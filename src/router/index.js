import 'babel-polyfill'
import 'es6-promise/auto'
import Vue from 'vue'
import Router from 'vue-router'
import TokenContract from '@/components/TokenContract'
import ManageToken from '@/components/ManageToken'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/token-contract'
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
  ]
})