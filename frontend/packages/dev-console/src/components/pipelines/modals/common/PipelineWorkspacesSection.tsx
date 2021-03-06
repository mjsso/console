import * as React from 'react';
import { useFormikContext, FormikValues, useField } from 'formik';
import { SecretModel, ConfigMapModel } from '@console/internal/models';
import { DropdownField } from '@console/shared';
import { PipelineWorkspace } from '../../../../utils/pipeline-augment';
import FormSection from '../../../import/section/FormSection';
import { VolumeTypes } from '../../const';
import PVCDropdown from './PVCDropdown';
import MultipleResourceKeySelector from './MultipleResourceKeySelector';
import { useTranslation } from 'react-i18next';

const getVolumeTypeFields = (volumeType: VolumeTypes, index: number) => {
  switch (VolumeTypes[volumeType]) {
    case VolumeTypes.Secret: {
      return (
        <MultipleResourceKeySelector
          resourceNameField={`workspaces.${index}.data.secret.secretName`}
          resourceKeysField={`workspaces.${index}.data.secret.items`}
          label="Secret"
          resourceModel={SecretModel}
          required
        />
      );
    }
    case VolumeTypes.ConfigMap: {
      return (
        <MultipleResourceKeySelector
          resourceNameField={`workspaces.${index}.data.configMap.name`}
          resourceKeysField={`workspaces.${index}.data.configMap.items`}
          label="Config Map"
          resourceModel={ConfigMapModel}
          required
        />
      );
    }
    case VolumeTypes.PVC: {
      return <PVCDropdown name={`workspaces.${index}.data.persistentVolumeClaim.claimName`} />;
    }
    default:
      return null;
  }
};

const PipelineWorkspacesSection: React.FC = () => {
  const { setFieldValue } = useFormikContext<FormikValues>();
  const [{ value: workspaces }] = useField<PipelineWorkspace[]>('workspaces');
  const { t } = useTranslation();
  return (
    workspaces.length > 0 && (
      <FormSection title={t('SINGLE:MSG_PIPELINERUNS_CREATEFORM_9')} fullWidth>
        {workspaces.map((workspace, index) => (
          <div className="form-group" key={workspace.name}>
            <DropdownField
              name={`workspaces.${index}.type`}
              label={workspace.name}
              items={VolumeTypes}
              onChange={() => setFieldValue(`workspaces.${index}.data`, {})}
              fullWidth
              required
            />
            {getVolumeTypeFields(workspace.type as VolumeTypes, index)}
          </div>
        ))}
      </FormSection>
    )
  );
};

export default PipelineWorkspacesSection;
