import { GlobalStoreContext } from '@/store/globalStore';
import { Component, useContext, createSignal } from 'solid-js';
import { ModbusConfigIO } from '@/components/ModbusConfigIO';
import { ModbusConfigDialog } from '@/components/ModbusConfigDialog';
import { models } from '@wails/go/models';
import { ValueType } from '@/types/valueType';

export const ModbusTable = () => {
  const store = useContext(GlobalStoreContext)!;
  const [isDialogOpen, setIsDialogOpen] = createSignal(false);
  const [editingConfig, setEditingConfig] = createSignal<
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
            />
          ))}
        </tbody>
      </table>

      <ModbusConfigDialog
        isOpen={isDialogOpen()}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveConfig}
        onDelete={editingConfig() ? handleDeleteConfig : undefined}
        config={editingConfig()}
      />
    </div>
  );
};

interface ModbusTableItemProps {
  config: models.ModbusConfig;
  onEdit: () => void;
}

const ModbusTableItem: Component<ModbusTableItemProps> = props => {
  return (
    <tr>
      <td>
        <input
          class="d-checkbox"
          checked={props.config.enabled}
          type="checkbox"
        />
      </td>
      <td>{props.config.description}</td>
      <td>{props.config.addr.toString(16).padStart(4, '0').toUpperCase()}</td>
      <td>{modBusRawDisplay(props.config)}</td>
      <td>{modBusValueDisplay(props.config)}</td>
      <td class="space-x-1">
        <button class="d-btn d-btn-sm d-btn-soft" onClick={props.onEdit}>
          编辑
        </button>
        <button class="d-btn d-btn-sm d-btn-soft">改值</button>
        <button class="d-btn d-btn-sm d-btn-soft">增加</button>
        <button class="d-btn d-btn-sm d-btn-soft">减少</button>
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

function modBusRawDisplay(config: models.ModbusConfig): string {
  return config.value.toString(16).padStart(4, '0').toUpperCase();
}

function modBusValueDisplay(config: models.ModbusConfig): string {
  switch (config.valueType) {
    case ValueType.Bool:
      return config.value ? 'true' : 'false';
    case ValueType.Number:
      return (config.value * config.scale + config.offset).toString();
    case ValueType.Binary:
      const binaryString = config.value.toString(2).padStart(16, '0');
      return binaryString.replace(/(.{4})/g, '$1 ').trim();
    default:
      return modBusRawDisplay(config);
  }
}
