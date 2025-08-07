# 开发环境设置

## 项目结构

这是一个基于 Wails v2 的桌面应用程序，使用 Go 作为后端，SolidJS 作为前端框架。

## 环境要求

- Go 1.19+
- Node.js 16+
- pnpm 8+
- Wails CLI v2

## 快速开始

### 1. 安装依赖

```bash
# 安装前端依赖
cd frontend
pnpm install

# 安装 Go 依赖
cd ..
go mod tidy
```

### 2. 开发模式

```bash
# 启动开发服务器
wails dev
```

### 3. 构建应用

```bash
# 构建生产版本
wails build
```

## VSCode 配置

项目已配置了以下 VSCode 设置：

- **扩展推荐**: Go、Prettier、TypeScript 等开发必需扩展
- **调试配置**: 支持直接在 VSCode 中调试 Wails 应用
- **任务配置**: 快速执行常用命令（构建、开发、依赖管理）
- **代码格式化**: 自动格式化 Go 和 TypeScript 代码

## 代码规范

- **Go**: 使用 `goimports` 和 `golangci-lint`
- **TypeScript/JavaScript**: 使用 Prettier 格式化
- **提交前**: 代码会自动格式化和组织导入

## 常用命令

### 前端开发

```bash
cd frontend

# 安装依赖
pnpm install

# 更新依赖到最新版本
pnpm update --latest

# 开发服务器
pnpm dev

# 构建
pnpm build
```

### 后端开发

```bash
# 整理依赖
go mod tidy

# 运行测试
go test ./...

# 格式化代码
go fmt ./...
```

## 项目特性

- 🚀 热重载开发
- 🎨 现代化 UI 框架 (SolidJS)
- 🔧 完整的 VSCode 开发环境
- 📦 自动依赖管理
- 🎯 跨平台构建支持