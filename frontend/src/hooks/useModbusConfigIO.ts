import { useContext } from "solid-js";
import { GlobalStoreContext } from "@/store/globalStore";
import { importModbusConfigs, exportModbusConfigs } from "@/utils/modbusConfigIO";

/**
 * 自定义hook，提供modbus配置导入导出功能
 */
export function useModbusConfigIO() {
  const store = useContext(GlobalStoreContext)!;

  /**
   * 导入modbus配置
   */
  const handleImport = async (): Promise<boolean> => {
    try {
      const configs = await importModbusConfigs();
      store.importModbusConfigs(configs);
      return true;
    } catch (error) {
      if (error instanceof Error && error.message === "用户取消选择") {
        // 用户取消选择，返回false但不抛出错误
        return false;
      }
      throw error;
    }
  };

  /**
   * 导出modbus配置
   */
  const handleExport = (): void => {
    const configs = store.exportModbusConfigs();
    exportModbusConfigs(configs);
  };

  /**
   * 检查是否可以执行导入操作
   */
  const canImport = (): boolean => {
    return !store.isRunning;
  };

  return {
    handleImport,
    handleExport,
    canImport,
    isRunning: () => store.isRunning,
  };
}
