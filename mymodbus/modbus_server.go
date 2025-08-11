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
	modbusConfigs map[string]*models.ModbusConfig
	register      map[uint16]uint16
	lock          sync.RWMutex
}

func NewModbusServer() *ModbusServer {
	return &ModbusServer{
		modbusConfigs: make(map[string]*models.ModbusConfig),
		register:      make(map[uint16]uint16),
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
	handler := NewModbusRequestHandler(m.register, &m.lock)
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

// 初始化modbus配置
func (m *ModbusServer) InitModbusConfig(configs []*models.ModbusConfig) {
	m.lock.Lock()
	defer m.lock.Unlock()

	m.register = make(map[uint16]uint16)

	for _, config := range configs {
		m.setModbusConfig(config)
	}
}

func (m *ModbusServer) setModbusConfig(config *models.ModbusConfig) {
	// 初始化寄存器
	for i := 0; i < int(config.AddrSize); i++ {
		addr := config.StartAddr + uint16(i)
		_, ok := m.register[addr]
		if !ok {
			if len(config.InitValue) > i {
				m.register[addr] = uint16(config.InitValue[i])<<8 | uint16(config.InitValue[i+1])
			} else {
				m.register[addr] = 0
			}
		}
	}

	m.modbusConfigs[config.Id] = config
}

// 编辑modbus配置
func (m *ModbusServer) SetModbusConfig(config *models.ModbusConfig) {
	m.lock.Lock()
	defer m.lock.Unlock()

	m.setModbusConfig(config)
}

// 删除modbus配置
func (m *ModbusServer) RemoveModbusConfig(id string) {
	m.lock.Lock()
	defer m.lock.Unlock()

	config, ok := m.modbusConfigs[id]
	if !ok {
		return
	}

	for i := 0; i < int(config.AddrSize); i++ {
		addr := config.StartAddr + uint16(i)
		delete(m.register, addr)
	}
	delete(m.modbusConfigs, id)
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
		return res[i].StartAddr < res[j].StartAddr
	})
	return res
}

// 获取所有的值
func (m *ModbusServer) GetAllValue() map[string][]byte {
	m.lock.RLock()
	defer m.lock.RUnlock()

	res := make(map[string][]byte)
	for guid, config := range m.modbusConfigs {
		sourceArr := make([]byte, config.AddrSize*2)
		for i := 0; i < int(config.AddrSize); i++ {
			addr := config.StartAddr + uint16(i)
			sourceArr[i*2] = byte(m.register[addr] >> 8)
			sourceArr[i*2+1] = byte(m.register[addr])
		}
		res[guid] = sourceArr
	}
	return res
}

// 设置值
func (m *ModbusServer) SetValue(guid string, data []byte) {
	m.lock.Lock()
	defer m.lock.Unlock()

	config, ok := m.modbusConfigs[guid]
	if !ok {
		return
	}

	for i := 0; i < int(config.AddrSize); i++ {
		addr := config.StartAddr + uint16(i)
		value := 0
		if len(data) > i*2 {
			value = int(data[i*2]) << 8
		}
		if len(data) > i*2+1 {
			value |= int(data[i*2+1])
		}
		m.register[addr] = uint16(value)
	}
}
