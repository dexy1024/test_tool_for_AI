# 图像识别系统测试平台

这是一个基于 Vue 3 + Element Plus 的图像识别系统后台测试功能页面，用于测试图像识别准确率。

## 🚀 在线访问

项目已部署到 GitHub Pages：
**https://dexy1024.github.io/test_tool_for_AI/**

## 📋 功能特性

### 1. 陈列页面
- 场景选择（端架、货架、挂架等）
- 规则编码选择
- 输出项编码选择
- Excel 图片链接上传
- 图像识别测试
- 识别结果展示（合格/不合格、SKU信息等）

### 2. 铺货页面
- Excel/CSV 数据导入
- 模板字段验证（图片链接、AI规则编码、AI规则名称为必填）
- 批量识别执行
- 执行结果表格展示
- 数据详情查看（包含图片预览）
- 人工判定功能
- Excel 导出功能

### 3. 价格页面
- Excel/CSV 数据导入
- 多图片链接自动拆分（一行多个图片链接拆分为多行）
- 价格识别执行
- 结果表格（图片链接、缩略图、SKU名称、识别价格、价格区间、是否合格、不合格原因）
- 人工判定功能
- Excel 导出功能

### 4. POSM页面
- Excel/CSV 数据导入
- 多图片链接自动拆分
- POSM 识别执行
- 结果表格（图片链接、缩略图、POSM名称）
- 人工判定功能
- Excel 导出功能

## 🛠️ 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **Element Plus** - Vue 3 组件库
- **Vite** - 快速构建工具
- **xlsx** - Excel 文件处理库

## 📦 本地开发

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

## 📝 使用说明

### 陈列页面
1. 选择场景、规则编码、输出项编码
2. 上传包含图片链接的 Excel 文件
3. 配置回调地址
4. 点击"开始识别"按钮
5. 查看识别结果

### 铺货/价格/POSM 页面
1. 上传 Excel 或 CSV 文件（支持多图片链接，自动拆分）
2. 点击"开始执行"按钮
3. 查看执行结果表格
4. 进行人工判定（可选）
5. 导出 Excel 结果（可选）

## 🔧 部署

本项目使用 GitHub Actions 自动部署到 GitHub Pages。

- 每次推送到 `main` 分支时自动构建和部署
- 部署地址：https://dexy1024.github.io/test_tool_for_AI/

## 📄 文件说明

- `vite.config.js` - 已配置 base 路径为 `/test_tool_for_AI/`
- `.github/workflows/deploy.yml` - GitHub Actions 部署配置
- `dist/` - 构建输出目录（自动生成，不提交到 Git）

## 🌐 浏览器支持

- Chrome >= 87
- Firefox >= 78
- Safari >= 14
- Edge >= 88

## 📝 注意事项

- 当前版本使用模拟数据进行演示
- 实际使用时需要对接真实的图像识别 API
- 所有功能均可在离线状态下使用（本地部署版本）
