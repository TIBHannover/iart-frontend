import axios from '../../plugins/axios';
import config from '../../../app.config';
const collection = {
  namespaced: true,
  state: {
    collections: [],
    upload: {
      status: null,
      error: {},
    },
  },
  actions: {
    upload({ commit, state }, params) {
      let formData = new FormData();
      formData.append('image', params.image);
      formData.append('meta', params.meta);
      formData.append('name', params.name);
      commit('loading/update', true, { root: true });
      axios.post(`${config.API_LOCATION}/collection_upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: progressEvent => {
            console.log(progressEvent.loaded);
            console.log(progressEvent.total)
          }
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
    list({ commit, state }, params) {
      axios.get(`${config.API_LOCATION}/collection_list`)
        .then((res) => {
          if (res.data.status === 'ok') {
            commit('updateCollections', res.data.collections);
          }
        })
        .catch((error) => {
          const info = { date: Date(), error, origin: 'collection' };
        });
    },
    delete({ commit, state }, params) {
      axios.post(`${config.API_LOCATION}/collection_delete`, { params })
        .then((res) => {
          if (res.data.status === 'ok') {
            console.log('Done');
          }
        })
        .catch((error) => {
          const info = { date: Date(), error, origin: 'collection' };
        });
    },
  },
  mutations: {
    updateCollections(state, collections) {
      state.collections = collections;
    },
    updateUpload(state, upload) {
      state.upload = { ...upload };
    },
  },
};
export default collection;