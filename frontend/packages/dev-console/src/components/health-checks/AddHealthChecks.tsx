import * as React from 'react';
import * as _ from 'lodash';
import Helmet from 'react-helmet';
import { FormikProps, FormikValues } from 'formik';
import { Form, Button } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { ContainerDropdown, history, PageHeading, ResourceLink, ResourceIcon, openshiftHelpBase } from '@console/internal/components/utils';
import { ContainerModel } from '@console/internal/models';
import { K8sResourceKind, referenceFor, modelFor } from '@console/internal/module/k8s';
import { FormFooter } from '@console/shared';
import { getResourcesType } from '../edit-application/edit-application-utils';
import HealthChecks from './HealthChecks';
import { getHealthChecksData } from './create-health-checks-probe-utils';
import './AddHealthChecks.scss';
import { useTranslation } from 'react-i18next';

type AddHealthChecksProps = {
  resource?: K8sResourceKind;
  currentContainer: string;
};

const AddHealthChecks: React.FC<FormikProps<FormikValues> & AddHealthChecksProps> = ({ resource, currentContainer, handleSubmit, handleReset, errors, status, isSubmitting, setFieldValue, values, dirty }) => {
  const [currentKey, setCurrentKey] = React.useState(currentContainer);
  const { t } = useTranslation();
  const containers = resource?.spec?.template?.spec?.containers;
  const healthCheckAdded = _.every(containers, container => container.readinessProbe || container.livenessProbe || container.startupProbe);
  const containersByKey = _.keyBy(containers, 'name');
  const pageTitle = healthCheckAdded ? t('SINGLE:MSG_DEPLOYMENTS_EDITDEPLOYMENTS_EDITHEALTHCHECKS_1') : t('SINGLE:MSG_DEPLOYMENTS_EDITDEPLOYMENTS_ADDHEALTHCHECKS_1');
  const {
    metadata: { name, namespace },
  } = resource;
  const kindForCRDResource = referenceFor(resource);
  const resourceModel = modelFor(kindForCRDResource);
  const resourcePlural = resourceModel.crd ? kindForCRDResource : resourceModel.plural;
  const isFormClean = _.every(values.healthChecks, { modified: false });

  const handleSelectContainer = (containerName: string) => {
    const containerIndex = _.findIndex(resource.spec.template.spec.containers, ['name', containerName]);
    setCurrentKey(containerName);
    setFieldValue('containerName', containerName);
    setFieldValue('healthChecks', getHealthChecksData(resource, containerIndex));
    history.replace(`/k8s/ns/${namespace}/${resourcePlural}/${name}/containers/${containerName}/health-checks`);
  };

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>
      <PageHeading
        title={
          <>
            {pageTitle}
            <Button variant="link" component="a" href={`${openshiftHelpBase}applications/application-health.html`} target="_blank">
              {t('SINGLE:MSG_DEPLOYMENTS_EDITDEPLOYMENTS_ADDHEALTHCHECKS_2')} <ExternalLinkAltIcon />
            </Button>
          </>
        }
      />
      <div className="odc-add-health-checks__body">
        <p>
          {t('SINGLE:MSG_DEPLOYMENTS_EDITDEPLOYMENTS_EDITHEALTHCHECKS_2')} &nbsp;
          <ResourceLink kind={referenceFor(resource)} name={name} namespace={namespace} title={name} inline />
        </p>
        <Form onSubmit={handleSubmit}>
          <div>
            {t('SINGLE:MSG_DEPLOYMENTS_EDITDEPLOYMENTS_EDITHEALTHCHECKS_2')} &nbsp;
            {_.size(containers) > 1 ? (
              <ContainerDropdown currentKey={currentKey} containers={containersByKey} onChange={handleSelectContainer} />
            ) : (
              <>
                <ResourceIcon kind={ContainerModel.kind} />
                {containers[0].name}
              </>
            )}
          </div>
          <HealthChecks resourceType={getResourcesType(resource)} />
          <FormFooter handleReset={handleReset} errorMessage={status && status?.errors?.json?.message} isSubmitting={isSubmitting} submitLabel={healthCheckAdded ? t('COMMON:MSG_COMMON_BUTTON_COMMIT_3') : t('COMMON:MSG_COMMON_BUTTON_COMMIT_8')} disableSubmit={isFormClean || !dirty || !_.isEmpty(errors)} resetLabel={t('COMMON:MSG_COMMON_BUTTON_COMMIT_2')} />
        </Form>
      </div>
    </>
  );
};

export default AddHealthChecks;
