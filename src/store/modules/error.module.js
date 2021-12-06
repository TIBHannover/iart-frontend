const error = {
  namespaced: true,
  state: {
    date: null,
    text: null,
    origin: null,
  },
  mutations: {
    update(state, { date, text, origin }) {
      console.log(text);

      state.date = date;
      state.text = text;
      state.origin = origin;
    },
  },
};
export default error;
