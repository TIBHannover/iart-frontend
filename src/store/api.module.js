import Vue from 'vue';
import axios from '../plugins/axios';
import config from '../../app.config';

function keyInObj(key, obj) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

function isEqual(x, y) {
  return JSON.stringify(x) === JSON.stringify(y);
}

const api = {
  state: {
    index: 'wikidata',
    loading: false,
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
        data: state.index,
        query: state.query,
        random: state.random,
        filters: state.filters,
        date_range: state.dateRange,
        aggregate: config.DEFAULT_AGGREGATION_FIELDS,
      };

      if (!isEqual(params, state.prevParams)) {
        commit('updateParams', params);
        commit('updateLoading', true);

        if (!state.backBtn) {
          dispatch('getState');
        } else {
          commit('toggleBackBtn');
        }

        axios.post(`${config.API_LOCATION}/load`, { params })
          .then((res) => {
            const { results } = res.data;
            // Check if we have to wait for the results
            if (res.data.job_id !== undefined) {
              commit('updateJobID', res.data.job_id);
              setTimeout(() => this.dispatch('check_load'), 500);
            } else {
              //TODO add cache here

              commit('updateHits', results.hits);
              commit('updateCounts', results.aggregations);
              commit('updateLoading', false);
              window.scrollTo(0, 0);
            }
          })
          .catch((error) => {
            console.error(error);
            commit('updateLoading', false);
          });
      }
    },
    check_load({ commit, dispatch, state }) {
      // commit('updateLoading', true);
      console.log('check_load');
      const params = {
        job_id: state.jobID,
      };

      if (!state.backBtn) {
        dispatch('getState');
      } else {
        commit('toggleBackBtn');
      }

      console.log(params);
      axios.post(`${config.API_LOCATION}/load`, { params })
        .then((res) => {
          // const { results } = res.data;
          console.log(res.data);
          console.log(res.data.job_id);
          // Check if we have to wait for the results
          if (res.data.job_id !== undefined) {
            commit('jobID', res.data.job_id);
            setTimeout(() => this.dispatch('check_load'), 500);
          } else {
            commit('updateHits', res.data.entries);
            commit('updateCounts', res.data.aggregations);
            commit('updateLoading', false);
            window.scrollTo(0, 0);
          }
        })
        .catch((error) => {
          console.error(error);
          commit('updateLoading', false);
        });
    },
    insert({ commit }, params) {
      commit('updateLoading', true);

      axios.post(`${config.API_LOCATION}/insert`, { params })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          commit('updateLoading', false);
        });
    },
    suggest({ commit }, params) {
      commit('updateLoading', true);

      axios.post(`${config.API_LOCATION}/suggest`, { params })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          commit('updateLoading', false);
        });
    },
    setState({ commit }, params) {
      const selectedFields = [
        'depicts', 'genre', 'location', 'medium',
        'object_type', 'institution', 'artist_name',
      ];

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
                [type, value] = value.split(':', 2);

                if (['+', '-'].includes(type.charAt(0))) {
                  if (type.charAt(0) === '-') {
                    positive = false;
                  }

                  type = type.slice(1);
                }
              }

              commit('addQuery', { type, positive, value });
            });
          } catch (e) {
            console.log('query', e);
          }
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

        if (selectedFields.includes(field)) {
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
      console.log('updateJobID');
      console.log(jobID);
      state.jobID = jobID;
    },
    updateHits(state, hits) {
      state.hits = hits;
    },
    updateIndex(state, index) {
      state.index = index;
    },
    updateCounts(state, counts) {
      state.counts = counts;
    },
    updateLoading(state, loading) {
      state.loading = loading;
    },
    updateRandom(state, random) {
      if (random) {
        state.random = Math.random();
        state.query = [];
      } else {
        state.random = null;
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

          if (!state.filters[field].length) {
            Vue.delete(state.filters, field);
          }
        }
      }
    },
    removeAllFilters(state) {
      if (Object.keys(state.filters).length) {
        state.dateRange = [];
        state.filters = {};
      }
    },
  },
};

export default api;
