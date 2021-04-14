import axios from '../plugins/axios';

const user = {
  state: {
    loading: false,
    drawer: {
      settings: false,
      filter: false,
    },
    userData: {},
  },
  actions: {
    login({ commit }, params) {
      commit('updateLoading', true);

      axios.post('/api/login', { params })
        .then((res) => {
          commit('updateUserData', res.data);
        })
        .catch(() => {
          commit('updateUserData', { login: false });
        })
        .finally(() => {
          commit('updateLoading', false);
        });
    },
    logout({ commit, state }) {
      commit('updateLoading', true);
      const params = state.userData;

      axios.post('/api/logout', { params })
        .then((res) => {
          commit('updateUserData', res.data);
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          commit('updateLoading', false);
        });
    },
    register({ commit }, params) {
      commit('updateLoading', true);

      axios.post('/api/register', { params })
        .then((res) => {
          commit('updateUserData', res.data);
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          commit('updateLoading', false);
        });
    },
  },
  mutations: {
    updateLoading(state, loading) {
      state.loading = loading;
    },
    updateUserData(state, userData) {
      state.userData = userData;
    },
    toggleDrawer(state, drawer) {
      state.drawer[drawer] = !state.drawer[drawer];
    },
  },
};

export default user;
