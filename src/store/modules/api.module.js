import Vue from 'vue';

import axios from '../../plugins/axios';
import config from '../../../app.config';
import { isEqual, lsplit, keyInObj } from '../../plugins/helpers';

const api = {
  namespaced: true,
  state: {
    random: null,
    query: [],

    dateRange: [],
    settings: {},
    filters: {},
    counts: [],
    hits: [],

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
        date_range: state.dateRange,
        aggregate: config.DEFAULT_AGGREGATION_FIELDS,
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

        axios.post(`${config.API_LOCATION}/load`, { params })
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
                commit('error/update', Date(), { root: true });
              }

              commit('loading/update', false, { root: true });
              window.scrollTo(0, 0);
            }
          })
          .catch((error) => {
            commit('error/update', error, { root: true });
            commit('loading/update', false, { root: true });
          });;
      }
    },
    checkLoad({ commit, dispatch, state }) {
      const params = { job_id: state.jobID };

      axios.post(`${config.API_LOCATION}/load`, { params })
        .then((res) => {
          if (res.data.job_id !== undefined) {
            commit('updateJobID', res.data.job_id);
            setTimeout(() => dispatch('checkLoad'), 500);
          } else {
            if (keyInObj('entries', res.data)) {
              commit('updateHits', res.data.entries);
              commit('updateCounts', res.data.aggregations);
            } else {
              commit('error/update', Date(), { root: true });
            }

            commit('loading/update', false, { root: true });
            window.scrollTo(0, 0);
          }
        })
        .catch((error) => {
          commit('error/update', error, { root: true });
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

      axios.post(`${config.API_LOCATION}/upload`, formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        .then((res) => {
          if (res.data.status === 'ok') {
            const query = {
              type: 'idx',
              positive: true,
              value: res.data.entries[0].id,
              weights: state.settings.weights,
              label: res.data.entries[0].meta.title,
            };

            commit('updateQuery', [query]);
          }

          window.scrollTo(0, 0);
        })
        .catch((error) => {
          commit('error/update', error, { root: true });
        })
        .finally(() => {
          commit('loading/update', false, { root: true });
        });
    },
    setState({ commit }, params) {
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

              commit('addQuery', { type, positive, value });
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
            let period = params.period.split('-');
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

        if (config.DEFAULT_AGGREGATION_FIELDS.includes(field)) {
          const values = params[field].split(',');

          values.forEach((value) => {
            commit('addFilter', { field, value });
          });
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

        params.append('query', query);
      }

      if (state.random) {
        params.append('random', state.random);
      }

      if (state.dateRange.length) {
        const period = state.dateRange.join('-');
        params.append('period', period);
      }

      if (Object.keys(state.filters).length) {
        Object.keys(state.filters).forEach((field) => {
          const values = state.filters[field].join(',');
          params.append(field, values);
        });
      }

      const href = `?${params.toString()}`;
      window.history.pushState({}, null, href);
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
          state.random = Math.random();
          state.query = [];
        } else {
          state.random = null;
        }
      } else {
        state.random = parseFloat(random);
      }
    },
    updateSettings(state, settings) {
      state.settings = settings;
    },
    updateDateRange(state, dateRange) {
      state.dateRange = dateRange;
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
    addFilter(state, { field, value }) {
      if (keyInObj(field, state.filters)) {
        if (!state.filters[field].includes(value)) {
          state.filters[field].push(value);
        }
      } else {
        Vue.set(state.filters, field, [value]);
      }
    },
    removeFilter(state, { field, value }) {
      if (keyInObj(field, state.filters)) {
        if (value === -1) {
          Vue.delete(state.filters, field);
        } else {
          const values = state.filters[field];
          const index = values.indexOf(value);

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

      if (keyInObj('date_range', params)) {
        state.dateRange = params.date_range;
      }
    },
  },
};

export default api;