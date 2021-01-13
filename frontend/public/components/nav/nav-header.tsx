import * as React from 'react';
import { connect } from 'react-redux';
import { Dropdown, DropdownItem, DropdownToggle, Title } from '@patternfly/react-core';
import { CaretDownIcon } from '@patternfly/react-icons';
//import { Perspective } from '@console/plugin-sdk';
import { Perspective, getPerspectives } from '../../hypercloud/perspectives';
import { RootState } from '../../redux';
import { featureReducerName, getFlagsObject, FlagsObject } from '../../reducers/features';
import { getActiveCluster } from '../../actions/ui';
import { getActivePerspective } from '../../reducers/ui';
import * as UIActions from '../../actions/ui';
import { history } from '../utils';
import ClusterDropdown from '../hypercloud/nav/cluster-dropdown';

type StateProps = {
  activePerspective: string;
  setActivePerspective?: (id: string) => void;
  flags: FlagsObject;
};

export type NavHeaderProps = {
  onPerspectiveSelected: () => void;
  onClusterSelected: () => void;
};

const NavHeader_: React.FC<NavHeaderProps & StateProps> = ({
  setActivePerspective,
  onPerspectiveSelected,
  activePerspective,
  onClusterSelected,
  flags,
}) => {
  const [isPerspectiveDropdownOpen, setPerspectiveDropdownOpen] = React.useState(false);

  const togglePerspectiveOpen = React.useCallback(() => {
    setPerspectiveDropdownOpen(!isPerspectiveDropdownOpen);
  }, [isPerspectiveDropdownOpen]);

  const onPerspectiveSelect = React.useCallback(
    (event: React.MouseEvent<HTMLLinkElement>, perspective: Perspective): void => {
      event.preventDefault();
      if (perspective.properties.id !== activePerspective) {
        setActivePerspective(perspective.properties.id);
        history.push(perspective.properties.getLandingPageURL(flags, getActiveCluster()));
      }

      setPerspectiveDropdownOpen(false);
      onPerspectiveSelected && onPerspectiveSelected();
    },
    [activePerspective, flags, onPerspectiveSelected, setActivePerspective],
  );

  const renderToggle = React.useCallback(
    (icon: React.ReactNode, name: string) => (
      <DropdownToggle
        isOpen={isPerspectiveDropdownOpen}
        onToggle={togglePerspectiveOpen}
        iconComponent={CaretDownIcon}
        data-test-id="perspective-switcher-toggle"
      >
        <Title size="md">
          <span className="oc-nav-header__icon">{icon}</span>
          {name}
        </Title>
      </DropdownToggle>
    ),
    [isPerspectiveDropdownOpen, togglePerspectiveOpen],
  );

  const getPerspectiveItems = React.useCallback(
    (perspectives: Perspective[]) => {
      return perspectives.map((nextPerspective: Perspective) => (
        <DropdownItem
          key={nextPerspective.properties.id}
          onClick={(event: React.MouseEvent<HTMLLinkElement>) =>
            onPerspectiveSelect(event, nextPerspective)
          }
          isHovered={nextPerspective.properties.id === activePerspective}
          component="button"
        >
          <Title size="md">
            <span className="oc-nav-header__icon">{nextPerspective.properties.icon}</span>
            {nextPerspective.properties.name}
          </Title>
        </DropdownItem>
      ));
    },
    [activePerspective, onPerspectiveSelect],
  );

  const perspectives = React.useMemo(() => getPerspectives(), []);
  const { icon, name } = React.useMemo(
    () => perspectives.find((p) => p.properties.id === activePerspective).properties,
    [activePerspective, perspectives],
  );

  return (
    <>
      {window.SERVER_FLAGS.McMode && (
        <div className="oc-nav-header">
          <h4>Application</h4>
          <Dropdown
            isOpen={isPerspectiveDropdownOpen}
            toggle={renderToggle(icon, name)}
            dropdownItems={getPerspectiveItems(perspectives)}
            data-test-id="perspective-switcher-menu"
          />
          {activePerspective == "hc" &&
            <>
              <h4>Cluster</h4>
              <ClusterDropdown onClusterSelected={onClusterSelected} />
            </>
          }
        </div>
      )
      }
    </>
  );
};

const mapStateToProps = (state: RootState): StateProps => ({
  activePerspective: getActivePerspective(state),
  flags: getFlagsObject(state),
});

export default connect<StateProps, {}, NavHeaderProps, RootState>(
  mapStateToProps,
  { setActivePerspective: UIActions.setActivePerspective },
  null,
  {
    areStatesEqual: (next, prev) =>
      next[featureReducerName] === prev[featureReducerName] &&
      getActivePerspective(next) === getActivePerspective(prev),
  },
)(NavHeader_);
