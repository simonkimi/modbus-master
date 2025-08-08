import { GlobalStoreContext } from '@/store/globalStore';
import { ExportModbusConfig } from '@wails/go/main/App';
import { Component, useContext } from 'solid-js';
import toast from 'solid-toast';

export const ModbusConfigIO: Component = () => {
  const store = useContext(GlobalStoreContext)!;

  return (
    <div class="flex flex-row space-x-2">
      <button
        onClick={store.importModbusConfig}
        class="d-btn d-btn-outline d-btn-sm d-btn-primary"
      >
        导入协议
      </button>
      <button
        onClick={ExportConfig}
        class="d-btn d-btn-outline d-btn-sm d-btn-primary"
      >
        导出协议
      </button>
    </div>
  );
};

async function ExportConfig() {
  try {
    await ExportModbusConfig();
    toast.success('导出成功');
  } catch (error) {
    toast.error('导出失败');
  }
}
