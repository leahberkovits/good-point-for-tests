"use strict";
module.exports = function () {
    var e = {},
        r = navigator.userAgent.toLowerCase(),
        a = void 0;
    return (a = r.match(/msie ([\d.]+)/)) ? e.ie = a[1] :
        (a = r.match(/firefox\/([\d.]+)/)) ? e.firefox = a[1] :
            (a = r.match(/chrome\/([\d.]+)/)) ? e.chrome = a[1] :
                (a = r.match(/opera.([\d.]+)/)) ? e.opera = a[1] :
                    (a = r.match(/version\/([\d.]+).*safari/)) ? e.safari = a[1] :
                        0, e.ie ? { name: "IE", version: e.ie } :
            e.firefox ? { name: "Firefox", version: e.firefox } :
                e.chrome ? { name: "Chrome", version: e.chrome } :
                    e.opera ? { name: "Opera", version: e.opera } :
                        e.safari ? { name: "Safari", version: e.safari } : { name: "" }
};