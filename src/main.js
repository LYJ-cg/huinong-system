import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import Vant from 'vant'
import 'vant/lib/index.css'
import App from './App.vue'
import router from './router'
import './styles/global.css'
import { initDB } from './api/db'

const app = createApp(App)
for (const [key, comp] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, comp)
}
app.use(createPinia())
app.use(router)
app.use(ElementPlus)
app.use(Vant)
// 先初始化数据（拉取共享存储数据），再挂载应用
initDB().finally(() => app.mount('#app'))
