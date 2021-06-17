import Vue from 'vue';
import VueIntro from 'vue-introjs';

import i18n from './plugins/i18n';
import vuetify from './plugins/vuetify';

import App from './App.vue';
import store from './store';
import router from './router';

import 'intro.js/introjs.css';
import './styles/introjs.css';

Vue.use(VueIntro);

new Vue({
  vuetify,
  router,
  store,
  i18n,
  render: (h) => h(App),
}).$mount('#app');
