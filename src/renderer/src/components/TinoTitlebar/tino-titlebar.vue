<script lang="ts" setup>
export interface TinoTitlebar {
  title?: string
  showBtns?: boolean
}

withDefaults(defineProps<TinoTitlebar>(), {
  title: '',
  showBtns: false
})

const isMax = ref(false)

const handleMinimize = (): void => {
  window.ipcRenderer.invoke('on-min')
}

const handleMax = async (status: boolean): Promise<void> => {
  await window.ipcRenderer.invoke(status ? 'on-unmax' : 'on-max')
  isMax.value = !status
}

const handleClose = (): void => {
  window.ipcRenderer.invoke('on-close')
}
</script>

<template>
  <div class="tino-titlebar tino-flex tino-flex-space-between" style="-webkit-app-region: drag">
    <div class="tino-titlebar__content" style="-webkit-app-region: no-drag">
      <slot>{{ title }}</slot>
    </div>
    <div v-if="showBtns" class="tino-titlebar__btns tino-flex tino-flex-row tino-col-center">
      <div class="tino-titlebar__btns_maximize" @click="handleMax(isMax)" />
      <div class="tino-titlebar__btns_minimize" @click="handleMinimize" />
      <div class="tino-titlebar__btns_close" @click="handleClose" />
    </div>
  </div>
</template>

<style lang="scss" src="./tino-titlebar.scss" scoped />
