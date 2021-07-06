import axios from '../../plugins/axios';
import config from '../../../app.config';
import { keyInObj } from '../../plugins/helpers';

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      // Does this cookie string begin with the name we want?
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}
const user = {
  namespaced: true,
  state: {
    drawer: {
      settings: true,
      filter: false,
    },
    modal: {
      weights: false,
      layout: false,
      cluster: false,
    },
    userData: {},
    loggedIn: false,
    csrfToken: getCookie('csrftoken'),
  },
  actions: {
    getCSRFToken({ commit, state }, params) {
      axios.get(`${config.API_LOCATION}/get_csrf_token`, {
          params, withCredentials: true
        })
        .then((res) => {
          const csrftoken = getCookie('csrftoken');
          if (state.csrfToken !== csrftoken) {
            commit('updateCSRFToken', csrftoken);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },
    getUserData({ commit, state }, params) {
      axios.post(`${config.API_LOCATION}/get_user`, { params })
        .then((res) => {
          if (res.data.status === 'ok') {
            commit('updateUserData', res.data.data);
            commit('updateLoggedIn', true);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },
    login({ commit }, params) {
      commit('loading/update', true, { root: true });
      axios.post(`${config.API_LOCATION}/login`, { params })
        .then((res) => {
          if (res.data.status === 'ok') {
            commit('updateUserData', res.data.data);
            commit('updateLoggedIn', true);
          }
        })
        .catch((error) => {
          const info = { date: Date(), error, origin: 'login' };
          commit('error/update', info, { root: true });
        })
        .finally(() => {
          commit('loading/update', false, { root: true });
        });
    },
    logout({ commit, state }) {
      commit('loading/update', true, { root: true });
      const params = state.userData;
      axios.post(`${config.API_LOCATION}/logout`, { params })
        .then((res) => {
          if (res.data.status === 'ok') {
            commit('updateUserData', {});
            commit('updateLoggedIn', false);
          }
        })
        .catch((error) => {
          const info = { date: Date(), error, origin: 'logout' };
          commit('error/update', info, { root: true });
        })
        .finally(() => {
          commit('loading/update', false, { root: true });
        });
    },
    register({ commit, dispatch }, params) {
      commit('loading/update', true, { root: true });
      axios.post(`${config.API_LOCATION}/register`, { params })
        .then((res) => {
          commit('updateUserData', res.data);
          dispatch('login', params);
        })
        .catch((error) => {
          const info = { date: Date(), error, origin: 'register' };
          commit('error/update', info, { root: true });
        });
    },
  },
  mutations: {
    updateLoggedIn(state, loggedIn) {
      state.loggedIn = loggedIn;
    },
    updateUserData(state, userData) {
      state.userData = userData;
    },
    updateCSRFToken(state, token) {
      state.csrfToken = token;
    },
    toggleDrawer(state, drawer) {
      state.drawer[drawer] = !state.drawer[drawer];
    },
    updateDrawer(state, { drawer, value }) {
      state.drawer[drawer] = value;
    },
    updateAllDrawers(state, value) {
      Object.keys(state.drawer).forEach((drawer) => {
        state.drawer[drawer] = value;
      });
    },
    toggleModal(state, modal) {
      state.modal[modal] = !state.modal[modal];
    },
    updateModal(state, { modal, value }) {
      state.modal[modal] = value;
    },
    updateAllModals(state, value) {
      Object.keys(state.modal).forEach((modal) => {
        state.modal[modal] = value;
      });
    },
  },
};
export default user;