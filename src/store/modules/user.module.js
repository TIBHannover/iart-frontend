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
      settings: false,
      history: false,
      filter: false,
    },
    history: [],
    userData: {},
    csrfToken: getCookie('csrftoken'),
  },
  actions: {
    getCSRFToken({ commit, state }, params) {
      console.log('Request Token');

      // TODO
      axios.get(`${config.API_LOCATION}/get_csrf_token`, { params, withCredentials: true })
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
    addHistory(state, params) {
      params = JSON.parse(JSON.stringify(params));
      delete params['settings'];

      const hash = require('crypto').createHash('md5')
        .update(JSON.stringify(params)).digest('hex');

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
