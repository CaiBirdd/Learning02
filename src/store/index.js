import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

// 创建 Pinia 实例
const pinia = createPinia()

// 使用持久化插件 (替代原 vuex-persistedstate)
pinia.use(piniaPluginPersistedstate)

export default pinia
