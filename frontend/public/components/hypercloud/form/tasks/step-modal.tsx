import * as React from 'react';
import * as _ from 'lodash';
import { Section } from '../../utils/section';
import { RadioGroup } from '../../utils/radio';
// import { ResourceDropdown } from '../../utils/resource-dropdown';
import { Dropdown } from '../../utils/dropdown';
import { TextInput } from '../../utils/text-input';
import { TextArea } from '../../utils/text-area';
import { ListView } from '../../utils/list-view';
import { useWatch } from 'react-hook-form';
import { Button } from '@patternfly/react-core';
// import { modelFor, k8sList } from '@console/internal/module/k8s';
// import { makeQuery } from '../../../utils/k8s-watcher';

export const StepModal: React.FC<StepModalProps> = ({ methods, step }) => {
  // const ImageRadioList = [
  //   // RadioGroup 컴포넌트에 넣어줄 items
  //   {
  //     title: 'Image Registry',
  //     value: 'registry',
  //   },
  //   {
  //     title: '직접 입력',
  //     value: 'manual',
  //   },
  // ];

  // const [isOpen, setIsOpen] = React.useState(false);
  // const [imageList, setImageList] = React.useState({});
  // const [imageTagList, setImageTagList] = React.useState({});

  const commandTypeItems = [
    {
      title: '커맨드/인수',
      value: 'command',
    },
    {
      title: '스크립트',
      value: 'script',
    },
  ];

  let volumeItems = {};
  // volume 있는지 여부
  let isVolumeExist = () => {
    let volumeList = methods.getValues('spec.volumes');
    if (volumeList?.length > 0) {
      volumeList.forEach(cur => {
        volumeItems[cur.name] = cur.name;
      });
      return true;
    }
    return false;
  };
  const commandListItemRenderer = (method, name, item, index, ListActions, ListDefaultIcons) => (
    <div className="row" key={item.id}>
      <div className="col-xs-11 pairs-list__value-field">
        <TextInput id={`${name}[${index}].value`} inputClassName="col-md-12" methods={methods} defaultValue={item.value} placeholder={'/bin/sh'} />
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
  const parameterListItemRenderer = (method, name, item, index, ListActions, ListDefaultIcons) => (
    <div className="row" key={item.id}>
      <div className="col-xs-11 pairs-list__value-field">
        <TextInput id={`${name}[${index}].value`} inputClassName="col-md-12" methods={methods} defaultValue={item.value} placeholder={'-c'} />
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
  const envListItemRenderer = (method, name, item, index, ListActions, ListDefaultIcons) => (
    <div className="row" key={item.id}>
      <div className="col-xs-11 pairs-list__value-field" style={{ display: 'flex' }}>
        <TextInput id={`${name}[${index}].envKey`} inputClassName="col-md-6" methods={methods} defaultValue={item.envKey} placeholder={'키'} />
        <span style={{ margin: '0 5px' }}>=</span>
        <TextInput id={`${name}[${index}].envValue`} inputClassName="col-md-6" methods={methods} defaultValue={item.envValue} placeholder={'값'} />
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

  let template;

  // modify 기능 용
  let target = document.getElementById('step-list');
  let modalType = target && [...target.childNodes].some(cur => cur['dataset']['modify'] === 'true') ? 'modify' : 'add';
  if (modalType === 'modify') {
    let list = target.childNodes;
    list.forEach((cur, idx) => {
      if (cur['dataset']['modify'] === 'true') {
        template = step[idx];
      }
    });
  }

  // command radio toggle 용
  const commandTypeToggle = useWatch({
    control: methods.control,
    name: 'commandTypeToggle',
    defaultValue: template ? template.commandTypeToggle : 'command',
  });

  // image radio toggle용
  // const imageToggle = useWatch({
  //   control: methods.control,
  //   name: 'imageToggle',
  //   defaultValue: template ? template.imageToggle : 'registry',
  // });
  // const imageRegistry = useWatch({
  //   control: methods.control,
  //   name: 'registryRegistry',
  //   defaultValue: template ? template.registryRegistry : null,
  // });
  // const image = useWatch({
  //   control: methods.control,
  //   name: 'registryImage',
  //   defaultValue: template ? template.registryImage : null,
  // });

  // // Image Registry 선택되면 Image Dropdown 메뉴 채워주기
  // React.useEffect(() => {
  //   const ko = modelFor('Repository');
  //   let query = makeQuery('', { matchLabels: { registry: imageRegistry } });
  //   k8sList(ko, query)
  //     .then(reponse => reponse)
  //     .then(data => {
  //       if (data.length === 0) return;
  //       let imageItems = {};
  //       data.forEach(cur => {
  //         imageItems[cur.spec.name] = cur.spec.name;
  //       });
  //       setImageList(() => imageItems);
  //     });
  // }, [imageRegistry]);

  // // Image 선택되면 ImageTag Dropdown 메뉴 채워주기
  // React.useEffect(() => {
  //   const ko = modelFor('Repository');
  //   let query = makeQuery('', { matchLabels: { registry: imageRegistry } });
  //   k8sList(ko, query)
  //     .then(reponse => reponse)
  //     .then(data => {
  //       if (data.length === 0) return;
  //       let imageTagItems = {};
  //       let curImage = data.filter(cur => image === cur.spec.name)[0];
  //       curImage.spec.versions.forEach(cur => {
  //         imageTagItems[cur.version] = cur.version;
  //       });
  //       setImageTagList(() => imageTagItems);
  //     });
  // }, [image]);

  return (
    <>
      <Section label="스텝 이름" id="step-name" isRequired={true}>
        <TextInput id="name" inputClassName="col-md-12" methods={methods} defaultValue={modalType === 'modify' ? template.name : ''} />
      </Section>
      <div className="horizontal-line" />
      <Section label="이미지" id="step-manual-image" isRequired={true}>
        <TextInput id="image" inputClassName="col-md-12" methods={methods} defaultValue={modalType === 'modify' ? template.image : ''} />
      </Section>
      {/* <Section label="이미지" id="step-image-toggle">
        <RadioGroup
          methods={methods}
          name="imageToggle" // 서버에 보낼 데이터에서의 path (필수)
          items={ImageRadioList} // [{title: '', value: ''}] (필수)
          inline={true} // inline속성 먹일거면 true, 아니면 빼면 됨 (선택)
          initValue={imageToggle}
        />
      </Section>
      {imageToggle === 'registry' && (
        <>
          <Section id="registrydropdown" label="컨테이너 레지스트리">
            <ResourceDropdown
              name="registryRegistry"
              placeholder="컨테이너 레지스트리 선택"
              methods={methods}
              defaultValue={modalType === 'modify' ? imageRegistry : ''}
              resources={[
                {
                  kind: 'Registry',
                  prop: 'deployment',
                },
              ]}
              type="single"
              useHookForm
            />
          </Section>
          <Section id="imagedropdown" label="이미지">
            <Dropdown
              name="registryImage"
              className="btn-group"
              title="이미지 선택" // 드롭다운 title 지정
              methods={methods}
              defaultValue={modalType === 'modify' ? image : ''}
              items={imageList} // (필수)
              style={{ display: 'block' }}
              buttonClassName="dropdown-btn col-md-12" // 선택된 아이템 보여주는 button (title) 부분 className
              itemClassName="dropdown-item" // 드롭다운 아이템 리스트 전체의 className - 각 row를 의미하는 것은 아님
            />
          </Section>
          <Section id="imagetagdropdown" label="이미지 태그">
            <Dropdown
              name="registryTag"
              className="btn-group"
              title="이미지 선택" // 드롭다운 title 지정
              methods={methods}
              defaultValue={modalType === 'modify' ? template.registryTag : ''}
              items={imageTagList} // (필수)
              style={{ display: 'block' }}
              buttonClassName="dropdown-btn col-md-12" // 선택된 아이템 보여주는 button (title) 부분 className
              itemClassName="dropdown-item" // 드롭다운 아이템 리스트 전체의 className - 각 row를 의미하는 것은 아님
            />
          </Section>
        </>
      )}
      {imageToggle === 'manual' && (
        <>
          <Section label="" id="step-manual-image">
            <TextInput id="image" inputClassName="col-md-12" methods={methods} defaultValue={modalType === 'modify' ? template.image : ''} />
          </Section>
        </>
      )} */}
      <div className="horizontal-line" />
      <Section label="명령어 타입" id="command-type-toggle">
        <RadioGroup
          methods={methods}
          name="commandTypeToggle" // 서버에 보낼 데이터에서의 path (필수)
          items={commandTypeItems} // [{title: '', value: ''}] (필수)
          initValue={commandTypeToggle}
        />
      </Section>
      {commandTypeToggle === 'command' ? (
        <>
          <Section label="커맨드" id="step-command">
            <ListView name="command" methods={methods} addButtonText="추가" headerFragment={<></>} itemRenderer={commandListItemRenderer} defaultValues={modalType === 'modify' ? _.cloneDeep(template.command) : []} defaultItem={{ value: '' }} />
          </Section>
          <Section label="인수" id="step-parameter">
            <ListView name="args" methods={methods} addButtonText="추가" headerFragment={<></>} itemRenderer={parameterListItemRenderer} defaultItem={{ value: '' }} defaultValues={modalType === 'modify' ? _.cloneDeep(template.args) : []} />
          </Section>
        </>
      ) : (
        <>
          <Section label="스크립트" id="step-parameter">
            <TextArea id="script" inputClassName="col-md-12 text-area" methods={methods} defaultValue={modalType === 'modify' ? template.script : ''} />
          </Section>
        </>
      )}
      <div className="horizontal-line" />
      <Section label="환경 변수" id="step-parameter">
        <ListView name="env" methods={methods} addButtonText="추가" headerFragment={<></>} itemRenderer={envListItemRenderer} defaultValues={modalType === 'modify' ? _.cloneDeep(template.env) : []} defaultItem={{ envKey: '', envValue: '' }} />
      </Section>
      <Section label="마운트 경로" id="step-mountPath">
        {!isVolumeExist() ? (
          '마운트할 볼륨을 먼저 추가해 주세요.'
        ) : (
          <>
            <Section id="selectedVolume">
              <Dropdown
                name="selectedVolume"
                className="btn-group"
                defaultValue={template ? template.selectedVolume : ''}
                title="볼륨 선택" // 드롭다운 title 지정
                methods={methods}
                items={volumeItems} // (필수)
                style={{ display: 'block' }}
                buttonClassName="dropdown-btn col-md-12" // 선택된 아이템 보여주는 button (title) 부분 className
                itemClassName="dropdown-item" // 드롭다운 아이템 리스트 전체의 className - 각 row를 의미하는 것은 아님
              />
            </Section>
            <Section id="mountPath">
              <TextInput id="mountPath" inputClassName="col-md-12" methods={methods} placeholder="마운트 경로를 입력해 주세요." defaultValue={modalType === 'modify' ? template.mountPath : ''} />
            </Section>
          </>
        )}
      </Section>
    </>
  );
};

type StepModalProps = {
  methods: any;
  step: any;
};
