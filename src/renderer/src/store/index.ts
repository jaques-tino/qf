import { createPinia } from 'pinia'
import { App as Application } from 'vue'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

export const install = (app: Application): void => {
  app.use(pinia)
}

export default pinia
