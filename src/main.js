import Vue from 'vue';
import VueIntro from 'vue-introjs';
import AsyncComputed from 'vue-async-computed';
import i18n from './plugins/i18n';
import vuetify from './plugins/vuetify';
import App from './App.vue';
import store from './store';
import router from './router';
import 'intro.js/introjs.css';
import './styles/introjs.css';
Vue.use(VueIntro);
Vue.use(AsyncComputed);
var app = Vue.extend({
  created() {
    this.$store.dispatch('user/getCSRFToken').then(() => {
      this.$store.dispatch('user/getUserData');
      setTimeout(
        () => this.$store.dispatch('api/setState', this.$route.query),
        500
      );
    });
  },
})
new app({
  vuetify,
  router,
  store,
  i18n,
  render: (h) => h(App),
}).$mount('#app');