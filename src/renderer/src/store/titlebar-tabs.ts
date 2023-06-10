import config from '@renderer/config/index.json'

interface TitlebarTabsState {
  tabs: ElTabProps[]
  activeTab: string
}

const key = Date.now().toString()

export const useStore = defineStore('titlebar-tabs', {
  persist: true,
  state: (): TitlebarTabsState => ({
    tabs: [],
    activeTab: key
  }),
  actions: {
    addTab(tab?: ElTabProps) {
      const key = tab?.key || Date.now().toString()
      this.tabs.push(
        tab || {
          key,
          title: config.default.title,
          path: config.default.path
        }
      )
      this.activeTab = key
    },
    removeTab(key: string) {
      let index = -1
      for (let i = 0; i < this.tabs.length; i++) {
        if (this.tabs[i].key === key) {
          index = i
        }
      }
      if (index !== -1) {
        const prevIndex = index - 1
        const tab = this.tabs.splice(index, 1)
        if (this.activeTab === tab[0].key) {
          this.activeTab = this.tabs[prevIndex < 0 ? 0 : prevIndex].key
        }
      }
      if (this.tabs.length === 0) {
        this.addTab({
          key,
          title: config.default.title,
          path: config.default.path
        })
      }
    },
    changeTab(key: string) {
      this.activeTab = key
    }
  }
})
