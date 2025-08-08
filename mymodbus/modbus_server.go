package mymodbus

import (
	"fmt"
	"modbus-master/models"
	"sort"
	"sync"

	"github.com/simonvetter/modbus"
)

type ModbusServer struct {
	server        *modbus.ModbusServer
	modbusConfigs map[uint16]*models.ModbusConfig
	lock          sync.RWMutex
}

func NewModbusServer() *ModbusServer {
	return &ModbusServer{
		modbusConfigs: make(map[uint16]*models.ModbusConfig),
		lock:          sync.RWMutex{},
		server:        nil,
	}
}

// 启动modbus服务器
func (m *ModbusServer) Start(port uint16) error {
	m.lock.Lock()
	defer m.lock.Unlock()

	if m.server != nil {
		return fmt.Errorf("modbus server already started")
	}

	var err error
	handler := NewModbusRequestHandler(m.modbusConfigs, &m.lock)
	m.server, err = modbus.NewServer(&modbus.ServerConfiguration{
		URL:        fmt.Sprintf("tcp://0.0.0.0:%d", port),
		MaxClients: 10,
	}, handler)
	if err != nil {
		return err
	}
	return m.server.Start()
}

// 停止modbus服务器
func (m *ModbusServer) Stop() {
	m.lock.Lock()
	defer m.lock.Unlock()

	if m.server == nil {
		return
	}

	m.server.Stop()
	m.server = nil
}

// 添加modbus配置
func (m *ModbusServer) SetModbusConfig(config *models.ModbusConfig) {
	m.lock.Lock()
	defer m.lock.Unlock()

	m.modbusConfigs[config.Addr] = config
}

// 删除modbus配置
func (m *ModbusServer) RemoveModbusConfig(addr uint16) {
	m.lock.Lock()
	defer m.lock.Unlock()

	delete(m.modbusConfigs, addr)
}

// 获取所有modbus配置
func (m *ModbusServer) GetModbusConfig() []*models.ModbusConfig {
	m.lock.RLock()
	defer m.lock.RUnlock()

	res := make([]*models.ModbusConfig, 0, len(m.modbusConfigs))
	for _, config := range m.modbusConfigs {
		res = append(res, config.Clone())
	}
	sort.Slice(res, func(i, j int) bool {
		return res[i].Addr < res[j].Addr
	})
	return res
}

// 导入modbus配置
func (m *ModbusServer) ImportModbusConfig(config []*models.ModbusConfig) {
	m.lock.Lock()
	defer m.lock.Unlock()

	m.modbusConfigs = make(map[uint16]*models.ModbusConfig)
	for _, config := range config {
		m.modbusConfigs[config.Addr] = config
	}
}

// 获取所有modbus配置的值
func (m *ModbusServer) GetValue() map[uint16]uint16 {
	m.lock.RLock()
	defer m.lock.RUnlock()

	res := make(map[uint16]uint16)
	for addr, config := range m.modbusConfigs {
		res[addr] = config.Value
	}
	return res
}

// 设置modbus配置的值
func (m *ModbusServer) SetValue(addr uint16, value uint16) {
	m.lock.Lock()
	defer m.lock.Unlock()

	config, ok := m.modbusConfigs[addr]
	if !ok {
		return
	}

	config.Value = value
}

