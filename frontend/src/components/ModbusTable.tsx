import { ModbusConfigDialog } from '@/components/ModbusConfigDialog';
import { ModbusConfigIO } from '@/components/ModbusConfigIO';
import { ModbusValueDialog } from '@/components/ModbusValueDialog';
import { GlobalStoreContext } from '@/store/globalStore';
import {
  ByteOrderEnum,
  DataTypeEnum,
  getBytes,
  getNumber,
  isNumberDataType,
} from '@/utils/data';
import { models } from '@wails/go/models';
import {
  Component,
  Show,
  createMemo,
  createSignal,
  useContext,
} from 'solid-js';

export const ModbusTable = () => {
  const store = useContext(GlobalStoreContext)!;
  const [isDialogOpen, setIsDialogOpen] = createSignal(false);
  const [editingConfig, setEditingConfig] = createSignal<
    models.ModbusConfig | undefined
  >();
  const [isValueDialogOpen, setIsValueDialogOpen] = createSignal(false);
  const [valueEditingConfig, setValueEditingConfig] = createSignal<
    models.ModbusConfig | undefined
  >();

  const handleEditConfig = (config: models.ModbusConfig) => {
    setEditingConfig(config);
    setIsDialogOpen(true);
  };

  const handleSaveConfig = (config: models.ModbusConfig) => {
    store.setModbusConfig(config);
  };

  const handleDeleteConfig = (config: models.ModbusConfig) => {
    store.deleteModbusConfig(config.id);
  };

  const handleOpenValueDialog = (config: models.ModbusConfig) => {
    setValueEditingConfig(config);
    setIsValueDialogOpen(true);
  };

  const handleSubmitValue = async (id: string, raw: Uint8Array) => {
    console.log('handleSubmitValue', id, raw);
    await store.setValue(id, raw);
    setIsValueDialogOpen(false);
  };

  return (
    <div>
      <table class="d-table">
        <thead>
          <tr>
            <th>启用</th>
            <th>描述</th>
            <th>地址</th>
            <th>数据(HEX)</th>
            <th>值</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {store.modbusConfigs.map(config => (
            <ModbusTableItem
              config={config}
              onEdit={() => handleEditConfig(config)}
              onChangeValue={() => handleOpenValueDialog(config)}
            />
          ))}
        </tbody>
      </table>

      {isDialogOpen() && editingConfig() ? (
        <ModbusConfigDialog
          isOpen={isDialogOpen()}
          onClose={() => setIsDialogOpen(false)}
          onSave={handleSaveConfig}
          onDelete={editingConfig() ? handleDeleteConfig : undefined}
          config={editingConfig()}
        />
      ) : null}

      {isValueDialogOpen() && valueEditingConfig() ? (
        <ModbusValueDialog
          isOpen={isValueDialogOpen()}
          onClose={() => setIsValueDialogOpen(false)}
          config={valueEditingConfig()!}
          onSubmit={handleSubmitValue}
        />
      ) : null}
    </div>
  );
};

interface ModbusTableItemProps {
  config: models.ModbusConfig;
  onEdit: () => void;
  onChangeValue: () => void;
}

const ModbusTableItem: Component<ModbusTableItemProps> = props => {
  const store = useContext(GlobalStoreContext)!;
  const value = createMemo(() => store.values[props.config.id]);

  const handleIncreaseValue = () => {
    const valueNumber = getNumber(
      value()!,
      props.config.byteOrder as ByteOrderEnum,
      props.config.valueType as DataTypeEnum
    );

    const raw = Math.round(
      valueNumber + props.config.delta / props.config.scale
    );
    store.setValue(
      props.config.id,
      getBytes(
        raw,
        props.config.byteOrder as ByteOrderEnum,
        props.config.valueType as DataTypeEnum
      )
    );
  };
  const handleDecreaseValue = () => {
    const valueNumber = getNumber(
      value()!,
      props.config.byteOrder as ByteOrderEnum,
      props.config.valueType as DataTypeEnum
    );
    const raw = Math.round(
      valueNumber - props.config.delta / props.config.scale
    );
    store.setValue(
      props.config.id,
      getBytes(
        raw,
        props.config.byteOrder as ByteOrderEnum,
        props.config.valueType as DataTypeEnum
      )
    );
  };

  return (
    <tr>
      <td>
        <input
          class="d-checkbox d-checkbox-sm pointer-events-none"
          checked={props.config.enabled}
          type="checkbox"
        />
      </td>
      <td>{props.config.description}</td>
      <td>
        {props.config.startAddr.toString(16).padStart(4, '0').toUpperCase()}
      </td>
      <td>{modBusRawDisplay(value())}</td>
      <td>{modBusValueDisplay(props.config, value())}</td>
      <td class="space-x-1">
        <button
          class="d-btn d-btn-sm d-btn-outline d-btn-secondary"
          onClick={props.onChangeValue}
        >
          改值
        </button>
        <Show when={isNumberDataType(props.config.valueType)}>
          <button
            class="d-btn d-btn-sm d-btn-outline d-btn-success"
            onClick={handleIncreaseValue}
          >
            增加
          </button>
        </Show>
        <Show when={isNumberDataType(props.config.valueType)}>
          <button
            class="d-btn d-btn-sm d-btn-outline d-btn-error"
            onClick={handleDecreaseValue}
          >
            减少
          </button>
        </Show>
        <button class="d-btn d-btn-sm d-btn-soft" onClick={props.onEdit}>
          编辑
        </button>
      </td>
    </tr>
  );
};

export const ModbusItemController = () => {
  const store = useContext(GlobalStoreContext)!;
  const [isDialogOpen, setIsDialogOpen] = createSignal(false);

  const handleAddConfig = () => {
    setIsDialogOpen(true);
  };

  const handleSaveConfig = (config: models.ModbusConfig) => {
    store.setModbusConfig(config);
  };

  return (
    <div class="flex flex-row space-x-2">
      <button class="d-btn d-btn-sm d-btn-success" onClick={handleAddConfig}>
        添加
      </button>
      <ModbusConfigIO />

      <ModbusConfigDialog
        isOpen={isDialogOpen()}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveConfig}
      />
    </div>
  );
};

function modBusRawDisplay(value: Uint8Array | undefined): string {
  if (value === undefined) {
    return '';
  }
  // 将value转为16进制字符串, 4个byte一组, 以空格分开
  if (!value || value.length === 0) return '';
  const groups: string[] = [];
  for (let i = 0; i < value.length; i += 2) {
    const group = value.slice(i, i + 2);
    // 每个byte转为2位大写16进制
    const hexStr = Array.from(group)
      .map(b => b.toString(16).toUpperCase().padStart(2, '0'))
      .join('');
    groups.push(hexStr);
  }
  return groups.join(' ');
}

function modBusValueDisplay(
  config: models.ModbusConfig,
  value: Uint8Array | undefined
): string {
  if (value === undefined) {
    return '';
  }
  switch (config.valueType) {
    case DataTypeEnum.Bool:
      return value[0] !== 0 || value[1] !== 0 ? 'true' : 'false';
    default:
      const number = getNumber(
        value,
        config.byteOrder as ByteOrderEnum,
        config.valueType as DataTypeEnum
      );
      return (number * config.scale + config.offset).toFixed(4).toString();
  }
}
