// TODO file should be renamed replica-set.jsx to match convention

import * as React from 'react';
import * as _ from 'lodash-es';
import * as classNames from 'classnames';
import { Link } from 'react-router-dom';
import { sortable } from '@patternfly/react-table';
import { useTranslation } from 'react-i18next';
import { DetailsPage, ListPage, Table, TableData, TableRow } from './factory';
import { Kebab, ContainerTable, navFactory, SectionHeading, ResourceSummary, ResourcePodCount, AsyncComponent, ResourceLink, resourcePath, LabelList, ResourceKebab, OwnerReferences, Timestamp, PodsComponent } from './utils';
import { ResourceEventStream } from './events';
import { VolumesTable } from './volumes-table';
import { ReplicaSetModel } from '../models';
import { ResourceLabel } from '../models/hypercloud/resource-plural';

const { ModifyCount, AddStorage, common } = Kebab.factory;

export const replicaSetMenuActions = [ModifyCount, AddStorage, ...Kebab.getExtensionsActionsForKind(ReplicaSetModel), ...common];

const Details = ({ obj: replicaSet }) => {
  const { t } = useTranslation();
  const revision = _.get(replicaSet, ['metadata', 'annotations', 'deployment.kubernetes.io/revision']);
  return (
    <>
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: ResourceLabel(replicaSet, t) })} />
        <div className="row">
          <div className="col-md-6">
            <ResourceSummary resource={replicaSet} showPodSelector showNodeSelector showTolerations showOwner={false}>
              {revision && (
                <>
                  <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_41')}</dt>
                  <dd>{revision}</dd>
                </>
              )}
            </ResourceSummary>
          </div>
          <div className="col-md-6">
            <ResourcePodCount resource={replicaSet} />
          </div>
        </div>
      </div>
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_CONTAINERS_TABLEHEADER_1')} />
        <ContainerTable containers={replicaSet.spec.template.spec.containers} />
      </div>
      <div className="co-m-pane__body">
        <VolumesTable resource={replicaSet} heading={t('COMMON:MSG_DETAILS_TABDETAILS_VOLUMES_TABLEHEADER_1')} />
      </div>
    </>
  );
};

const EnvironmentPage = props => <AsyncComponent loader={() => import('./environment.jsx').then(c => c.EnvironmentPage)} {...props} />;

const envPath = ['spec', 'template', 'spec', 'containers'];
const environmentComponent = props => <EnvironmentPage obj={props.obj} rawEnvData={props.obj.spec.template.spec} envPath={envPath} readOnly={false} />;

const ReplicaSetPods = props => <PodsComponent {...props} customData={{ showNodes: true }} />;

const { details, editResource, pods, envEditor, events } = navFactory;
const ReplicaSetsDetailsPage = props => <DetailsPage {...props} menuActions={replicaSetMenuActions} pages={[details(Details), editResource(), pods(ReplicaSetPods), envEditor(environmentComponent), events(ResourceEventStream)]} />;

const kind = 'ReplicaSet';

const tableColumnClasses = ['', '', classNames('pf-m-hidden', 'pf-m-visible-on-sm', 'pf-u-w-16-on-lg'), classNames('pf-m-hidden', 'pf-m-visible-on-lg'), classNames('pf-m-hidden', 'pf-m-visible-on-lg'), classNames('pf-m-hidden', 'pf-m-visible-on-xl'), Kebab.columnClass];

const ReplicaSetTableRow = ({ obj, index, key, style }) => {
  return (
    <TableRow id={obj.metadata.uid} index={index} trKey={key} style={style}>
      <TableData className={tableColumnClasses[0]}>
        <ResourceLink kind={kind} name={obj.metadata.name} namespace={obj.metadata.namespace} title={obj.metadata.uid} />
      </TableData>
      <TableData className={classNames(tableColumnClasses[1], 'co-break-word')}>
        <ResourceLink kind="Namespace" name={obj.metadata.namespace} title={obj.metadata.namespace} />
      </TableData>
      <TableData className={tableColumnClasses[2]}>
        <Link to={`${resourcePath(kind, obj.metadata.name, obj.metadata.namespace)}/pods`} title="pods">
          {obj.status.replicas || 0} of {obj.spec.replicas} pods
        </Link>
      </TableData>
      <TableData className={tableColumnClasses[3]}>
        <LabelList kind={kind} labels={obj.metadata.labels} />
      </TableData>
      <TableData className={tableColumnClasses[4]}>
        <OwnerReferences resource={obj} />
      </TableData>
      <TableData className={tableColumnClasses[5]}>
        <Timestamp timestamp={obj.metadata.creationTimestamp} />
      </TableData>
      <TableData className={tableColumnClasses[6]}>
        <ResourceKebab actions={replicaSetMenuActions} kind={kind} resource={obj} />
      </TableData>
    </TableRow>
  );
};

const ReplicaSetTableHeader = t => {
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
      sortFunc: 'numReplicas',
      transforms: [sortable],
      props: { className: tableColumnClasses[2] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_15'),
      sortField: 'metadata.labels',
      transforms: [sortable],
      props: { className: tableColumnClasses[3] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_11'),
      sortField: 'metadata.ownerReferences[0].name',
      transforms: [sortable],
      props: { className: tableColumnClasses[4] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_12'),
      sortField: 'metadata.creationTimestamp',
      transforms: [sortable],
      props: { className: tableColumnClasses[5] },
    },
    {
      title: '',
      props: { className: tableColumnClasses[6] },
    },
  ];
};

ReplicaSetTableHeader.displayName = 'ReplicaSetTableHeader';

const ReplicaSetsList = props => {
  const { t } = useTranslation();
  return <Table {...props} aria-label="Replica Sets" Header={ReplicaSetTableHeader.bind(null, t)} Row={ReplicaSetTableRow} virtualize />;
};
const ReplicaSetsPage = props => {
  const { t } = useTranslation();
  const { canCreate = true } = props;
  return <ListPage title={t('COMMON:MSG_LNB_MENU_31')} createButtonText={t('COMMON:MSG_MAIN_CREATEBUTTON_1', { 0: t('COMMON:MSG_LNB_MENU_31') })} canCreate={canCreate} kind="ReplicaSet" ListComponent={ReplicaSetsList} {...props} />;
};

export { ReplicaSetsList, ReplicaSetsPage, ReplicaSetsDetailsPage };
