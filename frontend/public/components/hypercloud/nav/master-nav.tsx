import * as React from 'react';

import { Translation } from 'react-i18next';
// import { GroupModel, UserModel } from '../../../models';

// import { referenceForModel } from '../../../module/k8s';
import { HrefLink, ResourceNSLink, ResourceClusterLink } from '../../nav/items';
// import { AuthAdminLink } from './items';
import { NavSection } from '../../nav/section';

// Wrap `NavItemSeparator` so we can use `required` without prop type errors.

const searchStartsWith = ['search'];
const rolesStartsWith = ['roles', 'clusterroles'];
const rolebindingsStartsWith = ['rolebindings', 'clusterrolebindings', 'rolebindingclaims', 'clusterrolebindingclaims'];
//const rolebindingclaimsStartsWith = ['rolebindingclaims', 'clusterrolebindingclaims'];
const quotaStartsWith = ['resourcequotas', 'clusterresourcequotas', 'resourcequotaclaims'];
const namespaceStartsWith = ['namespaces', 'namespaceclaims'];

const MasterNav = () => (
  <Translation>
    {t => (
      <>
        <NavSection title={t('COMMON:MSG_LNB_MENU_1')}>
          <HrefLink href="/dashboards" activePath="/dashboards/" name={t('COMMON:MSG_LNB_MENU_90')} />
          <ResourceClusterLink resource="namespaces" name={t('COMMON:MSG_LNB_MENU_3')} startsWith={namespaceStartsWith} />
          <HrefLink href="/search" name={t('COMMON:MSG_LNB_MENU_4')} startsWith={searchStartsWith} />
          <ResourceNSLink resource="audits" name={t('COMMON:MSG_LNB_MENU_5')} />
          <ResourceNSLink resource="events" name={t('COMMON:MSG_LNB_MENU_6')} />
          {/* <HrefLink href="/grafana" name="Grafana" />
          <HrefLink href="/kibana" name="Kibana" /> */}
          {/* <NewTabLink name={t('COMMON:MSG_LNB_MENU_98')} type="grafana" />
          <NewTabLink name={t('COMMON:MSG_LNB_MENU_99')} type="kibana" />
          <NewTabLink name={t('COMMON:GitLab')} type="git" /> */}
        </NavSection>
        {/* <NavSection title={t('COMMON:MSG_LNB_MENU_7')}>
          <HrefLink href="/operatorhub" name={t('COMMON:MSG_LNB_MENU_8')} />
          <ResourceNSLink resource='clusterserviceversions' name={t('COMMON:MSG_LNB_MENU_9')} startsWith={['operators.coreos.com', 'clusterserviceversions',]} />
        </NavSection> */}
        <NavSection title={t('COMMON:MSG_LNB_MENU_22')}>
          <ResourceNSLink resource="pods" name={t('COMMON:MSG_LNB_MENU_23')} />
          <ResourceNSLink resource="deployments" name={t('COMMON:MSG_LNB_MENU_24')} />
          <ResourceNSLink resource="replicasets" name={t('COMMON:MSG_LNB_MENU_31')} />
          <ResourceNSLink resource="horizontalpodautoscalers" name={t('COMMON:MSG_LNB_MENU_32')} />
          <ResourceNSLink resource="daemonsets" name={t('COMMON:MSG_LNB_MENU_30')} />
          <ResourceNSLink resource="statefulsets" name={t('COMMON:MSG_LNB_MENU_25')} />
          {/* <ResourceNSLink resource="virtualmachines" name={t('COMMON:MSG_LNB_MENU_33')} />
          <ResourceNSLink resource="virtualmachineinstances" name={t('COMMON:MSG_LNB_MENU_34')} /> */}
          <ResourceNSLink resource="configmaps" name={t('COMMON:MSG_LNB_MENU_27')} />
          <ResourceNSLink resource="secrets" name={t('COMMON:MSG_LNB_MENU_26')} />
          <ResourceNSLink resource="jobs" name={t('COMMON:MSG_LNB_MENU_29')} />
          <ResourceNSLink resource="cronjobs" name={t('COMMON:MSG_LNB_MENU_28')} />
        </NavSection>
        <NavSection title={t('COMMON:MSG_LNB_MENU_46')}>
          <ResourceNSLink resource="services" name={t('COMMON:MSG_LNB_MENU_47')} />
          <ResourceNSLink resource="ingresses" name={t('COMMON:MSG_LNB_MENU_48')} />
          <ResourceNSLink resource="networkpolicies" name={t('COMMON:MSG_LNB_MENU_49')} />
        </NavSection>
        <NavSection title={t('COMMON:MSG_LNB_MENU_50')}>
          <ResourceClusterLink resource="storageclasses" name={t('COMMON:MSG_LNB_MENU_53')} />
          {/* <ResourceNSLink resource="datavolumes" name={t('COMMON:MSG_LNB_MENU_54')} /> */}
          <ResourceNSLink resource="persistentvolumeclaims" name={t('COMMON:MSG_LNB_MENU_52')} />
          <ResourceClusterLink resource="persistentvolumes" name={t('COMMON:MSG_LNB_MENU_51')} />
        </NavSection>
        <NavSection title="매니지먼트">
          <ResourceNSLink resource="limitranges" name={t('COMMON:MSG_LNB_MENU_81')} />
          <ResourceNSLink resource="resourcequotas" name={t('COMMON:MSG_LNB_MENU_80')} startsWith={quotaStartsWith} />
          <ResourceClusterLink resource="customresourcedefinitions" name={t('COMMON:MSG_LNB_MENU_82')} />
        </NavSection>
        <NavSection title={t('COMMON:MSG_LNB_MENU_72')}>
          <ResourceClusterLink resource="nodes" name={t('COMMON:MSG_LNB_MENU_100')} />
        </NavSection>
        <NavSection title={t('COMMON:MSG_LNB_MENU_73')}>
          <ResourceNSLink resource="roles" name={t('COMMON:MSG_LNB_MENU_75')} startsWith={rolesStartsWith} />
          <ResourceNSLink resource="rolebindings" name={t('COMMON:MSG_LNB_MENU_76')} startsWith={rolebindingsStartsWith} />
          {/*<ResourceNSLink resource="rolebindingclaims" name={t('COMMON:MSG_LNB_MENU_101')} startsWith={rolebindingclaimsStartsWith} />*/}
          <ResourceNSLink resource="serviceaccounts" name={t('COMMON:MSG_LNB_MENU_74')} />
          {/* <ResourceClusterLink resource="podsecuritypolicies" name={t('COMMON:MSG_LNB_MENU_78')} /> */}
          {/* <AuthAdminLink resource={referenceForModel(UserModel)} name="Users" />
          <AuthAdminLink resource={referenceForModel(GroupModel)} name="User Groups" /> */}
        </NavSection>
      </>
    )}
  </Translation>
);

export default MasterNav;
