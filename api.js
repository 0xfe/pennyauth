import axios from 'axios';

const BASEURL_PROD = 'https://us-central1-pennyauth.cloudfunctions.net';

class API {
  constructor(options) {
    this.options = Object.assign(
      {},
      {
        baseURL: BASEURL_PROD,
      },
      options,
    );

    this.axios = axios.create({
      baseURL: this.options.baseURL,
      timeout: 20000,
      withCredentials: true, // required for CORS requests
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
  }

  validateCaptcha(params) {
    return this.axios
      .post('/validateCaptcha', params)
      .then(response => response)
      .catch(e => e.response);
  }
}

export default API;
