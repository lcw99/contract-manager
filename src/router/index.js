import Vue from 'vue'
import Router from 'vue-router'
import Hello from '@/components/Hello'
import About from '@/components/About'
import Coins from '@/components/Coins'
import TokenContract from '@/components/TokenContract'
import ManageToken from '@/components/ManageToken'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Hello',
      component: Hello
    },
    {
      path: '/about',
      name: 'About',
      component: About
    },
    {
      path: '/token-contract',
      name: 'TokenContract',
      component: TokenContract
    },
    {
      path: '/manage-token',
      redirect: '/manage-token/0'
    },
    {
      path: '/manage-token/:id',
      name: 'ManageToken',
      component: ManageToken
    },
    {
      path: '/coins/:id',
      name: 'Coins',
      component: Coins
    }
  ]
})