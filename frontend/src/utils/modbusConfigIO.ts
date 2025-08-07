import { ModbusRegisterConfig } from "@/models/modbus_config";

/**
 * 验证modbus配置的有效性
 */
export function isValidModbusConfig(config: any): config is ModbusRegisterConfig {
  return (
    typeof config === "object" &&
    typeof config.enabled === "boolean" &&
    typeof config.description === "string" &&
    typeof config.addr === "number" &&
    typeof config.scale === "number" &&
    typeof config.offset === "number" &&
    typeof config.delta === "number" &&
    typeof config.dataValueType === "string" &&
    config.value &&
    typeof config.value.type === "string" &&
    (typeof config.value.value === "boolean" || typeof config.value.value === "number")
  );
}

/**
 * 验证modbus配置数组
 */
export function validateModbusConfigs(configs: any[]): configs is ModbusRegisterConfig[] {
  return Array.isArray(configs) && configs.every(isValidModbusConfig);
}

/**
 * 从文件内容解析modbus配置
 */
export function parseModbusConfigsFromContent(content: string): ModbusRegisterConfig[] {
  try {
    const parsed = JSON.parse(content);
    if (validateModbusConfigs(parsed)) {
      return parsed;
    }
    throw new Error("文件格式不正确");
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error("JSON格式错误");
    }
    throw error;
  }
}

/**
 * 从文件对象读取并解析modbus配置
 */
export function parseModbusConfigsFromFile(file: File): Promise<ModbusRegisterConfig[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const configs = parseModbusConfigsFromContent(content);
        resolve(configs);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error("文件读取失败"));
    };
    
    reader.readAsText(file);
  });
}

/**
 * 将modbus配置导出为JSON字符串
 */
export function exportModbusConfigsToJSON(configs: ModbusRegisterConfig[]): string {
  return JSON.stringify(configs, null, 2);
}

/**
 * 生成导出文件名
 */
export function generateExportFileName(): string {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
  return `modbus_configs_${timestamp}.json`;
}

/**
 * 下载文件到本地
 */
export function downloadFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 导出modbus配置到文件
 */
export function exportModbusConfigsToFile(configs: ModbusRegisterConfig[]): void {
  const jsonString = exportModbusConfigsToJSON(configs);
  const filename = generateExportFileName();
  downloadFile(jsonString, filename);
}

/**
 * 创建文件选择器并返回Promise
 */
export function selectFile(accept: string = ".json"): Promise<File> {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    
    input.onchange = (event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        resolve(file);
      } else {
        reject(new Error("未选择文件"));
      }
    };
    
    input.oncancel = () => {
      reject(new Error("用户取消选择"));
    };
    
    input.click();
  });
}

/**
 * 导入modbus配置的完整流程
 */
export async function importModbusConfigs(): Promise<ModbusRegisterConfig[]> {
  try {
    const file = await selectFile();
    const configs = await parseModbusConfigsFromFile(file);
    return configs;
  } catch (error) {
    throw error;
  }
}

/**
 * 导出modbus配置的完整流程
 */
export function exportModbusConfigs(configs: ModbusRegisterConfig[]): void {
  try {
    exportModbusConfigsToFile(configs);
  } catch (error) {
    throw error;
  }
}
