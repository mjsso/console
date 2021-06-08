import { useFormContext, useFieldArray } from 'react-hook-form';
import * as React from 'react';
import * as _ from 'lodash-es';
import { Button } from '@patternfly/react-core';
import { MinusCircleIcon, PlusCircleIcon } from '@patternfly/react-icons';
export const ListView: React.FC<ListViewProps> = ({ name, methods, defaultItem = { key: '', value: '' }, itemRenderer, headerFragment, addButtonText, defaultValues }) => {
  const { control, register, getValues, setValue } = methods ? methods : useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: name });

  const DefaultListHeaderFragment = (
    <div className="row pairs-list__heading">
      <div className="col-xs-4 text-secondary text-uppercase">KEY</div>
      <div className="col-xs-4 text-secondary text-uppercase">VALUE</div>
      <div className="col-xs-1 co-empty__header" />
    </div>
  );

  React.useEffect(() => {
    if (!!defaultValues) {
      // MEMO : name에 []이 들어가있으면 setValue 에러남. test[0].values 대신 test.0.values 형식으로 들어가있어야됨
      setValue(name, defaultValues);
    }
  }, [name]);

  const DefaultListItemRenderer = (register, name, item, index, ListActions, ListDefaultIcons) => {
    return (
      <div className="row" key={item.id}>
        <div className="col-xs-4 pairs-list__name-field">
          <input ref={register()} className="pf-c-form-control" name={`${name}[${index}].key`} defaultValue={item.key}></input>
        </div>
        <div className="col-xs-4 pairs-list__value-field">
          <input ref={register()} className="pf-c-form-control" name={`${name}[${index}].value`} defaultValue={item.value}></input>
        </div>
        <div className="col-xs-1 pairs-list__action">
          <Button
            type="button"
            data-test-id="pairs-list__delete-btn"
            className="pairs-list__span-btns"
            onClick={() => {
              ListActions.remove(index);
            }}
            variant="plain"
          >
            {ListDefaultIcons.deleteIcon}
          </Button>
        </div>
      </div>
    );
  };

  const deleteIcon = (
    <>
      <MinusCircleIcon className="pairs-list__side-btn pairs-list__delete-icon" />
      <span className="sr-only">Delete</span>
    </>
  );

  // MEMO : ListView컴포넌트 안에서 ref가 없는 다른 공통컴포넌트를 사용해 itemRenderer를 구성할 때, item remove할 때 그 안에 값들의 싱크가 맞지 않는 경우가 있어서,
  // 다시 원래 값으로 세팅해주는 함수. (임시 방안) 사용예시는 create-role.tsx 참고.
  const registerWithInitValue = (name, defaultValue) => {
    const isRegistered = _.get(getValues(), name);

    if (!isRegistered) {
      register(name);
      setValue(name, defaultValue);
    }
  };

  const ListActions = {
    append: append,
    remove: remove,
    getValues: getValues,
    registerWithInitValue: registerWithInitValue,
  };

  const ListDefaultIcons = {
    deleteIcon: deleteIcon,
  };

  const itemList = itemRenderer ? fields.map((item, index) => itemRenderer(methods, name, item, index, ListActions, ListDefaultIcons)) : fields.map((item, index) => DefaultListItemRenderer(register, name, item, index, ListActions, ListDefaultIcons));

  return (
    <div>
      {headerFragment ? headerFragment : DefaultListHeaderFragment}
      {itemList}
      <div className="row col-xs-12">
        <Button
          className="pf-m-link--align-left"
          data-test-id="pairs-list__add-btn"
          onClick={() => {
            append(defaultItem);
          }}
          type="button"
          variant="link"
        >
          <PlusCircleIcon data-test-id="pairs-list__add-icon" className="co-icon-space-r" />
          {!!addButtonText ? addButtonText : 'Add'}
        </Button>
      </div>
    </div>
  );
};

type ListViewProps = {
  name: string;
  defaultItem?: object;
  itemRenderer?: Function;
  headerFragment?: JSX.Element;
  addButtonText?: string;
  methods?: any;
  defaultValues?: object[];
};
