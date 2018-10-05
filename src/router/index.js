import Vue from 'vue'
import Router from 'vue-router'
import TokenContract from '@/components/TokenContract'
import ManageToken from '@/components/ManageToken'
import SendEther from '@/components/SendEther'
import SignMessage from '@/components/SignMessage'
import About from '@/components/About'
import GambleSimulator from '@/components/GambleSimulator'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/send-ether'
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
      path: '/send-ether/',
      name: 'SendEther',
      component: SendEther
    },
    {
      path: '/sign-message/',
      name: 'SignMessage',
      component: SignMessage
    },
    {
      path: '/about',
      name: 'About',
      component: About
    },
    {
      path: '/gamble',
      name: 'Gamble',
      component: GambleSimulator
    },
  ]
})