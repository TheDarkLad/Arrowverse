import Vue from 'vue'
import VueRouter from 'vue-router'
import axios from 'axios'
import Notifications from 'vue-notification'

Vue.use(VueRouter)
Vue.use(Notifications)
Vue.prototype.$http = axios

import App from './App.vue'
import Home from './components/Home.vue'
import EpisodeList from './components/EpisodeList.vue';

Vue.config.productionTip = false

const series = 0;
const router = new VueRouter({
  routes: [
    { name: 'home', path: '/', component: Home },
    { name: 'series', path: '/series/:series', component: EpisodeList, params: { series } },
  ],
})

new Vue({
  el:'#app',
  router,  
  render: h => h(App)
});