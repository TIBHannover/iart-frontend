import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';

import api from './api.module';
import user from './user.module';

Vue.use(Vuex);
Vue.config.devtools = true;

export default new Vuex.Store({
  modules: {
    api,
    user,
  },
  plugins: [
    createPersistedState({
      paths: [
        'api.index',
        'api.random',
        'api.settings',
        'user.data',
        'user.drawer',
      ],
    }),
  ],
});
