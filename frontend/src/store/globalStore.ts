import { ModBusDataValueType, ModbusRegisterConfig, ModBusValueType } from "@/models/modbus_config";
import { createContext } from "solid-js";
import { createStore } from "solid-js/store";


export const GlobalStoreContext = createContext<ReturnType<typeof createGlobalStore>>();


interface GlobalStoreState {
    port: number;
    isRunning: boolean;
    modbusConfigs: ModbusRegisterConfig[];
}

export function createGlobalStore() {
    const [state, setState] = createStore<GlobalStoreState>({
        port: 8080,
        isRunning: false,
        modbusConfigs: [{
            enabled: true,
            description: "温箱状态",
            addr: 0x1F36,
            dataValueType: ModBusDataValueType.Binary,
            scale: 1,
            offset: 0,
            delta: 1,
            value: { type: ModBusValueType.HoldingRegister, value: 0x1234 },
        }, {
            enabled: true,
            description: "温箱温度",
            addr: 0x1F37,
            dataValueType: ModBusDataValueType.Number,
            scale: 0.1,
            offset: 0,
            delta: 1,
            value: { type: ModBusValueType.HoldingRegister, value: 0x01F4 },
        }, {
            enabled: true,
            description: "温箱湿度",
            addr: 0x1F38,
            dataValueType: ModBusDataValueType.Number,
            scale: 0.1,
            offset: 0,
            delta: 1,
            value: { type: ModBusValueType.HoldingRegister, value: 0x01F4 },
        }, {
            enabled: true,
            description: "温箱故障码",
            addr: 0x1F77,
            dataValueType: ModBusDataValueType.Boolean,
            scale: 0.1,
            offset: 0,
            delta: 1,
            value: { type: ModBusValueType.Coil, value: false },
        }],
    });


    function start() {
        setState("isRunning", true);
    }

    function stop() {
        setState("isRunning", false);
    }

    function setPort(port: number) {
        setState("port", port);
    }

    // 导入modbus配置
    function importModbusConfigs(configs: ModbusRegisterConfig[]) {
        setState("modbusConfigs", configs);
    }

    // 导出modbus配置
    function exportModbusConfigs(): ModbusRegisterConfig[] {
        return state.modbusConfigs;
    }

    // 添加modbus配置
    function addModbusConfig(config: ModbusRegisterConfig) {
        setState("modbusConfigs", [...state.modbusConfigs, config]);
    }

    // 更新modbus配置
    function updateModbusConfig(index: number, config: ModbusRegisterConfig) {
        setState("modbusConfigs", (configs) => 
            configs.map((c, i) => i === index ? config : c)
        );
    }

    // 删除modbus配置
    function deleteModbusConfig(index: number) {
        setState("modbusConfigs", (configs) => 
            configs.filter((_, i) => i !== index)
        );
    }

    return {
        get port() { return state.port },
        get isRunning() { return state.isRunning },
        get modbusConfigs() { return state.modbusConfigs },
        start,
        stop,
        setPort,
        importModbusConfigs,
        exportModbusConfigs,
        addModbusConfig,
        updateModbusConfig,
        deleteModbusConfig,
    }
}