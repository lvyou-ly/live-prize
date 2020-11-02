import Vue from 'vue'
import Router from 'vue-router'
import UseLivePrize from '@/views/useLivePrize/index.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/useLivePrize',
      name: 'UseLivePrize',
      component: UseLivePrize
    }
  ]
})
