import {
  ModBusDataValueType,
  ModbusRegisterConfig,
  ModBusValue,
  ModBusValueType,
} from "@/models/modbus_config";
import { GlobalStoreContext } from "@/store/globalStore";
import { Component, useContext, createSignal } from "solid-js";
import { ModbusConfigIO } from "@/components/ModbusConfigIO";
import { ModbusConfigDialog } from "@/components/ModbusConfigDialog";

export const ModbusTable = () => {
  const store = useContext(GlobalStoreContext)!;
  const [isDialogOpen, setIsDialogOpen] = createSignal(false);
  const [editingConfig, setEditingConfig] = createSignal<
    ModbusRegisterConfig | undefined
  >();

  const handleEditConfig = (config: ModbusRegisterConfig) => {
    setEditingConfig(config);
    setIsDialogOpen(true);
  };

  const handleSaveConfig = (config: ModbusRegisterConfig) => {
    if (editingConfig()) {
      const index = store.modbusConfigs.findIndex((c) => c === editingConfig());
      if (index !== -1) {
        store.updateModbusConfig(index, config);
      }
    } else {
      store.addModbusConfig(config);
    }
  };

  const handleDeleteConfig = (config: ModbusRegisterConfig) => {
    const index = store.modbusConfigs.findIndex((c) => c === config);
    if (index !== -1) {
      store.deleteModbusConfig(index);
    }
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
          {store.modbusConfigs.map((config) => (
            <ModbusTableItem
              {...config}
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

interface ModbusTableItemProps extends ModbusRegisterConfig {
  onEdit: () => void;
}

const ModbusTableItem: Component<ModbusTableItemProps> = (props) => {
  return (
    <tr>
      <td>
        <input class="d-checkbox" checked={props.enabled} type="checkbox" />
      </td>
      <td>{props.description}</td>
      <td>{props.addr.toString(16).padStart(4, "0").toUpperCase()}</td>
      <td>{modBusRawDisplay(props.value)}</td>
      <td>{modBusValueDisplay(props)}</td>
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

  const handleSaveConfig = (config: ModbusRegisterConfig) => {
    store.addModbusConfig(config);
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

function modBusRawDisplay(value: ModBusValue): string {
  switch (value.type) {
    case ModBusValueType.Coil:
      return value.value ? "true" : "false";
    case ModBusValueType.InputStatus:
      return value.value ? "true" : "false";
    case ModBusValueType.HoldingRegister:
      return value.value.toString(16).padStart(4, "0").toUpperCase();
    case ModBusValueType.InputRegister:
      return value.value.toString(16).padStart(4, "0").toUpperCase();
  }
}

function modBusValueDisplay(config: ModbusRegisterConfig): string {
  switch (config.value.type) {
    case ModBusValueType.Coil:
    case ModBusValueType.InputStatus:
      return config.value.value ? "true" : "false";
    case ModBusValueType.HoldingRegister:
    case ModBusValueType.InputRegister:
      if (config.dataValueType === ModBusDataValueType.Number) {
        return (config.value.value * config.scale + config.offset).toString();
      }
      if (config.dataValueType === ModBusDataValueType.Binary) {
        const binaryString = config.value.value.toString(2).padStart(16, "0");
        return binaryString.replace(/(.{4})/g, "$1 ").trim();
      }
      return config.value.value.toString();
  }
}
