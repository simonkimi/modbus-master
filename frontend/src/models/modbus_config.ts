export enum ModBusValueType {
    Coil = 'coil',
    InputStatus = 'inputStatus',
    HoldingRegister = 'holdingRegister',
    InputRegister = 'inputRegister',
}

export enum ModBusDataValueType {
    Boolean = 'boolean',
    Number = 'number',
    Binary = 'binary',
}

export interface ModbusRegisterConfig {
    enabled: boolean;
    description: string;
    addr: number;
    scale: number;
    offset: number;
    delta: number;
    dataValueType: ModBusDataValueType;
    value: ModBusValue;
}

export type ModBusValue =
    | { type: ModBusValueType.Coil; value: boolean }
    | { type: ModBusValueType.InputStatus; value: boolean }
    | { type: ModBusValueType.HoldingRegister; value: number }
    | { type: ModBusValueType.InputRegister; value: number };


