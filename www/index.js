// eslint-disable-next-line
function run() {
  const loginButton = document.getElementById('loginButton');
  const formEl = document.getElementById('login-form');
  const successEl = document.getElementById('success-message');

  // eslint-disable-next-line
  const client = pennyauth.initDev(
    () => {},
    () => {
      loginButton.disabled = false;
    },
  );

  function login(ev) {
    loginButton.disabled = true;
    ev.preventDefault();
    client.ask(
      (resp) => {
        console.log(resp);
        formEl.style.display = 'none';
        successEl.style.display = 'block';
        loginButton.disabled = false;
      },
      (e) => {
        console.error(e);
        loginButton.disabled = false;
      },
    );
    return false;
  }

  formEl.addEventListener('submit', login);
}
