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
        onTokenReady: (token) => {
          log('Pennyauth token ready:', token);
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
    this.token = null;
  }

  reset() {
    if (this.checkboxEl) {
      this.checkboxEl.disabled = false;
      this.checkboxEl.checked = false;
    }
    this.token = null;
  }

  installButton() {
    if (!this.options.el) return;
    const { el } = this.options;

    const containerEl = document.createElement('div');
    containerEl.className = 'pennyauth pennyauth-container pennyauth-style-default';
    el.appendChild(containerEl);

    const insideDivEl = document.createElement('div');
    insideDivEl.className = 'pennyauth pennyauth-inside';
    containerEl.appendChild(insideDivEl);

    const checkboxEl = document.createElement('input');
    checkboxEl.setAttribute('type', 'checkbox');
    checkboxEl.className = 'pennyauth pennyauth-checkbox';
    checkboxEl.addEventListener('change', () => {
      this.messageEl.innerText = 'Validating...';
      this.checkboxEl.disabled = true;
      this.ask(this.onSuccess.bind(this), this.onError.bind(this));
    });
    insideDivEl.appendChild(checkboxEl);

    const messageEl = document.createElement('span');
    messageEl.className = 'pennyauth pennyauth-message';
    messageEl.innerText = '1¢ to Login';
    insideDivEl.appendChild(messageEl);

    const linkEl = document.createElement('a');
    linkEl.appendChild(document.createTextNode('Powered by Pennyauth'));
    linkEl.title = 'Powered by https://pennyauth.com';
    linkEl.href = 'https://pennyauth.com';
    linkEl.target = '_blank';
    linkEl.className = 'pennyauth pennyauth-link';
    containerEl.appendChild(linkEl);

    this.containerEl = containerEl;
    this.checkboxEl = checkboxEl;
    this.messageEl = messageEl;
  }

  onSuccess() {
    this.checkboxEl.checked = true;
    this.checkboxEl.disabled = true;
    this.containerEl.className = 'pennyauth pennyauth-container pennyauth-style-default-approved';
    this.messageEl.innerText = 'Login approved';
    this.options.onTokenReady(this.token);
  }

  onError() {
    this.checkboxEl.checked = false;
    this.checkboxEl.disabled = false;
    this.messageEl.innerText = '1¢ to Login';
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
  }

  ready() {
    log('QUID ready:', this.options.quidBaseURL);
    this.isReady = true;

    // Setup UI container
    this.installButton();
    this.options.onReady();
  }

  ask(onSuccess, onError) {
    if (this.token) {
      onSuccess(this.token);
      return true;
    }

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
              this.token = result.data.data;
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

function init(onReady, onTokenReady) {
  let client;
  // eslint-disable-next-line
  if (PENNYAUTH_TESTING) {
    client = new Client({
      el: document.getElementById('pennyauth-container'),
      apiKey: 'k-9cd44e1a091a7e6b853f860bc65294d4',
      originKey: 'zL7o3CQHtGf5eSPHF2ChFkFFWvQnAKCfmniZmp6NZ6k=',
      apiBaseURL: 'http://localhost:8010/pennywall/us-central1',
      quidBaseURL: 'http://localhost:3000',
      quidAPIKey: 'kt-GXBB4MX58YCM4ABITU8Y7CM35XNLBSKF',
      onReady,
      onTokenReady,
    });
  } else {
    client = new Client({
      apiKey: 'k-482d092d5ac0046bbb0725df4fe2a3ca', // s-7ad865c6c7892f6aa44e3ae7b8eb153d
      originKey: '3CVEyd0GmNJYEJ5/XB0/09T60qmVC6q92RJiC97GbDk=',
      onReady,
      onTokenReady,
    });
  }

  client.install();
  return client;
}

export { Client, init };
