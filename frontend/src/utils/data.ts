export enum DataTypeEnum {
  Bool = 'bool',
  Uint16 = 'uint16',
  Uint32 = 'uint32',
  Int16 = 'int16',
  Int32 = 'int32',
  Float32 = 'float32',
  Float64 = 'float64',
  Binary = 'binary',
}

export function isNumberDataType(dataType: string): boolean {
  return (
    dataType === DataTypeEnum.Uint16 ||
    dataType === DataTypeEnum.Int16 ||
    dataType === DataTypeEnum.Uint32 ||
    dataType === DataTypeEnum.Int32 ||
    dataType === DataTypeEnum.Float32 ||
    dataType === DataTypeEnum.Float64
  );
}

export enum ByteOrderEnum {
  BigEndian = 'bigEndian',
  LittleEndian = 'littleEndian',
}

export function getNumber(
  data: Uint8Array,
  byteOrder: ByteOrderEnum,
  dataType: DataTypeEnum
): number {
  const littleEndian = byteOrder === ByteOrderEnum.LittleEndian;

  switch (dataType) {
    case DataTypeEnum.Bool: {
      const byte0 = data[0] ?? 0;
      const byte1 = data[1] ?? 0;
      return byte0 !== 0 || byte1 !== 0 ? 1 : 0;
    }
    default: {
      const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
      switch (dataType) {
        case DataTypeEnum.Uint16:
          return view.getUint16(0, littleEndian);
        case DataTypeEnum.Int16:
          return view.getInt16(0, littleEndian);
        case DataTypeEnum.Uint32:
          return view.getUint32(0, littleEndian);
        case DataTypeEnum.Int32:
          return view.getInt32(0, littleEndian);
        case DataTypeEnum.Float32:
          return view.getFloat32(0, littleEndian);
        case DataTypeEnum.Float64:
          return view.getFloat64(0, littleEndian);
        default:
          throw new Error(`Unsupported data type: ${dataType}`);
      }
    }
  }
}

export function getBytes(
  data: number,
  byteOrder: ByteOrderEnum,
  dataType: DataTypeEnum
): Uint8Array {
  const littleEndian = byteOrder === ByteOrderEnum.LittleEndian;

  switch (dataType) {
    case DataTypeEnum.Bool: {
      const value16 = data === 0 ? 0x0000 : 0xff00;
      const buffer = new ArrayBuffer(2);
      const view = new DataView(buffer);
      view.setUint16(0, value16, littleEndian);
      return new Uint8Array(buffer);
    }
    case DataTypeEnum.Uint16: {
      const buffer = new ArrayBuffer(2);
      const view = new DataView(buffer);
      view.setUint16(0, data >>> 0, littleEndian);
      return new Uint8Array(buffer);
    }
    case DataTypeEnum.Int16: {
      const buffer = new ArrayBuffer(2);
      const view = new DataView(buffer);
      view.setInt16(0, data | 0, littleEndian);
      return new Uint8Array(buffer);
    }
    case DataTypeEnum.Uint32: {
      const buffer = new ArrayBuffer(4);
      const view = new DataView(buffer);
      view.setUint32(0, Math.trunc(data) >>> 0, littleEndian);
      return new Uint8Array(buffer);
    }
    case DataTypeEnum.Int32: {
      const buffer = new ArrayBuffer(4);
      const view = new DataView(buffer);
      view.setInt32(0, Math.trunc(data) | 0, littleEndian);
      return new Uint8Array(buffer);
    }
    case DataTypeEnum.Float32: {
      const buffer = new ArrayBuffer(4);
      const view = new DataView(buffer);
      view.setFloat32(0, data, littleEndian);
      return new Uint8Array(buffer);
    }
    case DataTypeEnum.Float64: {
      const buffer = new ArrayBuffer(8);
      const view = new DataView(buffer);
      view.setFloat64(0, data, littleEndian);
      return new Uint8Array(buffer);
    }
    default:
      throw new Error(`Unsupported data type: ${dataType}`);
  }
}
