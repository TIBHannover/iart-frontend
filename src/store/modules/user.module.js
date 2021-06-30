import axios from '../../plugins/axios';
import config from '../../../app.config';
import { keyInObj, getHash } from '../../plugins/helpers';

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
    history: [],
    userData: {},
    csrfToken: getCookie('csrftoken'),
  },
  actions: {
    addBookmark({ commit, state }, params) {
      if (Object.keys(state.userData).length) {
        console.log(JSON.stringify(state.history));
        axios.post(`${config.API_LOCATION}/add_bookmark`, { id: params })
          .then((res) => {
            if (res.data.status === 'ok') {
              commit("addBookmark", params);
            }
          })
          .catch(() => {
            // commit('updateUserData', { login: false });
          });
      }
      else {
        commit("addBookmark", params);
      }
    },
    removeBookmark({ commit, state }, params) {
      if (Object.keys(state.userData).length) {
        axios.post(`${config.API_LOCATION}/remove_bookmark`, { params })
          .then((res) => {
            if (res.data.status === 'ok') {
              commit("removeBookmark", params);
            }
          })
          .catch(() => {
            // commit('updateUserData', { login: false });
          });
      }
      else {
        commit("removeBookmark", params);
      }
    },
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
        .catch(() => {
          commit('updateUserData', { login: false });
        });
    },
    getUserData({ commit, state }, params) {
      console.log('GET_USER');
      axios.post(`${config.API_LOCATION}/get_user`, { params })
        .then((res) => {
          if (res.data.status === 'ok') {
            commit('updateUserData', { ...res.data.data, login: true });
          }
        })
        .catch(() => {
          commit('updateUserData', { login: false });
        });
    },
    login({ commit }, params) {
      commit('loading/update', true, { root: true });

      axios.post(`${config.API_LOCATION}/login`, { params })
        .then((res) => {
          if (res.data.status === 'ok') {
            commit('updateUserData', { ...res.data.data, login: true });
          }
        })
        .catch(() => {
          commit('updateUserData', { login: false });
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
            commit('updateUserData', { login: false });
          }
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          commit('loading/update', false, { root: true });
        });
    },
    register({ commit }, params) {
      commit('loading/update', true, { root: true });

      axios.post(`${config.API_LOCATION}/register`, { params })
        .then((res) => {
          commit('updateUserData', res.data);
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          commit('loading/update', false, { root: true });
        });
    },
  },
  mutations: {
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
    addHistory(state, params) {
      params = JSON.parse(JSON.stringify(params));
      delete params['settings'];

      const hash = getHash(params);
      const hashes = state.history.map((x) => x.hash);
      const index = hashes.indexOf(hash);

      if (index !== -1) {
        params.bookmarks = state.history[index].bookmarks;
        state.history.splice(index, 1);
      } else {
        params.bookmarks = [];
      }

      state.history.unshift({ date: Date(), ...params, hash });
    },
    removeHistory(state, params) {
      const index = state.history.indexOf(params);

      if (index !== -1) {
        state.history.splice(index, 1);
      }
    },
    removeAllHistory(state) {
      state.history = [];
    },
    addBookmark(state, bookmark) {
      const index = state.history[0].bookmarks.indexOf(bookmark);

      if (index === -1) {
        state.history[0].bookmarks.push(bookmark);
      }
    },
    removeBookmark(state, bookmark) {
      const index = state.history[0].bookmarks.indexOf(bookmark);

      if (index !== -1) {
        state.history[0].bookmarks.splice(index, 1);
      }
    },
  },
};

export default user;
