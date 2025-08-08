package models

type ModbusConfig struct {
	Enabled     bool    `json:"enabled"`
	Description string  `json:"description"`
	Addr        uint16  `json:"addr"`
	Value       uint16  `json:"value"`
	Scale       float64 `json:"scale"`
	Offset      float64 `json:"offset"`
	Delta       float64 `json:"delta"`
	ValueType   string  `json:"valueType"`
}

func (m *ModbusConfig) Clone() *ModbusConfig {
	return &ModbusConfig{
		Enabled:     m.Enabled,
		Description: m.Description,
		Addr:        m.Addr,
		Value:       m.Value,
		Scale:       m.Scale,
		Offset:      m.Offset,
		Delta:       m.Delta,
		ValueType:   m.ValueType,
	}
}
