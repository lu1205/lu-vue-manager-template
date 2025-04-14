import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import cesium from "vite-plugin-cesium"
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  base: '/luVueAdmin',
  plugins: [
    vue(),
    vueJsx(),
    // vueDevTools(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
    createSvgIconsPlugin({
      iconDirs: [path.resolve(process.cwd(), 'src/assets/svgIcon')],
      symbolId: 'icon-[dir]-[name]',
    }),
    cesium()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 3009,
    // host: "192.168.1.218",
    open: false,
    hmr: true, //开启热更新
    proxy: {
      '^/vue': {
        target: 'http://127.0.0.1:3007',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/vue/, '/vue/'),
      },
    },
  },
  build: {
    target: ['es2015'],
    outDir: 'dist', // 指定输出路径
    assetsDir: 'static', // 指定生成静态文件目录
    assetsInlineLimit: 4096, // 小于此阈值的导入或引用资源将内联为 base64 编码
    cssCodeSplit: true, // 启用 CSS 代码拆分
    emptyOutDir: true, //打包前先清空原有打包文件
    // 在这里配置打包时的rollup配置
    rollupOptions: {
      output: {
        //静态资源分类打包
        chunkFileNames: 'static/js/[name]-[hash].js',
        entryFileNames: 'static/js/[name]-[hash].js',
        // assetFileNames: 'static/[ext]/[name]-[hash].[ext]',
        assetFileNames: (chunkInfo: any) => {
          const extFileDirMap: Record<string, string> = {
            'png,gif,jpg,jpeg,svg': '/img',
          }
          const ext = chunkInfo?.name.match(/\.(\w+)$/)?.[1] || 'js'
          const dir =
            Object.keys(extFileDirMap)
              .filter((key) => key.split(',').includes(ext))
              .map((key) => extFileDirMap[key])?.[0] || '[ext]'
          return `static/${dir}/[name].[hash].[ext]`
        },
        manualChunks(id) {
          //静态资源分拆打包
          if (id.includes('node_modules')) {
            return id.toString().split('node_modules/')[2].split('/')[0].toString()
          }
        },
      },
    },
  },
  optimizeDeps: {
    include: [
      'element-plus/es',
      'element-plus/es/components/button/style/css',
      'element-plus/es/components/form/style/css',
      'element-plus/es/components/form-item/style/css',
      'element-plus/es/components/input/style/css',
      'element-plus/es/components/menu/style/css',
      'element-plus/es/components/menu-item/style/css',
      'element-plus/es/components/sub-menu/style/css',
      'element-plus/es/components/dialog/style/css',
      'element-plus/es/components/popover/style/css',
      'element-plus/es/components/avatar/style/css',
      'element-plus/es/components/icon/style/css',
    ],
  },
})
