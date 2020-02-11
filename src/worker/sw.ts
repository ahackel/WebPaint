
self.addEventListener("install", (event: any) => {
    event.waitUntil(
        caches.open('v1').then((cache) => {
            return cache.addAll([
                './index.html',
                './painter.css',
                './js/App.js',
                './js/ColorPalette.js',
                './js/CrayonTool.js'
            ]);
        })
    );
});


self.addEventListener('fetch', (event: any) => {
    event.respondWith(caches.match(event.request).then(function(response) {
        // caches.match() always resolves
        // but in case of success response will have value
        if (response !== undefined) {
            return response;
        } else {
            return fetch(event.request).then(function (response) {
                // response may be used only once
                // we need to save clone to put one copy in cache
                // and serve second one
                let responseClone = response.clone();

                caches.open('v1').then(function (cache) {
                    cache.put(event.request, responseClone);
                });
                return response;
            });
        }
    }));
});

