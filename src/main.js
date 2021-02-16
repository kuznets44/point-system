import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import VueRouter from 'vue-router';
import Factors from './components/Factors.vue';
import Catalogs from './components/Catalogs.vue';

import { store } from './store';

Vue.config.productionTip = false
Vue.use(VueRouter);
Vue.use(vuetify)

const router = new VueRouter({
  base: __dirname,
  routes: [
    { path: '/factors', component: Factors },
    { path: '/factors/:code', component: Factors },
    { path: '/factors/:code/:id', component: Factors },
    { path: '/catalogs/', component: Catalogs },
    { path: '/catalogs/:code/', component: Catalogs },
    { path: '/', redirect: '/factors' }
  ]
})

new Vue({
  vuetify,
  router: router,
  store: store,
  render: h => h(App)
}).$mount('#app')
