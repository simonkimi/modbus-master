package main

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"modbus-master/models"
	"modbus-master/mymodbus"
	"os"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx    context.Context
	server *mymodbus.ModbusServer
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{
		server: mymodbus.NewModbusServer(),
	}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// 启动modbus服务器
func (a *App) StartModbusServer(port uint16) error {
	error := a.server.Start(port)
	if error != nil {
		return fmt.Errorf("failed to start modbus server: %w", error)
	}
	return nil
}

// 停止modbus服务器
func (a *App) StopModbusServer() {
	a.server.Stop()
}

// 设置modbus配置
func (a *App) SetModbusConfig(config *models.ModbusConfig) {
	fmt.Printf("SetModbusConfig: %+v\n", config)
	a.server.SetModbusConfig(config)
}

// 删除modbus配置
func (a *App) RemoveModbusConfig(ulid string) {
	a.server.RemoveModbusConfig(ulid)
}

// 获取modbus配置
func (a *App) GetModbusConfig() []*models.ModbusConfig {
	return a.server.GetModbusConfig()
}

// 导入modbus配置
func (a *App) ImportModbusConfig() error {
	filePath, err := runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "导入modbus配置",
		Filters: []runtime.FileFilter{
			{
				DisplayName: "JSON (*.json)",
				Pattern:     "*.json",
			},
		},
	})
	if err != nil {
		return fmt.Errorf("打开文件失败: %w", err)
	}

	if filePath == "" {
		return nil
	}

	jsonData, err := os.ReadFile(filePath)
	if err != nil {
		return fmt.Errorf("读取文件失败: %w", err)
	}

	var configs []*models.ModbusConfig

	err = json.Unmarshal(jsonData, &configs)
	if err != nil {
		return fmt.Errorf("解析JSON失败: %w", err)
	}

	a.server.InitModbusConfig(configs)

	return nil
}

// 导出modbus配置
func (a *App) ExportModbusConfig() error {
	filePath, err := runtime.SaveFileDialog(a.ctx, runtime.SaveDialogOptions{
		Title: "导出modbus配置",
		Filters: []runtime.FileFilter{
			{
				DisplayName: "JSON (*.json)",
				Pattern:     "*.json",
			},
		},
	})
	if err != nil {
		return fmt.Errorf("保存文件失败: %w", err)
	}

	if filePath == "" {
		return nil
	}

	configs := a.server.GetModbusConfig()

	jsonData, err := json.Marshal(configs)
	if err != nil {
		return fmt.Errorf("序列化JSON失败: %w", err)
	}

	err = os.WriteFile(filePath, jsonData, 0644)
	if err != nil {
		return fmt.Errorf("保存文件失败: %w", err)
	}

	return nil
}

// 获取所有modbus配置的值
func (a *App) GetValue() map[string]string {
	values := a.server.GetAllValue()
	result := make(map[string]string)
	for k, v := range values {
		result[k] = base64.StdEncoding.EncodeToString(v)
	}
	return result
}

// 设置modbus配置的值
func (a *App) SetValue(guid string, value string) {
	decoded, err := base64.StdEncoding.DecodeString(value)
	if err != nil {
		return
	}
	a.server.SetValue(guid, decoded)
}
