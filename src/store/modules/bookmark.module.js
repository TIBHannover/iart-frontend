import axios from '../../plugins/axios';
import config from '../../../app.config';
import { keyInObj, getHash } from '../../plugins/helpers';


const bookmark = {
    namespaced: true,
    state: {
        bookmarks: []
    },
    actions: {
        add({ commit, state, rootState }, params) {
            if (rootState.user.loggedIn) {
                axios.post(`${config.API_LOCATION}/add_bookmark`, { id: params })
                    .then((res) => {
                        if (res.data.status === 'ok') {
                            commit("user/addBookmark", params, { root: true });
                            commit("add", params);
                        }
                    })
                    .catch(() => {
                        // commit('updateUserData', { login: false });
                    });
            }
            else {
                // TODO move everything to this place
                commit("user/addBookmark", params, { root: true });
            }
        },
        remove({ commit, state, rootState }, params) {
            if (rootState.user.loggedIn) {
                axios.post(`${config.API_LOCATION}/remove_bookmark`, { id: params })
                    .then((res) => {
                        if (res.data.status === 'ok') {
                            commit("user/removeBookmark", params, { root: true });
                            commit("remove", params);
                        }
                    })
                    .catch(() => {
                        // commit('updateUserData', { login: false });
                    });
            }
            else {
                // TODO move everything to this place
                commit("user/removeBookmark", params, { root: true });
            }
        },
        list({ commit, state, rootState }, params) {
            if (rootState.user.loggedIn) {
                axios.post(`${config.API_LOCATION}/list_bookmark`, { params })
                    .then((res) => {
                        if (res.data.status === 'ok') {
                            commit("set", res.data.data);
                        }
                    })
                    .catch(() => {
                        // commit('updateUserData', { login: false });
                    });
            }
        },
    },
    mutations: {
        add(state, bookmark) {
            state.bookmarks.push(bookmark);
        },
        remove(state, bookmark) {
            const index = state.bookmarks.indexOf(bookmark);
            if (index > -1) {
                state.bookmarks.splice(index, 1);
            }
        },
        set(state, bookmarks) {
            state.bookmarks = []
            bookmarks.forEach(element => {
                state.bookmarks.push(element.id);
            });
        },
    },
};

export default bookmark;
