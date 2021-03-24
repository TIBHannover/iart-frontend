import axios from 'axios';

export default axios.create({
  // baseURL: 'http://localhost:8001',
  xsrfHeaderName: 'X-CSRFToken',
  xsrfCookieName: 'csrftoken',
});
