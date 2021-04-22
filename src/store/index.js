import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';

import api from './api.module';
import user from './user.module';
import loading from './loading.module';

Vue.use(Vuex);
Vue.config.devtools = true;

export default new Vuex.Store({
  modules: {
    api,
    user,
    loading,
  },
  plugins: [
    createPersistedState({
      paths: [
        'api.settings',
        'user.data',
        'user.drawer',
        'user.history',
      ],
    }),
  ],
});
