import * as React from 'react';
import * as _ from 'lodash';
import { CogsIcon } from '@patternfly/react-icons';
import { FLAGS } from '@console/shared/src/constants';
import { FLAG_DEVWORKSPACE } from './consts';
import { Plugin, Perspective, ModelFeatureFlag, ModelDefinition, DashboardsOverviewResourceActivity, DashboardsOverviewHealthURLSubsystem, DashboardsOverviewHealthPrometheusSubsystem, DashboardsOverviewInventoryItem, DashboardsOverviewHealthOperator, ReduxReducer } from '@console/plugin-sdk';
import { ClusterVersionModel, NodeModel, PodModel, PersistentVolumeClaimModel, ClusterOperatorModel, NamespaceClaimModel, ServiceModel, ResourceQuotaClaimModel } from '@console/internal/models';
import { referenceForModel, ClusterOperator } from '@console/internal/module/k8s';
import { getNodeStatusGroups, getPodStatusGroups, getPVCStatusGroups } from '@console/shared/src/components/dashboard/inventory-card/utils';
import { fetchK8sHealth, getK8sHealthState, getControlPlaneHealth, getClusterOperatorHealthStatus } from './components/dashboards-page/status';
import { API_SERVERS_UP, API_SERVER_REQUESTS_SUCCESS, CONTROLLER_MANAGERS_UP, SCHEDULERS_UP, ETCD_HEALTH } from './queries';
import { getClusterUpdateTimestamp, isClusterUpdateActivity } from './components/dashboards-page/activity';
import reducer from './redux/reducer';
import * as models from './models';

type ConsumedExtensions = Perspective | ModelDefinition | ModelFeatureFlag | DashboardsOverviewResourceActivity | DashboardsOverviewHealthURLSubsystem<any> | DashboardsOverviewHealthPrometheusSubsystem | DashboardsOverviewInventoryItem | DashboardsOverviewHealthOperator<ClusterOperator> | ReduxReducer;

const plugin: Plugin<ConsumedExtensions> = [
  {
    type: 'ModelDefinition',
    properties: {
      models: _.values(models),
    },
  },
  {
    type: 'FeatureFlag/Model',
    properties: {
      model: models.WorkspaceModel,
      flag: FLAG_DEVWORKSPACE,
    },
  },
  {
    type: 'Perspective',
    properties: {
      id: 'admin',
      name: 'Administrator',
      icon: <CogsIcon />,
      selectedIcon :<CogsIcon />,
      default: true,
      getLandingPageURL: flags => (flags[FLAGS.CAN_LIST_NS] ? '/dashboards' : '/k8s/cluster/projects'),
      getK8sLandingPageURL: () => '/search',
      getImportRedirectURL: project => `/k8s/cluster/projects/${project}/workloads`,
    },
  },
  {
    type: 'Dashboards/Overview/Activity/Resource',
    properties: {
      k8sResource: {
        isList: true,
        prop: 'clusterVersion',
        kind: referenceForModel(ClusterVersionModel),
        namespaced: false,
      },
      isActivity: isClusterUpdateActivity,
      getTimestamp: getClusterUpdateTimestamp,
      loader: () => import('./components/dashboards-page/ClusterUpdateActivity' /* webpackChunkName: "console-app" */).then(m => m.default),
    },
    flags: {
      required: [FLAGS.CLUSTER_VERSION],
    },
  },
  {
    type: 'Dashboards/Overview/Health/URL',
    properties: {
      title: 'Cluster',
      url: 'readyz',
      fetch: fetchK8sHealth,
      healthHandler: getK8sHealthState,
      additionalResource: {
        kind: referenceForModel(ClusterVersionModel),
        namespaced: false,
        name: 'version',
        isList: false,
        prop: 'cv',
        optional: true,
      },
    },
  },
  {
    type: 'Dashboards/Overview/Health/Prometheus',
    properties: {
      title: 'Control Plane',
      queries: [API_SERVERS_UP, CONTROLLER_MANAGERS_UP, SCHEDULERS_UP, API_SERVER_REQUESTS_SUCCESS, ETCD_HEALTH],
      healthHandler: getControlPlaneHealth,
      popupComponent: () => import('./components/dashboards-page/ControlPlaneStatus' /* webpackChunkName: "console-app" */).then(m => m.default),
      popupTitle: 'Control Plane status',
      disallowedProviders: ['IBMCloud'],
    },
  },
  {
    type: 'Dashboards/Overview/Inventory/Item',
    properties: {
      model: NodeModel,
      mapper: getNodeStatusGroups,
    },
  },
  {
    type: 'Dashboards/Overview/Inventory/Item',
    properties: {
      model: PodModel,
      mapper: getPodStatusGroups,
    },
  },
  {
    type: 'Dashboards/Overview/Inventory/Item',
    properties: {
      model: ServiceModel,
      useAbbr: true,
    },
  },
  {
    type: 'Dashboards/Overview/Inventory/Item',
    properties: {
      model: PersistentVolumeClaimModel,
      mapper: getPVCStatusGroups,
      useAbbr: true,
    },
  },
  {
    type: 'Dashboards/Overview/Inventory/Item',
    properties: {
      model: NamespaceClaimModel,
      useAbbr: true,
    },
  },
  {
    type: 'Dashboards/Overview/Inventory/Item',
    properties: {
      model: ResourceQuotaClaimModel,
      useAbbr: true,
    },
  },
  // {
  //   type: 'Dashboards/Overview/Inventory/Item',
  //   properties: {
  //     model: StorageClassModel,
  //   },
  // },

  {
    type: 'Dashboards/Overview/Health/Operator',
    properties: {
      title: 'Cluster operators',
      resources: [
        {
          kind: referenceForModel(ClusterOperatorModel),
          isList: true,
          namespaced: false,
          prop: 'clusterOperators',
        },
      ],
      getOperatorsWithStatuses: getClusterOperatorHealthStatus,
      operatorRowLoader: () => import('./components/dashboards-page/OperatorStatus' /* webpackChunkName: "console-app" */).then(c => c.default),
      viewAllLink: '/settings/cluster/clusteroperators',
    },
    flags: {
      required: [FLAGS.CLUSTER_VERSION],
    },
  },
  {
    type: 'ReduxReducer',
    properties: {
      namespace: 'console',
      reducer,
    },
  },
];

export default plugin;
