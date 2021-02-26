import * as React from 'react';
import * as _ from 'lodash-es';
import * as classNames from 'classnames';
import { useState } from 'react';
import { Button } from '@patternfly/react-core';
import { sortable } from '@patternfly/react-table';
import { Status } from '@console/shared';
import { ServiceInstanceModel } from '../../models';
import { K8sResourceKind, modelFor, k8sGet } from '../../module/k8s';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { DetailsPage, ListPage, Table, TableData, TableRow } from '../factory';
import { Kebab, ResourceKebab, navFactory, SectionHeading, ResourceSummary, ResourceLink, Timestamp } from '../utils';
import { ResourceSidebar } from '../sidebars/resource-sidebar';

const { common } = Kebab.factory;

const kind = ServiceInstanceModel.kind;

export const serviceInstanceMenuActions = [...Kebab.getExtensionsActionsForKind(ServiceInstanceModel), ...common];

const ServiceInstanceDetails: React.FC<ServiceInstanceDetailsProps> = props => {
  const { t } = useTranslation();
  const { obj: serviceInstance, match } = props;
  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarDetails, setSidebarDetails] = useState({});
  const [sidebarKind, setSidebarKind] = useState('');
  const [sidebarTitle, setSidebarTitle] = useState('');
  // const [planDetails, setPlanDetails] = useState({});
  const getDetails = async (kind, e) => {
    const model = modelFor(kind);
    const details = await k8sGet(model, e.target.innerText, kind.indexOf('Cluster') < 0 ? match.params.ns : null);
    setSidebarDetails(details);
    setShowSidebar(true);
    setSidebarKind(kind);
    setSidebarTitle(details.metadata.name);
    console.log(sidebarDetails);
  };
  const SidebarLink = ({ name, kind }) => {
    return (
      <Button type="button" variant="link" isInline onClick={getDetails.bind(null, kind)}>
        {name}
      </Button>
    );
  };
  return (
    <>
      <div className="co-p-has-sidebar">
        <div className="co-m-pane__body">
          <SectionHeading text={`${t('COMMON:MSG_LNB_MENU_17')} ${t('COMMON:MSG_DETAILS_TABOVERVIEW_1')}`} />
          <div className="row">
            <div className="col-md-6">
              <ResourceSummary resource={serviceInstance} showPodSelector showNodeSelector></ResourceSummary>
            </div>
            <div className="col-md-6">
              <dl className="co-m-pane__details">
                <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_13')}</dt>
                <dd>
                  <Status status={serviceInstance.status.lastConditionState} />
                </dd>
                <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_19')}</dt>
                <SidebarLink name={serviceInstance.spec.clusterServiceClassRef?.name ? serviceInstance.spec.clusterServiceClassRef?.name : serviceInstance.spec?.serviceClassExternalName} kind={serviceInstance.spec.clusterServiceClassRef?.name ? 'ClusterServiceClass' : 'ServiceClass'}></SidebarLink>
                <dt>{t('COMMON:MSG_LNB_MENU_13')}</dt>
                <dd>
                  <SidebarLink name={serviceInstance.spec.clusterServicePlanRef?.name ? serviceInstance.spec.clusterServicePlanRef?.name : serviceInstance.spec?.servicePlanRef?.name} kind={serviceInstance.spec.clusterServiceClassRef?.name ? 'ClusterServicePlan' : 'ServicePlan'}></SidebarLink>
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <ResourceSidebar
          toggleSidebar={() => {
            setShowSidebar(!showSidebar);
            window.dispatchEvent(new Event('sidebar_toggle'));
          }}
          resource={sidebarDetails}
          kindObj={modelFor(sidebarKind)}
          title={sidebarTitle}
          isFloat={true}
          showName={false}
          showID={true}
          showPodSelector={true}
          showNodeSelector={true}
          showOwner={false}
          showSidebar={showSidebar}
          samples={[]}
          isCreateMode={true}
          showDetails={true}
        />
      </div>
    </>
  );
};

type ServiceInstanceDetailsProps = {
  obj: K8sResourceKind;
  match?: any;
};

const { details, editYaml } = navFactory;
const ServiceInstancesDetailsPage: React.FC<ServiceInstancesDetailsPageProps> = props => <DetailsPage {...props} kind={kind} menuActions={serviceInstanceMenuActions} pages={[details(ServiceInstanceDetails), editYaml()]} />;
ServiceInstancesDetailsPage.displayName = 'ServiceInstancesDetailsPage';

const tableColumnClasses = [
  '', // NAME
  '', // NAMESPACE
  classNames('pf-m-hidden', 'pf-m-visible-on-lg'), // SERVICE CLASS
  classNames('pf-m-hidden', 'pf-m-visible-on-sm', 'pf-u-w-16-on-lg'), // SERVICE PLAN
  classNames('pf-m-hidden', 'pf-m-visible-on-xl'), // CREATED
  Kebab.columnClass, // MENU ACTIONS
];

const ServiceInstanceTableRow = ({ obj, index, key, style }) => {
  return (
    <TableRow id={obj.metadata.uid} index={index} trKey={key} style={style}>
      <TableData className={tableColumnClasses[0]}>
        <ResourceLink kind={kind} name={obj.metadata.name} namespace={obj.metadata.namespace} title={obj.metadata.name} />
      </TableData>
      <TableData className={classNames(tableColumnClasses[1])}>
        <ResourceLink kind="Namespace" name={obj.metadata.namespace} title={obj.metadata.namespace} />
      </TableData>
      <TableData className={tableColumnClasses[2]}>
        <Status status={obj.status.lastConditionState} />
      </TableData>
      <TableData className={tableColumnClasses[3]}>{obj.spec.clusterServicePlanExternalName ? <ResourceLink kind="ClusterServicePlan" title={obj.spec.clusterServicePlanRef?.name} name={obj.spec.clusterServicePlanRef?.name} displayName={obj.spec.clusterServicePlanExternalName} /> : <ResourceLink kind="ServicePlan" title={obj.spec.servicePlanRef?.name} name={obj.spec.servicePlanRef?.name} displayName={obj.spec.servicePlanExternalName} />}</TableData>
      <TableData className={tableColumnClasses[4]}>
        <Timestamp timestamp={obj.metadata.creationTimestamp} />
      </TableData>
      <TableData className={tableColumnClasses[5]}>
        <ResourceKebab actions={serviceInstanceMenuActions} kind={kind} resource={obj} />
      </TableData>
    </TableRow>
  );
};

const ServiceInstanceTableHeader = (t?: TFunction) => {
  return [
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_1'),
      sortField: 'metadata.name',
      transforms: [sortable],
      props: { className: tableColumnClasses[0] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_2'),
      sortField: 'metadata.namespace',
      transforms: [sortable],
      props: { className: tableColumnClasses[1] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_3'),
      sortField: 'status.lastConditionState',
      transforms: [sortable],
      props: { className: tableColumnClasses[2] },
    },
    {
      title: t('COMMON:MSG_LNB_MENU_13'),
      sortField: 'spec.servicePlanName',
      transforms: [sortable],
      props: { className: tableColumnClasses[3] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_12'),
      sortField: 'metadata.creationTimestamp',
      transforms: [sortable],
      props: { className: tableColumnClasses[4] },
    },
    {
      title: '',
      props: { className: tableColumnClasses[5] },
    },
  ];
};

ServiceInstanceTableHeader.displayName = 'ServiceInstanceTableHeader';

const ServiceInstancesList: React.FC = props => {
  const { t } = useTranslation();
  return <Table {...props} aria-label="Service Instance" Header={ServiceInstanceTableHeader.bind(null, t)} Row={ServiceInstanceTableRow} />;
};
ServiceInstancesList.displayName = 'ServiceInstancesList';

const serviceInstanceStatusReducer = (serviceInstance: any): string => {
  return serviceInstance.status.lastConditionState;
};

const ServiceInstancesPage: React.FC<ServiceInstancesPageProps> = props => {
  const { t } = useTranslation();
  return (
    <ListPage
      canCreate={true}
      kind={kind}
      ListComponent={ServiceInstancesList}
      rowFilters={[
        {
          filterGroupName: 'Status',
          type: 'service-instance-status',
          reducer: serviceInstanceStatusReducer,
          items: [
            { id: 'Ready', title: t('COMMON:MSG_MAIN_FILTER_2') },
            { id: 'Error', title: 'Error' },
          ],
        },
      ]}
      {...props}
    />
  );
};
ServiceInstancesPage.displayName = 'ServiceInstancesPage';

export { ServiceInstancesList, ServiceInstancesPage, ServiceInstancesDetailsPage };

type ServiceInstancesPageProps = {};

type ServiceInstancesDetailsPageProps = {
  match: any;
};
