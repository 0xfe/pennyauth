function merge(o, defaults) {
  return Object.assign({}, o, defaults);
}

function log(...args) {
  // eslint-disable-next-line
  console.log(...args);
}

function randomString(len) {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < len; i += 1) text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

export { merge, log, randomString };
