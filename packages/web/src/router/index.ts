import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ControlView from "@/views/ControlView.vue"
import BangumiView from "@/views/BangumiView.vue"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      redirect: '/control',
      children:[
        {
          path: '/control',
          name: 'control',
          component: ControlView,
        },
        {
          path: '/bangumi',
          name: 'bangumi',
          component: BangumiView,
        }
      ]
    },
  ]
})

export default router
