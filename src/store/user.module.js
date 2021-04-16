import axios from '../plugins/axios';
import config from '../../app.config';


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
  state: {
    loading: false,
    drawer: {
      settings: false,
      filter: false,
    },
    userData: {},
    csrfToken: getCookie('csrftoken'),
  },
  actions: {

    getCSRFToken({ commit, state }, params) {
      console.log('Request Token')
      // TODO
      axios.get(`${config.API_LOCATION}/get_csrf_token`, { params: params, withCredentials: true })
        .then((res) => {
          const csrftoken = getCookie('csrftoken');
          if (state.csrfToken !== csrftoken) {
            commit('updateCSRFToken', csrftoken);
          }


        })
        .catch(() => {
          commit('updateUserData', { login: false });
        })
        .finally(() => {
          commit('updateLoading', false);
        });
    },
    login({ commit }, params) {
      commit('updateLoading', true);

      axios.post(`${config.API_LOCATION}/login`, { params })
        .then((res) => {
          if (res.data.status === "ok") {
            commit('updateUserData', { ...res.data.data, login: true });
          }

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

      axios.post(`${config.API_LOCATION}/logout`, { params })
        .then((res) => {

          if (res.data.status === "ok") {
            commit('updateUserData', { login: false });
          }


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

      axios.post(`${config.API_LOCATION}/register`, { params })
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
    updateCSRFToken(state, token) {
      state.csrfToken = token;
    },
    toggleDrawer(state, drawer) {
      state.drawer[drawer] = !state.drawer[drawer];
    },
  },
};

export default user;
