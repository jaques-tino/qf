import App from './App.vue'
import { createApp } from 'vue'
import pinia from '@renderer/store'
import '@renderer/static/styles/normalize.scss'
import '@renderer/static/styles/tools.scss'

createApp(App).use(pinia).mount('#app')
