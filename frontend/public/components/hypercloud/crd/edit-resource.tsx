import * as _ from 'lodash';
import * as React from 'react';
import { JSONSchema6 } from 'json-schema';
import { K8sKind, modelFor, K8sResourceKind, K8sResourceKindReference, referenceForModel } from '@console/internal/module/k8s';
import { CustomResourceDefinitionModel } from '@console/internal/models';
import { StatusBox, resourcePathFromModel } from '@console/internal/components/utils';
import { RootState } from '@console/internal/redux';
import { SyncedEditor } from '@console/shared/src/components/synced-editor';
import { getActivePerspective } from '@console/internal/reducers/ui';
import { EditorType } from '@console/shared/src/components/synced-editor/editor-toggle';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import { match as RouterMatch } from 'react-router';
import { OperandForm } from '@console/operator-lifecycle-manager/src/components/operand/operand-form';
import { OperandYAML } from '@console/operator-lifecycle-manager/src/components/operand/operand-yaml';
import { FORM_HELP_TEXT, YAML_HELP_TEXT, DEFAULT_K8S_SCHEMA } from '@console/operator-lifecycle-manager/src/components/operand/const';
import { prune } from '@console/shared/src/components/dynamic-form/utils';
import { pluralToKind, isResourceSchemaBasedMenu, isCreateManual, resourceSchemaBasedMenuMap } from '../form';
import { getIdToken } from '../../../hypercloud/auth';
import { getK8sAPIPath } from '@console/internal/module/k8s/resource.js';
import { AsyncComponent } from '../../utils/async';
import { isSaveButtonDisabled } from '../utils/button-state';
import { OnlyYamlEditorKinds } from './create-pinned-resource';

export const EditDefault: React.FC<EditDefaultProps> = ({ initialEditorType, loadError, match, model, activePerspective, obj, create }) => {
  if (!model) {
    return null;
  }

  if (OnlyYamlEditorKinds.includes(model.kind)) {
    const next = `${resourcePathFromModel(model, match.params.appName, match.params.ns)}`;
    const sample = obj;
    return (
      <>
        <SyncedEditor
          context={{
            formContext: { create },
            yamlContext: { next, match, create, readOnly: isSaveButtonDisabled(obj) },
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
      const isCustomResourceType = !isResourceSchemaBasedMenu(kind);
      let url;
      if (isCustomResourceType) {
        url = getK8sAPIPath({ apiGroup: CustomResourceDefinitionModel.apiGroup, apiVersion: CustomResourceDefinitionModel.apiVersion });
        url = `${document.location.origin}${url}/customresourcedefinitions/${model.plural}.${model.apiGroup}`;
      } else {
        const directory = resourceSchemaBasedMenuMap.get(model.kind)?.['directory'];
        const file = resourceSchemaBasedMenuMap.get(model.kind)?.['file'];
        url = `${document.location.origin}/api/resource/${directory}/key-mapping/${file}`;
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

    const [, setHelpText] = React.useState(FORM_HELP_TEXT);
    const next = `${resourcePathFromModel(model, match.params.appName, match.params.ns)}`;
    let definition;

    const [schema, FormComponent] = React.useMemo(() => {
      const baseSchema = (template?.spec?.versions?.[0]?.schema?.openAPIV3Schema as JSONSchema6) ?? (template?.spec?.validation?.openAPIV3Schema as JSONSchema6) ?? template;
      return [_.defaultsDeep({}, DEFAULT_K8S_SCHEMA, _.omit(baseSchema, 'properties.status')), OperandForm];
    }, [template, definition, model]);
    const sample = obj;
    const pruneFunc = React.useCallback(data => prune(data, sample), [sample]);

    const onChangeEditorType = React.useCallback(newMethod => {
      setHelpText(newMethod === EditorType.Form ? FORM_HELP_TEXT : YAML_HELP_TEXT);
    }, []);

    return (
      <StatusBox loaded={loaded} loadError={loadError} data={template}>
        {loaded ? (
          <>
            <SyncedEditor
              context={{
                formContext: { match, model, next, schema, create },
                yamlContext: { next, match, create, readOnly: isSaveButtonDisabled(obj) },
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

// edit?????? ?????? customresourcedefinitions ????????? ?????? url params??? plural ?????? ????????? ?????? ????????? ?????????.
const getMatchedPlural = (type, spec, match) => {
  // if (type === 'customresourcedefinitions') {
  //   return spec.group + '~' + spec.version + '~' + spec.names.kind;
  // } else {
  return match.params.plural;
  // }
};

const stateToProps = (state: RootState, props: Omit<EditDefaultPageProps, 'model'>) => {
  let {
    obj: { spec },
    match,
  } = props;
  let plural = getMatchedPlural(match.params.plural, spec, match);
  if (plural === 'clusterroles') {
    plural = 'roles';
  }
  let kind = pluralToKind(plural);
  let model = kind && modelFor(kind);
  // crd?????? hypercloud?????? ??????????????? ???????????? redux?????? ???????????? plural??? kind ????????? model ???????????????.
  if (kind && model) {
    plural = referenceForModel(model);
  } else {
    kind = plural.split('~')[2];
  }
  return { model: (state.k8s.getIn(['RESOURCES', 'models', kind]) as K8sKind) || state.k8s.getIn(['RESOURCES', 'models', plural]), activePerspective: getActivePerspective(state) };
};

export const EditDefaultPage = connect(stateToProps)((props: EditDefaultPageProps) => {
  const { kind, plural } = props.model;
  return (
    <>
      <Helmet>
        <title>{`Edit ${kind}`}</title>
      </Helmet>
      {isCreateManual(kind) ? <AsyncComponent loader={() => import(`../form/${plural}/create-${kind.toLowerCase()}`).then(m => m[`Create${kind}`])} obj={props.obj} match={props.match} /> : <EditDefault {...(props as any)} model={props.model} match={props.match} initialEditorType={EditorType.Form} create={false} />}
    </>
  );
});

export type EditDefaultProps = {
  activePerspective: string;
  initialEditorType: EditorType;
  loaded: boolean;
  loadError?: any;
  match: RouterMatch<{ name: string; appName: string; ns: string; plural: K8sResourceKindReference }>;
  model: K8sKind;
  obj?: K8sResourceKind;
  create: boolean;
};

export type EditDefaultPageProps = {
  match: RouterMatch<{ name: string; appName: string; ns: string; plural: K8sResourceKindReference }>;
  model: K8sKind;
  obj?: K8sResourceKind;
};
