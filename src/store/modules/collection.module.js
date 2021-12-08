import axios from '@/plugins/axios';
import config from '@/../app.config';

const collection = {
  namespaced: true,
  state: {
    collections: [],
    upload: {
      status: null,
      error: {},
    },
    modal: {
      list: false,
    },
  },
  actions: {
    upload({ commit }, params) {
      const formData = new FormData();
      formData.append('image', params.image);
      formData.append('meta', params.meta);
      formData.append('name', params.name);
      commit('loading/update', true, { root: true });
      axios.post(`${config.API_LOCATION}/collection_upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
        .then((res) => {
          commit('updateUpload', res.data);
        })
        .catch((error) => {
          const info = { date: Date(), error, origin: 'collection' };
          commit('error/update', info, { root: true });
        })
        .finally(() => {
          commit('loading/update', false, { root: true });
        });
    },
    list({ commit }) {
      axios.get(`${config.API_LOCATION}/collection_list`)
        .then((res) => {
          commit('updateCollections', res.data.collections);
        })
        .catch((error) => {
          const info = { date: Date(), error, origin: 'collection' };
          commit('error/update', info, { root: true });
        });
    },
    delete({ commit, dispatch }, params) {
      axios.post(`${config.API_LOCATION}/collection_delete`, { params })
        .then(() => {
          dispatch('list');
        })
        .catch((error) => {
          const info = { date: Date(), error, origin: 'collection' };
          commit('error/update', info, { root: true });
        });
    },
  },
  mutations: {
    updateCollections(state, collections) {
      state.collections = collections;
    },
    updateUpload(state, upload) {
      state.upload = upload;
    },
    updateModal(state, { modal, value }) {
      state.modal[modal] = value;
    },
  },
};
export default collection;
