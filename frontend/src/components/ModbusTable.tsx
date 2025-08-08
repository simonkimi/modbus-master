import { ModbusConfigDialog } from '@/components/ModbusConfigDialog';
import { ModbusConfigIO } from '@/components/ModbusConfigIO';
import { ModbusValueDialog } from '@/components/ModbusValueDialog';
import { GlobalStoreContext } from '@/store/globalStore';
import { ValueType } from '@/types/valueType';
import { models } from '@wails/go/models';
import {
  Component,
  createMemo,
  createSignal,
  Show,
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
    store.deleteModbusConfig(config.addr);
  };

  const handleOpenValueDialog = (config: models.ModbusConfig) => {
    setValueEditingConfig(config);
    setIsValueDialogOpen(true);
  };

  const handleSubmitValue = async (addr: number, raw: number) => {
    console.log('handleSubmitValue', addr, raw);
    await store.setValue(addr, raw);
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
          currentRaw={store.values[valueEditingConfig()!.addr]}
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
  const value = createMemo(() => store.values[props.config.addr]);

  const handleIncreaseValue = () => {
    const raw = Math.round(value() + props.config.delta / props.config.scale);
    store.setValue(props.config.addr, raw);
  };
  const handleDecreaseValue = () => {
    const raw = Math.round(value() - props.config.delta / props.config.scale);
    store.setValue(props.config.addr, raw);
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
      <td>{props.config.addr.toString(16).padStart(4, '0').toUpperCase()}</td>
      <td>{modBusRawDisplay(value())}</td>
      <td>{modBusValueDisplay(props.config, value())}</td>
      <td class="space-x-1">
        <button
          class="d-btn d-btn-sm d-btn-outline d-btn-secondary"
          onClick={props.onChangeValue}
        >
          改值
        </button>
        <Show when={props.config.valueType === ValueType.Number}>
          <button
            class="d-btn d-btn-sm d-btn-outline d-btn-success"
            onClick={handleIncreaseValue}
          >
            增加
          </button>
        </Show>
        <Show when={props.config.valueType === ValueType.Number}>
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

function modBusRawDisplay(value: number | undefined): string {
  if (value === undefined) {
    return '';
  }
  return value.toString(16).padStart(4, '0').toUpperCase();
}

function modBusValueDisplay(
  config: models.ModbusConfig,
  value: number | undefined
): string {
  if (value === undefined) {
    return '';
  }
  switch (config.valueType) {
    case ValueType.Bool:
      return value ? 'true' : 'false';
    case ValueType.Number:
      return (value * config.scale + config.offset).toString();
    case ValueType.Binary:
      const binaryString = value.toString(2).padStart(16, '0');
      return binaryString.replace(/(.{4})/g, '$1 ').trim();
    default:
      return modBusRawDisplay(value);
  }
}
