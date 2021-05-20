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
            console.log('upload')
            console.log(params)
            let formData = new FormData();

            formData.append('image', params.image);
            formData.append('meta', params.meta);


            commit('loading/update', true, { root: true });

            axios.post(`${config.API_LOCATION}/collection_upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
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
