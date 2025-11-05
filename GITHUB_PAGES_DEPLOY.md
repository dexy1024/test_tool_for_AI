# GitHub Pages 部署指南

## 📋 项目检查结果

✅ **项目完全适合 GitHub Pages 部署！**

- ✅ Vue 3 + Vite 静态项目
- ✅ 无后端依赖
- ✅ 无路由配置（单页面应用）
- ✅ 已配置相对路径（`base: './'`）
- ✅ 所有资源本地化

## 🚀 部署步骤

### 方法一：使用 GitHub Actions（推荐，自动部署）

1. **初始化 Git 仓库（如果还没有）**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **创建 GitHub 仓库**
   - 在 GitHub 上创建一个新仓库
   - 不要初始化 README、.gitignore 或 license

3. **推送代码到 GitHub**
   ```bash
   git remote add origin https://github.com/你的用户名/仓库名.git
   git branch -M main
   git push -u origin main
   ```

4. **启用 GitHub Pages**
   - 进入仓库的 **Settings** → **Pages**
   - 在 **Source** 中选择 **GitHub Actions**
   - 保存设置

5. **自动部署**
   - 每次推送到 `main` 分支时，GitHub Actions 会自动构建并部署
   - 部署完成后，访问地址：`https://你的用户名.github.io/仓库名/`

### 方法二：手动部署（简单但需手动操作）

1. **构建项目**
   ```bash
   npm run build
   ```

2. **创建 gh-pages 分支**
   ```bash
   git checkout --orphan gh-pages
   git rm -rf .
   cp -r dist/* .
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin gh-pages
   ```

3. **启用 GitHub Pages**
   - 进入仓库的 **Settings** → **Pages**
   - 在 **Source** 中选择 **gh-pages** 分支
   - 保存设置

## 📝 配置文件说明

### `.github/workflows/deploy.yml`
- 自动构建和部署的 GitHub Actions 工作流
- 在每次推送到 main 分支时自动触发

### `vite.config.js`
- 已配置 `base: './'`，使用相对路径
- 适合 GitHub Pages 的子路径部署

## 🔧 自定义域名（可选）

如果需要使用自定义域名：

1. 在仓库根目录创建 `CNAME` 文件：
   ```
   你的域名.com
   ```

2. 在域名 DNS 设置中添加 CNAME 记录：
   - 类型：CNAME
   - 名称：@ 或 www
   - 值：你的用户名.github.io

## ⚠️ 注意事项

1. **仓库名称影响访问路径**
   - 如果仓库名是 `image-recognition`，访问地址是：
     `https://你的用户名.github.io/image-recognition/`
   - 如果仓库名是 `你的用户名.github.io`，访问地址是：
     `https://你的用户名.github.io/`

2. **首次部署可能需要几分钟**
   - GitHub Actions 需要构建时间
   - 可以在 Actions 标签页查看构建进度

3. **文件大小限制**
   - GitHub Pages 单个文件最大 100MB
   - 仓库总大小限制 1GB
   - 当前项目构建后约 2MB，完全符合要求

## 🎯 访问地址

部署成功后，访问地址格式：
```
https://你的用户名.github.io/仓库名/
```

例如：
```
https://username.github.io/image-recognition-test/
```

## 📚 相关文档

- [GitHub Pages 官方文档](https://docs.github.com/en/pages)
- [Vite 部署指南](https://vitejs.dev/guide/static-deploy.html)

