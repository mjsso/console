const pluralToKindMap = new Map([
  ['podsecuritypolicies', 'PodSecurityPolicy'],
  ['pods', 'Pod'],
  ['deployments', 'Deployment'],
  ['replicasets', 'ReplicaSet'],
  ['horizontalpodautoscalers', 'HorizontalPodAutoscaler'],
  ['daemonsets', 'DaemonSet'],
  ['statefulsets', 'StatefulSet'],
  ['configmaps', 'ConfigMap'],
  ['secrets', 'Secret'],
  ['jobs', 'Job'],
  ['cronjobs', 'CronJob'],
  ['services', 'Service'],
  ['ingresses', 'Ingress'],
  ['networkpolicies', 'NetworkPolicy'],
  ['storageclasses', 'StorageClass'],
  ['persistentvolumeclaims', 'PersistentVolumeClaim'],
  ['persistentvolumes', 'PersistentVolume'],
  ['namespaces', 'Namespace'],
  ['limitranges', 'LimitRange'],
  ['resourcequotas', 'ResourceQuota'],
  ['nodes', 'Node'],
  ['roles', 'Role'],
  ['clusterroles', 'ClusterRole'],
  ['rolebindings', 'RoleBinding'],
  ['clusterrolebindings', 'ClusterRoleBinding'],
  ['serviceaccounts', 'ServiceAccount'],
  ['customresourcedefinitions', 'CustomResourceDefinition'],
  ['namespaceclaims', 'NamespaceClaim'],
  ['servicebrokers', 'ServiceBroker'],
  ['serviceclasses', 'ServiceClass'],
  ['serviceplans', 'ServicePlan'],
  ['clusterservicebrokers', 'ClusterServiceBroker'],
  ['clusterserviceclasses', 'ClusterServiceClass'],
  ['clusterserviceplans', 'ClusterServicePlan'],
  ['clustertemplates', 'ClusterTemplate'],
  ['serviceinstances', 'ServiceInstance'],
  ['servicebindings', 'ServiceBinding'],
  ['clustertemplateclaims', 'ClusterTemplateClaim'],
  ['templates', 'Template'],
  ['templateinstances', 'TemplateInstance'],
  ['rolebindingclaims', 'RoleBindingClaim'],
  ['resourcequotaclaims', 'ResourceQuotaClaim'],
  ['tasks', 'Task'],
  ['clustertasks', 'ClusterTask'],
  ['taskruns', 'TaskRun'],
  ['pipelines', 'Pipeline'],
  ['pipelineruns', 'PipelineRun'],
  ['approvals', 'Approval'],
  ['pipelineresources', 'PipelineResource'],
  ['integrationjobs', 'IntegrationJob'],
  ['integrationconfigs', 'IntegrationConfig'],
  ['hyperclusterresources', 'HyperClusterResource'],
  ['clustermanagers', 'ClusterManager'],
  ['clusterclaims', 'ClusterClaim'],
  ['clusterregistrations', 'ClusterRegistration'],
  ['federatedconfigmaps', 'FederatedConfigMap'],
  ['federateddeployments', 'FederatedDeployment'],
  ['federatedingresses', 'FederatedIngress'],
  ['federatedjobs', 'FederatedJob'],
  ['federatednamespaces', 'FederatedNamespace'],
  ['federatedreplicasets', 'FederatedReplicaSet'],
  ['federatedsecrets', 'FederatedSecret'],
  ['federatedservices', 'FederatedService'],
  ['federatedpods', 'FederatedPod'],
  ['federatedhorizontalpodautoscalers', 'FederatedHorizontalPodAutoscaler'],
  ['federateddaemonsets', 'FederatedDaemonSet'],
  ['federatedstatefulsets', 'FederatedStatefulSet'],
  ['federatedcronjobs', 'FederatedCronJob'],
  ['virtualservices', 'VirtualService'],
  ['destinationrules', 'DestinationRule'],
  ['envoyfilters', 'EnvoyFilter'],
  ['gateways', 'Gateway'],
  ['sidecars', 'Sidecar'],
  ['serviceentries', 'ServiceEntry'],
  ['requestauthentications', 'RequestAuthentication'],
  ['peerauthentications', 'PeerAuthentication'],
  ['authorizationpolicies', 'AuthorizationPolicy'],
  ['datavolumes', 'DataVolume'],
  ['virtualmachines', 'VirtualMachine'],
  ['registries', 'Registry'],
  ['repositories', 'Repository'],
  ['externalregistries', 'ExternalRegistry'],
  ['imagesigners', 'ImageSigner'],
  ['imagesignrequests', 'ImageSignRequest'],
  ['imagescanrequests', 'ImageScanRequest'],
  ['imagereplicates', 'ImageReplicate'],
  ['signerpolicies', 'SignerPolicy'],
  ['notebooks', 'Notebook'],
  ['experiments', 'Experiment'],
  ['trainingjobs', 'TrainingJob'],
  ['tfjobs', 'TFJob'],
  ['pytorchjobs', 'PyTorchJob'],
  ['inferenceservices', 'InferenceService'],
  ['trainedmodels', 'TrainedModel'],
  ['workflowtemplates', 'WorkflowTemplate'],
  ['workflows', 'Workflow'],
  ['tfapplyclaims', 'TFApplyClaim'],
  ['helmreleases', 'HelmRelease'],
  ['awxs', 'AWX'],
]);

const isCreateManualSet = new Set(['Role', 'ClusterRole', 'ServiceInstance', 'TemplateInstance', 'Task', 'ClusterTask', 'TaskRun', 'PipelineRun', 'PipelineResource', 'RoleBinding', 'ClusterRoleBinding', 'RoleBindingClaim', 'Pipeline']);
const isVanillaObjectSet = new Set(['PodSecurityPolicy', 'Pod', 'Deployment', 'ReplicaSet', 'HorizontalPodAutoscaler', 'DaemonSet', 'StatefulSet', 'ConfigMap', 'Secret', 'Job', 'CronJob', 'Service', 'Ingress', 'NetworkPolicy', 'StorageClass', 'PersistentVolumeClaim', 'PersistentVolume', 'Namespace', 'LimitRange', 'ResourceQuota', 'Node', 'Role', 'RoleBinding', 'ClusterRole', 'ClusterRoleBinding', 'ServiceAccount', 'CustomResourceDefinition']);

export const pluralToKind = plural => pluralToKindMap.get(plural);

export const isCreateManual = kind => isCreateManualSet.has(kind);

export const isVanillaObject = kind => isVanillaObjectSet.has(kind);
