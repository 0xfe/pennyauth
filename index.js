import API from './api';
import { merge, log, randomString } from './helpers';

import './pennyauth.css';

// Pennyauth client implementation, which communicates with the
// QUID API servers and the Pennyauth server (github.com/0xfe/pennyauth-server)
class Client {
  constructor(options) {
    this.options = merge(
      {
        el: null,
        apiKey: 'NO_API_KEY',
        originKey: 'NO_ORIGIN_KEY',
        quid: window.quid,
        quidAPIKey: 'kp-DX7BKCK8OP8ZSKOES6JMMDTD41CTNM21',
        quidBaseURL: 'https://app.quid.works',
        onReady: () => {
          log('Pennyauth ready to go.');
        },
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

  installButton() {
    if (!this.options.el) return;
    const { el } = this.options;

    const container = document.createElement('div');
    container.className = 'pennyauth-container';
    el.appendChild(container);
  }

  // Initialize the QUID client libraries.
  install() {
    this.Quid = this.options.quid && this.options.quid.Quid;
    if (!this.Quid) {
      throw new Error("Missing QUID client. Make sure it's included in your HTML document.");
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

    // Install QUID iframe
    this.q.install();

    // Setup UI container
    this.installButton();
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
      productID: 'CAPTCHA-0',
      productURL: window.location.origin,
      productName: 'Access request',
      productDescription: `A penny for access to ${window.location.origin}`,
      requestID: randomString(10),
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
            if (result.data.success) {
              onSuccess(result.data.data);
            } else {
              onError({ code: 'VALIDATION_ERROR', error: result.data });
            }
          })
          .catch((e) => {
            onError({ code: 'API_ERROR', error: e });
          });
      },
    });
  }
}

function initDev(onReady) {
  // eslint-disable-next-line
  const client = new Client({
    el: document.getElementById('pennyauth-container'),
    apiKey: 'k-9cd44e1a091a7e6b853f860bc65294d4',
    originKey: 'zL7o3CQHtGf5eSPHF2ChFkFFWvQnAKCfmniZmp6NZ6k=',
    apiBaseURL: 'http://localhost:8010/pennywall/us-central1',
    quidBaseURL: 'http://localhost:3000',
    quidAPIKey: 'kt-GXBB4MX58YCM4ABITU8Y7CM35XNLBSKF',
    onReady,
  });
  client.install();
  return client;
}

function init(onReady) {
  // eslint-disable-next-line
  const client = new Client({
    apiKey: 'k-8d11e50e2fed4e5e83ecc7c335969cf6', // s-c28cb16b99486e4310fc253a814a435c
    originKey: 'u5q1lZ5mHC9fvtGki0jYP9ROnOizkarxuAsQ2qLEOxw=',
    onReady,
  });

  client.install();
  return client;
}

export { Client, init, initDev };
