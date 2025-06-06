import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [preact()],
  
  // Build configuration - package as embeddable JS file
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'WebAssistant',
      fileName: 'web-assistant',
      formats: ['umd', 'es'] // Support both UMD and ES modules
    },
    rollupOptions: {
      // Don't bundle these libraries to reduce file size
      external: [],
      output: {
        globals: {}
      }
    },
    // Generate type declaration files
    emptyOutDir: true
  },
  
  // Development server configuration
  server: {
    port: 3000,
    cors: true,
    open: '/test.html', // 打开测试页面
    strictPort: false // 自动寻找下一个可用端口
  },
  
  // 配置公共文件访问 - 指向根目录以访问test.html
  publicDir: '../../public',
  
  // Path aliases
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  
  // CSS configuration
  css: {
    modules: {
      localsConvention: 'camelCase'
    }
  }
})