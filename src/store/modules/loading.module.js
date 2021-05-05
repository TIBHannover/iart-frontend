const loading = {
  namespaced: true,
  state: {
    status: false,
  },
  mutations: {
    update(state, loading) {
      state.status = loading;
    },
  },
};

export default loading;
