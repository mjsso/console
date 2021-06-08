import * as _ from 'lodash-es';
import { coFetchJSON } from '../../co-fetch';
import { k8sBasePath, multiClusterBasePath } from './k8s';
import { selectorToString } from './selector';
import { WSFactory } from '../ws-factory';
import { getActivePerspective, getActiveCluster } from '../../actions/ui';
import { getId, getUserGroup } from '../../hypercloud/auth';
import { kindToSchemaPath } from '../hypercloud/k8s/kind-to-schema-path.ts'

export const getDynamicProxyPath = (cluster) => {
  if (window.SERVER_FLAGS.McMode && getActivePerspective() == 'hc') {
    return `${window.SERVER_FLAGS.basePath}api/${getActiveCluster()}`;
  } else if (cluster) {
    return `${window.SERVER_FLAGS.basePath}api/${cluster}`;
  } else {
    return k8sBasePath;
  }
};

/** @type {(model: K8sKind) => string} */
export const getK8sAPIPath = ({ apiGroup = 'core', apiVersion}, cluster)
=> {
  const isLegacy = apiGroup === 'core' && apiVersion === 'v1';

  let p = getDynamicProxyPath(cluster);

  if (isLegacy) {
    p += '/api/';
  } else {
    p += '/apis/';
  }

  if (!isLegacy && apiGroup) {
    p += `${apiGroup}/`;
  }

  p += apiVersion;
  return p;
};

/** @type {(model: K8sKind) => string} */
const getClusterAPIPath = ({ apiGroup = 'core', apiVersion}, cluster)
=> {
  const isLegacy = apiGroup === 'core' && apiVersion === 'v1';
  let p = multiClusterBasePath;

  if (window.SERVER_FLAGS.McMode && getActivePerspective() == 'hc') {
    p = `${window.SERVER_FLAGS.basePath}api/${getActiveCluster()}`;
  } else if (cluster) {
    p = `${window.SERVER_FLAGS.basePath}api/${cluster}`;
  }
  return p;
};

/** @type {(model: GroupVersionKind, options: {ns?: string, name?: string, path?: string, queryParams?: {[k: string]: string}}) => string} */
// export const resourceURL = (model, options, listName) => {
export const resourceURL = (model, options) => {
  let q = '';
  let u = getK8sAPIPath(model, options.cluster);

  if (options.ns) {
    u += `/namespaces/${options.ns}`;
  }
  u += `/${model.plural}`;
  if (options.name) {
    // Some resources like Users can have special characters in the name.
    u += `/${encodeURIComponent(options.name)}`;
  }
  if (options.path) {
    u += `/${options.path}`;
  }
  if (!_.isEmpty(options.queryParams)) {
    q = _.map(options.queryParams, function(v, k) {
      return `${k}=${v}`;
    });
    u += `?${q.join('&')}`;
  }

  return u;
};

export const resourceClusterURL = (model, options) => {
  let q = '';
  let u = getClusterAPIPath(model, options.cluster);

  if (options.ns) {
    u += `/namespaces/${options.ns}`;
  }
  u += `/${model.plural}`;
  if (options.name) {
    // Some resources like Users can have special characters in the name.
    u += `/${encodeURIComponent(options.name)}`;
  }
  if (options.path) {
    u += `/${options.path}`;
  }
  if (!_.isEmpty(options.queryParams)) {
    q = _.map(options.queryParams, function(v, k) {
      return `${k}=${v}`;
    });
    u += `?${q.join('&')}`;

  }

  if(isCluster(model)) {
    return `${u}?userId=${getId()}${getUserGroup()}&accessOnly=false`;
  }
  return `${u}?userId=${getId()}${getUserGroup()}`;
}

export const resourceApprovalURL = (model, options, approval) => {
  return resourceURL(model, options).replace('cicd', 'cicdapi') + `/${approval}`
}

const isCluster = (model) => {
  if(model.kind === 'ClusterManager') {
    return true;
  }
  return false;
}

const isClusterClaim = (model) => {
  if(model.kind === 'ClusterClaim') {
    return true;
  }
  return false;
}

export const watchURL = (kind, options) => {
  const opts = options || {};

  opts.queryParams = opts.queryParams || {};
  opts.queryParams.watch = true;
  return resourceURL(kind, opts);
};

export const k8sGet = (kind, name, ns, opts) => coFetchJSON(resourceURL(kind, Object.assign({ ns, name }, opts)));

export const k8sCreate = (kind, data, opts = {}) => {
  // Occassionally, a resource won't have a metadata property.
  // For example: apps.openshift.io/v1 DeploymentRequest
  // https://github.com/openshift/api/blob/master/apps/v1/types.go
  data.metadata = data.metadata || {};

  // Lowercase the resource name
  // https://github.com/kubernetes/kubernetes/blob/HEAD/docs/user-guide/identifiers.md#names
  if (data.metadata.name && _.isString(data.metadata.name) && !data.metadata.generateName) {
    data.metadata.name = data.metadata.name.toLowerCase();
  }

  return coFetchJSON.post(resourceURL(kind, Object.assign({ ns: data.metadata.namespace }, opts)), data);
};

export const k8sCreateUrl = (kind, data, opts = {}) => {
  return coFetchJSON.post(resourceURL(kind, opts), data);
}


export const k8sUpdate = (kind, data, ns, name) => coFetchJSON.put(resourceURL(kind, { ns: ns || data.metadata.namespace, name: name || data.metadata.name }), data);

export const k8sUpdateApproval = (kind, resource, approval, data, method = 'PUT') => {
  const url = resourceApprovalURL(
    kind,
    Object.assign(
      {
        ns: resource.metadata.namespace,
        name: resource.metadata.name,
      },
    ),
    approval,
  );

  switch(method) {
    case 'PATCH': {
      return coFetchJSON.patch(url, data);
    }
    default: {
      return coFetchJSON.put(url, data);
    }
  }
}

export const k8sUpdateClaim = (kind, clusterClaim, admit, reason = '', userName, nameSpace) => {

  const resourceClusterURL = `api/multi-hypercloud/namespaces/${nameSpace}/clusterclaims/${clusterClaim}?userId=${getId()}${getUserGroup()}`;

  const url = resourceClusterURL + `&admit=${admit}&reason=${reason}&userName=${userName}&memberName=cho`;

  return coFetchJSON.put(url);
}

export const k8sPatch = (kind, resource, data, opts = {}) => {
  const patches = _.compact(data);

  if (_.isEmpty(patches)) {
    return Promise.resolve(resource);
  }

  return coFetchJSON.patch(
    resourceURL(
      kind,
      Object.assign(
        {
          ns: resource.metadata.namespace,
          name: resource.metadata.name,
        },
        opts,
      ),
    ),
    patches,
  );
};

export const k8sCreateSchema = (kind) => {
  const directory = kindToSchemaPath.get(kind)?.['directory'];
  const file = kindToSchemaPath.get(kind)?.['file'];
  const schemaUrl = `/api/resource/${directory}/${file}`;
  return coFetchJSON(`${schemaUrl}`, 'GET');
}

export const k8sPatchByName = (kind, name, namespace, data, opts = {}) => k8sPatch(kind, { metadata: { name, namespace } }, data, opts);

export const k8sKill = (kind, resource, opts = {}, json = null) => coFetchJSON.delete(resourceURL(kind, Object.assign({ ns: resource.metadata.namespace, name: resource.metadata.name }, opts)), opts, json);

export const k8sKillByName = (kind, name, namespace, opts = {}) => k8sKill(kind, { metadata: { name, namespace } }, opts);

export const k8sList = (kind, params = {}, raw = false, options = {}) => {
  const query = _.map(_.omit(params, 'ns'), (v, k) => {
    if (k === 'labelSelector') {
      v = selectorToString(v);
    }
    return `${encodeURIComponent(k)}=${encodeURIComponent(v)}`;
  }).join('&');

  // if(isCluster(kind) || isClusterClaim(kind)) {
  //   const listClusterURL = resourceClusterURL(kind);
  //   return coFetchJSON(`${listClusterURL}`, 'GET').then((result) => raw ? result: result.items);
  // }

  let isMultiCluster = isCluster(kind) || isClusterClaim(kind);
  let listURL = isMultiCluster ? resourceClusterURL(kind, {ns: params.ns}) : resourceURL(kind, { ns: params.ns });
  // let listURL = resourceURL(kind, { ns: params.ns });
  if(localStorage.getItem('bridge/last-perspective') === 'hc') {
    return coFetchJSON(`${listURL}?${query}`, 'GET', options).then(result => (raw ? result : result.items));
  }

  if (kind.kind === 'Namespace') {
    listURL = `${document.location.origin}/api/hypercloud/namespace?userId=${getId()}${getUserGroup()}`;
    return coFetchJSON(`${listURL}`, 'GET', options).then(result => (raw ? result : result.items));
  } else if (kind.kind === 'NamespaceClaim') {
    listURL = `${document.location.origin}/api/hypercloud/namespaceClaim?userId=${getId()}${getUserGroup()}`;
    return coFetchJSON(`${listURL}`, 'GET', options).then(result => (raw ? result : result.items));
  } else if (isMultiCluster){
    return coFetchJSON(`${listURL}`, 'GET', options).then(result => (raw ? result : result.items));  
  }
  else {
    return coFetchJSON(`${listURL}?${query}`, 'GET', options).then(result => (raw ? result : result.items));
  }
};

export const k8sListPartialMetadata = (kind, params = {}, raw = false) => {
  return k8sList(kind, params, raw, {
    headers: {
      Accept: 'application/json;as=PartialObjectMetadataList;v=v1beta1;g=meta.k8s.io,application/json',
    },
  });
};

export const k8sWatch = (kind, query = {}, wsOptions = {}) => {
  const queryParams = { watch: true };
  const opts = { queryParams };
  wsOptions = Object.assign(
    {
      host: 'auto',
      reconnect: true,
      jsonParse: true,
      bufferFlushInterval: 500,
      bufferMax: 1000,
    },
    wsOptions,
  );

  const labelSelector = query.labelSelector || kind.labelSelector;
  if (labelSelector) {
    const encodedSelector = encodeURIComponent(selectorToString(labelSelector));
    if (encodedSelector) {
      queryParams.labelSelector = encodedSelector;
    }
  }

  if (query.fieldSelector) {
    queryParams.fieldSelector = encodeURIComponent(query.fieldSelector);
  }

  if (query.ns) {
    opts.ns = query.ns;
  }

  if (query.resourceVersion) {
    queryParams.resourceVersion = encodeURIComponent(query.resourceVersion);
  }

  const path = resourceURL(kind, opts);
  wsOptions.path = path;
  return new WSFactory(path, wsOptions);
};
