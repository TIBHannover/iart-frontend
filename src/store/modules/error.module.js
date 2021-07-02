const error = {
  namespaced: true,
  state: {
    date: null,
    text: null,
    origin: null,
  },
  mutations: {
    update(state, { date, error, origin }) {
      console.log('error', date, origin);
      state.date = date;
      state.text = error;
      state.origin = origin;
    },
  },
};
export default error;