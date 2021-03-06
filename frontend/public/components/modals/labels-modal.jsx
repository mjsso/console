import * as _ from 'lodash-es';
import * as React from 'react';

import { k8sPatch, referenceForModel } from '../../module/k8s';
import { createModalLauncher, ModalTitle, ModalBody, ModalSubmitFooter } from '../factory/modal';
import { PromiseComponent, ResourceIcon, SelectorInput } from '../utils';
import { withTranslation, Trans } from 'react-i18next';

const LABELS_PATH = '/metadata/labels';
const TEMPLATE_SELECTOR_PATH = '/spec/template/metadata/labels';

const BaseLabelsModal = withTranslation()(
  class BaseLabelsModal extends PromiseComponent {
    constructor(props) {
      super(props);
      this._submit = this._submit.bind(this);
      this._cancel = props.cancel.bind(this);
      const labels = SelectorInput.arrayify(_.get(props.resource, props.path.split('/').slice(1)));
      this.state = Object.assign(this.state, {
        labels,
      });
      this.createPath = !labels.length;
    }

    _submit(e) {
      e.preventDefault();

      const { kind, path, resource, isPodSelector } = this.props;

      const patch = [
        {
          op: this.createPath ? 'add' : 'replace',
          path,
          value: SelectorInput.objectify(this.state.labels),
        },
      ];

      // https://kubernetes.io/docs/user-guide/deployments/#selector
      //   .spec.selector must match .spec.template.metadata.labels, or it will be rejected by the API
      const updateTemplate = isPodSelector && !_.isEmpty(_.get(resource, TEMPLATE_SELECTOR_PATH.split('/').slice(1)));

      if (updateTemplate) {
        patch.push({
          path: TEMPLATE_SELECTOR_PATH,
          op: 'replace',
          value: SelectorInput.objectify(this.state.labels),
        });
      }
      const promise = k8sPatch(kind, resource, patch);
      this.handlePromise(promise).then(this.props.close);
    }

    render() {
      const { kind, resource, labelKind, labelClassName, t } = this.props;
      const label = labelKind === 'Pod' ? t('COMMON:MSG_MAIN_TABLEHEADER_16') : t('COMMON:MSG_MAIN_TABLEHEADER_15');
      const message = labelKind === 'Pod' ? t('COMMON:MSG_MAIN_POPUP_DESCRIPTION_8') : t('COMMON:MSG_MAIN_POPUP_DESCRIPTION_11');
      const i18nKey = labelKind === 'Pod' ? 'COMMON:MSG_MAIN_POPUP_DESCRIPTION_9' : 'COMMON:MSG_MAIN_POPUP_DESCRIPTION_12';
      const ResourceNameComponent = () => (
        <>
          <ResourceIcon kind={kind.crd ? referenceForModel(kind) : kind.kind} /> {resource.metadata.name}
        </>
      );
      const resourceNameComponent = <ResourceNameComponent key="resourceName" />;

      return (
        <form onSubmit={this._submit} name="form" className="modal-content">
          <ModalTitle>{t('COMMON:MSG_COMMON_DIV1_1', { 0: label })}</ModalTitle>
          <ModalBody>
            <div className="row co-m-form-row">
              <div className="col-sm-12">{message}</div>
            </div>
            <div className="row co-m-form-row">
              <div className="col-sm-12">
                <label htmlFor="tags-input" className="control-label">
                  <Trans i18nKey={i18nKey}>{[resourceNameComponent]}</Trans>
                </label>
                <SelectorInput onChange={labels => this.setState({ labels })} tags={this.state.labels} labelClassName={labelClassName || `co-text-${kind.id}`} autoFocus />
              </div>
            </div>
          </ModalBody>
          <ModalSubmitFooter errorMessage={this.state.errorMessage} inProgress={this.state.inProgress} submitText={t('COMMON:MSG_COMMON_BUTTON_COMMIT_3')} cancel={this._cancel} />
        </form>
      );
    }
  },
);

export const labelsModal = createModalLauncher(props => <BaseLabelsModal path={LABELS_PATH} {...props} />);

export const podSelectorModal = createModalLauncher(props => <BaseLabelsModal path={['replicationcontrolleres', 'services'].includes(props.kind.plural) ? '/spec/selector' : '/spec/selector/matchLabels'} isPodSelector={true} labelClassName="co-text-pod" {...props} />);
