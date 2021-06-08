import * as React from 'react';
import { NavItemSeparator, NavGroup } from '@patternfly/react-core';
// import { referenceForModel } from '../../module/k8s';
// import { ExternalLink, HrefLink, ResourceNSLink, ResourceClusterLink } from './items';
import { ResourceNSLink, ResourceClusterLink, NewTabLink } from '../../nav/items';
import { NavSection } from '../../nav/section';
import { Translation } from 'react-i18next';
// import { ALL_NAMESPACES_KEY } from '../../../../packages/console-shared/src/constants/common';

type SeparatorProps = {
  name: string;
  required?: string;
};

const Separator: React.FC<SeparatorProps> = ({ name }) => <NavItemSeparator name={name} />;

const MulticlusterNav = () => (
  <Translation>
    {t => (
      <>
        <NavSection title={t('COMMON:MSG_LNB_MENU_105')} isSingleChild={true}>
          <ResourceNSLink resource="clusterclaims" name={t('COMMON:MSG_LNB_MENU_105')} />
        </NavSection>
        <NavSection title={t('COMMON:MSG_LNB_MENU_84')} isSingleChild={true}>
          <ResourceNSLink resource="clustermanagers" name={t('COMMON:MSG_LNB_MENU_84')} />
        </NavSection>
        <NavSection title={t('테라폼 클레임')} isSingleChild={true}>
          <ResourceNSLink resource="tfapplyclaims" name={t('테라폼 클레임')} />
        </NavSection>
        {/* <ResourceClusterLink resource="clustergroups" name="Cluster Groups" /> */}
        <NavSection title={t('COMMON:MSG_LNB_MENU_86')}>
          <NavGroup title="Workloads">
            <ResourceClusterLink resource="federatedpods" name="Pods" />
            <ResourceClusterLink resource="federateddeployments" name="Deployments" />
            <ResourceClusterLink resource="federatedreplicasets" name="Replica Sets" />
            <ResourceClusterLink resource="federatedhorizontalpodautoscalers" name="Horizontal Pod Autoscalers" />
            <ResourceClusterLink resource="federateddaemonsets" name="Daemon Sets" />
            <ResourceClusterLink resource="federatedstatefulsets" name="Stateful Sets" />
            <ResourceClusterLink resource="federatedconfigmaps" name="Config Maps" />
            <ResourceClusterLink resource="federatedsecrets" name="Secrets" />
            <ResourceClusterLink resource="federatedjobs" name="Jobs" />
            <ResourceClusterLink resource="federatedcronjobs" name="Cron Jobs" />
          </NavGroup>
          <Separator name="WorkloadsSeparator" />
          <NavGroup title={t('COMMON:MSG_LNB_MENU_46')}>
            <ResourceClusterLink resource="federatedingresses" name={t('COMMON:MSG_LNB_MENU_48')} />
            <ResourceClusterLink resource="federatedservices" name={t('COMMON:MSG_LNB_MENU_47')} />
          </NavGroup>
          <Separator name="NetworksSeparator" />
          <NavGroup title={t('COMMON:MSG_LNB_MENU_79')}>
            <ResourceClusterLink resource="federatednamespaces" name={t('COMMON:MSG_LNB_MENU_3')} />
          </NavGroup>
        </NavSection>
        <NavSection title={t('앤서블 웍스')} isSingleChild={true}>
          <NewTabLink name={t('앤서블 웍스')} type="ansibleawx" />
        </NavSection>
        {/* <NavSection title="Image">
      <ResourceClusterLink resource="federatedregistries" name="Registry" />
      <ResourceClusterLink resource="federatedimagesigners" name="Image Signer" />
      <ResourceClusterLink resource="federatedimagesignrequests" name="Image Sign Request" />
      <ResourceClusterLink resource="federatedimagetransfers" name="Image Transfer" />
    </NavSection> */}
      </>
    )}
  </Translation>
);

export default MulticlusterNav;
