import * as _ from 'lodash-es';
import * as React from 'react';
import { render } from 'react-dom';
import { Helmet } from 'react-helmet';
import { Provider } from 'react-redux';
import { Route, Router, Switch } from 'react-router-dom';
// AbortController is not supported in some older browser versions
import 'abort-controller/polyfill';
import store from '../redux';
import { detectFeatures } from '../actions/features';
import AppContents from './app-contents';
import { getBrandingDetails, Masthead } from './masthead';
import { ConsoleNotifier } from './console-notifier';
import { ConnectedNotificationDrawer } from './notification-drawer';
import { Navigation } from './nav';
import { history, LoadingBox } from './utils';
import * as UIActions from '../actions/ui';
import { fetchSwagger, getCachedResources } from '../module/k8s';
import { fetchEventSourcesCrd } from '../../packages/knative-plugin/src/utils/fetch-dynamic-eventsources-utils';
import { receivedResources, watchAPIServices } from '../actions/k8s';
// cloud shell imports must come later than features
import CloudShell from '@console/app/src/components/cloud-shell/CloudShell';
import CloudShellTab from '@console/app/src/components/cloud-shell/CloudShellTab';
import '../vendor.scss';
import '../style.scss';
import './hypercloud/utils/langs/i18n';
//PF4 Imports
import { Page } from '@patternfly/react-core';
// import Keycloak from 'keycloak-js';
import keycloak from '../hypercloud/keycloak';
import { setAccessToken, setIdToken, setId, resetLoginState } from '../hypercloud/auth';
import { initializationForMenu } from '@console/internal/components/hypercloud/utils/menu-utils';
import { setUrlFromIngresses } from '@console/internal/components/hypercloud/utils/ingress-utils';
import { isSingleClusterPerspective } from '@console/internal/hypercloud/perspectives';

const breakpointMD = 768;
const NOTIFICATION_DRAWER_BREAKPOINT = 1800;

// Edge lacks URLSearchParams
import 'url-search-params-polyfill';

class App extends React.PureComponent {
  constructor(props) {
    super(props);
    this._onNavToggle = this._onNavToggle.bind(this);
    this._onNavSelect = this._onNavSelect.bind(this);
    this._onNotificationDrawerToggle = this._onNotificationDrawerToggle.bind(this);
    this._isDesktop = this._isDesktop.bind(this);
    this._onResize = this._onResize.bind(this);
    this.previousDesktopState = this._isDesktop();
    this.previousDrawerInlineState = this._isLargeLayout();

    this.state = {
      isNavOpen: this._isDesktop(),
      isDrawerInline: this._isLargeLayout(),
    };
  }

  UNSAFE_componentWillMount() {
    window.addEventListener('resize', this._onResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._onResize);
  }

  componentDidUpdate(prevProps) {
    const props = this.props;
    // Prevent infinite loop in case React Router decides to destroy & recreate the component (changing key)
    const oldLocation = _.omit(prevProps.location, ['key']);
    const newLocation = _.omit(props.location, ['key']);
    if (_.isEqual(newLocation, oldLocation) && _.isEqual(props.match, prevProps.match)) {
      return;
    }
    // two way data binding :-/
    const { pathname } = props.location;
    store.dispatch(UIActions.setCurrentLocation(pathname));
  }

  _isLargeLayout() {
    return window.innerWidth >= NOTIFICATION_DRAWER_BREAKPOINT;
  }

  _isDesktop() {
    return window.innerWidth >= breakpointMD;
  }

  _onNavToggle() {
    // Some components, like svg charts, need to reflow when nav is toggled.
    // Fire event after a short delay to allow nav animation to complete.
    setTimeout(() => {
      window.dispatchEvent(new Event('sidebar_toggle'));
    }, 100);

    this.setState(prevState => {
      return {
        isNavOpen: !prevState.isNavOpen,
      };
    });
  }

  _onNotificationDrawerToggle() {
    if (this._isLargeLayout()) {
      // Fire event after the drawer animation speed delay.
      setTimeout(() => {
        window.dispatchEvent(new Event('sidebar_toggle'));
      }, 250);
    }
  }

  _onNavSelect() {
    //close nav on mobile nav selects
    if (!this._isDesktop()) {
      this.setState({ isNavOpen: false });
    }
  }

  _onResize() {
    const isDesktop = this._isDesktop();
    const isDrawerInline = this._isLargeLayout();
    if (this.previousDesktopState !== isDesktop) {
      this.setState({ isNavOpen: isDesktop });
      this.previousDesktopState = isDesktop;
    }
    if (this.previousDrawerInlineState !== isDrawerInline) {
      this.setState({ isDrawerInline });
      this.previousDrawerInlineState = isDrawerInline;
    }
  }

  render() {
    const { isNavOpen, isDrawerInline } = this.state;
    const { productName } = getBrandingDetails();

    return (
      <>
        <Helmet titleTemplate={`%s · ${productName}`} defaultTitle={productName} />
        <ConsoleNotifier location="BannerTop" />
        <Page header={<Masthead keycloak={keycloak} onNavToggle={this._onNavToggle} />} sidebar={<Navigation isNavOpen={isNavOpen} onNavSelect={this._onNavSelect} onPerspectiveSelected={this._onNavSelect} onClusterSelected={this._onNavSelect} isSingleClusterPerspective={isSingleClusterPerspective()} />}>
          <ConnectedNotificationDrawer isDesktop={isDrawerInline} onDrawerChange={this._onNotificationDrawerToggle}>
            <AppContents />
          </ConnectedNotificationDrawer>
        </Page>
        <CloudShell />
        <ConsoleNotifier location="BannerBottom" />
      </>
    );
  }
}

// export const keycloak = new Keycloak({
//   realm: window.SERVER_FLAGS.KeycloakRealm,
//   url: window.SERVER_FLAGS.KeycloakAuthURL,
//   clientId: window.SERVER_FLAGS.KeycloakClientId,
// });

// keycloak.logout = keycloak.logout.bind(keycloak, { redirectUri: document.location.origin });

keycloak
  .init({
    onLoad: 'check-sso',
    checkLoginIframe: false,
  })
  .then(authorization => {
    if (!authorization) {
      keycloak.login();
      return;
    }
    render(
      <Provider store={store}>
        <Router history={history} basename={window.SERVER_FLAGS.basePath}>
          <Switch>
            <Route path="/terminal" component={CloudShellTab} />
            <Route path="/" component={App} />
          </Switch>
        </Router>
      </Provider>,
      document.getElementById('app'),
    );
  })
  .catch(error => {
    // render(<div>{!!error ? error : 'Failed to initialize Keycloak'}</div>, document.getElementById('app'));
    render(
      <div className="co-m-pane__body">
        <h1 className="co-m-pane__heading co-m-pane__heading--center">Oh no! Something went wrong.</h1>
        <label htmlFor="description">Description: </label>
        <p>{!!error ? error.stack : 'Failed to initialize keycloak'}</p>
      </div>,
      document.getElementById('app'),
    );
  });

keycloak.onReady = function() {
  console.log('[keycloak] onReady');
};
keycloak.onAuthSuccess = function() {
  console.log('[keycloak] onAuthSuccess');

  setIdToken(keycloak.idToken);
  setAccessToken(keycloak.token);
  setId(keycloak.idTokenParsed.preferred_username);
  setUrlFromIngresses().then(() => {
    const startDiscovery = () => store.dispatch(watchAPIServices());
    // Load cached API resources from localStorage to speed up page load.
    getCachedResources()
      .then(resources => {
        if (resources) {
          store.dispatch(receivedResources(resources));
        }
        // Still perform discovery to refresh the cache.
        startDiscovery();
      })
      .catch(startDiscovery);

    store.dispatch(detectFeatures());

    // Global timer to ensure all <Timestamp> components update in sync
    setInterval(() => store.dispatch(UIActions.updateTimestamps(Date.now())), 10000);

    fetchEventSourcesCrd();

    // Fetch swagger on load if it's stale.
    fetchSwagger();

    // Used by GUI tests to check for unhandled exceptions
    window.windowError = false;
    window.onerror = window.onunhandledrejection = e => {
      // eslint-disable-next-line no-console
      console.error('Uncaught error', e);
      window.windowError = e || true;
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .getRegistrations()
        .then(registrations => registrations.forEach(reg => reg.unregister()))
        // eslint-disable-next-line no-console
        .catch(e => console.warn('Error unregistering service workers', e));
    }
  });
};
keycloak.onAuthError = function() {
  console.log('[keycloak] onAuthError');
};
keycloak.onAuthRefreshSuccess = function() {
  console.log('[keycloak] onAuthRefreshSuccess');
};
keycloak.onAuthRefreshError = function() {
  console.log('[keycloak] onAuthRefreshError');
};
keycloak.onAuthLogout = function() {
  console.log('[keycloak] onAuthLogout');
  keycloak.logout();
  resetLoginState();
};
keycloak.onTokenExpired = function() {
  console.log('[keycloak] onTokenExpired ');
  keycloak.logout();
  resetLoginState();
};
