import Vue from 'vue';

import i18n from './plugins/i18n';
import vuetify from './plugins/vuetify';

import App from './App.vue';
import store from './store';
import router from './router';

new Vue({
  vuetify,
  router,
  store,
  i18n,
  render: (h) => h(App),
}).$mount('#app');
