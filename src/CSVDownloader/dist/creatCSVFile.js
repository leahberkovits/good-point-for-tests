"use strict";
var _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ?
    function (n) { return typeof n } :
    function (n) {
        return n && "function" == typeof Symbol && n.constructor === Symbol && n !== Symbol.prototype ?
            "symbol" : typeof n
    };

module.exports = function (n, e) {
    var t = arguments.length > 2 && void
        0 !== arguments[2] ? arguments[2] : ",";
    if (!n || Array.isArray(n) && !n.length || !Object.keys(n).length)
        return "the download datas is null";
    var r = [];

    if ("object" === ("undefined" == typeof n ? "undefined" : _typeof(n)) && Array.isArray(n)) {
        var o = function () {
            var o = Array.isArray(n[0]);
            return n.some(function (n) {
                return Array.isArray(n) !== o
            }) ? { v: "the array element data format is inconsistent" } : void
                (o ? r = r.concat(n.map(function (n) {
                    return n.join(t)
                }))
                    : !function () {
                        var o = []; if (n.forEach(function (n) { return o = o.concat(Object.keys(n)) }), o = o.filter(function (n, e, t) { return t.indexOf(n) === e }), o.length > 0) if (e && "object" === ("undefined" == typeof e ? "undefined" : _typeof(e))) { var f = o.map(function (n) { return e.hasOwnProperty(n) ? e[n] : n }); r.push(f.join(t)) }
                        else r.push(o.join(t)); n.map(function (n) { return o.map(function (e) { return "undefined" != typeof n[e] ? n[e] : "" }) }).forEach(function (n) { r.push(n.join(t)) })
                    }())
        }();
        if ("object" === ("undefined" == typeof o ? "undefined" : _typeof(o))) return o.v
    } else { if ("object" !== ("undefined" == typeof n ? "undefined" : _typeof(n))) return n; for (var f in n) e && e.hasOwnProperty(f) ? r.push(e[f] + "," + n[f]) : r.push(f + "," + n[f]) } return r.join("\r\n")
};