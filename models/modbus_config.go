package models

// 协议
type ModbusConfig struct {
	Id          string  `json:"id"`          // Id
	Enabled     bool    `json:"enabled"`     // 是否启用
	Description string  `json:"description"` // 描述
	StartAddr   uint16  `json:"startAddr"`   // 起始地址
	AddrSize    uint16  `json:"addrSize"`    // 地址大小
	InitValue   []byte  `json:"initValue"`   // 初始值
	ValueType   string  `json:"valueType"`   // 值类型
	ByteOrder   string  `json:"byteOrder"`   // 字节序
	Scale       float64 `json:"scale"`       // 缩放
	Offset      float64 `json:"offset"`      // 偏移
	Delta       float64 `json:"delta"`       // 增量
}

func (m *ModbusConfig) Clone() *ModbusConfig {
	return &ModbusConfig{
		Id:          m.Id,
		Enabled:     m.Enabled,
		Description: m.Description,
		StartAddr:   m.StartAddr,
		AddrSize:    m.AddrSize,
		InitValue:   m.InitValue,
		ValueType:   m.ValueType,
		ByteOrder:   m.ByteOrder,
		Scale:       m.Scale,
		Offset:      m.Offset,
		Delta:       m.Delta,
	}
}
