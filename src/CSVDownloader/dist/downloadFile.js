"use strict"; var detectionClientType = require("./detectionClientType");

module.exports = function (e) {
    var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "export.csv";
    if (!e) return;
    var n = detectionClientType(),
        o = "\ufeff",
        c = "data:attachment/csv;charset=utf-8," + o + encodeURIComponent(e);
    if (window.Blob && window.URL && window.URL.createObjectURL) {
        var a = new Blob([o + e], { type: "text/csv" });
        c = URL.createObjectURL(a)
    }
    if ("IE" === n.name) {
        var d = window.top.open("about:blank", "_blank");
        return d.document.write("sep=,\r\n" + e), d.document.close(), d.document.execCommand("SaveAs", !0, t), void d.close()
    }
    if ("Safari" === n.name) {
        var i = document.createElement("a");
        i.direction = "rtl";
        i.id = "csvDwnLink";
        document.body.appendChild(i);
        var r = o + e, l = "data:attachment/csv;charset=utf-8," + encodeURIComponent(r);
        i.download = t;
        return document.getElementById("csvDwnLink").setAttribute("href", l),
            document.getElementById("csvDwnLink").click(), void document.body.removeChild(i);
    } if ("Firefox" === n.name) {
        var v = document.createElement("a");
        v.download = t;
        v.target = "_blank";
        v.href = c;
        var m = document.createEvent("MouseEvents");
        return m.initEvent("click", !0, !0), void v.dispatchEvent(m)
    }
    var u = document.createElement("a");
    u.download = t;
    u.href = c;
    u.click()
};
