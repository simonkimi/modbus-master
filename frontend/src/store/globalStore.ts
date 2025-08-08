import {
  GetModbusConfig,
  GetValue,
  ImportModbusConfig,
  RemoveModbusConfig,
  SetModbusConfig,
  SetValue,
  StartModbusServer,
  StopModbusServer,
} from '@wails/go/main/App';
import { models } from '@wails/go/models';
import { createContext, createEffect, onCleanup } from 'solid-js';
import { createStore } from 'solid-js/store';
import toast from 'solid-toast';

export const GlobalStoreContext =
  createContext<ReturnType<typeof createGlobalStore>>();

interface GlobalStoreState {
  port: number;
  isRunning: boolean;
  modbusConfigs: models.ModbusConfig[];
  values: Record<number, number>;
}

export function createGlobalStore() {
  const [state, setState] = createStore<GlobalStoreState>({
    port: 8080,
    isRunning: false,
    modbusConfigs: [],
    values: {},
  });

  createEffect(() => {
    const intervalId = window.setInterval(async () => {
      await getValues();
    }, 1000);

    onCleanup(() => {
      if (intervalId !== undefined) {
        clearInterval(intervalId);
      }
    });
  });

  createEffect(async () => {
    await updateModbusConfig();
  });

  async function setValue(addr: number, value: number) {
    await SetValue(addr, value);
    await getValues();
  }

  async function getValues() {
    const values = await GetValue();
    console.log('getValues', values);
    setState('values', values);
  }

  async function start() {
    try {
      await StartModbusServer(state.port);
      setState('isRunning', true);
      toast.success('启动成功');
    } catch (error) {
      toast.error('启动失败');
    }
  }

  async function stop() {
    try {
      await StopModbusServer();
      setState('isRunning', false);
      toast.success('停止成功');
    } catch (error) {
      toast.error('停止失败');
    }
  }

  async function updateModbusConfig() {
    const configs = await GetModbusConfig();
    setState('modbusConfigs', configs);
  }

  function setPort(port: number) {
    setState('port', port);
  }

  async function setModbusConfig(config: models.ModbusConfig) {
    await SetModbusConfig(config);
    await updateModbusConfig();
  }

  async function deleteModbusConfig(addr: number) {
    await RemoveModbusConfig(addr);
    await updateModbusConfig();
  }

  async function importModbusConfig() {
    await ImportModbusConfig();
    await updateModbusConfig();
  }

  return {
    get port() {
      return state.port;
    },
    get isRunning() {
      return state.isRunning;
    },
    get modbusConfigs() {
      return state.modbusConfigs;
    },
    get values() {
      return state.values;
    },
    start,
    stop,
    setPort,
    updateModbusConfig,
    setModbusConfig,
    deleteModbusConfig,
    importModbusConfig,
    setValue,
  };
}
