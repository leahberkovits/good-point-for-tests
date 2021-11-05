const CACHE_NAME = "gp";

const STATIC_DATA = [
    '/images/transparentIcon.png',
    '/images/logo.jpg',
    '/images/backIcon.png',
    '/images/loginImg.png',
    '/images/loading2.gif',
    '/images/homeIcon.png',
    '/images/sentImg.png',
    // '/images/smspage.png',
    '/images/x-icon.svg',
    '/images/check-icon.svg',
    '/images/shareIcon.png',
    "/images/heart.png",
    "/images/shadowHrCheatsheet.png",
    "/images/userIcon.png",
    "/images/plusButton.png",
    '/images/send_icon.png',
    "/images/navbarImg.png"
];

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(STATIC_DATA);
            })
            .then(() => {
                self.skipWaiting()
            })
            .catch(() => { self.skipWaiting() })
    );
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(name => {
                        if (name !== CACHE_NAME) {
                            return caches.delete(name);
                        }
                    })
                )
            })
    );

});

function fetchAndSave(request) {
    return fetch(request)
        .then(res => {
            const resClone = res.clone();
            caches.open(CACHE_NAME)
                .then(cache => cache.put(request.url, resClone));
            return res;
        });
}
self.addEventListener('fetch', e => {
    if (e.request.method !== "GET" || e.request.url.indexOf("http") !== 0) {
        return;
    }

    const inStaticData = STATIC_DATA.some(data => e.request.url.includes(data)) || /^((https?|ftp):)?\/\/.*(jpeg|jpg|png|gif|mp3|mp4|webm)$/i.test(e.request.url);

    if (inStaticData) {
        e.respondWith(
            caches.match(e.request.url)
                .then(res => res ? res : fetchAndSave(e.request))
        );
        // console.log("static", e.request.url)
    } else {
        e.respondWith(
            fetchAndSave(e.request)
                .catch(err => caches.match(e.request.url))
        );
        // console.log("not static", e.request.url)
    }
});