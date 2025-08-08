import { ValueType } from '@/types/valueType';
import { models } from '@wails/go/models';
import { Component, Show, createSignal } from 'solid-js';

interface ModbusValueDialogProps {
  isOpen: boolean;
  onClose: () => void;
  config: models.ModbusConfig;
  onSubmit: (addr: number, rawValue: number) => Promise<void> | void;
  currentRaw?: number; // 可选的当前寄存器原始值（若不提供则使用config.value）
}

export const ModbusValueDialog: Component<ModbusValueDialogProps> = props => {
  const valueType = () => props.config.valueType as ValueType;

  const [hexInput, setHexInput] = createSignal('');
  const [boolInput, setBoolInput] = createSignal(false);
  const [numberInput, setNumberInput] = createSignal(0);
  const [binaryInput, setBinaryInput] = createSignal('');

  const handleRawSubmit = async () => {
    await props.onSubmit(props.config.addr, parseInt(hexInput(), 16));
  };

  const handleBoolSubmit = async () => {
    await props.onSubmit(props.config.addr, boolInput() ? 0xff00 : 0x0000);
  };

  const handleNumberSubmit = async () => {
    const raw = Math.round(
      (numberInput() - props.config.offset) / props.config.scale
    );
    await props.onSubmit(props.config.addr, raw);
  };

  const handleBinarySubmit = async () => {
    const raw = parseInt(binaryInput(), 2);
    await props.onSubmit(props.config.addr, raw);
  };

  return (
    <dialog class="d-modal" open={props.isOpen} closedby="none">
      <div class="d-modal-box max-w-xl">
        <h3 class="font-bold text-lg mb-4">改值</h3>

        <div class="grid grid-cols-[auto_1fr_auto] gap-4 items-center">
          <label>通用 HEX</label>
          <input
            type="text"
            class="d-input input-bordered w-full"
            value={hexInput()}
            onInput={e => setHexInput(e.currentTarget.value)}
            placeholder="0000"
            maxLength={4}
          />
          <button class="d-btn d-btn-primary" onClick={handleRawSubmit}>
            下发
          </button>

          <Show when={valueType() === ValueType.Bool}>
            <>
              <label>布尔</label>
              <input
                type="checkbox"
                class="d-toggle"
                checked={boolInput()}
                onChange={e => setBoolInput(e.currentTarget.checked)}
              />
              <button class="d-btn d-btn-primary" onClick={handleBoolSubmit}>
                下发
              </button>
            </>
          </Show>

          <Show when={valueType() === ValueType.Number}>
            <>
              <label>数值</label>
              <input
                type="number"
                class="d-input input-bordered w-full"
                value={numberInput()}
                step="0.1"
                onInput={e => setNumberInput(Number(e.currentTarget.value))}
              />
              <button class="d-btn d-btn-primary" onClick={handleNumberSubmit}>
                下发
              </button>
            </>
          </Show>

          <Show when={valueType() === ValueType.Binary}>
            <>
              <label>二进制</label>
              <input
                type="text"
                class="d-input input-bordered w-full"
                value={binaryInput()}
                onInput={e =>
                  setBinaryInput(e.currentTarget.value.replace(/[^01\s]/g, ''))
                }
                placeholder="例如: 10010"
              />
              <button class="d-btn d-btn-primary" onClick={handleBinarySubmit}>
                下发
              </button>
            </>
          </Show>
        </div>
        <div class="d-modal-action">
          <button class="d-btn d-btn-soft" onClick={props.onClose}>
            取消
          </button>
        </div>
      </div>
    </dialog>
  );
};
