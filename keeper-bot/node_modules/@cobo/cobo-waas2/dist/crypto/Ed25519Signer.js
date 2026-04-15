"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _tweetnacl = require("tweetnacl");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var Ed25519Signer = exports["default"] = /*#__PURE__*/function () {
  function Ed25519Signer(privateKey) {
    _classCallCheck(this, Ed25519Signer);
    this.privateKey = privateKey;
  }
  return _createClass(Ed25519Signer, [{
    key: "sign",
    value: function sign(message_hash) {
      var pk = this.getPublicKey(this.privateKey);
      var skBytes = new Uint8Array(Buffer.from(this.privateKey + pk, 'hex'));
      var messageBytes = new Uint8Array(Buffer.from(message_hash, 'hex'));
      var signature = _tweetnacl.sign.detached(messageBytes, skBytes);
      return Buffer.from(signature).toString('hex');
    }
  }, {
    key: "getPublicKey",
    value: function getPublicKey() {
      var skBytes = new Uint8Array(Buffer.from(this.privateKey, 'hex'));
      var pk = _tweetnacl.sign.keyPair.fromSeed(skBytes).publicKey;
      return Buffer.from(pk).toString('hex');
    }
  }]);
}();