import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

// 管理画面は遅延ロード：Octokit / vuedraggable / SortableJS など
// リスナー側で不要な依存はリスナーには配信しないようにバンドル分割。
const AdminView = () => import('@/views/AdminView.vue')

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/admin', name: 'admin', component: AdminView },
  ],
})
