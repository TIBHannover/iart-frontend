import Vue from 'vue';
import router from '../../router';
import axios from '../../plugins/axios';
import config from '../../../app.config';
import { isEqual, lsplit, keyInObj } from '../../plugins/helpers';

function generateRandomStr(length) {
  var result = [];
  var characters = 'abcdef0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result.push(characters.charAt(Math.floor(Math.random() *
      charactersLength)));
  }
  return result.join('');
}
const api = {
  namespaced: true,
  state: {
    random: null,
    query: [],
    dateRange: [],
    fullText: [],
    filters: {},
    bookmarks: false,
    counts: [],
    hits: [],
    settings: {
      weights: {},
      layout: {
        itemSize: 0,
        sortOrder: "asc",
        sortType: "relevance",
        viewGrid: false,
        viewType: "flexible",
      },
      cluster: {},
    },
    prevParams: {},
    backBtn: false,
    jobID: null,
  },
  actions: {
    load({ commit, dispatch, state }) {
      const params = {
        query: state.query,
        random: state.random,
        filters: state.filters,
        settings: state.settings,
        full_text: state.fullText,
        date_range: state.dateRange,
        aggregate: config.DEFAULT_AGGREGATION_FIELDS,
        bookmarks: state.bookmarks,
      };
      if (!isEqual(params, state.prevParams)) {
        commit('updateParams', params);
        commit('loading/update', true, { root: true });
        commit('user/addHistory', params, { root: true });
        if (!state.backBtn) {
          dispatch('getState');
        } else {
          commit('toggleBackBtn');
        }
        axios.post(`${config.API_LOCATION}/search`, { params })
          .then((res) => {
            if (res.data.job_id !== undefined) {
              commit('updateJobID', res.data.job_id);
              setTimeout(() => dispatch('checkLoad'), 500);
            } else {
              // TODO: add cache here
              if (keyInObj('entries', res.data)) {
                commit('updateHits', res.data.entries);
                commit('updateCounts', res.data.aggregations);
              } else {
                const info = { date: Date(), text: '', origin: 'search' };
                commit('error/update', info, { root: true });
              }
              commit('loading/update', false, { root: true });
              window.scrollTo(0, 0);
            }
          })
          .catch((error) => {
            const info = { date: Date(), error, origin: 'search' };
            commit('error/update', info, { root: true });
            commit('loading/update', false, { root: true });
          });;
      }
    },
    checkLoad({ commit, dispatch, state }) {
      const params = { job_id: state.jobID };
      axios.post(`${config.API_LOCATION}/search`, { params })
        .then((res) => {
          if (res.data.job_id !== undefined) {
            commit('updateJobID', res.data.job_id);
            setTimeout(() => dispatch('checkLoad'), 500);
          } else {
            if (keyInObj('entries', res.data)) {
              commit('updateHits', res.data.entries);
              commit('updateCounts', res.data.aggregations);
            } else {
              const info = { date: Date(), error: '', origin: 'search' };
              commit('error/update', info, { root: true });
            }
            commit('loading/update', false, { root: true });
            window.scrollTo(0, 0);
          }
        })
        .catch((error) => {
          const info = { date: Date(), error, origin: 'search' };
          commit('error/update', info, { root: true });
          commit('loading/update', false, { root: true });
        });
    },
    upload({ commit, state }, params) {
      let formData = new FormData();
      if (params.type === 'file') {
        formData.append('file', params.value);
      } else if (params.type === 'url') {
        formData.append('url', params.value);
      }
      commit('loading/update', true, { root: true });
      axios.post(`${config.API_LOCATION}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
        .then((res) => {
          if (res.data.status === 'ok') {
            if (params.append) {
              res.data.entries.forEach(({ id, meta }) => {
                const query = {
                  type: 'idx',
                  positive: true,
                  value: id,
                  weights: {},
                  label: meta.title,
                };
                commit('addQuery', query);
              });
            } else {
              const queries = [];
              res.data.entries.forEach(({ id, meta }) => {
                queries.push({
                  type: 'idx',
                  positive: true,
                  value: id,
                  weights: {},
                  label: meta.title,
                });
              });
              commit('updateQuery', queries);
              commit('removeAllFilters');
            }
          }
        })
        .catch((error) => {
          const info = { date: Date(), error, origin: 'upload' };
          commit('error/update', info, { root: true });
          commit('loading/update', false, { root: true });
        });
    },
    setState({ commit, state }, params) {
      if (!keyInObj('period', params)) {
        commit('updateDateRange', []);
      }
      commit('removeAllQueries');
      commit('removeAllFilters');
      Object.keys(params).forEach((field) => {
        if (field === 'query') {
          try {
            const values = params[field].split(',');
            values.forEach((value) => {
              let positive = true;
              let type = 'txt';
              if (value.includes(':')) {
                [type, value] = lsplit(value, ':', 1);
                if (['+', '-'].includes(type.charAt(0))) {
                  if (type.charAt(0) === '-') {
                    positive = false;
                  }
                  type = type.slice(1);
                }
                if (type === 'idx') {
                  // TODO: retrieve metadata
                }
              }
              commit('addQuery', { type, positive, value, weights: {} });
            });
          } catch (e) {
            console.log('query', e);
          }
        }
        if (field === 'random') {
          commit('updateRandom', params[field]);
        }
        if (field === 'period') {
          try {
            let period = params[field].split('-');
            period = period.map((x) => parseInt(x, 10));
            if (period.length === 1) {
              period.push(period[0]);
            } else if (period.length > 2) {
              period.splice(-1, 9e9);
            }
            if (period[0] >= 1000 && period[1] <= 2000) {
              commit('updateDateRange', period);
            }
          } catch (e) {
            console.log('period', e);
          }
        }
        if (field === 'full.text') {
          const fullText = params[field].split(',');
          commit('updateFullText', fullText);
        }
        if (config.DEFAULT_AGGREGATION_FIELDS.includes(field)) {
          try {
            const names = params[field].split(',');
            names.forEach((name) => {
              let positive = true;
              if (['+', '-'].includes(name.charAt(0))) {
                if (name.charAt(0) === '-') {
                  positive = false;
                }
                name = name.slice(1);
              }
              const filter = { positive, name }
              commit('addFilter', { field, filter });
            });
          } catch (e) {
            console.log('filters', e);
          }
        }
      });
    },
    getState({ state }) {
      const params = new URLSearchParams();
      if (state.query.length) {
        const query = state.query.map((v) => {
          let prefix = '+';
          if (!v.positive) prefix = '-';
          return `${prefix}${v.type}:${v.value}`;
        });
        params.append('query', query.join(','));
      }
      if (state.random) {
        params.append('random', state.random);
      }
      if (state.dateRange.length) {
        const period = state.dateRange.join('-');
        params.append('period', period);
      }
      if (state.fullText.length) {
        const fullText = state.fullText.join(',');
        params.append('full.text', fullText);
      }
      if (Object.keys(state.filters).length) {
        Object.keys(state.filters).forEach((field) => {
          if (state.filters[field].length) {
            const names = state.filters[field].map((n) => {
              let prefix = '+';
              if (!n.positive) prefix = '-';
              return `${prefix}${n.name}`;
            });
            params.append(field, names.join(','));
          }
        });
      }
      if (router.currentRoute.path === '/search') {
        const href = `?${params.toString()}`;
        window.history.pushState({}, null, href);
      } else {
        const query = Object.fromEntries(params);
        router.push({ path: 'search', query });
      }
    },
  },
  mutations: {
    updateJobID(state, jobID) {
      state.jobID = jobID;
    },
    updateHits(state, hits) {
      state.hits = hits;
    },
    updateCounts(state, counts) {
      state.counts = counts;
    },
    updateRandom(state, random) {
      if (typeof random === 'boolean') {
        if (random) {
          state.random = generateRandomStr(16);
          state.query = [];
        } else {
          state.random = null;
        }
      } else if (typeof random === 'string') {
        state.random = random;
      }
    },
    updateSettings(state, settings) {
      state.settings = settings;
    },
    updateDateRange(state, dateRange) {
      state.dateRange = dateRange;
    },
    updateFullText(state, fullText) {
      state.fullText = fullText;
    },
    updateParams(state, params) {
      const clone = JSON.stringify(params);
      state.prevParams = JSON.parse(clone);
    },
    toggleBackBtn(state) {
      state.backBtn = !state.backBtn;
    },
    addQuery(state, query) {
      const index = state.query.indexOf(query);
      if (index === -1) {
        state.query.push(query);
      }
    },
    removeQuery(state, query) {
      const index = state.query.indexOf(query);
      if (index !== -1) {
        state.query.splice(index, 1);
      }
    },
    removeAllQueries(state) {
      if (state.query.length) {
        state.query = [];
      }
    },
    updateQuery(state, query) {
      if (!isEqual(state.query, query)) {
        state.query = query;
      }
    },
    addFilter(state, { field, filter }) {
      if (keyInObj(field, state.filters)) {
        if (!state.filters[field].includes(filter)) {
          state.filters[field].push(filter);
        }
      } else {
        Vue.set(state.filters, field, [filter]);
      }
    },
    removeFilter(state, { field, filter }) {
      if (keyInObj(field, state.filters)) {
        if (value === -1) {
          Vue.delete(state.filters, field);
        } else {
          const values = state.filters[field];
          const index = values.indexOf(filter);
          if (index !== -1) {
            state.filters[field].splice(index, 1);
          }
          if (state.filters[field].length === 0) {
            Vue.delete(state.filters, field);
          }
        }
      }
    },
    removeAllFilters(state) {
      if (Object.keys(state.filters).length) {
        state.filters = {};
      }
      if (state.dateRange.length) {
        state.dateRange = [];
      }
      if (state.fullText.length) {
        state.fullText = [];
      }
      state.bookmarks = false;
    },
    updateFilters(state, filters) {
      if (!isEqual(state.filters, filters)) {
        state.filters = filters;
      }
    },
    updateAll(state, params) {
      if (keyInObj('query', params)) {
        state.query = params.query;
      }
      if (keyInObj('random', params)) {
        state.random = params.random;
      }
      if (keyInObj('filters', params)) {
        state.filters = params.filters;
      }
      if (keyInObj('full_text', params)) {
        state.fullText = params.full_text;
      }
      if (keyInObj('date_range', params)) {
        state.dateRange = params.date_range;
      }
    },
    showBookmarks(state) {
      state.random = null;
      state.query = [];
      state.dateRange = [];
      state.fullText = [];
      state.filters = {};
      state.bookmarks = true;
    },
    addBookmarks(state) {
      state.bookmarks = true;
    },
    removeBookmarks(state) {
      state.bookmarks = false;
    }
  },
};
export default api;