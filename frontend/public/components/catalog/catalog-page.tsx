import * as React from 'react';
import * as _ from 'lodash-es';
import { Helmet } from 'react-helmet';
import { safeLoad } from 'js-yaml';

import { PropertyItem } from '@patternfly/react-catalog-view-extension';
import { ANNOTATIONS, FLAGS, APIError } from '@console/shared';
import { CatalogTileViewPage, Item } from './catalog-items';
import { k8sListPartialMetadata, referenceForModel, serviceClassDisplayName, K8sResourceCommon, K8sResourceKind, PartialObjectMetadata, TemplateKind } from '../../module/k8s';
import { withStartGuide } from '../start-guide';
import { connectToFlags, flagPending, FlagsObject } from '../../reducers/features';
import { Firehose, LoadError, PageHeading, skeletonCatalog, StatusBox, FirehoseResult, ExternalLink, Box, MsgBox } from '../utils';
import { getAnnotationTags, getMostRecentBuilderTag, isBuilder } from '../image-stream';
import { getImageForIconClass, getImageStreamIcon, getServiceClassIcon, getServiceClassImage, getTemplateIcon } from './catalog-item-icon';
import { ClusterServiceClassModel, TemplateModel, ServiceClassModel } from '../../models';
import * as plugins from '../../plugins';
import { coFetch, coFetchJSON } from '../../co-fetch';
import { useTranslation, withTranslation } from 'react-i18next';
import * as noResourceImg from '../../imgs/hypercloud/img_no_resource.svg';
import { Link } from 'react-router-dom';

export const CatalogPageType = {
  SERVICE_INSTANCE: 'ServiceInstance',
  DEVELOPER: 'Developer',
};

export const getCatalogPageType = () => {
  if (window.location.href.indexOf('/serviceinstance') > 0 && window.location.href.indexOf('/serviceinstance/') < 0) {
    return CatalogPageType.SERVICE_INSTANCE;
  } else {
    return CatalogPageType.DEVELOPER;
  }
};

export const CatalogListPage = withTranslation()(
  class CatalogListPage extends React.Component<any, CatalogListPageState> {
    constructor(props: CatalogListPageProps) {
      super(props);

      const items = this.getItems();
      this.state = { items };
    }

    componentDidUpdate(prevProps) {
      const { serviceClasses, clusterServiceClasses, templateMetadata, projectTemplateMetadata, imageStreams, helmCharts, namespace, loaded, t } = this.props;
      if ((!prevProps.loaded && loaded) || !_.isEqual(namespace, prevProps.namespace) || !_.isEqual(serviceClasses, prevProps.serviceClasses) || !_.isEqual(clusterServiceClasses, prevProps.clusterServiceClasses) || !_.isEqual(templateMetadata, prevProps.templateMetadata) || !_.isEqual(projectTemplateMetadata, prevProps.projectTemplateMetadata) || !_.isEqual(imageStreams, prevProps.imageStreams) || !_.isEqual(helmCharts, prevProps.helmCharts) || !_.isEqual(t, prevProps.t)) {
        const items = this.getItems();
        this.setState({ items });
      }
    }

    getItems(): Item[] {
      const { serviceClasses, clusterServiceClasses, imageStreams, templateMetadata, projectTemplateMetadata, helmCharts, loaded, t } = this.props;
      // MEMO : getDevCatalogModels??? DevCatalogModel???????????? normalize??????????????? dev-catalog.ts??? ????????? normalizeClusterServiceVersions ????????? ?????????.
      // normalizeClusterServiceVersions???????????? t????????? ???????????? bind?????????.
      const extensionItems = _.flatten(
        plugins.registry
          .getDevCatalogModels()
          .filter(({ properties }) => _.get(this.props, referenceForModel(properties.model)))
          .map(({ properties }) => properties.normalize.bind(null, t)(_.get(this.props, [referenceForModel(properties.model), 'data']))),
      ) as Item[];

      let serviceClassItems: Item[] = [];
      let clusterServiceClassItems: Item[] = [];
      let imageStreamItems: Item[] = [];
      let templateItems: Item[] = [];
      let projectTemplateItems: Item[] = [];
      let helmChartItems: Item[] = [];

      if (!loaded) {
        return [];
      }

      if (serviceClasses) {
        serviceClassItems = this.normalizeServiceClasses(serviceClasses.data);
      }

      if (clusterServiceClasses) {
        clusterServiceClassItems = this.normalizeClusterServiceClasses(clusterServiceClasses.data);
      }

      if (imageStreams) {
        imageStreamItems = this.normalizeImageStreams(imageStreams.data);
      }

      // Templates are not passed as a Firehose item since we only request template metadata.
      if (templateMetadata) {
        templateItems = this.normalizeTemplates(templateMetadata);
      }

      // Templates are not passed as a Firehose item since we only request template metadata.
      if (projectTemplateMetadata) {
        projectTemplateItems = this.normalizeTemplates(projectTemplateMetadata);
      }

      if (helmCharts) {
        helmChartItems = this.normalizeHelmCharts(helmCharts);
      }

      const items: Item[] = [...serviceClassItems, ...clusterServiceClassItems, ...imageStreamItems, ...templateItems, ...extensionItems, ...projectTemplateItems, ...helmChartItems];

      return _.sortBy(items, 'tileName');
    }

    normalizeServiceClasses(serviceClasses: K8sResourceKind[]) {
      // MEMO : tileDescription ????????? ????????????????????? ???????????? ???????????????.

      // TODO : namespace??? ?????? ??????(all-namespace??? ????????? ??????) ?????? default??? namespace???????????? ???????????? ????????? ???????????? ???????????? ????????????
      const { namespace = 'default', t } = this.props;
      return _.reduce(
        serviceClasses,
        (acc, serviceClass) => {
          const iconClass = getServiceClassIcon(serviceClass);
          const tileImgUrl = getServiceClassImage(serviceClass);

          // TODO : service class??? ????????? service instance ????????? ????????? ?????? ???????????? ????????????????????? href ????????????
          acc.push({
            obj: serviceClass,
            kind: 'ServiceClass',
            tileName: serviceClassDisplayName(serviceClass),
            tileIconClass: tileImgUrl ? null : iconClass,
            tileImgUrl: tileImgUrl == 'example.com/example.gif' ? null : tileImgUrl, // MEMO : example????????? ????????? ????????? ????????????????????? ??????????????? ????????? ????????? ????????????
            tileDescription: serviceClass.spec.description,
            tileProvider: _.get(serviceClass, 'spec.externalMetadata.providerDisplayName'),
            tags: serviceClass.spec.tags,
            categories: serviceClass.spec.externalMetadata.categories,
            createLabel: t('SINGLE:MSG_SERVICEINSTANCES_CREATEFORM_DIV1_1'),
            // href: `/catalog/create-service-instance?service-class=${serviceClass.metadata.name}&preselected-ns=${namespace}`,
            href: `/k8s/ns/${namespace}/serviceinstances/~new?service-class=${serviceClass.metadata.name}`,
            supportUrl: _.get(serviceClass, 'spec.externalMetadata.supportUrl'),
            // longDescription: _.get(serviceClass, 'spec.externalMetadata.longDescription'),
            documentationUrl: _.get(serviceClass, 'spec.externalMetadata.urlDescription'),
          });
          return acc;
        },
        [] as Item[],
      );
    }

    normalizeClusterServiceClasses(clusterServiceClasses: K8sResourceKind[]) {
      // TODO : namespace??? ?????? ??????(all-namespace??? ????????? ??????) ?????? default??? namespace???????????? ???????????? ????????? ???????????? ???????????? ????????????
      const { namespace = 'default', t } = this.props;
      return _.reduce(
        clusterServiceClasses,
        (acc, clusterServiceClass) => {
          // Prefer native templates to template-service-broker service classes.
          // if (serviceClass.status.removedFromBrokerCatalog || serviceClass.spec.clusterServiceBrokerName === 'template-service-broker') {
          //   return acc;
          // }

          const iconClass = getServiceClassIcon(clusterServiceClass);
          const tileImgUrl = getServiceClassImage(clusterServiceClass);

          // TODO : service class??? ????????? service instance ????????? ????????? ?????? ???????????? ????????????????????? href ????????????
          // ????????? cluster service class ???????????? create ????????? default????????????????????? ??????????????????????????? ???????????? ???????????? ?????????
          acc.push({
            obj: clusterServiceClass,
            kind: 'ClusterServiceClass',
            tileName: serviceClassDisplayName(clusterServiceClass),
            tileIconClass: tileImgUrl ? null : iconClass,
            tileImgUrl: tileImgUrl == 'example.com/example.gif' ? null : tileImgUrl, // MEMO : example????????? ????????? ????????? ????????????????????? ??????????????? ????????? ????????? ????????????
            tileDescription: clusterServiceClass.spec.description,
            tileProvider: _.get(clusterServiceClass, 'spec.externalMetadata.providerDisplayName'),
            tags: clusterServiceClass.spec.tags,
            categories: clusterServiceClass.spec.externalMetadata.categories,
            createLabel: t('SINGLE:MSG_SERVICEINSTANCES_CREATEFORM_DIV1_1'),
            // href: `/catalog/create-service-instance?cluster-service-class=${clusterServiceClass.metadata.name}&preselected-ns=${namespace}`,
            href: `/k8s/ns/${namespace}/serviceinstances/~new?cluster-service-class=${clusterServiceClass.metadata.name}`,
            supportUrl: _.get(clusterServiceClass, 'spec.externalMetadata.supportUrl'),
            // longDescription: _.get(clusterServiceClass, 'spec.externalMetadata.longDescription'),
            documentationUrl: _.get(clusterServiceClass, 'spec.externalMetadata.urlDescription'),
          });
          return acc;
        },
        [] as Item[],
      );
    }

    normalizeTemplates(templates: Array<TemplateKind | PartialObjectMetadata>): Item[] {
      return _.reduce(
        templates,
        (acc, template) => {
          const { name, namespace, annotations = {} } = template.metadata;
          const tags = (annotations.tags || '').split(/\s*,\s*/);
          if (tags.includes('hidden')) {
            return acc;
          }
          const iconClass = getTemplateIcon(template);
          const tileImgUrl = getImageForIconClass(iconClass);
          const tileIconClass = tileImgUrl ? null : iconClass;
          acc.push({
            obj: template,
            kind: 'Template',
            tileName: annotations[ANNOTATIONS.displayName] || name,
            tileIconClass,
            tileImgUrl,
            // tileDescription: annotations.description,
            tileDescription: '',
            tags,
            createLabel: 'Instantiate Template',
            tileProvider: annotations[ANNOTATIONS.providerDisplayName],
            documentationUrl: annotations[ANNOTATIONS.documentationURL],
            supportUrl: annotations[ANNOTATIONS.supportURL],
            href: `/catalog/instantiate-template?template=${name}&template-ns=${namespace}&preselected-ns=${this.props.namespace || ''}`,
          });
          return acc;
        },
        [] as Item[],
      );
    }

    normalizeHelmCharts(chartEntries: HelmChartEntries): Item[] {
      const { namespace: currentNamespace = '' } = this.props;

      return _.reduce(
        chartEntries,
        (normalizedCharts, charts) => {
          charts.forEach((chart: HelmChart) => {
            const tags = chart.keywords;
            const chartName = chart.name;
            const chartVersion = chart.version;
            const appVersion = chart.appVersion;
            const tileName = `${_.startCase(chartName)} v${chart.version}`;
            const tileImgUrl = chart.icon || getImageForIconClass('icon-helm');
            const chartURL = _.get(chart, 'urls.0');
            const encodedChartURL = encodeURIComponent(chartURL);
            const markdownDescription = async () => {
              let chartData;
              try {
                chartData = await coFetchJSON(`/api/helm/chart?url=${chartURL}`);
              } catch {
                return null;
              }
              const readmeFile = chartData?.files?.find(file => file.name === 'README.md');
              const readmeData = readmeFile?.data && atob(readmeFile?.data);
              return readmeData && `## README\n${readmeData}`;
            };

            const maintainers = chart.maintainers?.length > 0 && (
              <>
                {chart.maintainers?.map(maintainer => (
                  <>
                    {maintainer.name}
                    <br />
                    <a href={`mailto:${maintainer.email}`}>{maintainer.email}</a>
                    <br />
                  </>
                ))}
              </>
            );

            const homePage = chart.home && <ExternalLink href={chart.home} additionalClassName="co-break-all" text={chart.home} />;

            const customProperties = (
              <>
                <PropertyItem label="Chart Version" value={chartVersion} />
                <PropertyItem label="App Version" value={appVersion} />
                {homePage && <PropertyItem label="Home Page" value={homePage} />}
                {maintainers && <PropertyItem label="Maintainers" value={maintainers} />}
              </>
            );

            const obj = {
              ...chart,
              ...{ metadata: { uid: chart.digest, creationTimestamp: chart.created } },
            };

            normalizedCharts.push({
              obj,
              kind: 'HelmChart',
              tileName,
              tileIconClass: null,
              tileImgUrl,
              // tileDescription: chart.description,
              tileDescription: '',
              tags,
              createLabel: 'Install Helm Chart',
              markdownDescription,
              customProperties,
              href: `/catalog/helm-install?chartName=${chartName}&chartURL=${encodedChartURL}&preselected-ns=${currentNamespace}`,
            });
          });
          return normalizedCharts;
        },
        [] as Item[],
      );
    }

    normalizeImageStreams(imageStreams: K8sResourceKind[]): Item[] {
      const builderimageStreams = _.filter(imageStreams, isBuilder);
      return _.map(builderimageStreams, imageStream => {
        const { namespace: currentNamespace = '' } = this.props;
        const { name, namespace } = imageStream.metadata;
        const tag = getMostRecentBuilderTag(imageStream);
        const tileName = _.get(imageStream, ['metadata', 'annotations', ANNOTATIONS.displayName]) || name;
        const iconClass = getImageStreamIcon(tag);
        const tileImgUrl = getImageForIconClass(iconClass);
        const tileIconClass = tileImgUrl ? null : iconClass;
        const tileDescription = _.get(tag, 'annotations.description');
        const tags = getAnnotationTags(tag);
        const createLabel = 'Create Application';
        const tileProvider = _.get(tag, ['annotations', ANNOTATIONS.providerDisplayName]);
        const href = `/catalog/source-to-image?imagestream=${name}&imagestream-ns=${namespace}&preselected-ns=${currentNamespace}`;
        const builderImageTag = _.head(_.get(imageStream, 'spec.tags'));
        const sampleRepo = _.get(builderImageTag, 'annotations.sampleRepo');
        return {
          obj: imageStream,
          kind: 'ImageStream',
          tileName,
          tileIconClass,
          tileImgUrl,
          tileDescription,
          tags,
          createLabel,
          tileProvider,
          href,
          sampleRepo,
        };
      });
    }

    render() {
      const { loaded, loadError, namespace = 'default', t } = this.props;
      const { items } = this.state;
      const label = 'Resources';

      const ServiceInstanceEmptyPage = () => {
        return (
          <div>
            <Box className="text-center">
              <img className="cos-status-box__access-denied-icon" src={noResourceImg} />
              <MsgBox title="" detail={t('SINGLE:MSG_SERVICEINSTANCES_CREATEFORM_DIV1_ERROR_1')} />
            </Box>
            <Box className="text-center">
              <Link to={`/k8s/ns/${namespace}/serviceinstances`}>{t('SINGLE:MSG_SERVICEINSTANCES_CREATEFORM_DIV2_ERROR_1')}</Link>
            </Box>
          </div>
        );
      };

      const EmptyPage = getCatalogPageType() === CatalogPageType.SERVICE_INSTANCE ? ServiceInstanceEmptyPage : null;

      return (
        <StatusBox skeleton={skeletonCatalog} data={items} loaded={loaded} loadError={loadError} label={label} EmptyMsg={EmptyPage}>
          <CatalogTileViewPage items={items} />
        </StatusBox>
      );
    }
  },
);
export const Catalog = connectToFlags<CatalogProps>(
  FLAGS.OPENSHIFT,
  FLAGS.SERVICE_CATALOG,
  ...plugins.registry.getDevCatalogModels().map(({ properties }) => properties.flag),
)(props => {
  const { flags, mock, namespace } = props;
  flags[FLAGS.OPENSHIFT] = false; // MEMO: ????????????...
  const openshiftFlag = flags[FLAGS.OPENSHIFT];
  const serviceCatalogFlag = flags[FLAGS.SERVICE_CATALOG];
  const [templateMetadata, setTemplateMetadata] = React.useState<K8sResourceCommon>();
  const [templateError, setTemplateError] = React.useState<APIError>();
  const [projectTemplateMetadata, setProjectTemplateMetadata] = React.useState<K8sResourceCommon[]>(null);
  const [projectTemplateError, setProjectTemplateError] = React.useState<APIError>();
  const [helmCharts, setHelmCharts] = React.useState<HelmChartEntries>();

  const loadTemplates = openshiftFlag && !mock;

  // Load templates from the shared `openshift` namespace. Don't use Firehose
  // for templates so that we can request only metadata. This keeps the request
  // much smaller.
  React.useEffect(() => {
    if (!loadTemplates) {
      return;
    }
    k8sListPartialMetadata(TemplateModel, { ns: 'openshift' })
      .then(metadata => {
        setTemplateMetadata(metadata);
        setTemplateError(null);
      })
      .catch(setTemplateError);
  }, [loadTemplates]);

  // Load templates for the current project.
  React.useEffect(() => {
    if (!loadTemplates) {
      return;
    }
    // Don't load templates from the `openshift` namespace twice if it's the current namespace
    if (!namespace || namespace === 'openshift') {
      setProjectTemplateMetadata([]);
      setProjectTemplateError(null);
    } else {
      k8sListPartialMetadata(TemplateModel, { ns: namespace })
        .then(metadata => {
          setProjectTemplateMetadata(metadata);
          setProjectTemplateError(null);
        })
        .catch(setTemplateError);
    }
  }, [loadTemplates, namespace]);

  React.useEffect(() => {
    coFetch('/api/helm/charts/index.yaml').then(async res => {
      const yaml = await res.text();
      const json = safeLoad(yaml);
      setHelmCharts(json.entries);
    });
  }, []);

  const error = templateError || projectTemplateError;
  if (error) {
    return <LoadError message={error.message} label="Templates" className="loading-box loading-box__errored" />;
  }

  if (_.some(flags, flag => flagPending(flag))) {
    return null;
  }

  const resources = [
    ...(serviceCatalogFlag
      ? [
          {
            isList: true,
            kind: referenceForModel(ClusterServiceClassModel),
            namespaced: false,
            prop: 'clusterServiceClasses',
          },
        ]
      : []),
    ...[
      {
        isList: true,
        kind: referenceForModel(ServiceClassModel),
        namespaced: true,
        namespace,
        prop: 'serviceClasses',
      },
    ],
    ...(openshiftFlag
      ? [
          {
            isList: true,
            kind: 'ImageStream',
            namespace: 'openshift',
            prop: 'imageStreams',
          },
        ]
      : []),
    ...(getCatalogPageType() === CatalogPageType.DEVELOPER
      ? plugins.registry
          .getDevCatalogModels()
          .filter(({ properties }) => !properties.flag || flags[properties.flag])
          .map(({ properties }) => ({
            isList: true,
            kind: referenceForModel(properties.model),
            namespaced: properties.model.namespaced,
            namespace,
            prop: referenceForModel(properties.model),
          }))
      : []),
  ];

  return (
    <div className="co-catalog__body">
      <Firehose resources={mock ? [] : resources}>
        <CatalogListPage namespace={namespace} templateMetadata={templateMetadata} projectTemplateMetadata={projectTemplateMetadata} helmCharts={helmCharts} {...(props as any)} />
      </Firehose>
    </div>
  );
});

export const CatalogPage = withStartGuide(({ match, noProjectsAvailable }) => {
  const { t } = useTranslation();
  const namespace = _.get(match, 'params.ns');

  const CatalogPageTitle = {
    ServiceInstance: t('COMMON:MSG_MAIN_CREATEBUTTON_1', { 0: t('COMMON:MSG_LNB_MENU_111') }),
    Developer: 'Developer Catalog',
  };

  const CatalogPageDescription = {
    ServiceInstance: '',
    Developer: t('SINGLE:MSG_SERVICEINSTANCES_CREATEFORM_DIV1_2'),
  };

  const title = CatalogPageTitle[getCatalogPageType()] || 'Catalog';
  const description = CatalogPageDescription[getCatalogPageType()];

  return (
    <>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      <div className="co-m-page__body">
        <div className="co-catalog">
          <PageHeading title={title} />
          <p className="co-catalog-page__description">{description}</p>
          <Catalog namespace={namespace} mock={noProjectsAvailable} />
        </div>
      </div>
    </>
  );
});

export type CatalogListPageProps = {
  serviceClasses?: FirehoseResult<K8sResourceKind[]>;
  clusterServiceClasses?: FirehoseResult<K8sResourceKind[]>;
  imageStreams?: FirehoseResult<K8sResourceKind[]>;
  templateMetadata?: PartialObjectMetadata[];
  projectTemplateMetadata?: PartialObjectMetadata[];
  helmCharts?: HelmChartEntries;
  loaded: boolean;
  loadError?: string;
  namespace?: string;
};

export type CatalogListPageState = {
  items: Item[];
};

export type CatalogProps = {
  flags: FlagsObject;
  namespace?: string;
  mock: boolean;
};

export type HelmChartEntries = {
  [name: string]: Array<HelmChart>;
};

export type HelmChart = {
  apiVersion: string;
  appVersion: string;
  created: string;
  description: string;
  digest: string;
  home: string;
  icon: string;
  keywords: string[];
  maintainers: Array<{ email: string; name: string }>;
  name: string;
  tillerVersion: string;
  urls: string[];
  version: string;
};

CatalogPage.displayName = 'CatalogPage';
Catalog.displayName = 'Catalog';
