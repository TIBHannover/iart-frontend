import axios from '../../plugins/axios';
import config from '../../../app.config';
import { keyInObj, getHash } from '../../plugins/helpers';


const collection = {
    namespaced: true,
    state: {
        collections: [],
        uploadError: null,
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
                    if (res.data.status === 'ok') {
                        console.log('Done');
                    }
                    else {
                        commit('updateUploadError', res.data.error);
                    }
                })
                .catch((error) => {
                    const info = { date: Date(), text: error };
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
                    const info = { date: Date(), text: error };
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
                    const info = { date: Date(), text: error };
                });
        },
    },
    mutations: {
        updateCollections(state, collections) {
            state.collections = collections;
        },
        updateUploadError(state, errorData) {
            state.uploadError = errorData;
        },
    },
};

export default collection;
