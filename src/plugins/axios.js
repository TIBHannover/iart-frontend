import axios from 'axios';

export default axios.create({
  xsrfHeaderName: 'X-CSRFToken',
  xsrfCookieName: 'csrftoken',
});
