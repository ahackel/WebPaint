(function () {
  // ASSET: src/lib/canvas-to-blob.min.js
  var $3ce38b75d22cba225b19b5e849f02b6b$exports = {};
  var $3ce38b75d22cba225b19b5e849f02b6b$var$define;
  !function (t) {
    var a = t.HTMLCanvasElement && t.HTMLCanvasElement.prototype,
        b = t.Blob && function () {
      try {
        return Boolean(new Blob());
      } catch (t) {
        return !1;
      }
    }(),
        f = b && t.Uint8Array && function () {
      try {
        return 100 === new Blob([new Uint8Array(100)]).size;
      } catch (t) {
        return !1;
      }
    }(),
        B = t.BlobBuilder || t.WebKitBlobBuilder || t.MozBlobBuilder || t.MSBlobBuilder,
        s = /^data:((.*?)(;charset=.*?)?)(;base64)?,/,
        r = (b || B) && t.atob && t.ArrayBuffer && t.Uint8Array && function (t) {
      var e,
          o,
          n,
          a,
          r,
          i,
          l,
          u,
          c = t.match(s);
      if (!c) throw new Error("invalid data URI");

      for (e = c[2] ? c[1] : "text/plain" + (c[3] || ";charset=US-ASCII"), o = !!c[4], n = t.slice(c[0].length), a = (o ? atob : decodeURIComponent)(n), r = new ArrayBuffer(a.length), i = new Uint8Array(r), l = 0; l < a.length; l += 1) {
        i[l] = a.charCodeAt(l);
      }

      return b ? new Blob([f ? i : r], {
        type: e
      }) : ((u = new B()).append(r), u.getBlob(e));
    };

    t.HTMLCanvasElement && !a.toBlob && (a.mozGetAsFile ? a.toBlob = function (t, e, o) {
      var n = this;
      setTimeout(function () {
        o && a.toDataURL && r ? t(r(n.toDataURL(e, o))) : t(n.mozGetAsFile("blob", e));
      });
    } : a.toDataURL && r && (a.msToBlob ? a.toBlob = function (t, e, o) {
      var n = this;
      setTimeout(function () {
        (e && "image/png" !== e || o) && a.toDataURL && r ? t(r(n.toDataURL(e, o))) : t(n.msToBlob(e));
      });
    } : a.toBlob = function (t, e, o) {
      var n = this;
      setTimeout(function () {
        t(r(n.toDataURL(e, o)));
      });
    })), "function" == typeof $3ce38b75d22cba225b19b5e849f02b6b$var$define && $3ce38b75d22cba225b19b5e849f02b6b$var$define.amd ? $3ce38b75d22cba225b19b5e849f02b6b$var$define(function () {
      return r;
    }) : "object" == "object" && $3ce38b75d22cba225b19b5e849f02b6b$exports ? $3ce38b75d22cba225b19b5e849f02b6b$exports = r : t.dataURLtoBlob = r;
  }(window);
})();
