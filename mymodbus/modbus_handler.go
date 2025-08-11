package mymodbus

import (
	"fmt"
	"sync"

	"github.com/simonvetter/modbus"
)

type ModbusRequestHandler struct {
	register map[uint16]uint16
	lock     *sync.RWMutex
}

func NewModbusRequestHandler(register map[uint16]uint16, lock *sync.RWMutex) *ModbusRequestHandler {
	return &ModbusRequestHandler{
		register: register,
		lock:     lock,
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
		_, ok := m.register[addr]

		if !ok {
			fmt.Printf("Coils addr 0x%X not found\n", addr)
			return nil, modbus.ErrIllegalDataAddress
		}

		if req.IsWrite {
			if req.Args[i] {
				m.register[addr] = 0xFF00
			} else {
				m.register[addr] = 0x0000
			}
		}

		res = append(res, m.register[addr] != 0)
	}
	return
}

// HandleDiscreteInputs handles the read discrete inputs (0x02) function code.
func (m *ModbusRequestHandler) HandleDiscreteInputs(req *modbus.DiscreteInputsRequest) (res []bool, err error) {
	m.lock.RLock()
	defer m.lock.RUnlock()

	for i := 0; i < int(req.Quantity); i++ {
		addr := req.Addr + uint16(i)
		_, ok := m.register[addr]

		if !ok {
			fmt.Printf("DiscreteInputs addr 0x%X not found\n", addr)
			return nil, modbus.ErrIllegalDataAddress
		}

		res = append(res, m.register[addr] != 0)
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
		_, ok := m.register[addr]

		if !ok {
			fmt.Printf("HoldingRegisters addr 0x%X not found\n", addr)
			return nil, modbus.ErrIllegalDataAddress
		}

		if req.IsWrite {
			m.register[addr] = req.Args[i]
		}

		res = append(res, m.register[addr])
	}
	return
}

// HandleInputRegisters handles the read input registers (0x04) function code.
func (m *ModbusRequestHandler) HandleInputRegisters(req *modbus.InputRegistersRequest) (res []uint16, err error) {
	m.lock.RLock()
	defer m.lock.RUnlock()

	for i := 0; i < int(req.Quantity); i++ {
		addr := req.Addr + uint16(i)
		_, ok := m.register[addr]

		if !ok {
			fmt.Printf("InputRegisters addr 0x%X not found\n", addr)
			return nil, modbus.ErrIllegalDataAddress
		}

		res = append(res, m.register[addr])
	}
	return
}
