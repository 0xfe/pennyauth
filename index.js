import API from './api';

function merge(o, defaults) {
  return Object.assign({}, o, defaults);
}

function log(...args) {
  // eslint-disable-next-line
  console.log(...args);
}

class Client {
  constructor(options) {
    this.options = merge(
      {
        el: document.body,
        apiKey: 'NO_API_KEY',
        originKey: 'NO_ORIGIN_KEY',
        quid: window.quid,
        quidAPIKey: 'kt-F6EJC9K19TUJYL6ML7RA6G03VLNGUQ3Q',
        quidBaseURL: 'https://app.quid.works',
        onReady: () => {},
      },
      options,
    );

    this.isReady = false;
    const apiParams = {};
    if (this.options.apiBaseURL) {
      apiParams.baseURL = this.options.apiBaseURL;
    }
    this.api = new API(apiParams);
  }

  install() {
    this.Quid = this.options.quid && this.options.quid.Quid;
    if (!this.Quid) {
      throw new Error('Missing QUID client');
    }

    // Setup QUID
    this.q = new this.Quid({
      apiKey: this.options.quidAPIKey,
      apiProxyMAC: this.options.originKey,
      baseURL: this.options.quidBaseURL,
      onLoad: () => {
        this.ready();
      },
    });
    this.q.install();
  }

  ready() {
    log('QUID ready:', this.options.quidBaseURL);
    this.isReady = true;
    this.options.onReady();
  }

  ask(onSuccess, onError) {
    return this.q.requestPayment({
      apiKey: this.options.quidAPIKey,
      apiProxyMAC: this.options.originKey,
      productID: 'captcha0',
      productURL: 'this.URL',
      productName: 'Captcha request',
      productDescription: 'This site only lets in humans',
      requestID: 'ABCD',
      price: 0.01,
      currency: 'CAD',
      errorCallback: (code) => {
        onError({ code });
      },
      successCallback: (resp) => {
        this.api
          .validateCaptcha({
            apiKey: this.options.apiKey,
            receipt: resp,
          })
          .then((result) => {
            onSuccess(result.data);
          })
          .catch((e) => {
            onError({ code: 'APIERROR', error: e });
          });
      },
    });
  }
}

function init(onReady) {
  // eslint-disable-next-line
  const client = new Client({
    apiKey: 'k-405a1100164f6f800d4f04314feb7909',
    originKey: 'zL7o3CQHtGf5eSPHF2ChFkFFWvQnAKCfmniZmp6NZ6k=',
    // apiBaseURL: 'http://localhost:8010/pennywall/us-central1',
    quidBaseURL: 'http://localhost:3000',
    quidAPIKey: 'kt-GXBB4MX58YCM4ABITU8Y7CM35XNLBSKF',
    onReady,
  });
  client.install();
  return client;
}

export { Client, init };
