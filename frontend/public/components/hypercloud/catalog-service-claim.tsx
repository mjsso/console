import * as React from 'react';
import * as _ from 'lodash-es';
import { sortable } from '@patternfly/react-table';
import { CatalogServiceClaimModel } from '../../models';
import { CatalogServiceClaimKind } from '../../module/k8s';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { DetailsPage, ListPage, Table, TableData, TableRow } from '../factory';
import { Kebab, navFactory, SectionHeading, ResourceSummary, ResourceLink, ResourceKebab, Timestamp } from '../utils';
import { ResourceLabel } from '../../models/hypercloud/resource-plural';

const { common } = Kebab.factory;

const kind = CatalogServiceClaimModel.kind;

export const catalogServiceClaimMenuActions = [...Kebab.getExtensionsActionsForKind(CatalogServiceClaimModel), ...common, Kebab.factory.ModifyStatus];

const CatalogServiceClaimDetails: React.FC<CatalogServiceClaimDetailsProps> = ({ obj: catalogServiceClaim }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: ResourceLabel(catalogServiceClaim, t) })} />
        <div className="row">
          <div className="col-md-6">
            <ResourceSummary resource={catalogServiceClaim} showOwner={false}></ResourceSummary>
          </div>
          <div className="col-md-6">
            <dl className="co-m-pane__details">
              <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_118')}</dt>
              <dd>{catalogServiceClaim.spec?.resourceName}</dd>
              <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_13')}</dt>
              <dd>{catalogServiceClaim.status?.status}</dd>
              <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_18')}</dt>
              <dd>
                <Timestamp timestamp={catalogServiceClaim.status?.lastTransitionTime} />
              </dd>
              {catalogServiceClaim.status?.reason && (
                <>
                  <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_CONDITIONS_TABLEHEADER_5')}</dt>
                  <dd>{catalogServiceClaim.status.reason}</dd>
                </>
              )}
            </dl>
          </div>
        </div>
      </div>
    </>
  );
};

type CatalogServiceClaimDetailsProps = {
  obj: CatalogServiceClaimKind;
};

const { details, editResource } = navFactory;
const CatalogServiceClaimsDetailsPage: React.FC<CatalogServiceClaimsDetailsPageProps> = props => <DetailsPage {...props} kind={kind} menuActions={catalogServiceClaimMenuActions} pages={[details(CatalogServiceClaimDetails), editResource()]} />;
CatalogServiceClaimsDetailsPage.displayName = 'CatalogServiceClaimsDetailsPage';

const tableColumnClasses = [
  '', // NAME
  '', // STATUS
  '', // CREATED
  Kebab.columnClass, // MENU ACTIONS
];

const CatalogServiceClaimTableRow = ({ obj, index, key, style }) => {
  return (
    <TableRow id={obj.metadata.uid} index={index} trKey={key} style={style}>
      <TableData className={tableColumnClasses[0]}>
        <ResourceLink kind={kind} name={obj.metadata.name} namespace={obj.metadata.namespace} title={obj.metadata.name} />
      </TableData>
      <TableData className={tableColumnClasses[1]}>{obj.status && obj.status.status}</TableData>
      <TableData className={tableColumnClasses[2]}>
        <Timestamp timestamp={obj.metadata.creationTimestamp} />
      </TableData>
      <TableData className={tableColumnClasses[3]}>
        <ResourceKebab actions={catalogServiceClaimMenuActions} kind={kind} resource={obj} />
      </TableData>
    </TableRow>
  );
};

const CatalogServiceClaimTableHeader = (t?: TFunction) => {
  return [
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_1'),
      sortField: 'metadata.name',
      transforms: [sortable],
      props: { className: tableColumnClasses[0] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_3'),
      sortFunc: 'catalogServiceClaimStatusReducer',
      transforms: [sortable],
      props: { className: tableColumnClasses[1] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_12'),
      sortField: 'metadata.creationTimestamp',
      transforms: [sortable],
      props: { className: tableColumnClasses[2] },
    },
    {
      title: '',
      props: { className: tableColumnClasses[3] },
    },
  ];
};

CatalogServiceClaimTableHeader.displayName = 'CatalogServiceClaimTableHeader';

const CatalogServiceClaimsList: React.FC = props => {
  const { t } = useTranslation();
  return <Table {...props} aria-label="Catalog Service Claim" Header={CatalogServiceClaimTableHeader.bind(null, t)} Row={CatalogServiceClaimTableRow} customSorts={{ catalogServiceClaimStatusReducer }} />;
};
CatalogServiceClaimsList.displayName = 'CatalogServiceClaimsList';

const catalogServiceClaimStatusReducer = (csc: any): string => {
  return csc?.status?.status;
};

const CatalogServiceClaimsPage: React.FC<CatalogServiceClaimsPageProps> = props => {
  const { t } = useTranslation();
  const filters = [
    {
      filterGroupName: t('COMMON:MSG_COMMON_BUTTON_FILTER_3'),
      type: 'catalog-service-claim-status',
      reducer: catalogServiceClaimStatusReducer,
      items: [
        { id: 'Approved', title: t('COMMON:MSG_COMMON_STATUS_10') },
        { id: 'Rejected', title: t('COMMON:MSG_COMMON_STATUS_11') },
        { id: 'Awaiting', title: t('COMMON:MSG_COMMON_STATUS_9') },
      ],
    },
  ];
  return <ListPage title={t('COMMON:MSG_LNB_MENU_19')} createButtonText={t('COMMON:MSG_MAIN_CREATEBUTTON_1', { 0: t('COMMON:MSG_LNB_MENU_19') })} canCreate={true} kind={kind} ListComponent={CatalogServiceClaimsList} rowFilters={filters} {...props} />;
};
CatalogServiceClaimsPage.displayName = 'CatalogServiceClaimsPage';

export { CatalogServiceClaimsList, CatalogServiceClaimsPage, CatalogServiceClaimsDetailsPage };

type CatalogServiceClaimsPageProps = {};

type CatalogServiceClaimsDetailsPageProps = {
  match: any;
};
