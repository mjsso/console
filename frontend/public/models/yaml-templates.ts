/* eslint-disable no-unused-vars */

import { Map as ImmutableMap } from 'immutable';

import { GroupVersionKind, referenceForModel } from '../module/k8s';
import * as k8sModels from '../models';

/**
 * Sample YAML manifests for some of the statically-defined Kubernetes models.
 */
export const yamlTemplates = ImmutableMap<GroupVersionKind, ImmutableMap<string, string>>()
  .setIn(
    ['DEFAULT', 'default'],
    `
apiVersion: ''
kind: ''
metadata:
  name: example
`,
  )
  .setIn(
    [referenceForModel(k8sModels.FederatedNamespaceModel), 'default'],
    `
    apiVersion: types.kubefed.io/v1beta1
    kind: FederatedNamespace
    metadata:
      name: test-namespace
      namespace: test-namespace
    spec:
      placement:
        clusters:
        - name: cluster2
        - name: cluster1
`,
  )
  .setIn(
    [referenceForModel(k8sModels.FederatedDeploymentModel), 'default'],
    `
    apiVersion: types.kubefed.io/v1beta1
    kind: FederatedDeployment
    metadata:
      name: test-deployment
      namespace: test-namespace
    spec:
      template:
        metadata:
          labels:
            app: nginx
        spec:
          replicas: 3
          selector:
            matchLabels:
              app: nginx
          template:
            metadata:
              labels:
                app: nginx
            spec:
              containers:
              - image: nginx
                name: nginx
      placement:
        clusters:
        - name: cluster2
        - name: cluster1
`,
  )
  .setIn(
    [referenceForModel(k8sModels.FederatedConfigMapModel), 'default'],
    `
    apiVersion: types.kubefed.io/v1beta1
    kind: FederatedConfigMap
    metadata:
      name: test-configmap
      namespace: test-namespace
    spec:
      template:
        data:
          A: ala ma kota
      placement:
        clusters:
        - name: cluster2
        - name: cluster1
      overrides:
      - clusterName: cluster2
        clusterOverrides:
        - path: /data
          value:
            foo: bar
`,
  )
  .setIn(
    [referenceForModel(k8sModels.FederatedIngressModel), 'default'],
    `
    apiVersion: types.kubefed.io/v1beta1
    kind: FederatedIngress
    metadata:
      name: test-ingress
      namespace: test-namespace
    spec:
      template:
        spec:
          rules:
          - host: ingress.example.com
            http:
              paths:
              - backend:
                  serviceName: test-service
                  servicePort: 80
      placement:
        clusters:
        - name: cluster2
        - name: cluster1
`,
  )
  .setIn(
    [referenceForModel(k8sModels.KubeadmConfigTemplateModel), 'default'],
    `
    apiVersion: bootstrap.cluster.x-k8s.io/v1alpha3
    kind: KubeadmConfigTemplate
    metadata:
      name: capi-quickstart-md-0
      namespace: default
    spec:
      template:
        spec:
          joinConfiguration:
            nodeRegistration:
              kubeletExtraArgs:
                cloud-provider: aws
              name: '{{ ds.meta_data.local_hostname }}'    
`,
  )
  .setIn(
    [referenceForModel(k8sModels.KubeadmControlPlaneModel), 'default'],
    `
    apiVersion: controlplane.cluster.x-k8s.io/v1alpha3
kind: KubeadmControlPlane
metadata:
  name: capi-quickstart-control-plane
  namespace: default
spec:
  infrastructureTemplate:
    apiVersion: infrastructure.cluster.x-k8s.io/v1alpha3
    kind: AWSMachineTemplate
    name: capi-quickstart-control-plane
  kubeadmConfigSpec:
    clusterConfiguration:
      apiServer:
        extraArgs:
          cloud-provider: aws
      controllerManager:
        extraArgs:
          cloud-provider: aws
    initConfiguration:
      nodeRegistration:
        kubeletExtraArgs:
          cloud-provider: aws
        name: '{{ ds.meta_data.local_hostname }}'
    joinConfiguration:
      nodeRegistration:
        kubeletExtraArgs:
          cloud-provider: aws
        name: '{{ ds.meta_data.local_hostname }}'
    postKubeadmCommands:
      - mkdir -p $HOME/.kube
      - cp /etc/kubernetes/admin.conf $HOME/.kube/config
      - chown $UESR:$USER $HOME/.kube/config
      - kubectl apply -f https://docs.projectcalico.org/manifests/calico.yaml
  replicas: 1
  version: v1.17.3
   
`,
  )
  .setIn(
    [referenceForModel(k8sModels.FederatedResourceModel), 'default'],
    `
apiVersion: apiextensions.k8s.io/v1beta1
kind: CustomResourceDefinition
metadata:
  # name must match the spec fields below, and be in the form: <plural>.<group>
  name: crontabs.stable.example.com
spec:
  # group name to use for REST API: /apis/<group>/<version>
  group: stable.example.com
  # version name to use for REST API: /apis/<group>/<version>
  version: v1
  # either Namespaced or Cluster
  scope: Namespaced
  names:
    # plural name to be used in the URL: /apis/<group>/<version>/<plural>
    plural: crontabs
    # singular name to be used as an alias on the CLI and for display
    singular: crontab
    # kind is normally the CamelCased singular type. Your resource manifests use this.
    kind: CronTab
    # shortNames allow shorter string to match your resource on the CLI
    shortNames:
    - ct
`,
  )
  .setIn(
    [referenceForModel(k8sModels.ReplicaSchedulingPreferenceModel), 'default'],
    `
    apiVersion: scheduling.kubefed.io/v1alpha1
    kind: ReplicaSchedulingPreference
    metadata:
      name: test-deployment
      namespace: test-namespace
    spec:
      targetKind: FederatedDeployment
      totalReplicas: 10
      rebalance: true
      clusters:
        cluster1:
          weight: 2
        cluster2:
          weight: 3

`,
  )
  .setIn(
    [referenceForModel(k8sModels.IngressDNSRecordModel), 'default'],
    `
    apiVersion: multiclusterdns.kubefed.io/v1alpha1
    kind: IngressDNSRecord
    metadata:
      name: test-ingress
      namespace: test-namespace
    spec:
      hosts:
      - ingress.example.com
      recordTTL: 300
    
`,
  )
  .setIn(
    [referenceForModel(k8sModels.ServiceDNSRecordModel), 'default'],
    `
    apiVersion: multiclusterdns.kubefed.io/v1alpha1
    kind: ServiceDNSRecord
    metadata:
      # The name of the sample service.
      name: test-service
      # The namespace of the sample deployment/service.
      namespace: test-namespace
    spec:
      # The name of the corresponding Domain.
      domainRef: test-domain
      recordTTL: 300
    
`,
  )
  .setIn(
    [referenceForModel(k8sModels.ServiceDNSRecordModel), 'default'],
    `
    apiVersion: multiclusterdns.kubefed.io/v1alpha1
    kind: ServiceDNSRecord
    metadata:
      # The name of the sample service.
      name: test-service
      # The namespace of the sample deployment/service.
      namespace: test-namespace
    spec:
      # The name of the corresponding Domain.
      domainRef: test-domain
      recordTTL: 300
    
`,
  )
  .setIn(
    [referenceForModel(k8sModels.ClusterModel), 'default'],
    `
    apiVersion: cluster.x-k8s.io/v1alpha3
    kind: Cluster
    metadata:
      name: capi-example
      namespace: default
    spec:
      clusterNetwork:
        pods:
          cidrBlocks:
          - x.x.x.x/x
      controlPlaneRef:
        apiVersion: controlplane.cluster.x-k8s.io/v1alpha3
        kind: KubeadmControlPlane
        name: capi-example-control-plane
      infrastructureRef:
        apiVersion: infrastructure.cluster.x-k8s.io/v1alpha3
        kind: infraProvider
        name: capi-example
`,
  )
  .setIn(
    [referenceForModel(k8sModels.MachineDeploymentModel), 'default'],
    `
    apiVersion: cluster.x-k8s.io/v1alpha3
    kind: MachineDeployment
    metadata:
      name: capi-example-md-0
      namespace: default
    spec:
      clusterName: capi-example
      replicas: 3
      selector:
        matchLabels: null
      template:
        spec:
          bootstrap:
            configRef:
              apiVersion: bootstrap.cluster.x-k8s.io/v1alpha3
              kind: KubeadmConfigTemplate
              name: capi-example-md-0
          clusterName: capi-example
          infrastructureRef:
            apiVersion: infrastructure.cluster.x-k8s.io/v1alpha3
            kind: InfraProverMachineTemplate
            name: capi-example-md-0
          version: v1.17.3
`,
  )
  .setIn(
    [referenceForModel(k8sModels.Metal3ClusterModel), 'default'],
    `
    apiVersion: infrastructure.cluster.x-k8s.io/v1alpha3
    kind: Metal3Cluster
    metadata:
      name: capi-example
    spec:
      controlPlaneEndpoint:
        host: x.x.x.x
        port: xxxx
      noCloudProvider: false
    
`,
  )
  .setIn(
    [referenceForModel(k8sModels.Metal3MachineTemplateModel), 'default'],
    `
    apiVersion: infrastructure.cluster.x-k8s.io/v1alpha3
    kind: Metal3MachineTemplate
    metadata:
      name: capi-example-control-plane
    spec:
      template:
        spec:
          image:
            url: urlPath
            checksum: checksumPath
    
`,
  )
  .setIn(
    [referenceForModel(k8sModels.AWSClusterModel), 'default'],
    `
    apiVersion: infrastructure.cluster.x-k8s.io/v1alpha3
    kind: AWSCluster
    metadata:
      name: capi-example
      namespace: default
    spec:
      region: us-east-1
      sshKeyName: default
`,
  )
  .setIn(
    [referenceForModel(k8sModels.AWSMachineTemplateModel), 'default'],
    `
    apiVersion: infrastructure.cluster.x-k8s.io/v1alpha3
    kind: AWSMachineTemplate
    metadata:
      name: capi-example-control-plane
      namespace: default
    spec:
      template:
        spec:
          iamInstanceProfile: control-plane.cluster-api-provider-aws.sigs.k8s.io
          instanceType: t3.large
          sshKeyName: default
    
`,
  )
  .setIn(
    [referenceForModel(k8sModels.VirtualMachineModel), 'default'],
    `
      apiVersion: kubevirt.io/v1alpha3
      kind: VirtualMachine
      metadata:
        name: windows-vm
        namespace: default
      spec:
        running: true
        template:
          spec:
            hostname: guestos-name
            affinity:
              nodeAffinity:
                requiredDuringSchedulingIgnoredDuringExecution:
                  nodeSelectorTerms:
                  - matchExpressions:
                    - key: kubernetes.io/hostname
                      operator: In
                      values:
                      - k8s-3-3
            domain:
              machine:
                type: q35
              devices:
                disks:
                - disk:
                    bus: virtio
                  name: rootdisk
                - cdrom:
                    bus: sata
                    readonly: true
                  name: cloudinitdisk
                - disk:
                    bus: virtio
                  name: additionaldisk
                interfaces:
                - name: default
                  model: virtio
                  bridge: {}
                  macAddress: de:ad:00:00:be:aa
              gpus:
                - deviceName: nvidia.com/GP102GL_Tesla_P40
                  name: gpu1
              cpu:
                cores: 2
              memory:
                guest: 2Gi
              resources:
                overcommitGuestOverhead: false
                requests:
                  cpu: 1500m
                  memory: 2Gi
                limits:
                  cpu: 2500m
                  memory: 3Gi
            terminationGracePeriodSeconds: 0
            networks:
            - name: default
              pod: {}
            volumes:
            - containerDisk:
                image: 172.21.7.20:5000/ubuntu:18.04
              name: rootdisk
            - name: cloudinitdisk
              cloudInitConfigDrive:
                userData: |
                  #ps1_sysnative
                  NET USER tmax "Qwer12345" /ADD
                  NET LOCALGROUP "Administrators" "tmax" /add
            - name: additionaldisk
              persistentVolumeClaim:
                claimName: empty-pvc
  `,
  )
  .setIn(
    [referenceForModel(k8sModels.VirtualMachineModel), 'read-virtualmachine-window'],
    `
    apiVersion: kubevirt.io/v1alpha3
    kind: VirtualMachine
    metadata:
      name: windows-vm
      namespace: default
    spec:
      running: true
      template:
        spec:
          hostname: guestos-name
          affinity:
            nodeAffinity:
              requiredDuringSchedulingIgnoredDuringExecution:
                nodeSelectorTerms:
                - matchExpressions:
                  - key: kubernetes.io/hostname
                    operator: In
                    values:
                    - k8s-3-3
          domain:
            machine:
              type: q35
            devices:
              disks:
              - disk:
                  bus: virtio
                name: rootdisk
              - cdrom:
                  bus: sata
                  readonly: true
                name: cloudinitdisk
              - disk:
                  bus: virtio
                name: additionaldisk
              interfaces:
              - name: default
                model: virtio
                bridge: {}
                macAddress: de:ad:00:00:be:aa
            gpus:
              - deviceName: nvidia.com/GP102GL_Tesla_P40
                name: gpu1
            cpu:
              cores: 2
            memory:
              guest: 2Gi
            resources:
              overcommitGuestOverhead: false
              requests:
                cpu: 1500m
                memory: 2Gi
              limits:
                cpu: 2500m
                memory: 3Gi
          terminationGracePeriodSeconds: 0
          networks:
          - name: default
            pod: {}
          volumes:
          - containerDisk:
              image: 172.21.7.20:5000/ubuntu:18.04
            name: rootdisk
          - name: cloudinitdisk
            cloudInitConfigDrive:
              userData: |
                #ps1_sysnative
                NET USER tmax "Qwer12345" /ADD
                NET LOCALGROUP "Administrators" "tmax" /add
          - name: additionaldisk
            persistentVolumeClaim:
              claimName: empty-pvc
`,
  )
  .setIn(
    [referenceForModel(k8sModels.VirtualMachineModel), 'read-virtualmachine-linux'],
    `
    apiVersion: kubevirt.io/v1alpha3
    kind: VirtualMachine
    metadata:
        name: linux
        namespace: default
    spec:
      running: true
      template:
        spec:
          hostname: guestos-name
          affinity:
            nodeAffinity:
              requiredDuringSchedulingIgnoredDuringExecution:
                nodeSelectorTerms:
                - matchExpressions:
                  - key: kubernetes.io/hostname
                    operator: In
                    values:
                    - k8s-3-3
          domain:
            machine:
              type: q35
            devices:
              disks:
              - disk:
                  bus: virtio
                name: rootdisk
              - cdrom:
                  bus: sata
                  readonly: true
                name: cloudinitdisk
              - disk:
                  bus: virtio
                name: additionaldisk
              interfaces:
              - name: default
                model: virtio
                bridge: {}
                macAddress: de:ad:00:00:be:aa
            cpu:
              cores: 2
            memory:
              guest: 2Gi
            resources:
              overcommitGuestOverhead: false
              requests:
                cpu: 1500m
                memory: 2Gi
              limits:
                cpu: 1500m
                memory: 2Gi
          terminationGracePeriodSeconds: 0
          networks:
          - name: default
            pod: {}
          volumes:
          - containerDisk:
              image: 172.21.7.20:5000/ubuntu:18.04
            name: rootdisk
          - name: cloudinitdisk
            cloudInitConfigDrive:
              userData: |
                #cloud-config
                disable_root: false
                ssh_pwauth: true
                lock_passwd: false
                users:
                  - name: tmax
                    sudo: ALL=(ALL) NOPASSWD:ALL
                    passwd: $6$bLLmCtnk51$21/Fq0vSHCwDODP2hXA.wo/0k91QIw/lUy6qWPOX1vx5z0CF9Acj9vGLFlQVbjSzmh.1r7wWd0kQS9RMm51HE.
                    shell: /bin/bash
                    lock_passwd: false
          - name: additionaldisk
            persistentVolumeClaim:
              claimName: empty-pvc
`,
  )
  .setIn(
    [referenceForModel(k8sModels.UsergroupModel), 'default'],
    `
    apiVersion: tmax.io/v1
    kind: Usergroup
    metadata: 
      name: example
    userGroupInfo:
      name: example
      department: Cloud
      position: developer
      description: For Example
    status: active

`,
  )
  .setIn(
    [referenceForModel(k8sModels.ClusterServiceBrokerModel), 'default'],
    `
  apiVersion: servicecatalog.k8s.io/v1beta1
  kind: ClusterServiceBroker
  metadata:
    name: hyperbroker4
  spec:
          url: http://0.0.0.0:28677
`,
  )
  .setIn(
    [referenceForModel(k8sModels.DataVolumeModel), 'default'],
    `
  apiVersion: cdi.kubevirt.io/v1alpha1
  kind: DataVolume
  metadata:
    name: example
  spec:
    source:
      registry:
        url: example
    pvc:
      accessModes:
        - example
      resources:
        requests:
          storage: example  
`,
  )
  .setIn(
    [referenceForModel(k8sModels.ServiceInstanceModel), 'default'],
    `
  apiVersion: servicecatalog.k8s.io/v1beta1
  kind: ServiceInstance
  metadata:
    name: nginx-instance
    namespace: hypercloud-system
  spec:
    clusterServiceClassName: nginx-template
    clusterServicePlanName: example-plan1
    parameters:
      NAME: nginx
      IMAGE: nginx:1
`,
  )
  .setIn(
    [referenceForModel(k8sModels.ServiceBindingModel), 'default'],
    `
  apiVersion: servicecatalog.k8s.io/v1beta1
  kind: ServiceBinding
  metadata:
    name: example-binding
    namespace: hypercloud4-system
  spec:
    instanceRef:
      name: example-instance
`,
  )
  .setIn(
    [referenceForModel(k8sModels.UserModel), 'default'],
    `
  apiVersion: tmax.io/v1
  kind: User
  metadata: 
    name: example-tmax.co.kr
    labels: 
      encrypted: f
  userInfo:
    name: example
    password: "example"
    email: example@tmax.co.kr
    department: Cloud
    position: developer
    phone: 010-0000-0000
    description: For Example
  status: active
`,
  )
  .setIn(
    [referenceForModel(k8sModels.NamespaceClaimModel), 'default'],
    `
    apiVersion: tmax.io/v1
    kind: NamespaceClaim
    metadata:
      name: example-claim
    resourceName: example-namespace
    spec:
      hard:
        limits.cpu: "1"
        limits.memory: "1Gi"
    
`,
  )
  .setIn(
    [referenceForModel(k8sModels.LimitRangeModel), 'default'],
    `
apiVersion: v1
kind: LimitRange
metadata:
  name: example-limit-range
spec:
  limits:
  - max:
      cpu: "800m"
      memory: "1Gi"
    min:
      cpu: "100m"
      memory: "99Mi"
    default:
      cpu: "700m"
      memory: "900Mi"
    defaultRequest:
      cpu: "110m"
      memory: "111Mi"
    type: Container

`,
  )
  .setIn(
    [referenceForModel(k8sModels.ResourceQuotaClaimModel), 'default'],
    `
    apiVersion: tmax.io/v1
    kind: ResourceQuotaClaim
    metadata:
      name: example-resource-quota
      namespace: example-namespace
    resourceName: example-claim
    spec:
      hard:
        limits.cpu: ""
        limits.memory: "1Gi"
    
`,
  )
  .setIn(
    [referenceForModel(k8sModels.RoleBindingClaimModel), 'default'],
    `
    apiVersion: tmax.io/v1
    kind: RoleBindingClaim
    metadata:
      name: example-role-biniding
      namespace: example-namespace
    resourceName: example-claim
    subjects:
    - kind: User
      name: example-tmax.co.kr
    roleRef:
      kind: ClusterRole
      name: namespace-user
      apiGroup: rbac.authorization.k8s.io
    
`,
  )
  .setIn(
    [referenceForModel(k8sModels.TaskModel), 'default'],
    `
apiVersion: tekton.dev/v1alpha1
kind: Task
metadata:
    name: example-task
    namespace: example-namespace
spec:
    inputs:
        resources:
            - name: git-source
              type: git
        params:
            - name: example-string
              type: string
              description: a sample string
              default: default-string-value
    outputs:
        resources:
            - name: output-image
              type: image
    steps:
        - name: sample-job
          image: sample-image-name:latest
          env:
            - name: "SAMPLE_ENV"
              value: "hello/world/"
          command:
            - /bin/sh
          args:
            - -c
            - "echo helloworld"
`,
  )
  .setIn(
    [referenceForModel(k8sModels.TaskRunModel), 'default'],
    `
apiVersion: tekton.dev/v1beta1
kind: TaskRun
metadata:
    name: example-taskrun
    namespace: example-namespace
spec:
    serviceAccountName: example-san
    taskRef:
        name: example-task
    inputs:
        resources:
            - name: git-source
              resourceRef:
                name: example-pipeline-resource-git
        params:
            - name: example-string
              value: input-string
    outputs:
        resources:
            - name: output-image
              resourceRef:
                name: example-pipeline-resource-image
`,
  )
  .setIn(
    [referenceForModel(k8sModels.PipelineResourceModel), 'default'],
    `
apiVersion: tekton.dev/v1alpha1
kind: PipelineResource
metadata:
    name: example-pipeline-resource-git
    namespace: example-namespace
spec:
    type: git
    params:
        - name: revision
          value: master
        - name: url
          value: https://github.com/sample/git/url
`,
  )
  .setIn(
    [referenceForModel(k8sModels.PipelineModel), 'default'],
    `
apiVersion: tekton.dev/v1alpha1
kind: Pipeline
metadata:
  name: example-pipeline
  namespace: example-namespace
spec:
    resources:
        resources:
            - name: source-repo
              type: git
            - name: sample-image
              type: image
    tasks:
        - name: task1
          taskRef:
            name: example-task1
          params:
            - name: example-string
              value: sample-string1
          resources:
            inputs:
                - name: example-pipeline-resource-git
                  resource: source-repo
            outputs:
                - name: example-pipeline-resource-image
                  resource: sample-image
        - name: task2
          taskRef:
            name: example-task2
          resources:
            inputs:
                - name: example-input-image
                  resource: sample-image
                  from:
                    - task1
`,
  )
  .setIn(
    [referenceForModel(k8sModels.PipelineRunModel), 'default'],
    `
apiVersion: tekton.dev/v1alpha1
kind: PipelineRun
metadata:
    name: example-pipeline-run
    namespace: example-namespace
spec:
    serviceAccountName: example-san
    pipelineRef:
        name: example-pipeline
    resources:
        - name: source-repo
          resourceRef:
            name: example-pipeline-resource-git
        - name: sample-image
          resourceRef:
            name: example-pipeline-resource-image
`,
  )
  .setIn(
    [referenceForModel(k8sModels.RegistryModel), 'default'],
    `
    # Note: To use the optional key, remove the '#' at the front of the key.

apiVersion: tmax.io/v1
kind: Registry
metadata:
  name: example # (required) [string] registry's name
  namespace: example # (required) [string] registry's namespace
spec:
  image: registryIP:5000/registry:b004 # (required) [string] registry:b004 image's repository (ex: 192.168.6.110:5000/registry:b004)
  #description: example # (optional) [string] a brief description of the registry.
  loginId: example # (required) [string] username for registry login
  loginPassword: example # (required) [string] password for registry login
  #replicaSet:
    #labels:
      #mylabel1: v1
      #mylabel2: v2
    #selector:
      #matchExpressions:
      #- {key: mylabel2, operator: In, values: [v2]}
      #matchLabels:
        #mylabel1: v1
    #nodeSelector:
      #kubernetes.io/hostname: example
    #tolerations:
    #- effect: NoExecute
      #key: node.kubernetes.io/not-ready
      #tolerationSeconds: 10
    #- effect: NoExecute
      #key: node.kubernetes.io/unreachable
      #tolerationSeconds: 10
  service:
    #ingress:
      #domainName: 192.168.6.110.nip.io
      #port: 443 # (optional) [integer] external port (default: 443)
    loadBalancer:
      port: 443 # (optional) [integer] external port (default: 443)
  persistentVolumeClaim:
    create:
      accessModes: [ReadWriteOnce] # (required) [array] (ex: [ReadWriteOnce, ReadWriteMany])
      storageSize: 10Gi # (required) [string] desired storage size (ex: 10Gi)
      storageClassName: example # (required) [string] Filesystem storage class name available (ex: csi-cephfs-sc)
      volumeMode: Filesystem
      deleteWithPvc: false
`,
  )
  .setIn(
    [referenceForModel(k8sModels.TemplateModel), 'default'],
    `
apiVersion: tmax.io/v1
kind: Template
metadata:
  name: example-template
  namespace: default
objects:
- apiVersion: apps/v1
  kind: Deployment
  metadata:
    name: example
    labels:
      app: example
  spec:
    selector:
      matchLabels:
        app: example
    template:
      metadata:
        labels:
          app: example
      spec:
        containers:
        - name: example
          image: example/image:version
          ports:
          - name: example
            containerPort: 80

`,
  )
  .setIn(
    [referenceForModel(k8sModels.TemplateInstanceModel), 'default'],
    `
apiVersion: tmax.io/v1
kind: TemplateInstance
metadata:
  name: example-instance
  namespace: default
spec:
  template:
    metadata:
      name: example-template
    parameters:
    - description: Example Name.
      displayName: Name
      name: NAME
      required: true
      value: example-instance
    - description: Example Image.
      displayName: Image
      name: IMAGE
      required: true
      value: example/image:version

`,
  )
  .setIn(
    [referenceForModel(k8sModels.NetworkPolicyModel), 'default'],
    `
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: example
  namespace: default
spec:
  podSelector:
    matchLabels:
      role: db
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          project: myproject
    - podSelector:
        matchLabels:
          role: somerole
    ports:
    - protocol: TCP
      port: 6379
`,
  )
  .setIn(
    [referenceForModel(k8sModels.NetworkPolicyModel), 'deny-other-namespaces'],
    `
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-other-namespaces
  namespace: target-ns
spec:
  podSelector:
  ingress:
  - from:
    - podSelector: {}
`,
  )
  .setIn(
    [referenceForModel(k8sModels.NetworkPolicyModel), 'db-or-api-allow-app'],
    `
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: db-or-api-allow-app
  namespace: target-ns
spec:
  podSelector:
    matchLabels:
      role: db
  ingress:
    - from:
      - podSelector:
          matchLabels:
            app: mail
`,
  )
  .setIn(
    [referenceForModel(k8sModels.NetworkPolicyModel), 'api-allow-http-and-https'],
    `
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: api-allow-http-and-https
  namespace: target-ns
spec:
  podSelector:
    matchLabels:
      app: api
  ingress:
  - from:
    - podSelector:
          matchLabels:
            role: monitoring
  - ports:
    - protocol: TCP
      port: 80
    - protocol: TCP
      port: 443
`,
  )
  .setIn(
    [referenceForModel(k8sModels.NetworkPolicyModel), 'default-deny-all'],
    `
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: target-ns
spec:
  podSelector:
`,
  )
  .setIn(
    [referenceForModel(k8sModels.NetworkPolicyModel), 'web-allow-external'],
    `
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: web-allow-external
  namespace: target-ns
spec:
  podSelector:
    matchLabels:
      app: web
  ingress:
  - {}
`,
  )
  .setIn(
    [referenceForModel(k8sModels.NetworkPolicyModel), 'web-db-allow-all-ns'],
    `
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: web-db-allow-all-ns
  namespace: target-ns
spec:
  podSelector:
    matchLabels:
      role: web-db
  ingress:
    - from:
      - namespaceSelector: {}
`,
  )
  .setIn(
    [referenceForModel(k8sModels.NetworkPolicyModel), 'web-allow-production'],
    `
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: web-allow-production
  namespace: target-ns
spec:
  podSelector:
    matchLabels:
      app: web
  ingress:
    - from:
      - namespaceSelector:
        matchLabels:
        env: production
`,
  )
  .setIn(
    [referenceForModel(k8sModels.BuildConfigModel), 'default'],
    `
apiVersion: build.openshift.io/v1
kind: BuildConfig
metadata:
  name: example
spec:
  output:
    to:
      kind: ImageStreamTag
      name: example:latest
  source:
    git:
      ref: master
      uri: https://github.com/openshift/ruby-ex.git
    type: Git
  strategy:
    type: Source
    sourceStrategy:
      from:
        kind: ImageStreamTag
        name: ruby:2.4
        namespace: openshift
      env: []
  triggers:
  - type: ImageChange
    imageChange: {}
  - type: ConfigChange
`,
  )
  .setIn(
    [referenceForModel(k8sModels.ChargebackReportModel), 'default'],
    `
apiVersion: chargeback.coreos.com/v1alpha1
kind: Report
metadata:
  name: namespace-memory-request
  namespace: default
spec:
  generationQuery: namespace-memory-request
  gracePeriod: 5m0s
  reportingStart: '2018-01-01T00:00:00Z'
  reportingEnd: '2018-12-30T23:59:59Z'
  runImmediately: true
`,
  )
  .setIn(
    [referenceForModel(k8sModels.DeploymentModel), 'default'],
    `
apiVersion: apps/v1
kind: Deployment
metadata:
  name: example
spec:
  selector:
    matchLabels:
      app: hello-hypercloud
  replicas: 3
  template:
    metadata:
      labels:
        app: hello-hypercloud
    spec:
      containers:
      - name: hello-hypercloud
        image: hypercloud/hello-hypercloud
        ports:
        - containerPort: 8080
`,
  )
  .setIn(
    [referenceForModel(k8sModels.ConfigMapModel), 'default'],
    `
apiVersion: v1
kind: ConfigMap
metadata:
  name: example
  namespace: default
data:
  example.property.1: hello
  example.property.2: world
  example.property.file: |-
    property.1=value-1
    property.2=value-2
    property.3=value-3
`,
  )
  .setIn(
    [referenceForModel(k8sModels.CronJobModel), 'default'],
    `
apiVersion: batch/v1beta1
kind: CronJob
metadata:
  name: example
spec:
  schedule: "@daily"
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: hello
            image: busybox
            args:
            - /bin/sh
            - -c
            - date; echo 'Hello from the Kubernetes cluster'
          restartPolicy: OnFailure
`,
  )
  .setIn(
    [referenceForModel(k8sModels.CustomResourceDefinitionModel), 'default'],
    `
apiVersion: apiextensions.k8s.io/v1beta1
kind: CustomResourceDefinition
metadata:
  # name must match the spec fields below, and be in the form: <plural>.<group>
  name: crontabs.stable.example.com
spec:
  # group name to use for REST API: /apis/<group>/<version>
  group: stable.example.com
  # version name to use for REST API: /apis/<group>/<version>
  version: v1
  # either Namespaced or Cluster
  scope: Namespaced
  names:
    # plural name to be used in the URL: /apis/<group>/<version>/<plural>
    plural: crontabs
    # singular name to be used as an alias on the CLI and for display
    singular: crontab
    # kind is normally the CamelCased singular type. Your resource manifests use this.
    kind: CronTab
    # shortNames allow shorter string to match your resource on the CLI
    shortNames:
    - ct
`,
  )
  .setIn(
    [referenceForModel(k8sModels.DeploymentConfigModel), 'default'],
    `
apiVersion: apps.openshift.io/v1
kind: DeploymentConfig
metadata:
  name: example
spec:
  selector:
    app: hello-hypercloud
  replicas: 3
  template:
    metadata:
      labels:
        app: hello-hypercloud
    spec:
      containers:
      - name: hello-hypercloud
        image: hypercloud/hello-hypercloud
        ports:
        - containerPort: 8080
`,
  )
  .setIn(
    [referenceForModel(k8sModels.PersistentVolumeModel), 'default'],
    `
apiVersion: v1
kind: PersistentVolume
metadata:
  name: example
spec:
  capacity:
    storage: 5Gi
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Recycle
  storageClassName: slow
  nfs:
    path: /tmp
    server: 172.17.0.2
`,
  )
  .setIn(
    [referenceForModel(k8sModels.HorizontalPodAutoscalerModel), 'default'],
    `
apiVersion: autoscaling/v2beta1
kind: HorizontalPodAutoscaler
metadata:
  name: example
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: example
  minReplicas: 1
  maxReplicas: 3
  metrics:
  - type: Resource
    resource:
      name: cpu
      targetAverageUtilization: 50
`,
  )
  .setIn(
    [referenceForModel(k8sModels.PodModel), 'default'],
    `
apiVersion: v1
kind: Pod
metadata:
  name: example
  labels:
    app: hello-hypercloud
spec:
  containers:
    - name: hello-hypercloud
      image: hypercloud/hello-hypercloud
      ports:
        - containerPort: 8080
`,
  )
  .setIn(
    [referenceForModel(k8sModels.IngressModel), 'default'],
    `
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  name: example
spec:
  rules:
  - host: example.com
    http:
      paths:
      - path: /testpath
        backend:
          serviceName: test
          servicePort: 80
`,
  )
  .setIn(
    [referenceForModel(k8sModels.JobModel), 'default'],
    `
apiVersion: batch/v1
kind: Job
metadata:
  name: example
spec:
  selector: {}
  template:
    metadata:
      name: pi
    spec:
      containers:
      - name: pi
        image: perl
        command: ["perl",  "-Mbignum=bpi", "-wle", "print bpi(2000)"]
      restartPolicy: Never
`,
  )
  .setIn(
    [referenceForModel(k8sModels.ImageStreamModel), 'default'],
    `
apiVersion: image.openshift.io/v1
kind: ImageStream
metadata:
  name: example
`,
  )
  .setIn(
    [referenceForModel(k8sModels.RoleBindingModel), 'default'],
    `
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: example
subjects:
- kind: Group
  name: "my-sample-group"
  apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: ClusterRole
  name: view
  apiGroup: rbac.authorization.k8s.io
`,
  )
  .setIn(
    [referenceForModel(k8sModels.ClusterRoleModel), 'default'],
    `apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: example
rules:
- apiGroups: [""] # "" indicates the core API group
  resources: ["pods"]
  verbs: ["get", "watch", "list"]
`,
  )
  .setIn(
    [referenceForModel(k8sModels.RoleModel), 'default'],
    `apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: example
rules:
- apiGroups: [""] # "" indicates the core API group
  resources: ["pods"]
  verbs: ["get", "watch", "list"]
`,
  )
  .setIn(
    [referenceForModel(k8sModels.RoleModel), 'read-pods-within-ns'],
    `
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: read-pods-within-ns
  namespace: default
rules:
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "list", "watch"]
`,
  )
  .setIn(
    [referenceForModel(k8sModels.RoleModel), 'read-write-deployment-in-ext-and-apps-apis'],
    `
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: read-write-deployment-in-ext-and-apps-apis
  namespace: default
rules:
- apiGroups: ["extensions", "apps"]
  resources: ["deployments"]
  verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
`,
  )
  .setIn(
    [referenceForModel(k8sModels.RoleModel), 'read-pods-and-read-write-jobs'],
    `apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: read-pods-and-read-write-jobs
  namespace: default
rules:
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "list", "watch"]
- apiGroups: ["batch", "extensions"]
  resources: ["jobs"]
  verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
`,
  )
  .setIn(
    [referenceForModel(k8sModels.RoleModel), 'read-configmap-within-ns'],
    `
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: read-configmap-within-ns
  namespace: default
rules:
- apiGroups: [""]
  resources: ["configmaps"]
  resourceNames: ["my-config"]
  verbs: ["get"]
`,
  )
  .setIn(
    [referenceForModel(k8sModels.ClusterRoleModel), 'read-nodes'],
    `
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  # "namespace" omitted since ClusterRoles are not namespaced
  name: read-nodes
rules:
- apiGroups: [""]
  resources: ["nodes"]
  verbs: ["get", "list", "watch"]
`,
  )
  .setIn(
    [referenceForModel(k8sModels.ClusterRoleModel), 'get-and-post-to-non-resource-endpoints'],
    `
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  # "namespace" omitted since ClusterRoles are not namespaced
  name: get-and-post-to-non-resource-endpoints
rules:
- nonResourceURLs: ["/healthz", "/healthz/*"] # '*' in a nonResourceURL is a suffix glob match
  verbs: ["get", "post"]
`,
  )
  .setIn(
    [referenceForModel(k8sModels.ServiceModel), 'default'],
    `
apiVersion: v1
kind: Service
metadata:
  name: example
spec:
  selector:
    app: MyApp
  ports:
  - protocol: TCP
    port: 80
    targetPort: 9376
`,
  )
  .setIn(
    [referenceForModel(k8sModels.DaemonSetModel), 'default'],
    `
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: example
spec:
  selector:
    matchLabels:
      app: hello-hypercloud
  template:
    metadata:
      labels:
        app: hello-hypercloud
    spec:
      containers:
      - name: hello-hypercloud
        image: hypercloud/hello-hypercloud
        ports:
        - containerPort: 8080
`,
  )
  .setIn(
    [referenceForModel(k8sModels.PersistentVolumeClaimModel), 'default'],
    `
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: example
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 8Gi
  storageClassName: slow
  selector:
    matchLabels:
      release: "stable"
    matchExpressions:
      - {key: environment, operator: In, values: [dev]}
`,
  )
  .setIn(
    [referenceForModel(k8sModels.ResourceQuotaModel), 'default'],
    `
apiVersion: v1
kind: ResourceQuota
metadata:
  name: example
spec:
  hard:
    pods: "4"
    requests.cpu: "1"
    requests.memory: 1Gi
    limits.cpu: "2"
    limits.memory: 2Gi
`,
  )
  .setIn(
    [referenceForModel(k8sModels.StatefulSetModel), 'default'],
    `
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: example
spec:
  serviceName: "nginx"
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      terminationGracePeriodSeconds: 10
      containers:
      - name: nginx
        image: gcr.io/google_containers/nginx-slim:0.8
        ports:
        - containerPort: 80
          name: web
        volumeMounts:
        - name: www
          mountPath: /usr/share/nginx/html
  volumeClaimTemplates:
  - metadata:
      name: www
    spec:
      accessModes: [ "ReadWriteOnce" ]
      storageClassName: my-storage-class
      resources:
        requests:
          storage: 1Gi
`,
  )
  .setIn(
    [referenceForModel(k8sModels.StorageClassModel), 'default'],
    `
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: example
provisioner: my-provisioner
reclaimPolicy: Delete
`,
  )
  .setIn(
    [referenceForModel(k8sModels.ServiceAccountModel), 'default'],
    `
apiVersion: v1
kind: ServiceAccount
metadata:
  name: example
`,
  )
  .setIn(
    [referenceForModel(k8sModels.SecretModel), 'default'],
    `
apiVersion: v1
kind: Secret
metadata:
  name: example
type: Opaque
stringData:
  username: admin
  password: damin
`,
  )
  .setIn(
    [referenceForModel(k8sModels.ReplicaSetModel), 'default'],
    `
apiVersion: apps/v1
kind: ReplicaSet
metadata:
  name: example
spec:
  replicas: 2
  selector:
    matchLabels:
      app: hello-hypercloud
  template:
    metadata:
      name: hello-hypercloud
      labels:
        app: hello-hypercloud
    spec:
      containers:
      - name: hello-hypercloud
        image: hypercloud/hello-hypercloud
        ports:
        - containerPort: 8080
`,
  )
  .setIn(
    [referenceForModel(k8sModels.RouteModel), 'default'],
    `
apiVersion: route.openshift.io/v1
kind: Route
metadata:
  name: example
spec:
  path: /
  to:
    kind: Service
    name: example
  port:
    targetPort: 80
`,
  )
  .setIn(
    [referenceForModel(k8sModels.ReplicationControllerModel), 'default'],
    `
apiVersion: v1
kind: ReplicationController
metadata:
  name: example
spec:
  replicas: 2
  selector:
    app: hello-hypercloud
  template:
    metadata:
      name: hello-hypercloud
      labels:
        app: hello-hypercloud
    spec:
      containers:
      - name: hello-hypercloud
        image: hypercloud/hello-hypercloud
        ports:
        - containerPort: 8080
`,
  )
  .setIn(
    [referenceForModel(k8sModels.BuildConfigModel), 'docker-build'],
    `
apiVersion: build.openshift.io/v1
kind: BuildConfig
metadata:
  name: docker-build
  namespace: default
  labels:
    name: docker-build
spec:
  triggers:
  - type: GitHub
    github:
      secret: secret101
  - type: ImageChange
    imageChange: {}
  - type: ConfigChange
  source:
    type: Git
    git:
      uri: https://github.com/openshift/ruby-hello-world.git
  strategy:
    type: Docker
    dockerStrategy:
      from:
        kind: ImageStreamTag
        name: ruby:latest
        namespace: openshift
      env:
      - name: EXAMPLE
        value: sample-app
  output:
    to:
      kind: ImageStreamTag
      name: origin-ruby-sample:latest
  postCommit:
    args:
    - bundle
    - exec
    - rake
    - test
`,
  )
  .setIn(
    [referenceForModel(k8sModels.BuildConfigModel), 's2i-build'],
    `apiVersion: build.openshift.io/v1
kind: BuildConfig
metadata:
  name: s2i-build
  namespace: default
spec:
  output:
    to:
      kind: ImageStreamTag
      name: s2i-build:latest
  source:
    git:
      ref: master
      uri: https://github.com/openshift/ruby-ex.git
    type: Git
  strategy:
    type: Source
    sourceStrategy:
      from:
        kind: ImageStreamTag
        name: ruby:2.4
        namespace: openshift
      env: []
  triggers:
  - type: ImageChange
    imageChange: {}
  - type: ConfigChange
`,
  )
  .setIn(
    [referenceForModel(k8sModels.BuildConfigModel), 'pipeline-build'],
    `
apiVersion: build.openshift.io/v1
kind: BuildConfig
metadata:
  labels:
    name: pipeline-build
  name: pipeline-build
  namespace: default
spec:
  strategy:
    jenkinsPipelineStrategy:
      jenkinsfile: |-
        node('nodejs') {
          stage('build') {
            sh 'npm --version'
          }
        }
    type: JenkinsPipeline
  triggers:
  - type: ConfigChange
`,
  )
  .setIn(
    [referenceForModel(k8sModels.ConditionModel), 'default'],
    `
    apiVersion: tekton.dev/v1alpha1
    kind: Condition
    metadata:
     name: sample-condition
     namespace: default
    spec:
     params:
       - name: "path"
     resources:
       - name: sample-resource
         type: git
         optional: true
     check:
       image: alpine
       script: 'test ! -f $(resources.sample-resource.path)/$(params.path)'    
`,
  )
  .setIn(
    [referenceForModel(k8sModels.VirtualServiceModel), 'default'],
    `
    apiVersion: networking.istio.io/v1alpha3
    kind: VirtualService
    metadata:
      name: example-virtualservice
    spec:
      hosts:
      - example.com
      http:
      - match:
        - uri:
            prefix: /reviews
        route:
        - destination:
            host: reviews
            subset: v2
      - route:
        - destination:
            host: reviews
            subset: v3
      
`,
  )
  .setIn(
    [referenceForModel(k8sModels.DestinationRuleModel), 'default'],
    `
    apiVersion: networking.istio.io/v1alpha3
    kind: DestinationRule
    metadata:
      name: my-destination-rule
    spec:
      host: my-svc
      trafficPolicy:
        loadBalancer:
          simple: RANDOM
      subsets:
      - name: v1
        labels:
          version: v1
      - name: v2
        labels:
          version: v2
        trafficPolicy:
          loadBalancer:
            simple: ROUND_ROBIN
      - name: v3
        labels:
          version: v3      
`,
  )
  .setIn(
    [referenceForModel(k8sModels.EnvoyFilterModel), 'default'],
    `
    apiVersion: networking.istio.io/v1alpha3
    kind: EnvoyFilter
    metadata:
      name: custom-protocol
    spec:
      workloadSelector:
        labels:
          app: hello
      configPatches:
      - applyTo: NETWORK_FILTER
        match:
          context: SIDECAR_OUTBOUND
          listener:
            portNumber: 9307
            filterChain:
              filter:
                name: "envoy.tcp_proxy"
        patch:
          operation: INSERT_BEFORE
          value:
            name: "envoy.config.filter.network.custom_protocol"    
`,
  )
  .setIn(
    [referenceForModel(k8sModels.GatewayModel), 'default'],
    `
    apiVersion: networking.istio.io/v1alpha3
    kind: Gateway
    metadata:
      name: ext-host-gwy
    spec:
      selector:
        app: my-gateway-controller
      servers:
      - port:
          number: 443
          name: https
          protocol: HTTPS
        hosts:
        - ext-host.example.com
        tls:
          mode: SIMPLE
          serverCertificate: /tmp/tls.crt
          privateKey: /tmp/tls.key    
`,
  )
  .setIn(
    [referenceForModel(k8sModels.SidecarModel), 'default'],
    `
    apiVersion: networking.istio.io/v1alpha3
    kind: Sidecar 
    metadata: 
      name: my-sidecar 
    spec: 
      workloadSelector: 
        labels: 
          app: hello
      egress: 
      - hosts: 
        - "./*" 
        - "istio-system/*"   
`,
  )
  .setIn(
    [referenceForModel(k8sModels.ServiceEntryModel), 'default'],
    `
    apiVersion: networking.istio.io/v1alpha3 
    kind: ServiceEntry 
    metadata: 
      name: svc-entry 
    spec: 
      hosts: 
      - ext-svc.example.com 
      ports: 
      - number: 443 
        name: https 
        protocol: HTTPS 
      location: MESH_EXTERNAL 
      resolution: DNS  
`,
  )
  .setIn(
    [referenceForModel(k8sModels.RequestAuthenticationModel), 'default'],
    `
    apiVersion: security.istio.io/v1beta1
    kind: RequestAuthentication
    metadata:
      name: jwt-example
    spec:
      selector:
        matchLabels:
          app: hello
      jwtRules:
      - issuer: "testing@secure.istio.io"
        jwksUri: "https://raw.githubusercontent.com/istio/istio/release-1.6/security/tools/jwt/samples/jwks.json"   
`,
  )
  .setIn(
    [referenceForModel(k8sModels.PeerAuthenticationModel), 'default'],
    `
    apiVersion: security.istio.io/v1beta1
    kind: PeerAuthentication
    metadata:
      name: example-peer-policy
    spec:
      selector:
        matchLabels:
          app: hello
      mtls:
        mode: STRICT  
`,
  )
  .setIn(
    [referenceForModel(k8sModels.AuthorizationPolicyModel), 'default'],
    `
    apiVersion: security.istio.io/v1beta1
    kind: AuthorizationPolicy
    metadata:
      name: allow-read
    spec:
      selector:
        matchLabels:
          app: hello
      action: ALLOW
      rules:
      - to:
        - operation:
             methods: ["GET", "HEAD"]       
`,
  );
