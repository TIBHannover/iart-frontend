const loading = {
  namespaced: true,
  state: {
    status: false,
  },
  mutations: {
    update(state, status) {
      state.status = status;
    },
  },
};
export default loading;
