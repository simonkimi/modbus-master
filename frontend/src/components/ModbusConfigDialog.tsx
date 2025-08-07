import {
  ModBusDataValueType,
  ModbusRegisterConfig,
  ModBusValue,
  ModBusValueType,
} from "@/models/modbus_config";

import { Component, createEffect, createSignal, Show } from "solid-js";
import toast from "solid-toast";

interface ModbusConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: ModbusRegisterConfig) => void;
  onDelete?: (config: ModbusRegisterConfig) => void;
  config?: ModbusRegisterConfig; // 如果是编辑模式，传入现有配置
}

export const ModbusConfigDialog: Component<ModbusConfigDialogProps> = (
  props
) => {
  const isEditMode = () => !!props.config;

  // 表单状态
  const [enabled, setEnabled] = createSignal(props.config?.enabled ?? true);
  const [description, setDescription] = createSignal(
    props.config?.description ?? ""
  );
  const [addr, setAddr] = createSignal(props.config?.addr ?? 0);
  const [scale, setScale] = createSignal(props.config?.scale ?? 1);
  const [offset, setOffset] = createSignal(props.config?.offset ?? 0);
  const [delta, setDelta] = createSignal(props.config?.delta ?? 1);
  const [valueType, setValueType] = createSignal<ModBusValueType>(
    props.config?.value.type ?? ModBusValueType.HoldingRegister
  );
  const [dataValueType, setDataValueType] = createSignal<ModBusDataValueType>(
    props.config?.dataValueType ?? ModBusDataValueType.Number
  );
  const [addrHex, setAddrHex] = createSignal(
    props.config?.addr.toString(16).toUpperCase() ?? "0000"
  );

  createEffect(() => {
    if (
      valueType() == ModBusValueType.Coil ||
      valueType() == ModBusValueType.InputStatus
    ) {
      setDataValueType(ModBusDataValueType.Boolean);
    }
  });

  // 地址验证函数
  const validateAddr = (hexValue: string) => {
    const value = parseInt(hexValue, 16);
    if (isNaN(value)) {
      toast.error("请输入有效的十六进制地址");
      return false;
    }
    if (value < 0 || value > 65535) {
      toast.error("地址范围应为 0000-FFFF");
      return false;
    }
    setAddr(value);
    return true;
  };

  // 地址输入处理
  const handleAddrChange = (value: string) => {
    const upperValue = value.toUpperCase();
    setAddrHex(upperValue);
    validateAddr(upperValue);
  };

  const handleSave = () => {
    if (!description().trim()) {
      toast.error("请输入描述");
      return;
    }

    if (scale() <= 0) {
      toast.error("比例必须大于0");
      return;
    }

    if (delta() <= 0) {
      toast.error("增量必须大于0");
      return;
    }

    let value: ModBusValue;
    const currentValueType = valueType();
    switch (currentValueType) {
      case ModBusValueType.Coil:
        value = { type: ModBusValueType.Coil, value: false };
        break;
      case ModBusValueType.InputStatus:
        value = { type: ModBusValueType.InputStatus, value: false };
        break;
      case ModBusValueType.HoldingRegister:
        value = { type: ModBusValueType.HoldingRegister, value: 0 };
        break;
      case ModBusValueType.InputRegister:
        value = { type: ModBusValueType.InputRegister, value: 0 };
        break;
    }

    const config: ModbusRegisterConfig = {
      enabled: enabled(),
      description: description().trim(),
      addr: addr(),
      scale: scale(),
      offset: offset(),
      delta: delta(),
      value,
      dataValueType: dataValueType(),
    };

    props.onSave(config);

    // 显示成功提示
    toast.success(isEditMode() ? "配置已更新" : "配置已添加");

    props.onClose();
  };

  const handleDelete = () => {
    if (props.config && props.onDelete) {
      if (confirm("确定要删除这个配置吗？此操作不可撤销。")) {
        props.onDelete(props.config);
        toast.success("配置已删除");
        props.onClose();
      }
    }
  };

  return (
    <dialog class="d-modal" open={props.isOpen}>
      <div class="d-modal-box max-w-2xl">
        <h3 class="font-bold text-lg mb-6">
          {isEditMode() ? "编辑Modbus配置" : "添加Modbus配置"}
        </h3>

        <div class="grid grid-cols-[auto_1fr] gap-4 items-center">
          <label>启用</label>
          <input
            type="checkbox"
            class="d-checkbox mr-2"
            checked={enabled()}
            onChange={(e) => setEnabled(e.currentTarget.checked)}
          />

          <label>描述</label>
          <input
            type="text"
            class="d-input input-bordered w-full"
            value={description()}
            onChange={(e) => setDescription(e.currentTarget.value)}
            placeholder="请输入描述"
          />

          <label>地址</label>
          <input
            type="text"
            class="d-input input-bordered w-full"
            value={addrHex()}
            onChange={(e) => handleAddrChange(e.currentTarget.value)}
            placeholder="0000"
            maxLength={4}
          />

          <label>数据类型</label>
          <select
            class="d-select w-full"
            value={valueType()}
            onChange={(e) =>
              setValueType(e.currentTarget.value as ModBusValueType)
            }
          >
            <option value={ModBusValueType.Coil}>线圈 (Coil)</option>
            <option value={ModBusValueType.InputStatus}>
              输入状态 (Input Status)
            </option>
            <option value={ModBusValueType.HoldingRegister}>
              保持寄存器 (Holding Register)
            </option>
            <option value={ModBusValueType.InputRegister}>
              输入寄存器 (Input Register)
            </option>
          </select>

          <label>数据值类型</label>
          <select
            class="d-select w-full"
            value={dataValueType()}
            onChange={(e) =>
              setDataValueType(e.currentTarget.value as ModBusDataValueType)
            }
          >
            <option value={ModBusDataValueType.Boolean}>布尔值</option>
            {valueType() === ModBusValueType.HoldingRegister ||
            valueType() === ModBusValueType.InputRegister ? (
              <>
                <option value={ModBusDataValueType.Number}>数值</option>
                <option value={ModBusDataValueType.Binary}>二进制</option>
              </>
            ) : null}
          </select>

          <label>比例</label>
          <input
            type="number"
            class="d-input input-bordered w-full"
            value={scale()}
            onChange={(e) => setScale(parseFloat(e.currentTarget.value) || 1)}
            step="0.1"
            min="0"
          />

          <label>偏移</label>
          <input
            type="number"
            class="d-input input-bordered w-full"
            value={offset()}
            onChange={(e) => setOffset(parseFloat(e.currentTarget.value) || 0)}
            step="0.1"
          />

          <label>增量</label>
          <input
            type="number"
            class="d-input input-bordered w-full"
            value={delta()}
            onChange={(e) => setDelta(parseFloat(e.currentTarget.value) || 1)}
            step="0.1"
            min="0"
          />
        </div>

        <div class="d-modal-action gap-2">
          <button class="d-btn d-btn-outline" onClick={props.onClose}>
            取消
          </button>
          <Show when={isEditMode() && props.onDelete}>
            <button
              class="d-btn d-btn-error d-btn-outline"
              onClick={handleDelete}
            >
              删除
            </button>
          </Show>
          <button class="d-btn d-btn-primary" onClick={handleSave}>
            {isEditMode() ? "保存" : "添加"}
          </button>
        </div>
      </div>
    </dialog>
  );
};
