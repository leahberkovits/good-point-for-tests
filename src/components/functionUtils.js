const utils = {
    getWidth() {
        return Math.max(
            document.body.scrollWidth,
            document.documentElement.scrollWidth,
            document.body.offsetWidth,
            document.documentElement.offsetWidth,
            document.documentElement.clientWidth
        );
    },
    getHeight() {
        return Math.max(
            document.body.scrollHeight,
            document.documentElement.scrollHeight,
            document.body.offsetHeight,
            document.documentElement.offsetHeight,
            document.documentElement.clientHeight
        );
    },
    viewportToPixels(value) {
        var parts = value.match(/([0-9\.]+)(vh|vw)/)
        var q = Number(parts[1])
        var side = window[['innerHeight', 'innerWidth'][['vh', 'vw'].indexOf(parts[2])]]
        return side * (q / 100)
    },
    vwTOpx(value) {
        let t = document.documentElement.style.getPropertyValue('--vw');
        // if (t) {
        //     t = parseFloat(t.split('px')[0]);
        //     alert(t);
        //     return t * value;
        // }
        var w = window,
            d = document,
            e = d.documentElement,
            g = d.getElementsByTagName('body')[0],
            x = w.innerWidth || e.clientWidth || g.clientWidth,
            y = w.innerHeight || e.clientHeight || g.clientHeight;


        // return t || ((x * value) / 100);

        var result = (x * value) / 100;
        return result;
    },
    vhTOpx(value) {
        var w = window,
            d = document,
            e = d.documentElement,
            g = d.getElementsByTagName('body')[0],
            x = w.innerWidth || e.clientWidth || g.clientWidth,
            y = w.innerHeight || e.clientHeight || g.clientHeight;

        var result = (y * value) / 100;
        return result;
    },

    getURLParam(location, paramName) {
        if (!location || !location.search) return null;
        let v = null;
        try { v = new URLSearchParams(location.search).get(paramName); } catch (e) { };
        return v;
    }
}

export default utils;