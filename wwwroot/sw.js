self.addEventListener('install', function (e) {
    console.log('%csw install..', '#6495ed');

    e.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function (e) {
    console.log('%csw active', '#228b22');

    e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function (e) {
    const resp = getResponse(e.request);

    e.respondWith(resp);
});


const getOkResult = () => new Response(JSON.stringify({ result: true }), {
    status: 200,
    statusText: 'OK',
    headers: {
        'Content-Type': 'application/json; charset=utf-8'
    }
});

const getUnauthorizedResult = () => new Response(null, {
    status: 401,
    statusText: 'Unauthorized'
});


let accessToken = '';


const getResponse = async request => {
    if (!request.headers.has('X-ServiceWorker-Command')) return fetch(request);

    const command = request.headers.get('X-ServiceWorker-Command');

    if (command === 'authenticate') {
        if (!accessToken) {
            return getUnauthorizedResult();
        }

        const headers = new Headers(request.headers);
        headers.append('Authorization', `Bearer ${accessToken}`);

        const authRequest = new Request(request, { headers });

        return fetch(authRequest);
    } else if (command === 'login') {
        const resp = await fetch(request);
        if (!resp.ok) return resp;

        accessToken = await resp.text();

        return getOkResult();
    } else if (command === 'logout') {
        accessToken = '';

        return getOkResult();
    }
}