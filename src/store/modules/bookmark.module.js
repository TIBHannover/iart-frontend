import mixins from '@/mixins';
import axios from '@/plugins/axios';
import config from '@/../app.config';

const bookmark = {
  namespaced: true,
  state: {
    history: [],
    bookmarks: [],
    toggle: false,
  },
  actions: {
    add({ commit, rootState }, params) {
      if (rootState.user.loggedIn) {
        axios.post(`${config.API_LOCATION}/add_bookmark`, { id: params })
          .then((res) => {
            if (res.data.status === 'ok') {
              commit('add', params);
            }
          })
          .catch((error) => {
            console.log(error);
          });
      } else {
        commit('add', params);
      }
    },
    remove({ commit, rootState }, params) {
      if (rootState.user.loggedIn) {
        axios.post(`${config.API_LOCATION}/remove_bookmark`, { id: params })
          .then((res) => {
            if (res.data.status === 'ok') {
              commit('remove', params);
            }
          })
          .catch((error) => {
            console.log(error);
          });
      } else {
        commit('remove', params);
      }
    },
    list({ commit, rootState }, params) {
      if (rootState.user.loggedIn) {
        axios.post(`${config.API_LOCATION}/list_bookmark`, { params })
          .then((res) => {
            if (res.data.status === 'ok') {
              commit('set', res.data.data);
            }
          })
          .catch((error) => {
            console.log(error);
          });
      }
    },
  },
  mutations: {
    update(state, value) {
      state.toggle = value;
    },
    add(state, values) {
      let index = state.bookmarks.indexOf(values);
      if (index === -1) {
        state.bookmarks.push(values);
      }
      index = state.history[0].bookmarks.indexOf(values);
      if (index === -1) {
        state.history[0].bookmarks.push(values);
      }
    },
    remove(state, values) {
      let index = state.bookmarks.indexOf(values);
      if (index !== -1) {
        state.bookmarks.splice(index, 1);
      }
      index = state.history[0].bookmarks.indexOf(values);
      if (index !== -1) {
        state.history[0].bookmarks.splice(index, 1);
      }
    },
    addHistory(state, params) {
      params = JSON.parse(JSON.stringify(params));
      const validKeys = [
        'query', 'random', 'filters',
        'full_text', 'date_range',
      ];
      Object.keys(params).forEach((key) => {
        if (!validKeys.includes(key)) {
          delete params[key];
        }
      });
      const hash = mixins.methods.getHash(params);
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
  },
};
export default bookmark;
