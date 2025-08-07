import { Component } from "solid-js";
import { useModbusConfigIO } from "@/hooks/useModbusConfigIO";

interface ModbusConfigIOProps {
  onImportSuccess?: () => void;
  onImportError?: (error: string) => void;
  onExportSuccess?: () => void;
  onExportError?: (error: string) => void;
  showSuccessMessage?: boolean;
  showErrorMessage?: boolean;
}

export const ModbusConfigIO: Component<ModbusConfigIOProps> = (props) => {
  const { handleImport, handleExport, canImport } = useModbusConfigIO();

  // 处理导入
  const onImportClick = async () => {
    try {
      const success = await handleImport();
      if (success) {
        if (props.showSuccessMessage !== false) {
          alert("配置导入成功！");
        }
        props.onImportSuccess?.();
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (props.showErrorMessage !== false) {
        alert("导入失败：" + errorMessage);
      }
      props.onImportError?.(errorMessage);
    }
  };

  // 处理导出
  const onExportClick = () => {
    try {
      handleExport();
      if (props.showSuccessMessage !== false) {
        alert("配置导出成功！");
      }
      props.onExportSuccess?.();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (props.showErrorMessage !== false) {
        alert("导出失败：" + errorMessage);
      }
      props.onExportError?.(errorMessage);
    }
  };

  return (
    <div class="flex flex-row space-x-2">
      {/* 导入按钮 */}
      <button
        onClick={onImportClick}
        disabled={!canImport()}
        class="d-btn d-btn-outline d-btn-sm d-btn-primary"
      >
        导入
      </button>

      {/* 导出按钮 */}
      <button
        onClick={onExportClick}
        class="d-btn d-btn-outline d-btn-sm d-btn-primary"
      >
        导出
      </button>
    </div>
  );
};
