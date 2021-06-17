import Vue from 'vue';
import VueRouter from 'vue-router';

import Home from '../views/Home.vue';
import Search from '../views/Search.vue';
import NotFound from '../views/NotFound.vue';

Vue.use(VueRouter);
console.log(process.env.BASE_URL);

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    { path: '/', name: 'Home', component: Home },
    { path: '/search', name: 'Search', component: Search },
    { path: '*', name: 'NotFound', component: NotFound },
  ],
});

export default router;
