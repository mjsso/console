import * as _ from 'lodash-es';
import * as React from 'react';
import { match as RMatch } from 'react-router';
import { useFormContext, Controller } from 'react-hook-form';
import { WithCommonForm, isCreatePage } from '../create-form';
import { Section } from '../../utils/section';
import { SelectorInput } from '../../../utils';
import { ModalLauncher, ModalList, useInitModal, handleModalData, removeModalData } from '../utils';
import { InputResourceModal } from './input-resource-modal';
import { OutputResourceModal } from './output-resource-modal';
import { TaskParameterModal } from './task-parameter-modal';
import { WorkSpaceModal } from './work-space-modal';
import { VolumeModal } from './volume-modal';
import { StepModal } from './step-modal';
import { ClusterTaskModel } from '../../../../models';

const defaultValuesTemplate = {
  metadata: {
    name: 'example-name',
  },
};

const clusterTaskFormFactory = (params, obj) => {
  const defaultValues = obj || defaultValuesTemplate;
  return WithCommonForm(CreateClusterTaskComponent, params, defaultValues);
};

const CreateClusterTaskComponent: React.FC<TaskFormProps> = props => {
  const methods = useFormContext();
  const {
    control,
    control: {
      defaultValuesRef: { current: defaultValues },
    },
  } = methods;

  const [labels, setLabels] = React.useState([]);
  const [inputResource, setInputResource] = React.useState([]);
  const [outputResource, setOutputResource] = React.useState([]);
  const [taskParameter, setTaskParameter] = React.useState([]);
  const [workSpace, setWorkSpace] = React.useState([]);
  const [volume, setVolume] = React.useState([]);
  const [step, setStep] = React.useState([]);

  // 이 페이지가 처음 마운트 되었을 때 한번 되어야 함. (나중에 modal 별로 다 한거를 custom hook으로 묶어주면 좋을듯.)
  React.useEffect(() => {
    if (!isCreatePage(defaultValues)) {
      if (_.has(defaultValues, 'metadata.labels')) {
        let labelObj = _.get(defaultValues, 'metadata.labels');
        let labelTemp = [];
        for (let key in labelObj) {
          labelTemp.push(`${key}=${labelObj[key]}`);
        }
        setLabels(labelTemp);
      }
      if (_.has(defaultValues, 'spec.resources.inputs')) {
        let inputResources = _.get(defaultValues, 'spec.resources.inputs');
        setInputResource(inputResources);
      }
      if (_.has(defaultValues, 'spec.resources.outputs')) {
        let outputResources = _.get(defaultValues, 'spec.resources.outputs');
        setOutputResource(outputResources);
      }
      if (_.has(defaultValues, 'spec.params')) {
        let paramDefaultValues = _.get(defaultValues, 'spec.params');
        paramDefaultValues = paramDefaultValues.map(item => {
          if (item.type === 'array') {
            return _.assign(item, {
              defaultArr: item.default?.map(cur => {
                return { value: cur };
              }),
            });
          } else {
            return _.assign(item, { defaultStr: item.default });
          }
        });
        setTaskParameter(paramDefaultValues);
      }
      if (_.has(defaultValues, 'spec.workspaces')) {
        let workSpaceDefaultValues = _.get(defaultValues, 'spec.workspaces');
        workSpaceDefaultValues = workSpaceDefaultValues.map(item => {
          if (typeof item.readOnly != 'undefined') {
            item.accessMode = 'readOnly';
          } else {
            item.accessMode = 'readWrite';
          }
          delete item.readOnly;
          return item;
        });
        setWorkSpace(workSpaceDefaultValues);
      }
      if (_.has(defaultValues, 'spec.volumes')) {
        let volumeDefaultValues = _.get(defaultValues, 'spec.volumes');
        volumeDefaultValues = volumeDefaultValues.map(item => {
          let obj = {
            name: item.name,
          };
          if (item.configMap) {
            obj['type'] = 'configMap';
            obj['configMap'] = item.configMap.name;
          } else if (item.secret) {
            obj['type'] = 'secret';
            obj['secret'] = item.secret.name;
          } else if (item.emptyDir) {
            obj['type'] = 'emptyDir';
          }
          return obj;
        });
        setVolume(volumeDefaultValues);
      }
      if (_.has(defaultValues, 'spec.steps')) {
        let stepDefaultValues = _.get(defaultValues, 'spec.steps');
        stepDefaultValues = stepDefaultValues.map(item => {
          return _.assign(item, {
            command: item.command?.map(cur => {
              return { value: cur };
            }),
            env: item.env?.map(cur => {
              return {
                envKey: cur.name,
                envValue: cur.value,
              };
            }),
            args: item.args?.map(cur => {
              return { value: cur };
            }),
            mountPath: item.volumeMounts?.[0].mountPath,
            selectedVolume: item.volumeMounts?.[0].name,
            commandTypeToggle: item?.script ? 'script' : 'command',
          });
        });
        setStep(stepDefaultValues);
      }
    }
  }, []);

  // Modal Form 초기 세팅위한 Hook들 Custom Hook으로 정리
  useInitModal(methods, inputResource, 'spec.resources.inputs');
  useInitModal(methods, outputResource, 'spec.resources.outputs');
  useInitModal(methods, taskParameter, 'spec.params');
  useInitModal(methods, workSpace, 'spec.workspaces');
  useInitModal(methods, volume, 'spec.volumes');
  useInitModal(methods, step, 'spec.steps');

  // 각 모달에서 다루는 data들
  let inputResourceArr = ['name', 'targetPath', 'type', 'optional'];
  let outputResourceArr = ['name', 'targetPath', 'type', 'optional'];
  let taskParameterArr = ['name', 'description', 'type', 'defaultStr', 'defaultArr'];
  let workspaceArr = ['name', 'description', 'mountPath', 'accessMode', 'optional'];
  let volumeArr = ['name', 'type', 'configMap', 'secret'];
  let stepArr = ['name', 'imageToggle', 'commandTypeToggle', 'registryRegistry', 'registryImage', 'registryTag', 'image', 'command', 'args', 'script', 'env', 'selectedVolume', 'mountPath'];

  const paramValidCallback = additionalConditions => {
    let type = additionalConditions[0] ? 'array' : 'string';
    let target = type === 'string' ? additionalConditions[1] : additionalConditions[0];
    if (type === 'string') {
      return target.trim().length > 0;
    } else {
      return target ? target.length > 0 : false;
    }
  };

  const volumeValidCallback = additionalConditions => {
    if (additionalConditions[0] === 'emptyDir') {
      return true;
    }
    return additionalConditions.filter((c, i) => i !== 0).some(cur => (typeof cur === 'string' ? cur.trim().length > 0 : false));
  };

  return (
    <>
      <Section label="레이블" id="label" description="Enter를 입력하여 레이블을 추가할 수 있습니다.">
        <Controller name="metadata.labels" id="label" labelClassName="co-text-sample" as={<SelectorInput tags={labels} />} control={control} />
      </Section>
      <Section label="인풋 리소스" id="inputResource">
        <>
          <ModalList
            list={inputResource}
            id="input-resource"
            path="spec.resources.inputs"
            title="Input Resource"
            methods={methods}
            requiredFields={['name', 'type']}
            children={<InputResourceModal methods={methods} inputResource={inputResource} />}
            onRemove={removeModalData.bind(null, inputResource, setInputResource)}
            handleMethod={handleModalData.bind(null, 'input-resource', inputResourceArr, inputResource, setInputResource, false, methods)}
            description="이 태스크의 추가된 인풋 리소스가 없습니다."
          ></ModalList>
          <span className="open-modal_text" onClick={() => ModalLauncher({ inProgress: false, path: 'spec.resources.inputs', methods: methods, requiredFields: ['name', 'type'], title: 'Input Resource', id: 'input-resource', handleMethod: handleModalData.bind(null, 'input-resource', inputResourceArr, inputResource, setInputResource, true, methods), children: <InputResourceModal methods={methods} inputResource={inputResource} />, submitText: '추가' })}>
            + 인풋 리소스 추가
          </span>
        </>
      </Section>
      <Section label="아웃풋 리소스" id="outputResource">
        <>
          <ModalList
            list={outputResource}
            id="output-resource"
            path="spec.resources.outputs"
            title="Output Resource"
            methods={methods}
            requiredFields={['name', 'type']}
            children={<OutputResourceModal methods={methods} outputResource={outputResource} />}
            onRemove={removeModalData.bind(null, outputResource, setOutputResource)}
            handleMethod={handleModalData.bind(null, 'output-resource', outputResourceArr, outputResource, setOutputResource, false, methods)}
            description="이 태스크의 추가된 아웃풋 리소스가 없습니다."
          ></ModalList>
          <span className="open-modal_text" onClick={() => ModalLauncher({ inProgress: false, path: 'spec.resources.outputs', methods: methods, requiredFields: ['name', 'type'], title: 'Out Resource', id: 'output-resource', handleMethod: handleModalData.bind(null, 'output-resource', outputResourceArr, outputResource, setOutputResource, true, methods), children: <OutputResourceModal methods={methods} outputResource={outputResource} />, submitText: '추가' })}>
            + 아웃풋 리소스 추가
          </span>
        </>
      </Section>
      <Section label="태스크 파라미터 구성" id="taskParameter">
        <>
          <ModalList
            list={taskParameter}
            id="task-parameter"
            path="spec.params"
            title="태스크 파라미터 구성"
            methods={methods}
            requiredFields={['name', 'type']}
            children={<TaskParameterModal methods={methods} taskParameter={taskParameter} />}
            onRemove={removeModalData.bind(null, taskParameter, setTaskParameter)}
            handleMethod={handleModalData.bind(null, 'task-parameter', taskParameterArr, taskParameter, setTaskParameter, false, methods)}
            description="이 태스크의 추가된 태스크 파라미터 구성이 없습니다."
          ></ModalList>
          <span
            className="open-modal_text"
            onClick={() =>
              ModalLauncher({ inProgress: false, path: 'spec.params', methods: methods, requiredFields: ['name', 'type'], optionalRequiredField: ['defaultArr', 'defaultStr'], optionalValidCallback: paramValidCallback, title: '태스크 파라미터', id: 'task-parameter', handleMethod: handleModalData.bind(null, 'task-parameter', taskParameterArr, taskParameter, setTaskParameter, true, methods), children: <TaskParameterModal methods={methods} taskParameter={taskParameter} />, submitText: '추가' })
            }
          >
            + 태스크 파라미터 추가
          </span>
        </>
      </Section>
      <Section label="워크스페이스 구성" id="workSpace">
        <>
          <ModalList list={workSpace} id="work-space" path="spec.workspaces" title="워크스페이스 구성" methods={methods} requiredFields={['name']} children={<WorkSpaceModal methods={methods} workSpace={workSpace} />} onRemove={removeModalData.bind(null, workSpace, setWorkSpace)} handleMethod={handleModalData.bind(null, 'work-space', workspaceArr, workSpace, setWorkSpace, false, methods)} description="이 태스크의 추가된 워크스페이스 구성이 없습니다."></ModalList>
          <span className="open-modal_text" onClick={() => ModalLauncher({ inProgress: false, path: 'spec.workspaces', methods: methods, requiredFields: ['name'], title: '워크스페이스', id: 'work-space', handleMethod: handleModalData.bind(null, 'work-space', workspaceArr, workSpace, setWorkSpace, true, methods), children: <WorkSpaceModal methods={methods} workSpace={workSpace} />, submitText: '추가' })}>
            + 워크스페이스 추가
          </span>
        </>
      </Section>
      <Section label="볼륨" id="volume">
        <>
          <ModalList list={volume} id="volume" path="spec.volumes" title="볼륨 구성" methods={methods} requiredFields={['name', 'type']} children={<VolumeModal methods={methods} volume={volume} />} onRemove={removeModalData.bind(null, volume, setVolume)} handleMethod={handleModalData.bind(null, 'volume', volumeArr, volume, setVolume, false, methods)} description="이 태스크의 추가된 볼륨이 없습니다."></ModalList>
          <span className="open-modal_text" onClick={() => ModalLauncher({ inProgress: false, path: 'spec.volumes', methods: methods, requiredFields: ['name', 'type'], optionalRequiredField: ['type', 'configMap', 'secret'], optionalValidCallback: volumeValidCallback, title: '볼륨', id: 'volume', handleMethod: handleModalData.bind(null, 'volume', volumeArr, volume, setVolume, true, methods), children: <VolumeModal methods={methods} volume={volume} />, submitText: '추가' })}>
            + 볼륨 추가
          </span>
        </>
      </Section>
      <Section label="스텝" id="step">
        <>
          <ModalList list={step} id="step" path="spec.steps" title="스텝 구성" methods={methods} requiredFields={['name', 'image']} children={<StepModal methods={methods} step={step} />} onRemove={removeModalData.bind(null, step, setStep)} handleMethod={handleModalData.bind(null, 'step', stepArr, step, setStep, false, methods)} description="이 태스크의 추가된 스텝이 없습니다."></ModalList>
          <span className="open-modal_text" onClick={() => ModalLauncher({ inProgress: false, path: 'spec.steps', methods: methods, requiredFields: ['name', 'image'], title: '스텝', id: 'step', handleMethod: handleModalData.bind(null, 'step', stepArr, step, setStep, true, methods), children: <StepModal methods={methods} step={step} />, submitText: '추가' })}>
            + 스텝 추가
          </span>
        </>
      </Section>
    </>
  );
};

export const CreateClusterTask: React.FC<CreateClusterTaskProps> = ({ match: { params }, obj, kind }) => {
  const formComponent = clusterTaskFormFactory(params, obj);
  const TaskFormComponent = formComponent;
  return <TaskFormComponent fixed={{ apiVersion: `${ClusterTaskModel.apiGroup}/${ClusterTaskModel.apiVersion}`, kind }} explanation={''} titleVerb="Create" onSubmitCallback={onSubmitCallback} isCreate={true} />;
};

export const onSubmitCallback = data => {
  let labels = {};
  if (_.isArray(data.metadata.labels)) {
    data.metadata.labels.forEach(cur => {
      labels = typeof cur === 'string' ? SelectorInput.objectify(data.metadata.labels) : data.metadata.labels;
    });
  } else {
    labels = typeof data.metadata.labels === 'string' ? SelectorInput.objectify(data.metadata.labels) : data.metadata.labels;
  }
  delete data.metadata.labels;
  data = _.defaultsDeep({ metadata: { labels: labels } }, data);
  // apiVersion, kind
  data.kind = ClusterTaskModel.kind;
  data.apiVersion = `${ClusterTaskModel.apiGroup}/${ClusterTaskModel.apiVersion}`;
  //parameter
  data.spec.params = data?.spec?.params?.map((cur, idx) => {
    if (cur.type === 'string') {
      data.spec.params[idx].default = data.spec.params[idx].defaultStr;
    } else {
      data.spec.params[idx].default = cur.defaultArr.map(cur => cur.value);
    }
    delete data.spec.params[idx].defaultStr;
    delete data.spec.params[idx].defaultArr;
    return cur;
  });
  // workspace
  data.spec.workspaces = data?.spec?.workspaces?.map((cur, idx) => {
    let isReadOnly = cur.accessMode === 'readOnly' ? true : false;
    delete data.spec.workspaces[idx].accessMode;
    if (isReadOnly) {
      return { ...cur, readOnly: true };
    } else {
      return { ...cur, readOnly: false };
    }
  });
  // volume
  data.spec.volumes = data?.spec?.volumes?.map(cur => {
    if (cur.type === 'emptyDir') {
      return {
        name: cur?.name,
        emptyDir: {},
      };
    } else if (cur.type === 'configMap') {
      return {
        name: cur?.name,
        configMap: {
          name: cur?.configMap,
        },
      };
    } else if (cur.type === 'secret') {
      return {
        name: cur?.name,
        secret: {
          secretName: cur?.secret,
        },
      };
    }
  });
  // step
  data.spec.steps = data?.spec?.steps?.map((cur, idx) => {
    // command
    cur.command = cur?.command?.map(curCommand => curCommand?.value);
    //args
    cur.args = cur?.args?.map(curArg => curArg?.value);
    //env
    cur.env = cur?.env?.map(curEnv => ({ name: curEnv?.envKey, value: curEnv?.envValue }));

    if (cur.imageToggle === 'registry') {
      cur.image = `${cur.registryRegistry}-${cur.registryImage}-${cur.registryTag}`;

      delete data.spec.steps[idx].registryRegistry;
      delete data.spec.steps[idx].registryImage;
      delete data.spec.steps[idx].registryTag;
    } else {
      delete data.spec.steps[idx].registryRegistry;
      delete data.spec.steps[idx].registryImage;
      delete data.spec.steps[idx].registryTag;
    }
    delete data.spec.steps[idx].imageToggle;

    if (cur.commandTypeToggle === 'command') {
      delete data.spec.steps[idx].script;
    } else {
      delete data.spec.steps[idx].command;
      delete data.spec.steps[idx].args;
    }
    delete data.spec.steps[idx].commandTypeToggle;

    if (cur.selectedVolume) {
      let volumeMounts = [];
      volumeMounts.push({
        mountPath: cur.mountPath,
        name: cur.selectedVolume,
      });
      data.spec.steps[idx].volumeMounts = volumeMounts;
      delete data.spec.steps[idx].selectedVolume;
      delete data.spec.steps[idx].mountPath;
    }
    return cur;
  });

  return data;
};

type CreateClusterTaskProps = {
  match: RMatch<{
    type?: string;
    ns?: string;
  }>;
  kind: string;
  fixed: object;
  explanation: string;
  titleVerb: string;
  saveButtonText?: string;
  isCreate: boolean;
  obj: any;
};

type TaskFormProps = {
  onChange: Function;
  stringData: {
    [key: string]: string;
  };
  isCreate: boolean;
};
