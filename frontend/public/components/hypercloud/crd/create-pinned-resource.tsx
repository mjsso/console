import * as _ from 'lodash';
import * as React from 'react';
import { JSONSchema6 } from 'json-schema';
import { K8sKind, modelFor, K8sResourceKind, K8sResourceKindReference, kindForReference, referenceForModel } from '@console/internal/module/k8s';
import { CustomResourceDefinitionModel, SecretModel, TemplateModel, ClusterTemplateModel } from '@console/internal/models';
import { StatusBox, BreadCrumbs, resourcePathFromModel } from '@console/internal/components/utils';
import { RootState } from '@console/internal/redux';
import { SyncedEditor } from '@console/shared/src/components/synced-editor';
import { getActivePerspective } from '@console/internal/reducers/ui';
import { EditorType } from '@console/shared/src/components/synced-editor/editor-toggle';
import { connect } from 'react-redux';
import { exampleForModel } from '.';
import { Helmet } from 'react-helmet';
import { match as RouterMatch } from 'react-router';
import { OperandForm } from '@console/operator-lifecycle-manager/src/components/operand/operand-form';
import { OperandYAML } from '@console/operator-lifecycle-manager/src/components/operand/operand-yaml';
import { FORM_HELP_TEXT, YAML_HELP_TEXT, DEFAULT_K8S_SCHEMA } from '@console/operator-lifecycle-manager/src/components/operand/const';
import { prune } from '@console/shared/src/components/dynamic-form/utils';
import { pluralToKind, isVanillaObject } from '../form';
import { kindToSchemaPath } from '@console/internal/module/hypercloud/k8s/kind-to-schema-path';
import { getIdToken } from '../../../hypercloud/auth';
import { getK8sAPIPath } from '@console/internal/module/k8s/resource.js';
// import { safeDump } from 'js-yaml';

// MEMO : YAML Editor만 제공돼야 되는 리소스 kind
const OnlyYamlEditorKinds = [SecretModel.kind, TemplateModel.kind, ClusterTemplateModel.kind];

export const CreateDefault: React.FC<CreateDefaultProps> = ({ initialEditorType, loadError, match, model, activePerspective, create }) => {
  if (!model) {
    return null;
  }

  if (OnlyYamlEditorKinds.includes(model.kind)) {
    const next = `${resourcePathFromModel(model, match.params.appName, match.params.ns)}`;
    let definition;

    const sample = React.useMemo<K8sResourceKind>(() => exampleForModel(definition, model), [definition, model]);

    return (
      <>
        <div className="co-create-operand__header">
          <div className="co-create-operand__header-buttons">
            <BreadCrumbs breadcrumbs={[{ name: `Create ${model.label}`, path: window.location.pathname }]} />
          </div>
          <h1 className="co-create-operand__header-text">{`Create ${model.label}`}</h1>
        </div>
        <SyncedEditor
          context={{
            formContext: { create },
            yamlContext: { next, match, create },
          }}
          initialData={sample}
          initialType={EditorType.YAML}
          FormEditor={null}
          YAMLEditor={OperandYAML}
          supplyEditorToggle={false}
        />
      </>
    );
  } else {
    const [loaded, setLoaded] = React.useState(false);
    const [template, setTemplate] = React.useState({} as any);

    React.useEffect(() => {
      let kind = pluralToKind(model.plural);
      const isCustomResourceType = !isVanillaObject(kind);
      let url;
      if (isCustomResourceType) {
        url = getK8sAPIPath({ apiGroup: CustomResourceDefinitionModel.apiGroup, apiVersion: CustomResourceDefinitionModel.apiVersion });
        url = `${document.location.origin}${url}/customresourcedefinitions/${model.plural}.${model.apiGroup}`;
      } else {
        const directory = kindToSchemaPath.get(model.kind)?.['directory'];
        const file = kindToSchemaPath.get(model.kind)?.['file'];
        url = `${document.location.origin}/api/resource/${directory}/${file}`;
      }
      const xhrTest = new XMLHttpRequest();
      xhrTest.open('GET', url);
      xhrTest.setRequestHeader('Authorization', `Bearer ${getIdToken()}`);
      xhrTest.onreadystatechange = function() {
        if (xhrTest.readyState == XMLHttpRequest.DONE && xhrTest.status == 200) {
          let template = xhrTest.response;
          template = JSON.parse(template);
          setTemplate(template);
          setLoaded(true);
        }
      };
      xhrTest.send();
    }, []);

    const [helpText, setHelpText] = React.useState(FORM_HELP_TEXT);
    const next = `${resourcePathFromModel(model, match.params.appName, match.params.ns)}`;
    let definition;

    const [schema, FormComponent] = React.useMemo(() => {
      const baseSchema = (template?.spec?.versions?.[0]?.schema?.openAPIV3Schema as JSONSchema6) ?? (template?.spec?.validation?.openAPIV3Schema as JSONSchema6) ?? template;
      return [_.defaultsDeep({}, DEFAULT_K8S_SCHEMA, _.omit(baseSchema, 'properties.status')), OperandForm];
    }, [template, definition, model]);

    const sample = React.useMemo<K8sResourceKind>(() => exampleForModel(definition, model), [definition, model]);

    const pruneFunc = React.useCallback(data => prune(data, sample), [sample]);

    const onChangeEditorType = React.useCallback(newMethod => {
      setHelpText(newMethod === EditorType.Form ? FORM_HELP_TEXT : YAML_HELP_TEXT);
    }, []);

    return (
      <StatusBox loaded={loaded} loadError={loadError} data={template}>
        {loaded ? (
          <>
            <div className="co-create-operand__header">
              <div className="co-create-operand__header-buttons">
                <BreadCrumbs breadcrumbs={[{ name: `Create ${model.label}`, path: window.location.pathname }]} />
              </div>
              <h1 className="co-create-operand__header-text">{`Create ${model.label}`}</h1>
              <p className="help-block">{helpText}</p>
            </div>
            <SyncedEditor
              context={{
                formContext: { match, model, next, schema, create },
                yamlContext: { next, match, create },
              }}
              FormEditor={FormComponent}
              initialData={sample}
              initialType={initialEditorType}
              onChangeEditorType={onChangeEditorType}
              prune={pruneFunc}
              YAMLEditor={OperandYAML}
            />
          </>
        ) : null}
      </StatusBox>
    );
  }
};

const stateToProps = (state: RootState, props: Omit<CreateDefaultPageProps, 'model'>) => {
  let plural = props.match.params.plural;
  let kind = pluralToKind(props.match.params.plural);
  let model = kind && modelFor(kind);
  // crd중에 hypercloud에서 사용안하는 경우에는 redux에서 관리하는 plural과 kind 값으로 model 참조해야함.
  if (kind && model) {
    plural = referenceForModel(model);
  } else {
    kind = plural.split('~')[2];
  }
  return { model: state.k8s.getIn(['RESOURCES', 'models', plural]) || (state.k8s.getIn(['RESOURCES', 'models', kind]) as K8sKind), activePerspective: getActivePerspective(state) };
};

export const CreateDefaultPage = connect(stateToProps)((props: CreateDefaultPageProps) => {
  return (
    <>
      <Helmet>
        <title>{`Create ${kindForReference(props.match.params.plural)}`}</title>
      </Helmet>
      <CreateDefault {...(props as any)} model={props.model} match={props.match} initialEditorType={EditorType.Form} create={true} />
    </>
  );
});

export type CreateDefaultProps = {
  activePerspective: string;
  initialEditorType: EditorType;
  loaded: boolean;
  loadError?: any;
  match: RouterMatch<{ appName: string; ns: string; plural: K8sResourceKindReference }>;
  model: K8sKind;
  create: boolean;
};

export type CreateDefaultPageProps = {
  match: RouterMatch<{ appName: string; ns: string; plural: K8sResourceKindReference }>;
  model: K8sKind;
};
