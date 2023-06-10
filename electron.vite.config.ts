import path, { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [
      vue({
        template: {
          compilerOptions: {
            isCustomElement: (tag) => tag === 'webview'
          }
        }
      }),
      AutoImport({
        imports: ['vue', 'pinia'],
        eslintrc: {
          enabled: true
        },
        resolvers: [ElementPlusResolver()]
      }),
      Components({
        dirs: [path.resolve(__dirname, 'src/renderer/src/components')],
        extensions: ['vue'],
        dts: true,
        resolvers: [
          ElementPlusResolver({
            importStyle: 'sass'
          })
        ]
      })
    ]
  }
})
