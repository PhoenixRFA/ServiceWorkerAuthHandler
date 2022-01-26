const state = {};

window.$state = state;

function login() {
    const inp = document.getElementById('username');
    const loginSection = document.querySelector('.login-section');
    const login = document.getElementById('login');
    const logout = document.getElementById('logout');
    const auth = document.getElementById('auth');

    const username = inp.value;

    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
            'X-ServiceWorker-Command': 'login'
        },
        body: JSON.stringify({ username })
    })
        .then(resp => resp.json())
        .then(res => {
            if (res.result) {
                inp.disabled = true;
                loginSection.innerHTML = '<p style="font-size: 24px; color: green;">Logged in</p>';

                login.disabled = true;
                logout.disabled = false;
                auth.disabled = false;

                state.isLoggedIn = true;
                console.log('%clogin success!', 'green');
            } else {
                console.error(res);
                _showError('login error');
            }
        })
        .catch(err => {
            console.error(err);
            _showError('login error');
        });
}

function logout() {
    const inp = document.getElementById('username');
    const loginSection = document.querySelector('.login-section');
    const login = document.getElementById('login');
    const logout = document.getElementById('logout');
    const auth = document.getElementById('auth');

    fetch('/logout', {
        method: 'POST',
        headers: {
            'X-ServiceWorker-Command': 'logout'
        }
    })
        .then(() => {
            inp.value = '';
            inp.disabled = false;
            loginSection.innerHTML = '<p style="font-size: 24px; color: orange;">Logged out</p>';

            login.disabled = false;
            logout.disabled = true;
            auth.disabled = true;

            state.isLoggedIn = false;
            console.log('%clogout', 'orange');
        })
        .catch(err => {
            console.error(err);
            _showError('logout error');
        });
}

function authenticate() {
    const userInfo = document.getElementById('user-info');

    fetch('/me', {
        method: 'GET',
        headers: {
            'X-ServiceWorker-Command': 'authenticate'
        }
    })
        .then(resp => resp.ok ? resp.json() : new Error(resp.status))
        .then(res => {
            if (res instanceof Error) {
                _showError(res);
                return;
            }

            let html = '';
            for (let claim of res) {
                html += `<div>${claim.type}: ${claim.value}</div>`;
            }

            userInfo.innerHTML = `<p style="font-size: 24px;">${html}</p>`;
            console.log(res)
        })
        .catch(err => _showError(err));
}

function _showError(err) {
    `<div class="error-msg">
        <a class="close" href="#">x</a>
        <p class="error-msg-header">Error header</p>
        <p class="error-msg-text">Errot text</p>
    </div>`
    const msg = document.createElement('div');
    msg.className = 'error-msg';

    const close = document.createElement('a');
    close.href = '#';
    close.className = 'close';
    close.innerText = 'x';

    msg.appendChild(close);

    const header = document.createElement('div');
    header.className = 'error-msg-header';
    header.innerText = 'Error';

    msg.appendChild(header);

    const body = document.createElement('div');
    body.className = 'error-msg-text';
    body.innerText = err;

    msg.appendChild(body);

    document.body.appendChild(msg);
}

document.addEventListener('click', function (e) {
    if (e.target.matches('.error-msg .close')) {
        e.preventDefault();
        e.target.closest('.error-msg').remove();
    }
});

document.getElementById('login').onclick = function (e) {
    const input = document.getElementById('username');
    if (!input.value) {
        input.focus();
        _showError('enter login');
        return;
    }

    login();
};

document.getElementById('logout').onclick = function (e) {
    if (!state.isLoggedIn) return;

    logout();
};

document.getElementById('auth').onclick = function (e) {
    authenticate();
};


if (navigator && 'serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
        .then(res => {
            console.log('%csw registered %o', '#228b22', res);
        })
        .catch(err => {
            console.error(err);
        });

    navigator.serviceWorker.addEventListener('message', msg => {
        const action = msg.data.action;
        const port = msg.ports[0];

        if (action === 'getAuthToken') {
            console.debug('Token request from sw');

            if (state.isLoggedIn) {
                port.postMessage({
                    bearer: state.bearer
                });
            } else {
                port.postMessage({
                    error: 'Not authenticated'
                });
            }
        } else {
            console.error('Unknown action: %s', action);
            port.postMessage({
                error: `Unknown action: ${aciton}`
            });
        }
    });
}