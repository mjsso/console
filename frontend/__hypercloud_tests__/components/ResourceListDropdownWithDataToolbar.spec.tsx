import * as React from 'react';
import { render, act } from '../../test-utils';
import { useForm, FormProvider } from 'react-hook-form';
import { configure } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { ResourceListDropdownWithDataToolbar, ResourceListDropdownWithDataToolbarProps } from '../../public/components/hypercloud/utils/resource-list-dropdown';

const mockSubmit = jest.fn(data => {});

jest.mock('react-i18next', () => ({
  useTranslation: () => {
    return {
      t: str => str,
      i18n: {
        changeLanguage: () => new Promise(() => {}),
      },
    };
  },
  withTranslation: () => Component => {
    Component.defaultProps = { ...Component.defaultProps, t: () => '' };
    return Component;
  },
}));

const ClusterResourceList = [
  {
    kind: 'ClusterManager',
    apiVersion: 'cluster.tmax.io/v1alpha1',
    metadata: {
      name: 'jmc-zgw2v',
      uid: '1a482d7d-ac35-46d3-8496-a94688fc6d0e',
    },
    fakeMetadata: {
      fakename: 'jmc',
    },
  },
  {
    kind: 'ClusterClaim',
    apiVersion: 'cluster.tmax.io/v1alpha1',
    metadata: {
      name: 'example',
      uid: '436b6e22-748e-4e04-aea5-156f2ed35fa0',
    },
  },
];

const renderResourceListDropdownWithDataToolbarWithNoReactHook = (props: ResourceListDropdownWithDataToolbarProps) => {
  return render(<ResourceListDropdownWithDataToolbar {...props} />);
};

const renderResourceListDropdownWithDataToolbarWithReactHook = (props: ResourceListDropdownWithDataToolbarProps) => {
  return render(<ResourceListDropdownWithDataToolbar {...props} />, {
    wrapper: ({ children }) => {
      const methods = useForm();
      return (
        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(data => {
              mockSubmit(data);
            })}
          >
            {children}
            <button type="submit">Submit</button>
          </form>
        </FormProvider>
      );
    },
  });
};

const defaultParameters = {
  resourceList: ClusterResourceList,
};

describe('ResourceListDropdownWithDataToolbar test', () => {
  describe('with no react hook', () => {
    it('?????? ???????????? ?????? ????????? ?????????', () => {
      const { container } = renderResourceListDropdownWithDataToolbarWithNoReactHook({ ...defaultParameters });
      expect(container.firstChild).toMatchSnapshot();
    });

    it('resources??? ??? ??? ??????????????? ?????????', () => {
      const { getByRole, getAllByRole } = renderResourceListDropdownWithDataToolbarWithNoReactHook({ ...defaultParameters });

      userEvent.click(getByRole('button'));
      expect(getAllByRole('option')).toHaveLength(2);
    });

    it('showAll ???????????? ???????????? ?????? ???????????? ?????????', () => {
      const { getByRole, getByText } = renderResourceListDropdownWithDataToolbarWithNoReactHook({ ...defaultParameters, showAll: true });

      userEvent.click(getByRole('button'));
      expect(getByText('All')).toBeTruthy();
    });

    it('autoCompletePlaceholder ???????????? ???????????? ?????? ???????????? ?????????', () => {
      const { getByRole, getByPlaceholderText } = renderResourceListDropdownWithDataToolbarWithNoReactHook({ ...defaultParameters, autocompletePlaceholder: 'search by name' });

      userEvent.click(getByRole('button'));
      expect(getByPlaceholderText('search by name')).toBeTruthy();
    });

    it('????????? ?????? ???????????? 1????????? ??????????????? ?????????', () => {
      configure({ testIdAttribute: 'id' });
      const { getByRole, getByText, getByTestId } = renderResourceListDropdownWithDataToolbarWithNoReactHook({ ...defaultParameters });

      userEvent.click(getByRole('button'));
      userEvent.click(getByText('jmc'));
      expect(getByTestId('mrd-badge')).toHaveTextContent('1');
    });

    it('???????????? ??? ?????? ????????? ?????? ??? ALL????????? ??????????????? ?????????', () => {
      configure({ testIdAttribute: 'id' });
      const { getByRole, getByText, getByTestId } = renderResourceListDropdownWithDataToolbarWithNoReactHook({ ...defaultParameters });

      userEvent.click(getByRole('button'));
      userEvent.click(getByText('jmc'));
      userEvent.click(getByText('example'));
      expect(getByTestId('mrd-badge')).toHaveTextContent('All');
    });
  });

  describe('with react hook', () => {
    // react-hook-form ????????? ????????? register??? ?????????
    it('Submit ??? ???????????? value ?????? ?????????', async () => {
      const { getByText, getAllByRole } = renderResourceListDropdownWithDataToolbarWithReactHook({ ...defaultParameters, useHookForm: true });
      userEvent.click(getAllByRole('button')[0]);
      userEvent.click(getByText('jmc'));
      await act(async () => {
        userEvent.click(getByText('Submit'));
      });
      expect(mockSubmit).toHaveBeenCalledTimes(1);
      expect(mockSubmit).toHaveBeenCalledWith(['ck-master-1-debug-yra43q']);
    });
  });
});
