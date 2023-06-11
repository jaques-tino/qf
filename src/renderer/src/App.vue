<script lang="ts" setup>
import config from '@renderer/config/index.json'
import { useStore } from '@renderer/store/titlebar-tabs'

const store = useStore()
const webviewMap = new Map()
const platform = ref('windows')

onMounted(() => {
  watch(
    store.tabs,
    async () => {
      await nextTick()
      store.tabs.forEach((tab) => {
        const webview = webviewMap.get(tab.key)
        console.log(webview)
        webview.addEventListener('dom-ready', () => {
          tab.title = webview.getTitle()
          tab.webview_id = webview.getWebContentsId()
          webview.addEventListener('page-title-updated', (event) => {
            tab.title = event.title
          })

          webview.addEventListener('did-change-theme-color', (event) => {
            const themeColor = event.themeColor
            if (themeColor === null) return
            console.log(themeColor)
            document.body.classList.add(themeColor === '#FFFFFF' ? 'light' : 'dart')
            document.body.classList.remove(themeColor === '#FFFFFF' ? 'dart' : 'light')
          })

          webview.addEventListener('did-navigate-in-page', (event) => {
            const target = store.tabs.find((tab) => tab.key === store.activeTab)
            if (target) {
              target.path = event.url
            }
          })
        })
      })
    },
    { deep: true, immediate: true }
  )
})

window.electronApi.openUrl((_, path: string) => {
  store.addTab({
    path,
    key: Date.now().toString(),
    title: config.default.title
  })
})

window.ipcRenderer.invoke('platform').then((p: string) => {
  platform.value = p
})
</script>

<template>
  <TinoTitlebar :show-btns="platform === 'darwin'">
    <el-tabs
      type="card"
      addable
      closable
      class="tabs"
      :model-value="store.activeTab"
      @tab-add="store.addTab"
      @tab-remove="store.removeTab"
      @tab-change="store.changeTab"
    >
      <el-tab-pane v-for="tab in store.tabs" :key="tab.key" :name="tab.key">
        <template #label>
          <div class="title" :title="tab.title">{{ tab.title }}</div>
        </template>
        <webview
          :ref="(el) => webviewMap.set(tab.key, el)"
          :src="tab.path"
          allowpopups
          webpreferences="spellcheck=yes"
        />
      </el-tab-pane>
    </el-tabs>
  </TinoTitlebar>
</template>

<style lang="scss" scoped>
.tino-titlebar {
  :deep(.tabs) {
    .el-tabs__new-tab {
      border: none;
      // color: rgb(183, 186, 196);
      color: var(--tino-text-color);
      // background-color: rgb(26, 30, 31);
      background-color: var(--tino-bg-color);
    }
    .el-tabs__header {
      border: none;
      margin-bottom: 0;

      .el-tabs__nav {
        border: none;
      }

      .el-tabs__item.is-closable .is-icon-close {
        width: 14px;
      }

      .is-closable {
        color: var(--tino-text-color);
        padding-left: 13px;
        padding-right: 13px;

        &:hover {
          color: inherit;
        }
      }

      .el-tabs__item {
        border-radius: 5px;
        width: 200px;
        border-bottom: 0;
        justify-content: space-between;
        transition: all 0.3s;
        border-left-color: transparent;

        .el-icon {
          flex-shrink: 0;
        }

        .title {
          flex: 1;
          overflow: hidden;
          margin-right: 10px;
          text-overflow: ellipsis;
        }

        &:hover {
          background-color: var(--tino-text-color-hover);
        }

        &.is-active {
          // background-color: rgb(26, 30, 31);
          background-color: var(--tino-bg-color-active);
          // color: #fff;
          color: var(--tino-text-color-active);
        }
      }
    }
    webview {
      width: 100%;
      height: calc(100vh - 40px);
      position: fixed;
    }
  }
}
</style>
