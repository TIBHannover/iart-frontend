const error = {
  namespaced: true,
  state: {
    status: null,
  },
  mutations: {
    update(state, text) {
    	console.log('error', text);
      state.status = text;
    },
  },
};

export default error;
