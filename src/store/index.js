import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';

import api from './api.module';

Vue.use(Vuex);
Vue.config.devtools = true;

export default new Vuex.Store({
  modules: {
    api,
  },
  plugins: [
    createPersistedState({
      paths: [
        'api.index',
        'api.random',
        'api.query',
        'api.dateRange',
        'api.settings',
        'api.filters',
      ],
    }),
  ],
});
