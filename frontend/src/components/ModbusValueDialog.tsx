import {
  ByteOrderEnum,
  DataTypeEnum,
  getBytes,
  isNumberDataType,
} from '@/utils/data';
import { models } from '@wails/go/models';
import { Component, Show, createMemo, createSignal } from 'solid-js';

interface ModbusValueDialogProps {
  isOpen: boolean;
  onClose: () => void;
  config: models.ModbusConfig;
  onSubmit: (id: string, rawValue: Uint8Array) => Promise<void> | void;
}

export const ModbusValueDialog: Component<ModbusValueDialogProps> = props => {
  const valueType = () => props.config.valueType as DataTypeEnum;

  const [hexInput, setHexInput] = createSignal('');
  const [boolInput, setBoolInput] = createSignal(false);
  const [numberInput, setNumberInput] = createSignal('');
  const [binaryInput, setBinaryInput] = createSignal('');
  const rawPlaceholder = createMemo(() => {
    return '0000'.repeat(props.config.addrSize);
  });

  const handleRawSubmit = async () => {
    const hex = hexInput().replace(/\s+/g, '');
    if (!/^[0-9a-fA-F]*$/.test(hex)) {
      alert('请输入有效的十六进制字符串');
      return;
    }
    // 补齐为偶数长度
    const paddedHex = hex.length % 2 === 0 ? hex : '0' + hex;
    const arr = new Uint8Array(paddedHex.length / 2);
    for (let i = 0; i < arr.length; i++) {
      arr[i] = parseInt(paddedHex.slice(i * 2, i * 2 + 2), 16);
    }
    console.log('handleRawSubmit', props.config.id, arr);
    await props.onSubmit(props.config.id, arr);
  };

  const handleBoolSubmit = async () => {
    const value = boolInput() ? 0xff00 : 0x0000;
    const arr = new Uint8Array([value >> 8, value & 0xff]);
    await props.onSubmit(props.config.id, arr);
  };

  const handleNumberSubmit = async () => {
    const value = Number(numberInput());
    const raw = (value - props.config.offset) / props.config.scale;

    const buff = getBytes(
      raw,
      props.config.byteOrder as ByteOrderEnum,
      props.config.valueType as DataTypeEnum
    );

    console.log('handleNumberSubmit', props.config.id, value, raw, buff);

    await props.onSubmit(props.config.id, buff);
  };

  const handleBinarySubmit = async () => {
    // 将输入的二进制字符串转为Uint8Array，然后下发
    const bin = binaryInput().replace(/\s+/g, '');
    if (!/^[01]*$/.test(bin)) {
      alert('请输入有效的二进制字符串');
      return;
    }
    // 补齐为8的倍数
    let paddedBin = bin;
    if (bin.length % 8 !== 0) {
      paddedBin = bin.padStart(Math.ceil(bin.length / 8) * 8, '0');
    }
    const arr = new Uint8Array(paddedBin.length / 8);
    for (let i = 0; i < arr.length; i++) {
      arr[i] = parseInt(paddedBin.slice(i * 8, i * 8 + 8), 2);
    }
    await props.onSubmit(props.config.id, arr);
  };

  return (
    <dialog class="d-modal" open={props.isOpen} closedby="none">
      <div class="d-modal-box max-w-xl">
        <h3 class="font-bold text-lg mb-4">改值</h3>

        <div class="grid grid-cols-[auto_1fr_auto] gap-4 items-center">
          <label>Hex</label>
          <input
            type="text"
            class="d-input input-bordered w-full"
            value={hexInput()}
            onInput={e => setHexInput(e.currentTarget.value)}
            placeholder={rawPlaceholder()}
            maxLength={rawPlaceholder().length}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                handleRawSubmit();
              }
            }}
          />
          <button class="d-btn d-btn-primary" onClick={handleRawSubmit}>
            下发
          </button>

          <Show when={valueType() === DataTypeEnum.Bool}>
            <>
              <label>布尔</label>
              <input
                type="checkbox"
                class="d-toggle"
                checked={boolInput()}
                onChange={e => setBoolInput(e.currentTarget.checked)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    handleBoolSubmit();
                  }
                }}
              />
              <button class="d-btn d-btn-primary" onClick={handleBoolSubmit}>
                下发
              </button>
            </>
          </Show>

          <Show when={isNumberDataType(valueType())}>
            <>
              <label>数值</label>
              <input
                type="number"
                class="d-input input-bordered w-full"
                value={numberInput()}
                step="0.1"
                onInput={e => setNumberInput(e.currentTarget.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    handleNumberSubmit();
                  }
                }}
              />
              <button class="d-btn d-btn-primary" onClick={handleNumberSubmit}>
                下发
              </button>
            </>
          </Show>

          <Show when={valueType() === DataTypeEnum.Binary}>
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
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    handleBinarySubmit();
                  }
                }}
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
