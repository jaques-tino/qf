<script lang="ts" setup>
import config from '@renderer/config/index.json'
import { useStore } from '@renderer/store/titlebar-tabs'

const store = useStore()
const webviewMap = new Map()

onMounted(() => {
  watch(
    store.tabs,
    async () => {
      await nextTick()
      store.tabs.forEach((tab) => {
        const webview = webviewMap.get(tab.key)
        webview.addEventListener('dom-ready', () => {
          tab.title = webview.getTitle()
          tab.webview_id = webview.getWebContentsId()

          webview.addEventListener('context-menu', async (e) => {
            e.preventDefault()
            await window.ipcRenderer.invoke('showWebviewMenu', tab.webview_id)
          })

          webview.addEventListener('did-navigate', (event) => {
            tab.path = event.url
            // tab.title = event.title
            console.log(event)
          })

          webview.addEventListener('page-title-updated', (event) => {
            tab.title = event.title
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

window.electronApi.openDevTools((_, id: number) => {
  for (const [, webview] of webviewMap) {
    if (webview.getWebContentsId() === id) {
      webview.openDevTools()
    }
  }
})
</script>

<template>
  <TinoTitlebar>
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
        <webview :ref="(el) => webviewMap.set(tab.key, el)" :src="tab.path" allowpopups />
      </el-tab-pane>
    </el-tabs>
  </TinoTitlebar>
</template>

<style lang="scss" scoped>
.tino-titlebar {
  :deep(.tabs) {
    .el-tabs__new-tab {
      border: none;
      color: rgb(183, 186, 196);
      background-color: rgb(26, 30, 31);
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
        color: #333;
        padding-left: 13px;
        padding-right: 13px;

        &:hover {
          color: inherit;
        }
      }

      .el-tabs__item {
        border-radius: 5px 5px 0 0;
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
          background-color: rgb(218, 218, 218);
        }

        &.is-active {
          box-shadow: 0px 12px 32px 4px rgba(0, 0, 0, 0.14);
          background-color: rgb(26, 30, 31);
          color: #fff;
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
