const error = {
  namespaced: true,
  state: {
    date: null,
    text: null,
  },
  mutations: {
    update(state, { date, text }) {
    	console.log('error', date, text);

      state.date = date;
      state.text = text;
    },
  },
};

export default error;
