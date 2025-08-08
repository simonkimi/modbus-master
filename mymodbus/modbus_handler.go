package mymodbus

import (
	"modbus-master/models"
	"sync"

	"github.com/simonvetter/modbus"
)

type ModbusRequestHandler struct {
	modbusConfigs map[uint16]*models.ModbusConfig
	lock          *sync.RWMutex
}

func NewModbusRequestHandler(modbusConfigs map[uint16]*models.ModbusConfig, lock *sync.RWMutex) *ModbusRequestHandler {
	return &ModbusRequestHandler{
		modbusConfigs: modbusConfigs,
		lock:          lock,
	}
}

// HandleCoils handles the read coils (0x01), write single coil (0x05)
func (m *ModbusRequestHandler) HandleCoils(req *modbus.CoilsRequest) (res []bool, err error) {
	if req.IsWrite {
		m.lock.Lock()
		defer m.lock.Unlock()
	} else {
		m.lock.RLock()
		defer m.lock.RUnlock()
	}

	for i := 0; i < int(req.Quantity); i++ {
		addr := req.Addr + uint16(i)
		config := m.modbusConfigs[addr]

		if config == nil {
			return nil, modbus.ErrIllegalDataAddress
		}

		if req.IsWrite {
			if req.Args[i] {
				config.Value = 0xFF00
			} else {
				config.Value = 0x0000
			}
		}

		res = append(res, config.Value != 0)
	}
	return
}

// HandleDiscreteInputs handles the read discrete inputs (0x02) function code.
func (m *ModbusRequestHandler) HandleDiscreteInputs(req *modbus.DiscreteInputsRequest) (res []bool, err error) {
	m.lock.RLock()
	defer m.lock.RUnlock()

	for i := 0; i < int(req.Quantity); i++ {
		addr := req.Addr + uint16(i)
		config := m.modbusConfigs[addr]

		if config == nil {
			return nil, modbus.ErrIllegalDataAddress
		}

		res = append(res, config.Value != 0)
	}
	return
}

// HandleHoldingRegisters implements modbus.RequestHandler.
func (m *ModbusRequestHandler) HandleHoldingRegisters(req *modbus.HoldingRegistersRequest) (res []uint16, err error) {
	if req.IsWrite {
		m.lock.Lock()
		defer m.lock.Unlock()
	} else {
		m.lock.RLock()
		defer m.lock.RUnlock()
	}

	for i := 0; i < int(req.Quantity); i++ {
		addr := req.Addr + uint16(i)
		config := m.modbusConfigs[addr]

		if config == nil {
			return nil, modbus.ErrIllegalDataAddress
		}

		if req.IsWrite {
			config.Value = req.Args[i]
		}

		res = append(res, config.Value)
	}
	return
}

// HandleInputRegisters handles the read input registers (0x04) function code.
func (m *ModbusRequestHandler) HandleInputRegisters(req *modbus.InputRegistersRequest) (res []uint16, err error) {
	m.lock.RLock()
	defer m.lock.RUnlock()

	for i := 0; i < int(req.Quantity); i++ {
		addr := req.Addr + uint16(i)
		config := m.modbusConfigs[addr]
		if config == nil {
			return nil, modbus.ErrIllegalDataAddress
		}

		res = append(res, config.Value)
	}
	return
}
