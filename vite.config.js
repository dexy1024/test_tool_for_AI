import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 8081, // 优先使用8081，如果被占用则自动尝试下一个可用端口
    open: true,
    host: '0.0.0.0', // 允许外部访问，监听所有网络接口
    strictPort: false, // 如果端口被占用，自动尝试下一个可用端口
  },
  build: {
    // GitHub Pages 部署路径：/test_tool_for_AI/
    base: '/test_tool_for_AI/',
    // 禁用代码分割，避免模块加载顺序问题
    rollupOptions: {
      output: {
        // 将所有代码打包到一个文件中，避免模块加载顺序问题
        manualChunks: undefined
      }
    }
  }
})
