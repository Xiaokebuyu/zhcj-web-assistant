var Ot = Object.defineProperty;
var Bt = (n, e, t) => e in n ? Ot(n, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : n[e] = t;
var P = (n, e, t) => Bt(n, typeof e != "symbol" ? e + "" : e, t);
var ce, y, st, D, Ie, it, rt, ot, Ne, ye, ge, K = {}, ct = [], Lt = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i, ae = Array.isArray;
function O(n, e) {
  for (var t in e) n[t] = e[t];
  return n;
}
function Ce(n) {
  n && n.parentNode && n.parentNode.removeChild(n);
}
function at(n, e, t) {
  var s, i, r, o = {};
  for (r in e) r == "key" ? s = e[r] : r == "ref" ? i = e[r] : o[r] = e[r];
  if (arguments.length > 2 && (o.children = arguments.length > 3 ? ce.call(arguments, 2) : t), typeof n == "function" && n.defaultProps != null) for (r in n.defaultProps) o[r] === void 0 && (o[r] = n.defaultProps[r]);
  return G(n, o, s, i, null);
}
function G(n, e, t, s, i) {
  var r = { type: n, props: e, key: t, ref: s, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: i ?? ++st, __i: -1, __u: 0 };
  return i == null && y.vnode != null && y.vnode(r), r;
}
function he(n) {
  return n.children;
}
function Z(n, e) {
  this.props = n, this.context = e;
}
function q(n, e) {
  if (e == null) return n.__ ? q(n.__, n.__i + 1) : null;
  for (var t; e < n.__k.length; e++) if ((t = n.__k[e]) != null && t.__e != null) return t.__e;
  return typeof n.type == "function" ? q(n) : null;
}
function ht(n) {
  var e, t;
  if ((n = n.__) != null && n.__c != null) {
    for (n.__e = n.__c.base = null, e = 0; e < n.__k.length; e++) if ((t = n.__k[e]) != null && t.__e != null) {
      n.__e = n.__c.base = t.__e;
      break;
    }
    return ht(n);
  }
}
function Me(n) {
  (!n.__d && (n.__d = !0) && D.push(n) && !re.__r++ || Ie != y.debounceRendering) && ((Ie = y.debounceRendering) || it)(re);
}
function re() {
  for (var n, e, t, s, i, r, o, a = 1; D.length; ) D.length > a && D.sort(rt), n = D.shift(), a = D.length, n.__d && (t = void 0, i = (s = (e = n).__v).__e, r = [], o = [], e.__P && ((t = O({}, s)).__v = s.__v + 1, y.vnode && y.vnode(t), Re(e.__P, t, s, e.__n, e.__P.namespaceURI, 32 & s.__u ? [i] : null, r, i ?? q(s), !!(32 & s.__u), o), t.__v = s.__v, t.__.__k[t.__i] = t, ft(r, t, o), t.__e != i && ht(t)));
  re.__r = 0;
}
function lt(n, e, t, s, i, r, o, a, h, l, u) {
  var c, p, f, d, S, E, g = s && s.__k || ct, v = e.length;
  for (h = Pt(t, e, g, h, v), c = 0; c < v; c++) (f = t.__k[c]) != null && (p = f.__i == -1 ? K : g[f.__i] || K, f.__i = c, E = Re(n, f, p, i, r, o, a, h, l, u), d = f.__e, f.ref && p.ref != f.ref && (p.ref && Oe(p.ref, null, f), u.push(f.ref, f.__c || d, f)), S == null && d != null && (S = d), 4 & f.__u || p.__k === f.__k ? h = ut(f, h, n) : typeof f.type == "function" && E !== void 0 ? h = E : d && (h = d.nextSibling), f.__u &= -7);
  return t.__e = S, h;
}
function Pt(n, e, t, s, i) {
  var r, o, a, h, l, u = t.length, c = u, p = 0;
  for (n.__k = new Array(i), r = 0; r < i; r++) (o = e[r]) != null && typeof o != "boolean" && typeof o != "function" ? (h = r + p, (o = n.__k[r] = typeof o == "string" || typeof o == "number" || typeof o == "bigint" || o.constructor == String ? G(null, o, null, null, null) : ae(o) ? G(he, { children: o }, null, null, null) : o.constructor == null && o.__b > 0 ? G(o.type, o.props, o.key, o.ref ? o.ref : null, o.__v) : o).__ = n, o.__b = n.__b + 1, a = null, (l = o.__i = Dt(o, t, h, c)) != -1 && (c--, (a = t[l]) && (a.__u |= 2)), a == null || a.__v == null ? (l == -1 && (i > u ? p-- : i < u && p++), typeof o.type != "function" && (o.__u |= 4)) : l != h && (l == h - 1 ? p-- : l == h + 1 ? p++ : (l > h ? p-- : p++, o.__u |= 4))) : n.__k[r] = null;
  if (c) for (r = 0; r < u; r++) (a = t[r]) != null && !(2 & a.__u) && (a.__e == s && (s = q(a)), _t(a, a));
  return s;
}
function ut(n, e, t) {
  var s, i;
  if (typeof n.type == "function") {
    for (s = n.__k, i = 0; s && i < s.length; i++) s[i] && (s[i].__ = n, e = ut(s[i], e, t));
    return e;
  }
  n.__e != e && (e && n.type && !t.contains(e) && (e = q(n)), t.insertBefore(n.__e, e || null), e = n.__e);
  do
    e = e && e.nextSibling;
  while (e != null && e.nodeType == 8);
  return e;
}
function Dt(n, e, t, s) {
  var i, r, o = n.key, a = n.type, h = e[t];
  if (h === null && n.key == null || h && o == h.key && a == h.type && !(2 & h.__u)) return t;
  if (s > (h != null && !(2 & h.__u) ? 1 : 0)) for (i = t - 1, r = t + 1; i >= 0 || r < e.length; ) {
    if (i >= 0) {
      if ((h = e[i]) && !(2 & h.__u) && o == h.key && a == h.type) return i;
      i--;
    }
    if (r < e.length) {
      if ((h = e[r]) && !(2 & h.__u) && o == h.key && a == h.type) return r;
      r++;
    }
  }
  return -1;
}
function $e(n, e, t) {
  e[0] == "-" ? n.setProperty(e, t ?? "") : n[e] = t == null ? "" : typeof t != "number" || Lt.test(e) ? t : t + "px";
}
function X(n, e, t, s, i) {
  var r, o;
  e: if (e == "style") if (typeof t == "string") n.style.cssText = t;
  else {
    if (typeof s == "string" && (n.style.cssText = s = ""), s) for (e in s) t && e in t || $e(n.style, e, "");
    if (t) for (e in t) s && t[e] == s[e] || $e(n.style, e, t[e]);
  }
  else if (e[0] == "o" && e[1] == "n") r = e != (e = e.replace(ot, "$1")), o = e.toLowerCase(), e = o in n || e == "onFocusOut" || e == "onFocusIn" ? o.slice(2) : e.slice(2), n.l || (n.l = {}), n.l[e + r] = t, t ? s ? t.u = s.u : (t.u = Ne, n.addEventListener(e, r ? ge : ye, r)) : n.removeEventListener(e, r ? ge : ye, r);
  else {
    if (i == "http://www.w3.org/2000/svg") e = e.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
    else if (e != "width" && e != "height" && e != "href" && e != "list" && e != "form" && e != "tabIndex" && e != "download" && e != "rowSpan" && e != "colSpan" && e != "role" && e != "popover" && e in n) try {
      n[e] = t ?? "";
      break e;
    } catch {
    }
    typeof t == "function" || (t == null || t === !1 && e[4] != "-" ? n.removeAttribute(e) : n.setAttribute(e, e == "popover" && t == 1 ? "" : t));
  }
}
function Fe(n) {
  return function(e) {
    if (this.l) {
      var t = this.l[e.type + n];
      if (e.t == null) e.t = Ne++;
      else if (e.t < t.u) return;
      return t(y.event ? y.event(e) : e);
    }
  };
}
function Re(n, e, t, s, i, r, o, a, h, l) {
  var u, c, p, f, d, S, E, g, v, H, B, Y, I, He, J, M, fe, N = e.type;
  if (e.constructor != null) return null;
  128 & t.__u && (h = !!(32 & t.__u), r = [a = e.__e = t.__e]), (u = y.__b) && u(e);
  e: if (typeof N == "function") try {
    if (g = e.props, v = "prototype" in N && N.prototype.render, H = (u = N.contextType) && s[u.__c], B = u ? H ? H.props.value : u.__ : s, t.__c ? E = (c = e.__c = t.__c).__ = c.__E : (v ? e.__c = c = new N(g, B) : (e.__c = c = new Z(g, B), c.constructor = N, c.render = Ut), H && H.sub(c), c.props = g, c.state || (c.state = {}), c.context = B, c.__n = s, p = c.__d = !0, c.__h = [], c._sb = []), v && c.__s == null && (c.__s = c.state), v && N.getDerivedStateFromProps != null && (c.__s == c.state && (c.__s = O({}, c.__s)), O(c.__s, N.getDerivedStateFromProps(g, c.__s))), f = c.props, d = c.state, c.__v = e, p) v && N.getDerivedStateFromProps == null && c.componentWillMount != null && c.componentWillMount(), v && c.componentDidMount != null && c.__h.push(c.componentDidMount);
    else {
      if (v && N.getDerivedStateFromProps == null && g !== f && c.componentWillReceiveProps != null && c.componentWillReceiveProps(g, B), !c.__e && c.shouldComponentUpdate != null && c.shouldComponentUpdate(g, c.__s, B) === !1 || e.__v == t.__v) {
        for (e.__v != t.__v && (c.props = g, c.state = c.__s, c.__d = !1), e.__e = t.__e, e.__k = t.__k, e.__k.some(function($) {
          $ && ($.__ = e);
        }), Y = 0; Y < c._sb.length; Y++) c.__h.push(c._sb[Y]);
        c._sb = [], c.__h.length && o.push(c);
        break e;
      }
      c.componentWillUpdate != null && c.componentWillUpdate(g, c.__s, B), v && c.componentDidUpdate != null && c.__h.push(function() {
        c.componentDidUpdate(f, d, S);
      });
    }
    if (c.context = B, c.props = g, c.__P = n, c.__e = !1, I = y.__r, He = 0, v) {
      for (c.state = c.__s, c.__d = !1, I && I(e), u = c.render(c.props, c.state, c.context), J = 0; J < c._sb.length; J++) c.__h.push(c._sb[J]);
      c._sb = [];
    } else do
      c.__d = !1, I && I(e), u = c.render(c.props, c.state, c.context), c.state = c.__s;
    while (c.__d && ++He < 25);
    c.state = c.__s, c.getChildContext != null && (s = O(O({}, s), c.getChildContext())), v && !p && c.getSnapshotBeforeUpdate != null && (S = c.getSnapshotBeforeUpdate(f, d)), M = u, u != null && u.type === he && u.key == null && (M = pt(u.props.children)), a = lt(n, ae(M) ? M : [M], e, t, s, i, r, o, a, h, l), c.base = e.__e, e.__u &= -161, c.__h.length && o.push(c), E && (c.__E = c.__ = null);
  } catch ($) {
    if (e.__v = null, h || r != null) if ($.then) {
      for (e.__u |= h ? 160 : 128; a && a.nodeType == 8 && a.nextSibling; ) a = a.nextSibling;
      r[r.indexOf(a)] = null, e.__e = a;
    } else for (fe = r.length; fe--; ) Ce(r[fe]);
    else e.__e = t.__e, e.__k = t.__k;
    y.__e($, e, t);
  }
  else r == null && e.__v == t.__v ? (e.__k = t.__k, e.__e = t.__e) : a = e.__e = qt(t.__e, e, t, s, i, r, o, h, l);
  return (u = y.diffed) && u(e), 128 & e.__u ? void 0 : a;
}
function ft(n, e, t) {
  for (var s = 0; s < t.length; s++) Oe(t[s], t[++s], t[++s]);
  y.__c && y.__c(e, n), n.some(function(i) {
    try {
      n = i.__h, i.__h = [], n.some(function(r) {
        r.call(i);
      });
    } catch (r) {
      y.__e(r, i.__v);
    }
  });
}
function pt(n) {
  return typeof n != "object" || n == null || n.__b && n.__b > 0 ? n : ae(n) ? n.map(pt) : O({}, n);
}
function qt(n, e, t, s, i, r, o, a, h) {
  var l, u, c, p, f, d, S, E = t.props, g = e.props, v = e.type;
  if (v == "svg" ? i = "http://www.w3.org/2000/svg" : v == "math" ? i = "http://www.w3.org/1998/Math/MathML" : i || (i = "http://www.w3.org/1999/xhtml"), r != null) {
    for (l = 0; l < r.length; l++) if ((f = r[l]) && "setAttribute" in f == !!v && (v ? f.localName == v : f.nodeType == 3)) {
      n = f, r[l] = null;
      break;
    }
  }
  if (n == null) {
    if (v == null) return document.createTextNode(g);
    n = document.createElementNS(i, v, g.is && g), a && (y.__m && y.__m(e, r), a = !1), r = null;
  }
  if (v == null) E === g || a && n.data == g || (n.data = g);
  else {
    if (r = r && ce.call(n.childNodes), E = t.props || K, !a && r != null) for (E = {}, l = 0; l < n.attributes.length; l++) E[(f = n.attributes[l]).name] = f.value;
    for (l in E) if (f = E[l], l != "children") {
      if (l == "dangerouslySetInnerHTML") c = f;
      else if (!(l in g)) {
        if (l == "value" && "defaultValue" in g || l == "checked" && "defaultChecked" in g) continue;
        X(n, l, null, f, i);
      }
    }
    for (l in g) f = g[l], l == "children" ? p = f : l == "dangerouslySetInnerHTML" ? u = f : l == "value" ? d = f : l == "checked" ? S = f : a && typeof f != "function" || E[l] === f || X(n, l, f, E[l], i);
    if (u) a || c && (u.__html == c.__html || u.__html == n.innerHTML) || (n.innerHTML = u.__html), e.__k = [];
    else if (c && (n.innerHTML = ""), lt(e.type == "template" ? n.content : n, ae(p) ? p : [p], e, t, s, v == "foreignObject" ? "http://www.w3.org/1999/xhtml" : i, r, o, r ? r[0] : t.__k && q(t, 0), a, h), r != null) for (l = r.length; l--; ) Ce(r[l]);
    a || (l = "value", v == "progress" && d == null ? n.removeAttribute("value") : d != null && (d !== n[l] || v == "progress" && !d || v == "option" && d != E[l]) && X(n, l, d, E[l], i), l = "checked", S != null && S != n[l] && X(n, l, S, E[l], i));
  }
  return n;
}
function Oe(n, e, t) {
  try {
    if (typeof n == "function") {
      var s = typeof n.__u == "function";
      s && n.__u(), s && e == null || (n.__u = n(e));
    } else n.current = e;
  } catch (i) {
    y.__e(i, t);
  }
}
function _t(n, e, t) {
  var s, i;
  if (y.unmount && y.unmount(n), (s = n.ref) && (s.current && s.current != n.__e || Oe(s, null, e)), (s = n.__c) != null) {
    if (s.componentWillUnmount) try {
      s.componentWillUnmount();
    } catch (r) {
      y.__e(r, e);
    }
    s.base = s.__P = null;
  }
  if (s = n.__k) for (i = 0; i < s.length; i++) s[i] && _t(s[i], e, t || typeof n.type != "function");
  t || Ce(n.__e), n.__c = n.__ = n.__e = void 0;
}
function Ut(n, e, t) {
  return this.constructor(n, t);
}
function Ht(n, e, t) {
  var s, i, r, o;
  e == document && (e = document.documentElement), y.__ && y.__(n, e), i = (s = !1) ? null : e.__k, r = [], o = [], Re(e, n = e.__k = at(he, null, [n]), i || K, K, e.namespaceURI, i ? null : e.firstChild ? ce.call(e.childNodes) : null, r, i ? i.__e : e.firstChild, s, o), ft(r, n, o);
}
ce = ct.slice, y = { __e: function(n, e, t, s) {
  for (var i, r, o; e = e.__; ) if ((i = e.__c) && !i.__) try {
    if ((r = i.constructor) && r.getDerivedStateFromError != null && (i.setState(r.getDerivedStateFromError(n)), o = i.__d), i.componentDidCatch != null && (i.componentDidCatch(n, s || {}), o = i.__d), o) return i.__E = i;
  } catch (a) {
    n = a;
  }
  throw n;
} }, st = 0, Z.prototype.setState = function(n, e) {
  var t;
  t = this.__s != null && this.__s != this.state ? this.__s : this.__s = O({}, this.state), typeof n == "function" && (n = n(O({}, t), this.props)), n && O(t, n), n != null && this.__v && (e && this._sb.push(e), Me(this));
}, Z.prototype.forceUpdate = function(n) {
  this.__v && (this.__e = !0, n && this.__h.push(n), Me(this));
}, Z.prototype.render = he, D = [], it = typeof Promise == "function" ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, rt = function(n, e) {
  return n.__v.__b - e.__v.__b;
}, re.__r = 0, ot = /(PointerCapture)$|Capture$/i, Ne = 0, ye = Fe(!1), ge = Fe(!0);
var It = 0;
function _(n, e, t, s, i, r) {
  e || (e = {});
  var o, a, h = e;
  if ("ref" in h) for (a in h = {}, e) a == "ref" ? o = e[a] : h[a] = e[a];
  var l = { type: n, props: h, key: t, ref: o, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: --It, __i: -1, __u: 0, __source: i, __self: r };
  if (typeof n == "function" && (o = n.defaultProps)) for (a in o) h[a] === void 0 && (h[a] = o[a]);
  return y.vnode && y.vnode(l), l;
}
var z, b, pe, Ve, oe = 0, dt = [], w = y, We = w.__b, Ke = w.__r, ze = w.diffed, Ye = w.__c, Je = w.unmount, Xe = w.__;
function Be(n, e) {
  w.__h && w.__h(b, n, oe || e), oe = 0;
  var t = b.__H || (b.__H = { __: [], __h: [] });
  return n >= t.__.length && t.__.push({}), t.__[n];
}
function W(n) {
  return oe = 1, Mt(yt, n);
}
function Mt(n, e, t) {
  var s = Be(z++, 2);
  if (s.t = n, !s.__c && (s.__ = [yt(void 0, e), function(a) {
    var h = s.__N ? s.__N[0] : s.__[0], l = s.t(h, a);
    h !== l && (s.__N = [l, s.__[1]], s.__c.setState({}));
  }], s.__c = b, !b.__f)) {
    var i = function(a, h, l) {
      if (!s.__c.__H) return !0;
      var u = s.__c.__H.__.filter(function(p) {
        return !!p.__c;
      });
      if (u.every(function(p) {
        return !p.__N;
      })) return !r || r.call(this, a, h, l);
      var c = s.__c.props !== a;
      return u.forEach(function(p) {
        if (p.__N) {
          var f = p.__[0];
          p.__ = p.__N, p.__N = void 0, f !== p.__[0] && (c = !0);
        }
      }), r && r.call(this, a, h, l) || c;
    };
    b.__f = !0;
    var r = b.shouldComponentUpdate, o = b.componentWillUpdate;
    b.componentWillUpdate = function(a, h, l) {
      if (this.__e) {
        var u = r;
        r = void 0, i(a, h, l), r = u;
      }
      o && o.call(this, a, h, l);
    }, b.shouldComponentUpdate = i;
  }
  return s.__N || s.__;
}
function ve(n, e) {
  var t = Be(z++, 3);
  !w.__s && mt(t.__H, e) && (t.__ = n, t.u = e, b.__H.__h.push(t));
}
function je(n) {
  return oe = 5, $t(function() {
    return { current: n };
  }, []);
}
function $t(n, e) {
  var t = Be(z++, 7);
  return mt(t.__H, e) && (t.__ = n(), t.__H = e, t.__h = n), t.__;
}
function Ft() {
  for (var n; n = dt.shift(); ) if (n.__P && n.__H) try {
    n.__H.__h.forEach(ee), n.__H.__h.forEach(be), n.__H.__h = [];
  } catch (e) {
    n.__H.__h = [], w.__e(e, n.__v);
  }
}
w.__b = function(n) {
  b = null, We && We(n);
}, w.__ = function(n, e) {
  n && e.__k && e.__k.__m && (n.__m = e.__k.__m), Xe && Xe(n, e);
}, w.__r = function(n) {
  Ke && Ke(n), z = 0;
  var e = (b = n.__c).__H;
  e && (pe === b ? (e.__h = [], b.__h = [], e.__.forEach(function(t) {
    t.__N && (t.__ = t.__N), t.u = t.__N = void 0;
  })) : (e.__h.forEach(ee), e.__h.forEach(be), e.__h = [], z = 0)), pe = b;
}, w.diffed = function(n) {
  ze && ze(n);
  var e = n.__c;
  e && e.__H && (e.__H.__h.length && (dt.push(e) !== 1 && Ve === w.requestAnimationFrame || ((Ve = w.requestAnimationFrame) || Vt)(Ft)), e.__H.__.forEach(function(t) {
    t.u && (t.__H = t.u), t.u = void 0;
  })), pe = b = null;
}, w.__c = function(n, e) {
  e.some(function(t) {
    try {
      t.__h.forEach(ee), t.__h = t.__h.filter(function(s) {
        return !s.__ || be(s);
      });
    } catch (s) {
      e.some(function(i) {
        i.__h && (i.__h = []);
      }), e = [], w.__e(s, t.__v);
    }
  }), Ye && Ye(n, e);
}, w.unmount = function(n) {
  Je && Je(n);
  var e, t = n.__c;
  t && t.__H && (t.__H.__.forEach(function(s) {
    try {
      ee(s);
    } catch (i) {
      e = i;
    }
  }), t.__H = void 0, e && w.__e(e, t.__v));
};
var Qe = typeof requestAnimationFrame == "function";
function Vt(n) {
  var e, t = function() {
    clearTimeout(s), Qe && cancelAnimationFrame(e), setTimeout(n);
  }, s = setTimeout(t, 35);
  Qe && (e = requestAnimationFrame(t));
}
function ee(n) {
  var e = b, t = n.__c;
  typeof t == "function" && (n.__c = void 0, t()), b = e;
}
function be(n) {
  var e = b;
  n.__c = n.__(), b = e;
}
function mt(n, e) {
  return !n || n.length !== e.length || e.some(function(t, s) {
    return t !== n[s];
  });
}
function yt(n, e) {
  return typeof e == "function" ? e(n) : e;
}
function Wt({ isConnected: n, isOpen: e, onClick: t, unreadCount: s = 0 }) {
  return /* @__PURE__ */ _(
    "button",
    {
      className: `float-button ${e ? "open" : ""} ${n ? "connected" : "disconnected"}`,
      onClick: t,
      title: n ? "智能助手已连接" : "智能助手未连接",
      children: [
        /* @__PURE__ */ _("div", { className: "float-button-icon", children: e ? (
          // 关闭图标
          /* @__PURE__ */ _("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", children: /* @__PURE__ */ _(
            "path",
            {
              d: "M18 6L6 18M6 6l12 12",
              stroke: "currentColor",
              strokeWidth: "2",
              strokeLinecap: "round",
              strokeLinejoin: "round"
            }
          ) })
        ) : (
          // 聊天图标
          /* @__PURE__ */ _("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", children: /* @__PURE__ */ _(
            "path",
            {
              d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
              stroke: "currentColor",
              strokeWidth: "2",
              strokeLinecap: "round",
              strokeLinejoin: "round"
            }
          ) })
        ) }),
        /* @__PURE__ */ _("div", { className: `connection-indicator ${n ? "connected" : "disconnected"}` }),
        s > 0 && /* @__PURE__ */ _("div", { className: "unread-badge", children: s > 99 ? "99+" : s }),
        /* @__PURE__ */ _("div", { className: "ripple-effect" })
      ]
    }
  );
}
function Kt({
  messages: n,
  isConnected: e,
  onSendMessage: t,
  onClear: s,
  onClose: i
}) {
  const [r, o] = W(""), [a, h] = W(!1), l = je(null), u = je(null);
  ve(() => {
    var d;
    (d = l.current) == null || d.scrollIntoView({ behavior: "smooth" });
  }, [n]), ve(() => {
    var d;
    (d = u.current) == null || d.focus();
  }, []);
  const c = () => {
    const d = r.trim();
    !d || !e || (t(d), o(""), h(!0), setTimeout(() => h(!1), 1e3));
  }, p = (d) => {
    d.key === "Enter" && !d.shiftKey && (d.preventDefault(), c());
  }, f = (d) => d.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit"
  });
  return /* @__PURE__ */ _("div", { className: "chat-dialog", children: [
    /* @__PURE__ */ _("div", { className: "chat-header", children: [
      /* @__PURE__ */ _("div", { className: "chat-title", children: [
        /* @__PURE__ */ _("h3", { children: "智能助手" }),
        /* @__PURE__ */ _("div", { className: `status-indicator ${e ? "online" : "offline"}`, children: e ? "已连接" : "未连接" })
      ] }),
      /* @__PURE__ */ _("div", { className: "chat-actions", children: [
        /* @__PURE__ */ _(
          "button",
          {
            className: "clear-btn",
            onClick: s,
            title: "清空聊天记录",
            children: "🗑️"
          }
        ),
        /* @__PURE__ */ _(
          "button",
          {
            className: "close-btn",
            onClick: i,
            title: "关闭对话框",
            children: "✕"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ _("div", { className: "chat-messages", children: [
      n.length === 0 ? /* @__PURE__ */ _("div", { className: "empty-state", children: [
        /* @__PURE__ */ _("div", { className: "empty-icon", children: "💬" }),
        /* @__PURE__ */ _("p", { children: "你好！我是你的智能网页助手" }),
        /* @__PURE__ */ _("p", { children: "有什么可以帮你的吗？" })
      ] }) : n.map((d) => /* @__PURE__ */ _(
        "div",
        {
          className: `message ${d.type}`,
          children: [
            /* @__PURE__ */ _("div", { className: "message-content", children: d.content }),
            /* @__PURE__ */ _("div", { className: "message-time", children: f(d.timestamp) })
          ]
        },
        d.id
      )),
      a && /* @__PURE__ */ _("div", { className: "message assistant loading", children: /* @__PURE__ */ _("div", { className: "typing-indicator", children: [
        /* @__PURE__ */ _("span", {}),
        /* @__PURE__ */ _("span", {}),
        /* @__PURE__ */ _("span", {})
      ] }) }),
      /* @__PURE__ */ _("div", { ref: l })
    ] }),
    /* @__PURE__ */ _("div", { className: "chat-input", children: [
      /* @__PURE__ */ _("div", { className: "input-group", children: [
        /* @__PURE__ */ _(
          "input",
          {
            ref: u,
            type: "text",
            value: r,
            onChange: (d) => o(d.target.value),
            onKeyPress: p,
            placeholder: e ? "输入消息..." : "未连接到服务器",
            disabled: !e,
            className: "message-input"
          }
        ),
        /* @__PURE__ */ _(
          "button",
          {
            onClick: c,
            disabled: !r.trim() || !e,
            className: "send-btn",
            title: "发送消息",
            children: /* @__PURE__ */ _("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", children: /* @__PURE__ */ _(
              "path",
              {
                d: "M2 21l21-9L2 3v7l15 2-15 2v7z",
                stroke: "currentColor",
                strokeWidth: "2",
                strokeLinecap: "round",
                strokeLinejoin: "round"
              }
            ) })
          }
        )
      ] }),
      !e && /* @__PURE__ */ _("div", { className: "connection-warning", children: "⚠️ 连接已断开，正在尝试重连..." })
    ] })
  ] });
}
function zt({ wsService: n }) {
  const [e, t] = W(!1), [s, i] = W(!1), [r, o] = W([]);
  return ve(() => (n.connect(), n.on("status", (l) => {
    i(l.connected), l.connected ? console.log("🟢 已连接到智能助手服务器") : console.log("🔴 与服务器断开连接");
  }), n.on("response", (l) => {
    o((u) => [...u, {
      id: Date.now(),
      type: "assistant",
      content: l.content,
      timestamp: /* @__PURE__ */ new Date()
    }]);
  }), () => {
    n.disconnect();
  }), []), /* @__PURE__ */ _("div", { className: "web-assistant", children: [
    /* @__PURE__ */ _(
      Wt,
      {
        isConnected: s,
        isOpen: e,
        onClick: () => t(!e),
        unreadCount: 0
      }
    ),
    e && /* @__PURE__ */ _(
      Kt,
      {
        messages: r,
        isConnected: s,
        onSendMessage: (l) => {
          const u = {
            id: Date.now(),
            type: "user",
            content: l,
            timestamp: /* @__PURE__ */ new Date()
          };
          o((c) => [...c, u]), n.sendMessage(l, {
            pageUrl: window.location.href,
            pageTitle: document.title,
            userAgent: navigator.userAgent
          });
        },
        onClear: () => {
          o([]);
        },
        onClose: () => t(!1)
      }
    )
  ] });
}
const R = /* @__PURE__ */ Object.create(null);
R.open = "0";
R.close = "1";
R.ping = "2";
R.pong = "3";
R.message = "4";
R.upgrade = "5";
R.noop = "6";
const te = /* @__PURE__ */ Object.create(null);
Object.keys(R).forEach((n) => {
  te[R[n]] = n;
});
const we = { type: "error", data: "parser error" }, gt = typeof Blob == "function" || typeof Blob < "u" && Object.prototype.toString.call(Blob) === "[object BlobConstructor]", vt = typeof ArrayBuffer == "function", bt = (n) => typeof ArrayBuffer.isView == "function" ? ArrayBuffer.isView(n) : n && n.buffer instanceof ArrayBuffer, Le = ({ type: n, data: e }, t, s) => gt && e instanceof Blob ? t ? s(e) : Ge(e, s) : vt && (e instanceof ArrayBuffer || bt(e)) ? t ? s(e) : Ge(new Blob([e]), s) : s(R[n] + (e || "")), Ge = (n, e) => {
  const t = new FileReader();
  return t.onload = function() {
    const s = t.result.split(",")[1];
    e("b" + (s || ""));
  }, t.readAsDataURL(n);
};
function Ze(n) {
  return n instanceof Uint8Array ? n : n instanceof ArrayBuffer ? new Uint8Array(n) : new Uint8Array(n.buffer, n.byteOffset, n.byteLength);
}
let _e;
function Yt(n, e) {
  if (gt && n.data instanceof Blob)
    return n.data.arrayBuffer().then(Ze).then(e);
  if (vt && (n.data instanceof ArrayBuffer || bt(n.data)))
    return e(Ze(n.data));
  Le(n, !1, (t) => {
    _e || (_e = new TextEncoder()), e(_e.encode(t));
  });
}
const et = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", V = typeof Uint8Array > "u" ? [] : new Uint8Array(256);
for (let n = 0; n < et.length; n++)
  V[et.charCodeAt(n)] = n;
const Jt = (n) => {
  let e = n.length * 0.75, t = n.length, s, i = 0, r, o, a, h;
  n[n.length - 1] === "=" && (e--, n[n.length - 2] === "=" && e--);
  const l = new ArrayBuffer(e), u = new Uint8Array(l);
  for (s = 0; s < t; s += 4)
    r = V[n.charCodeAt(s)], o = V[n.charCodeAt(s + 1)], a = V[n.charCodeAt(s + 2)], h = V[n.charCodeAt(s + 3)], u[i++] = r << 2 | o >> 4, u[i++] = (o & 15) << 4 | a >> 2, u[i++] = (a & 3) << 6 | h & 63;
  return l;
}, Xt = typeof ArrayBuffer == "function", Pe = (n, e) => {
  if (typeof n != "string")
    return {
      type: "message",
      data: wt(n, e)
    };
  const t = n.charAt(0);
  return t === "b" ? {
    type: "message",
    data: jt(n.substring(1), e)
  } : te[t] ? n.length > 1 ? {
    type: te[t],
    data: n.substring(1)
  } : {
    type: te[t]
  } : we;
}, jt = (n, e) => {
  if (Xt) {
    const t = Jt(n);
    return wt(t, e);
  } else
    return { base64: !0, data: n };
}, wt = (n, e) => {
  switch (e) {
    case "blob":
      return n instanceof Blob ? n : new Blob([n]);
    case "arraybuffer":
    default:
      return n instanceof ArrayBuffer ? n : n.buffer;
  }
}, kt = "", Qt = (n, e) => {
  const t = n.length, s = new Array(t);
  let i = 0;
  n.forEach((r, o) => {
    Le(r, !1, (a) => {
      s[o] = a, ++i === t && e(s.join(kt));
    });
  });
}, Gt = (n, e) => {
  const t = n.split(kt), s = [];
  for (let i = 0; i < t.length; i++) {
    const r = Pe(t[i], e);
    if (s.push(r), r.type === "error")
      break;
  }
  return s;
};
function Zt() {
  return new TransformStream({
    transform(n, e) {
      Yt(n, (t) => {
        const s = t.length;
        let i;
        if (s < 126)
          i = new Uint8Array(1), new DataView(i.buffer).setUint8(0, s);
        else if (s < 65536) {
          i = new Uint8Array(3);
          const r = new DataView(i.buffer);
          r.setUint8(0, 126), r.setUint16(1, s);
        } else {
          i = new Uint8Array(9);
          const r = new DataView(i.buffer);
          r.setUint8(0, 127), r.setBigUint64(1, BigInt(s));
        }
        n.data && typeof n.data != "string" && (i[0] |= 128), e.enqueue(i), e.enqueue(t);
      });
    }
  });
}
let de;
function j(n) {
  return n.reduce((e, t) => e + t.length, 0);
}
function Q(n, e) {
  if (n[0].length === e)
    return n.shift();
  const t = new Uint8Array(e);
  let s = 0;
  for (let i = 0; i < e; i++)
    t[i] = n[0][s++], s === n[0].length && (n.shift(), s = 0);
  return n.length && s < n[0].length && (n[0] = n[0].slice(s)), t;
}
function en(n, e) {
  de || (de = new TextDecoder());
  const t = [];
  let s = 0, i = -1, r = !1;
  return new TransformStream({
    transform(o, a) {
      for (t.push(o); ; ) {
        if (s === 0) {
          if (j(t) < 1)
            break;
          const h = Q(t, 1);
          r = (h[0] & 128) === 128, i = h[0] & 127, i < 126 ? s = 3 : i === 126 ? s = 1 : s = 2;
        } else if (s === 1) {
          if (j(t) < 2)
            break;
          const h = Q(t, 2);
          i = new DataView(h.buffer, h.byteOffset, h.length).getUint16(0), s = 3;
        } else if (s === 2) {
          if (j(t) < 8)
            break;
          const h = Q(t, 8), l = new DataView(h.buffer, h.byteOffset, h.length), u = l.getUint32(0);
          if (u > Math.pow(2, 21) - 1) {
            a.enqueue(we);
            break;
          }
          i = u * Math.pow(2, 32) + l.getUint32(4), s = 3;
        } else {
          if (j(t) < i)
            break;
          const h = Q(t, i);
          a.enqueue(Pe(r ? h : de.decode(h), e)), s = 0;
        }
        if (i === 0 || i > n) {
          a.enqueue(we);
          break;
        }
      }
    }
  });
}
const Et = 4;
function k(n) {
  if (n) return tn(n);
}
function tn(n) {
  for (var e in k.prototype)
    n[e] = k.prototype[e];
  return n;
}
k.prototype.on = k.prototype.addEventListener = function(n, e) {
  return this._callbacks = this._callbacks || {}, (this._callbacks["$" + n] = this._callbacks["$" + n] || []).push(e), this;
};
k.prototype.once = function(n, e) {
  function t() {
    this.off(n, t), e.apply(this, arguments);
  }
  return t.fn = e, this.on(n, t), this;
};
k.prototype.off = k.prototype.removeListener = k.prototype.removeAllListeners = k.prototype.removeEventListener = function(n, e) {
  if (this._callbacks = this._callbacks || {}, arguments.length == 0)
    return this._callbacks = {}, this;
  var t = this._callbacks["$" + n];
  if (!t) return this;
  if (arguments.length == 1)
    return delete this._callbacks["$" + n], this;
  for (var s, i = 0; i < t.length; i++)
    if (s = t[i], s === e || s.fn === e) {
      t.splice(i, 1);
      break;
    }
  return t.length === 0 && delete this._callbacks["$" + n], this;
};
k.prototype.emit = function(n) {
  this._callbacks = this._callbacks || {};
  for (var e = new Array(arguments.length - 1), t = this._callbacks["$" + n], s = 1; s < arguments.length; s++)
    e[s - 1] = arguments[s];
  if (t) {
    t = t.slice(0);
    for (var s = 0, i = t.length; s < i; ++s)
      t[s].apply(this, e);
  }
  return this;
};
k.prototype.emitReserved = k.prototype.emit;
k.prototype.listeners = function(n) {
  return this._callbacks = this._callbacks || {}, this._callbacks["$" + n] || [];
};
k.prototype.hasListeners = function(n) {
  return !!this.listeners(n).length;
};
const le = typeof Promise == "function" && typeof Promise.resolve == "function" ? (e) => Promise.resolve().then(e) : (e, t) => t(e, 0), T = typeof self < "u" ? self : typeof window < "u" ? window : Function("return this")(), nn = "arraybuffer";
function At(n, ...e) {
  return e.reduce((t, s) => (n.hasOwnProperty(s) && (t[s] = n[s]), t), {});
}
const sn = T.setTimeout, rn = T.clearTimeout;
function ue(n, e) {
  e.useNativeTimers ? (n.setTimeoutFn = sn.bind(T), n.clearTimeoutFn = rn.bind(T)) : (n.setTimeoutFn = T.setTimeout.bind(T), n.clearTimeoutFn = T.clearTimeout.bind(T));
}
const on = 1.33;
function cn(n) {
  return typeof n == "string" ? an(n) : Math.ceil((n.byteLength || n.size) * on);
}
function an(n) {
  let e = 0, t = 0;
  for (let s = 0, i = n.length; s < i; s++)
    e = n.charCodeAt(s), e < 128 ? t += 1 : e < 2048 ? t += 2 : e < 55296 || e >= 57344 ? t += 3 : (s++, t += 4);
  return t;
}
function Tt() {
  return Date.now().toString(36).substring(3) + Math.random().toString(36).substring(2, 5);
}
function hn(n) {
  let e = "";
  for (let t in n)
    n.hasOwnProperty(t) && (e.length && (e += "&"), e += encodeURIComponent(t) + "=" + encodeURIComponent(n[t]));
  return e;
}
function ln(n) {
  let e = {}, t = n.split("&");
  for (let s = 0, i = t.length; s < i; s++) {
    let r = t[s].split("=");
    e[decodeURIComponent(r[0])] = decodeURIComponent(r[1]);
  }
  return e;
}
class un extends Error {
  constructor(e, t, s) {
    super(e), this.description = t, this.context = s, this.type = "TransportError";
  }
}
class De extends k {
  /**
   * Transport abstract constructor.
   *
   * @param {Object} opts - options
   * @protected
   */
  constructor(e) {
    super(), this.writable = !1, ue(this, e), this.opts = e, this.query = e.query, this.socket = e.socket, this.supportsBinary = !e.forceBase64;
  }
  /**
   * Emits an error.
   *
   * @param {String} reason
   * @param description
   * @param context - the error context
   * @return {Transport} for chaining
   * @protected
   */
  onError(e, t, s) {
    return super.emitReserved("error", new un(e, t, s)), this;
  }
  /**
   * Opens the transport.
   */
  open() {
    return this.readyState = "opening", this.doOpen(), this;
  }
  /**
   * Closes the transport.
   */
  close() {
    return (this.readyState === "opening" || this.readyState === "open") && (this.doClose(), this.onClose()), this;
  }
  /**
   * Sends multiple packets.
   *
   * @param {Array} packets
   */
  send(e) {
    this.readyState === "open" && this.write(e);
  }
  /**
   * Called upon open
   *
   * @protected
   */
  onOpen() {
    this.readyState = "open", this.writable = !0, super.emitReserved("open");
  }
  /**
   * Called with data.
   *
   * @param {String} data
   * @protected
   */
  onData(e) {
    const t = Pe(e, this.socket.binaryType);
    this.onPacket(t);
  }
  /**
   * Called with a decoded packet.
   *
   * @protected
   */
  onPacket(e) {
    super.emitReserved("packet", e);
  }
  /**
   * Called upon close.
   *
   * @protected
   */
  onClose(e) {
    this.readyState = "closed", super.emitReserved("close", e);
  }
  /**
   * Pauses the transport, in order not to lose packets during an upgrade.
   *
   * @param onPause
   */
  pause(e) {
  }
  createUri(e, t = {}) {
    return e + "://" + this._hostname() + this._port() + this.opts.path + this._query(t);
  }
  _hostname() {
    const e = this.opts.hostname;
    return e.indexOf(":") === -1 ? e : "[" + e + "]";
  }
  _port() {
    return this.opts.port && (this.opts.secure && +(this.opts.port !== 443) || !this.opts.secure && Number(this.opts.port) !== 80) ? ":" + this.opts.port : "";
  }
  _query(e) {
    const t = hn(e);
    return t.length ? "?" + t : "";
  }
}
class fn extends De {
  constructor() {
    super(...arguments), this._polling = !1;
  }
  get name() {
    return "polling";
  }
  /**
   * Opens the socket (triggers polling). We write a PING message to determine
   * when the transport is open.
   *
   * @protected
   */
  doOpen() {
    this._poll();
  }
  /**
   * Pauses polling.
   *
   * @param {Function} onPause - callback upon buffers are flushed and transport is paused
   * @package
   */
  pause(e) {
    this.readyState = "pausing";
    const t = () => {
      this.readyState = "paused", e();
    };
    if (this._polling || !this.writable) {
      let s = 0;
      this._polling && (s++, this.once("pollComplete", function() {
        --s || t();
      })), this.writable || (s++, this.once("drain", function() {
        --s || t();
      }));
    } else
      t();
  }
  /**
   * Starts polling cycle.
   *
   * @private
   */
  _poll() {
    this._polling = !0, this.doPoll(), this.emitReserved("poll");
  }
  /**
   * Overloads onData to detect payloads.
   *
   * @protected
   */
  onData(e) {
    const t = (s) => {
      if (this.readyState === "opening" && s.type === "open" && this.onOpen(), s.type === "close")
        return this.onClose({ description: "transport closed by the server" }), !1;
      this.onPacket(s);
    };
    Gt(e, this.socket.binaryType).forEach(t), this.readyState !== "closed" && (this._polling = !1, this.emitReserved("pollComplete"), this.readyState === "open" && this._poll());
  }
  /**
   * For polling, send a close packet.
   *
   * @protected
   */
  doClose() {
    const e = () => {
      this.write([{ type: "close" }]);
    };
    this.readyState === "open" ? e() : this.once("open", e);
  }
  /**
   * Writes a packets payload.
   *
   * @param {Array} packets - data packets
   * @protected
   */
  write(e) {
    this.writable = !1, Qt(e, (t) => {
      this.doWrite(t, () => {
        this.writable = !0, this.emitReserved("drain");
      });
    });
  }
  /**
   * Generates uri for connection.
   *
   * @private
   */
  uri() {
    const e = this.opts.secure ? "https" : "http", t = this.query || {};
    return this.opts.timestampRequests !== !1 && (t[this.opts.timestampParam] = Tt()), !this.supportsBinary && !t.sid && (t.b64 = 1), this.createUri(e, t);
  }
}
let St = !1;
try {
  St = typeof XMLHttpRequest < "u" && "withCredentials" in new XMLHttpRequest();
} catch {
}
const pn = St;
function _n() {
}
class dn extends fn {
  /**
   * XHR Polling constructor.
   *
   * @param {Object} opts
   * @package
   */
  constructor(e) {
    if (super(e), typeof location < "u") {
      const t = location.protocol === "https:";
      let s = location.port;
      s || (s = t ? "443" : "80"), this.xd = typeof location < "u" && e.hostname !== location.hostname || s !== e.port;
    }
  }
  /**
   * Sends data.
   *
   * @param {String} data to send.
   * @param {Function} called upon flush.
   * @private
   */
  doWrite(e, t) {
    const s = this.request({
      method: "POST",
      data: e
    });
    s.on("success", t), s.on("error", (i, r) => {
      this.onError("xhr post error", i, r);
    });
  }
  /**
   * Starts a poll cycle.
   *
   * @private
   */
  doPoll() {
    const e = this.request();
    e.on("data", this.onData.bind(this)), e.on("error", (t, s) => {
      this.onError("xhr poll error", t, s);
    }), this.pollXhr = e;
  }
}
class C extends k {
  /**
   * Request constructor
   *
   * @param {Object} options
   * @package
   */
  constructor(e, t, s) {
    super(), this.createRequest = e, ue(this, s), this._opts = s, this._method = s.method || "GET", this._uri = t, this._data = s.data !== void 0 ? s.data : null, this._create();
  }
  /**
   * Creates the XHR object and sends the request.
   *
   * @private
   */
  _create() {
    var e;
    const t = At(this._opts, "agent", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "autoUnref");
    t.xdomain = !!this._opts.xd;
    const s = this._xhr = this.createRequest(t);
    try {
      s.open(this._method, this._uri, !0);
      try {
        if (this._opts.extraHeaders) {
          s.setDisableHeaderCheck && s.setDisableHeaderCheck(!0);
          for (let i in this._opts.extraHeaders)
            this._opts.extraHeaders.hasOwnProperty(i) && s.setRequestHeader(i, this._opts.extraHeaders[i]);
        }
      } catch {
      }
      if (this._method === "POST")
        try {
          s.setRequestHeader("Content-type", "text/plain;charset=UTF-8");
        } catch {
        }
      try {
        s.setRequestHeader("Accept", "*/*");
      } catch {
      }
      (e = this._opts.cookieJar) === null || e === void 0 || e.addCookies(s), "withCredentials" in s && (s.withCredentials = this._opts.withCredentials), this._opts.requestTimeout && (s.timeout = this._opts.requestTimeout), s.onreadystatechange = () => {
        var i;
        s.readyState === 3 && ((i = this._opts.cookieJar) === null || i === void 0 || i.parseCookies(
          // @ts-ignore
          s.getResponseHeader("set-cookie")
        )), s.readyState === 4 && (s.status === 200 || s.status === 1223 ? this._onLoad() : this.setTimeoutFn(() => {
          this._onError(typeof s.status == "number" ? s.status : 0);
        }, 0));
      }, s.send(this._data);
    } catch (i) {
      this.setTimeoutFn(() => {
        this._onError(i);
      }, 0);
      return;
    }
    typeof document < "u" && (this._index = C.requestsCount++, C.requests[this._index] = this);
  }
  /**
   * Called upon error.
   *
   * @private
   */
  _onError(e) {
    this.emitReserved("error", e, this._xhr), this._cleanup(!0);
  }
  /**
   * Cleans up house.
   *
   * @private
   */
  _cleanup(e) {
    if (!(typeof this._xhr > "u" || this._xhr === null)) {
      if (this._xhr.onreadystatechange = _n, e)
        try {
          this._xhr.abort();
        } catch {
        }
      typeof document < "u" && delete C.requests[this._index], this._xhr = null;
    }
  }
  /**
   * Called upon load.
   *
   * @private
   */
  _onLoad() {
    const e = this._xhr.responseText;
    e !== null && (this.emitReserved("data", e), this.emitReserved("success"), this._cleanup());
  }
  /**
   * Aborts the request.
   *
   * @package
   */
  abort() {
    this._cleanup();
  }
}
C.requestsCount = 0;
C.requests = {};
if (typeof document < "u") {
  if (typeof attachEvent == "function")
    attachEvent("onunload", tt);
  else if (typeof addEventListener == "function") {
    const n = "onpagehide" in T ? "pagehide" : "unload";
    addEventListener(n, tt, !1);
  }
}
function tt() {
  for (let n in C.requests)
    C.requests.hasOwnProperty(n) && C.requests[n].abort();
}
const mn = function() {
  const n = xt({
    xdomain: !1
  });
  return n && n.responseType !== null;
}();
class yn extends dn {
  constructor(e) {
    super(e);
    const t = e && e.forceBase64;
    this.supportsBinary = mn && !t;
  }
  request(e = {}) {
    return Object.assign(e, { xd: this.xd }, this.opts), new C(xt, this.uri(), e);
  }
}
function xt(n) {
  const e = n.xdomain;
  try {
    if (typeof XMLHttpRequest < "u" && (!e || pn))
      return new XMLHttpRequest();
  } catch {
  }
  if (!e)
    try {
      return new T[["Active"].concat("Object").join("X")]("Microsoft.XMLHTTP");
    } catch {
    }
}
const Nt = typeof navigator < "u" && typeof navigator.product == "string" && navigator.product.toLowerCase() === "reactnative";
class gn extends De {
  get name() {
    return "websocket";
  }
  doOpen() {
    const e = this.uri(), t = this.opts.protocols, s = Nt ? {} : At(this.opts, "agent", "perMessageDeflate", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "localAddress", "protocolVersion", "origin", "maxPayload", "family", "checkServerIdentity");
    this.opts.extraHeaders && (s.headers = this.opts.extraHeaders);
    try {
      this.ws = this.createSocket(e, t, s);
    } catch (i) {
      return this.emitReserved("error", i);
    }
    this.ws.binaryType = this.socket.binaryType, this.addEventListeners();
  }
  /**
   * Adds event listeners to the socket
   *
   * @private
   */
  addEventListeners() {
    this.ws.onopen = () => {
      this.opts.autoUnref && this.ws._socket.unref(), this.onOpen();
    }, this.ws.onclose = (e) => this.onClose({
      description: "websocket connection closed",
      context: e
    }), this.ws.onmessage = (e) => this.onData(e.data), this.ws.onerror = (e) => this.onError("websocket error", e);
  }
  write(e) {
    this.writable = !1;
    for (let t = 0; t < e.length; t++) {
      const s = e[t], i = t === e.length - 1;
      Le(s, this.supportsBinary, (r) => {
        try {
          this.doWrite(s, r);
        } catch {
        }
        i && le(() => {
          this.writable = !0, this.emitReserved("drain");
        }, this.setTimeoutFn);
      });
    }
  }
  doClose() {
    typeof this.ws < "u" && (this.ws.onerror = () => {
    }, this.ws.close(), this.ws = null);
  }
  /**
   * Generates uri for connection.
   *
   * @private
   */
  uri() {
    const e = this.opts.secure ? "wss" : "ws", t = this.query || {};
    return this.opts.timestampRequests && (t[this.opts.timestampParam] = Tt()), this.supportsBinary || (t.b64 = 1), this.createUri(e, t);
  }
}
const me = T.WebSocket || T.MozWebSocket;
class vn extends gn {
  createSocket(e, t, s) {
    return Nt ? new me(e, t, s) : t ? new me(e, t) : new me(e);
  }
  doWrite(e, t) {
    this.ws.send(t);
  }
}
class bn extends De {
  get name() {
    return "webtransport";
  }
  doOpen() {
    try {
      this._transport = new WebTransport(this.createUri("https"), this.opts.transportOptions[this.name]);
    } catch (e) {
      return this.emitReserved("error", e);
    }
    this._transport.closed.then(() => {
      this.onClose();
    }).catch((e) => {
      this.onError("webtransport error", e);
    }), this._transport.ready.then(() => {
      this._transport.createBidirectionalStream().then((e) => {
        const t = en(Number.MAX_SAFE_INTEGER, this.socket.binaryType), s = e.readable.pipeThrough(t).getReader(), i = Zt();
        i.readable.pipeTo(e.writable), this._writer = i.writable.getWriter();
        const r = () => {
          s.read().then(({ done: a, value: h }) => {
            a || (this.onPacket(h), r());
          }).catch((a) => {
          });
        };
        r();
        const o = { type: "open" };
        this.query.sid && (o.data = `{"sid":"${this.query.sid}"}`), this._writer.write(o).then(() => this.onOpen());
      });
    });
  }
  write(e) {
    this.writable = !1;
    for (let t = 0; t < e.length; t++) {
      const s = e[t], i = t === e.length - 1;
      this._writer.write(s).then(() => {
        i && le(() => {
          this.writable = !0, this.emitReserved("drain");
        }, this.setTimeoutFn);
      });
    }
  }
  doClose() {
    var e;
    (e = this._transport) === null || e === void 0 || e.close();
  }
}
const wn = {
  websocket: vn,
  webtransport: bn,
  polling: yn
}, kn = /^(?:(?![^:@\/?#]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@\/?#]*)(?::([^:@\/?#]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/, En = [
  "source",
  "protocol",
  "authority",
  "userInfo",
  "user",
  "password",
  "host",
  "port",
  "relative",
  "path",
  "directory",
  "file",
  "query",
  "anchor"
];
function ke(n) {
  if (n.length > 8e3)
    throw "URI too long";
  const e = n, t = n.indexOf("["), s = n.indexOf("]");
  t != -1 && s != -1 && (n = n.substring(0, t) + n.substring(t, s).replace(/:/g, ";") + n.substring(s, n.length));
  let i = kn.exec(n || ""), r = {}, o = 14;
  for (; o--; )
    r[En[o]] = i[o] || "";
  return t != -1 && s != -1 && (r.source = e, r.host = r.host.substring(1, r.host.length - 1).replace(/;/g, ":"), r.authority = r.authority.replace("[", "").replace("]", "").replace(/;/g, ":"), r.ipv6uri = !0), r.pathNames = An(r, r.path), r.queryKey = Tn(r, r.query), r;
}
function An(n, e) {
  const t = /\/{2,9}/g, s = e.replace(t, "/").split("/");
  return (e.slice(0, 1) == "/" || e.length === 0) && s.splice(0, 1), e.slice(-1) == "/" && s.splice(s.length - 1, 1), s;
}
function Tn(n, e) {
  const t = {};
  return e.replace(/(?:^|&)([^&=]*)=?([^&]*)/g, function(s, i, r) {
    i && (t[i] = r);
  }), t;
}
const Ee = typeof addEventListener == "function" && typeof removeEventListener == "function", ne = [];
Ee && addEventListener("offline", () => {
  ne.forEach((n) => n());
}, !1);
class L extends k {
  /**
   * Socket constructor.
   *
   * @param {String|Object} uri - uri or options
   * @param {Object} opts - options
   */
  constructor(e, t) {
    if (super(), this.binaryType = nn, this.writeBuffer = [], this._prevBufferLen = 0, this._pingInterval = -1, this._pingTimeout = -1, this._maxPayload = -1, this._pingTimeoutTime = 1 / 0, e && typeof e == "object" && (t = e, e = null), e) {
      const s = ke(e);
      t.hostname = s.host, t.secure = s.protocol === "https" || s.protocol === "wss", t.port = s.port, s.query && (t.query = s.query);
    } else t.host && (t.hostname = ke(t.host).host);
    ue(this, t), this.secure = t.secure != null ? t.secure : typeof location < "u" && location.protocol === "https:", t.hostname && !t.port && (t.port = this.secure ? "443" : "80"), this.hostname = t.hostname || (typeof location < "u" ? location.hostname : "localhost"), this.port = t.port || (typeof location < "u" && location.port ? location.port : this.secure ? "443" : "80"), this.transports = [], this._transportsByName = {}, t.transports.forEach((s) => {
      const i = s.prototype.name;
      this.transports.push(i), this._transportsByName[i] = s;
    }), this.opts = Object.assign({
      path: "/engine.io",
      agent: !1,
      withCredentials: !1,
      upgrade: !0,
      timestampParam: "t",
      rememberUpgrade: !1,
      addTrailingSlash: !0,
      rejectUnauthorized: !0,
      perMessageDeflate: {
        threshold: 1024
      },
      transportOptions: {},
      closeOnBeforeunload: !1
    }, t), this.opts.path = this.opts.path.replace(/\/$/, "") + (this.opts.addTrailingSlash ? "/" : ""), typeof this.opts.query == "string" && (this.opts.query = ln(this.opts.query)), Ee && (this.opts.closeOnBeforeunload && (this._beforeunloadEventListener = () => {
      this.transport && (this.transport.removeAllListeners(), this.transport.close());
    }, addEventListener("beforeunload", this._beforeunloadEventListener, !1)), this.hostname !== "localhost" && (this._offlineEventListener = () => {
      this._onClose("transport close", {
        description: "network connection lost"
      });
    }, ne.push(this._offlineEventListener))), this.opts.withCredentials && (this._cookieJar = void 0), this._open();
  }
  /**
   * Creates transport of the given type.
   *
   * @param {String} name - transport name
   * @return {Transport}
   * @private
   */
  createTransport(e) {
    const t = Object.assign({}, this.opts.query);
    t.EIO = Et, t.transport = e, this.id && (t.sid = this.id);
    const s = Object.assign({}, this.opts, {
      query: t,
      socket: this,
      hostname: this.hostname,
      secure: this.secure,
      port: this.port
    }, this.opts.transportOptions[e]);
    return new this._transportsByName[e](s);
  }
  /**
   * Initializes transport to use and starts probe.
   *
   * @private
   */
  _open() {
    if (this.transports.length === 0) {
      this.setTimeoutFn(() => {
        this.emitReserved("error", "No transports available");
      }, 0);
      return;
    }
    const e = this.opts.rememberUpgrade && L.priorWebsocketSuccess && this.transports.indexOf("websocket") !== -1 ? "websocket" : this.transports[0];
    this.readyState = "opening";
    const t = this.createTransport(e);
    t.open(), this.setTransport(t);
  }
  /**
   * Sets the current transport. Disables the existing one (if any).
   *
   * @private
   */
  setTransport(e) {
    this.transport && this.transport.removeAllListeners(), this.transport = e, e.on("drain", this._onDrain.bind(this)).on("packet", this._onPacket.bind(this)).on("error", this._onError.bind(this)).on("close", (t) => this._onClose("transport close", t));
  }
  /**
   * Called when connection is deemed open.
   *
   * @private
   */
  onOpen() {
    this.readyState = "open", L.priorWebsocketSuccess = this.transport.name === "websocket", this.emitReserved("open"), this.flush();
  }
  /**
   * Handles a packet.
   *
   * @private
   */
  _onPacket(e) {
    if (this.readyState === "opening" || this.readyState === "open" || this.readyState === "closing")
      switch (this.emitReserved("packet", e), this.emitReserved("heartbeat"), e.type) {
        case "open":
          this.onHandshake(JSON.parse(e.data));
          break;
        case "ping":
          this._sendPacket("pong"), this.emitReserved("ping"), this.emitReserved("pong"), this._resetPingTimeout();
          break;
        case "error":
          const t = new Error("server error");
          t.code = e.data, this._onError(t);
          break;
        case "message":
          this.emitReserved("data", e.data), this.emitReserved("message", e.data);
          break;
      }
  }
  /**
   * Called upon handshake completion.
   *
   * @param {Object} data - handshake obj
   * @private
   */
  onHandshake(e) {
    this.emitReserved("handshake", e), this.id = e.sid, this.transport.query.sid = e.sid, this._pingInterval = e.pingInterval, this._pingTimeout = e.pingTimeout, this._maxPayload = e.maxPayload, this.onOpen(), this.readyState !== "closed" && this._resetPingTimeout();
  }
  /**
   * Sets and resets ping timeout timer based on server pings.
   *
   * @private
   */
  _resetPingTimeout() {
    this.clearTimeoutFn(this._pingTimeoutTimer);
    const e = this._pingInterval + this._pingTimeout;
    this._pingTimeoutTime = Date.now() + e, this._pingTimeoutTimer = this.setTimeoutFn(() => {
      this._onClose("ping timeout");
    }, e), this.opts.autoUnref && this._pingTimeoutTimer.unref();
  }
  /**
   * Called on `drain` event
   *
   * @private
   */
  _onDrain() {
    this.writeBuffer.splice(0, this._prevBufferLen), this._prevBufferLen = 0, this.writeBuffer.length === 0 ? this.emitReserved("drain") : this.flush();
  }
  /**
   * Flush write buffers.
   *
   * @private
   */
  flush() {
    if (this.readyState !== "closed" && this.transport.writable && !this.upgrading && this.writeBuffer.length) {
      const e = this._getWritablePackets();
      this.transport.send(e), this._prevBufferLen = e.length, this.emitReserved("flush");
    }
  }
  /**
   * Ensure the encoded size of the writeBuffer is below the maxPayload value sent by the server (only for HTTP
   * long-polling)
   *
   * @private
   */
  _getWritablePackets() {
    if (!(this._maxPayload && this.transport.name === "polling" && this.writeBuffer.length > 1))
      return this.writeBuffer;
    let t = 1;
    for (let s = 0; s < this.writeBuffer.length; s++) {
      const i = this.writeBuffer[s].data;
      if (i && (t += cn(i)), s > 0 && t > this._maxPayload)
        return this.writeBuffer.slice(0, s);
      t += 2;
    }
    return this.writeBuffer;
  }
  /**
   * Checks whether the heartbeat timer has expired but the socket has not yet been notified.
   *
   * Note: this method is private for now because it does not really fit the WebSocket API, but if we put it in the
   * `write()` method then the message would not be buffered by the Socket.IO client.
   *
   * @return {boolean}
   * @private
   */
  /* private */
  _hasPingExpired() {
    if (!this._pingTimeoutTime)
      return !0;
    const e = Date.now() > this._pingTimeoutTime;
    return e && (this._pingTimeoutTime = 0, le(() => {
      this._onClose("ping timeout");
    }, this.setTimeoutFn)), e;
  }
  /**
   * Sends a message.
   *
   * @param {String} msg - message.
   * @param {Object} options.
   * @param {Function} fn - callback function.
   * @return {Socket} for chaining.
   */
  write(e, t, s) {
    return this._sendPacket("message", e, t, s), this;
  }
  /**
   * Sends a message. Alias of {@link Socket#write}.
   *
   * @param {String} msg - message.
   * @param {Object} options.
   * @param {Function} fn - callback function.
   * @return {Socket} for chaining.
   */
  send(e, t, s) {
    return this._sendPacket("message", e, t, s), this;
  }
  /**
   * Sends a packet.
   *
   * @param {String} type: packet type.
   * @param {String} data.
   * @param {Object} options.
   * @param {Function} fn - callback function.
   * @private
   */
  _sendPacket(e, t, s, i) {
    if (typeof t == "function" && (i = t, t = void 0), typeof s == "function" && (i = s, s = null), this.readyState === "closing" || this.readyState === "closed")
      return;
    s = s || {}, s.compress = s.compress !== !1;
    const r = {
      type: e,
      data: t,
      options: s
    };
    this.emitReserved("packetCreate", r), this.writeBuffer.push(r), i && this.once("flush", i), this.flush();
  }
  /**
   * Closes the connection.
   */
  close() {
    const e = () => {
      this._onClose("forced close"), this.transport.close();
    }, t = () => {
      this.off("upgrade", t), this.off("upgradeError", t), e();
    }, s = () => {
      this.once("upgrade", t), this.once("upgradeError", t);
    };
    return (this.readyState === "opening" || this.readyState === "open") && (this.readyState = "closing", this.writeBuffer.length ? this.once("drain", () => {
      this.upgrading ? s() : e();
    }) : this.upgrading ? s() : e()), this;
  }
  /**
   * Called upon transport error
   *
   * @private
   */
  _onError(e) {
    if (L.priorWebsocketSuccess = !1, this.opts.tryAllTransports && this.transports.length > 1 && this.readyState === "opening")
      return this.transports.shift(), this._open();
    this.emitReserved("error", e), this._onClose("transport error", e);
  }
  /**
   * Called upon transport close.
   *
   * @private
   */
  _onClose(e, t) {
    if (this.readyState === "opening" || this.readyState === "open" || this.readyState === "closing") {
      if (this.clearTimeoutFn(this._pingTimeoutTimer), this.transport.removeAllListeners("close"), this.transport.close(), this.transport.removeAllListeners(), Ee && (this._beforeunloadEventListener && removeEventListener("beforeunload", this._beforeunloadEventListener, !1), this._offlineEventListener)) {
        const s = ne.indexOf(this._offlineEventListener);
        s !== -1 && ne.splice(s, 1);
      }
      this.readyState = "closed", this.id = null, this.emitReserved("close", e, t), this.writeBuffer = [], this._prevBufferLen = 0;
    }
  }
}
L.protocol = Et;
class Sn extends L {
  constructor() {
    super(...arguments), this._upgrades = [];
  }
  onOpen() {
    if (super.onOpen(), this.readyState === "open" && this.opts.upgrade)
      for (let e = 0; e < this._upgrades.length; e++)
        this._probe(this._upgrades[e]);
  }
  /**
   * Probes a transport.
   *
   * @param {String} name - transport name
   * @private
   */
  _probe(e) {
    let t = this.createTransport(e), s = !1;
    L.priorWebsocketSuccess = !1;
    const i = () => {
      s || (t.send([{ type: "ping", data: "probe" }]), t.once("packet", (c) => {
        if (!s)
          if (c.type === "pong" && c.data === "probe") {
            if (this.upgrading = !0, this.emitReserved("upgrading", t), !t)
              return;
            L.priorWebsocketSuccess = t.name === "websocket", this.transport.pause(() => {
              s || this.readyState !== "closed" && (u(), this.setTransport(t), t.send([{ type: "upgrade" }]), this.emitReserved("upgrade", t), t = null, this.upgrading = !1, this.flush());
            });
          } else {
            const p = new Error("probe error");
            p.transport = t.name, this.emitReserved("upgradeError", p);
          }
      }));
    };
    function r() {
      s || (s = !0, u(), t.close(), t = null);
    }
    const o = (c) => {
      const p = new Error("probe error: " + c);
      p.transport = t.name, r(), this.emitReserved("upgradeError", p);
    };
    function a() {
      o("transport closed");
    }
    function h() {
      o("socket closed");
    }
    function l(c) {
      t && c.name !== t.name && r();
    }
    const u = () => {
      t.removeListener("open", i), t.removeListener("error", o), t.removeListener("close", a), this.off("close", h), this.off("upgrading", l);
    };
    t.once("open", i), t.once("error", o), t.once("close", a), this.once("close", h), this.once("upgrading", l), this._upgrades.indexOf("webtransport") !== -1 && e !== "webtransport" ? this.setTimeoutFn(() => {
      s || t.open();
    }, 200) : t.open();
  }
  onHandshake(e) {
    this._upgrades = this._filterUpgrades(e.upgrades), super.onHandshake(e);
  }
  /**
   * Filters upgrades, returning only those matching client transports.
   *
   * @param {Array} upgrades - server upgrades
   * @private
   */
  _filterUpgrades(e) {
    const t = [];
    for (let s = 0; s < e.length; s++)
      ~this.transports.indexOf(e[s]) && t.push(e[s]);
    return t;
  }
}
let xn = class extends Sn {
  constructor(e, t = {}) {
    const s = typeof e == "object" ? e : t;
    (!s.transports || s.transports && typeof s.transports[0] == "string") && (s.transports = (s.transports || ["polling", "websocket", "webtransport"]).map((i) => wn[i]).filter((i) => !!i)), super(e, s);
  }
};
function Nn(n, e = "", t) {
  let s = n;
  t = t || typeof location < "u" && location, n == null && (n = t.protocol + "//" + t.host), typeof n == "string" && (n.charAt(0) === "/" && (n.charAt(1) === "/" ? n = t.protocol + n : n = t.host + n), /^(https?|wss?):\/\//.test(n) || (typeof t < "u" ? n = t.protocol + "//" + n : n = "https://" + n), s = ke(n)), s.port || (/^(http|ws)$/.test(s.protocol) ? s.port = "80" : /^(http|ws)s$/.test(s.protocol) && (s.port = "443")), s.path = s.path || "/";
  const r = s.host.indexOf(":") !== -1 ? "[" + s.host + "]" : s.host;
  return s.id = s.protocol + "://" + r + ":" + s.port + e, s.href = s.protocol + "://" + r + (t && t.port === s.port ? "" : ":" + s.port), s;
}
const Cn = typeof ArrayBuffer == "function", Rn = (n) => typeof ArrayBuffer.isView == "function" ? ArrayBuffer.isView(n) : n.buffer instanceof ArrayBuffer, Ct = Object.prototype.toString, On = typeof Blob == "function" || typeof Blob < "u" && Ct.call(Blob) === "[object BlobConstructor]", Bn = typeof File == "function" || typeof File < "u" && Ct.call(File) === "[object FileConstructor]";
function qe(n) {
  return Cn && (n instanceof ArrayBuffer || Rn(n)) || On && n instanceof Blob || Bn && n instanceof File;
}
function se(n, e) {
  if (!n || typeof n != "object")
    return !1;
  if (Array.isArray(n)) {
    for (let t = 0, s = n.length; t < s; t++)
      if (se(n[t]))
        return !0;
    return !1;
  }
  if (qe(n))
    return !0;
  if (n.toJSON && typeof n.toJSON == "function" && arguments.length === 1)
    return se(n.toJSON(), !0);
  for (const t in n)
    if (Object.prototype.hasOwnProperty.call(n, t) && se(n[t]))
      return !0;
  return !1;
}
function Ln(n) {
  const e = [], t = n.data, s = n;
  return s.data = Ae(t, e), s.attachments = e.length, { packet: s, buffers: e };
}
function Ae(n, e) {
  if (!n)
    return n;
  if (qe(n)) {
    const t = { _placeholder: !0, num: e.length };
    return e.push(n), t;
  } else if (Array.isArray(n)) {
    const t = new Array(n.length);
    for (let s = 0; s < n.length; s++)
      t[s] = Ae(n[s], e);
    return t;
  } else if (typeof n == "object" && !(n instanceof Date)) {
    const t = {};
    for (const s in n)
      Object.prototype.hasOwnProperty.call(n, s) && (t[s] = Ae(n[s], e));
    return t;
  }
  return n;
}
function Pn(n, e) {
  return n.data = Te(n.data, e), delete n.attachments, n;
}
function Te(n, e) {
  if (!n)
    return n;
  if (n && n._placeholder === !0) {
    if (typeof n.num == "number" && n.num >= 0 && n.num < e.length)
      return e[n.num];
    throw new Error("illegal attachments");
  } else if (Array.isArray(n))
    for (let t = 0; t < n.length; t++)
      n[t] = Te(n[t], e);
  else if (typeof n == "object")
    for (const t in n)
      Object.prototype.hasOwnProperty.call(n, t) && (n[t] = Te(n[t], e));
  return n;
}
const Dn = [
  "connect",
  "connect_error",
  "disconnect",
  "disconnecting",
  "newListener",
  "removeListener"
  // used by the Node.js EventEmitter
], qn = 5;
var m;
(function(n) {
  n[n.CONNECT = 0] = "CONNECT", n[n.DISCONNECT = 1] = "DISCONNECT", n[n.EVENT = 2] = "EVENT", n[n.ACK = 3] = "ACK", n[n.CONNECT_ERROR = 4] = "CONNECT_ERROR", n[n.BINARY_EVENT = 5] = "BINARY_EVENT", n[n.BINARY_ACK = 6] = "BINARY_ACK";
})(m || (m = {}));
class Un {
  /**
   * Encoder constructor
   *
   * @param {function} replacer - custom replacer to pass down to JSON.parse
   */
  constructor(e) {
    this.replacer = e;
  }
  /**
   * Encode a packet as a single string if non-binary, or as a
   * buffer sequence, depending on packet type.
   *
   * @param {Object} obj - packet object
   */
  encode(e) {
    return (e.type === m.EVENT || e.type === m.ACK) && se(e) ? this.encodeAsBinary({
      type: e.type === m.EVENT ? m.BINARY_EVENT : m.BINARY_ACK,
      nsp: e.nsp,
      data: e.data,
      id: e.id
    }) : [this.encodeAsString(e)];
  }
  /**
   * Encode packet as string.
   */
  encodeAsString(e) {
    let t = "" + e.type;
    return (e.type === m.BINARY_EVENT || e.type === m.BINARY_ACK) && (t += e.attachments + "-"), e.nsp && e.nsp !== "/" && (t += e.nsp + ","), e.id != null && (t += e.id), e.data != null && (t += JSON.stringify(e.data, this.replacer)), t;
  }
  /**
   * Encode packet as 'buffer sequence' by removing blobs, and
   * deconstructing packet into object with placeholders and
   * a list of buffers.
   */
  encodeAsBinary(e) {
    const t = Ln(e), s = this.encodeAsString(t.packet), i = t.buffers;
    return i.unshift(s), i;
  }
}
function nt(n) {
  return Object.prototype.toString.call(n) === "[object Object]";
}
class Ue extends k {
  /**
   * Decoder constructor
   *
   * @param {function} reviver - custom reviver to pass down to JSON.stringify
   */
  constructor(e) {
    super(), this.reviver = e;
  }
  /**
   * Decodes an encoded packet string into packet JSON.
   *
   * @param {String} obj - encoded packet
   */
  add(e) {
    let t;
    if (typeof e == "string") {
      if (this.reconstructor)
        throw new Error("got plaintext data when reconstructing a packet");
      t = this.decodeString(e);
      const s = t.type === m.BINARY_EVENT;
      s || t.type === m.BINARY_ACK ? (t.type = s ? m.EVENT : m.ACK, this.reconstructor = new Hn(t), t.attachments === 0 && super.emitReserved("decoded", t)) : super.emitReserved("decoded", t);
    } else if (qe(e) || e.base64)
      if (this.reconstructor)
        t = this.reconstructor.takeBinaryData(e), t && (this.reconstructor = null, super.emitReserved("decoded", t));
      else
        throw new Error("got binary data when not reconstructing a packet");
    else
      throw new Error("Unknown type: " + e);
  }
  /**
   * Decode a packet String (JSON data)
   *
   * @param {String} str
   * @return {Object} packet
   */
  decodeString(e) {
    let t = 0;
    const s = {
      type: Number(e.charAt(0))
    };
    if (m[s.type] === void 0)
      throw new Error("unknown packet type " + s.type);
    if (s.type === m.BINARY_EVENT || s.type === m.BINARY_ACK) {
      const r = t + 1;
      for (; e.charAt(++t) !== "-" && t != e.length; )
        ;
      const o = e.substring(r, t);
      if (o != Number(o) || e.charAt(t) !== "-")
        throw new Error("Illegal attachments");
      s.attachments = Number(o);
    }
    if (e.charAt(t + 1) === "/") {
      const r = t + 1;
      for (; ++t && !(e.charAt(t) === "," || t === e.length); )
        ;
      s.nsp = e.substring(r, t);
    } else
      s.nsp = "/";
    const i = e.charAt(t + 1);
    if (i !== "" && Number(i) == i) {
      const r = t + 1;
      for (; ++t; ) {
        const o = e.charAt(t);
        if (o == null || Number(o) != o) {
          --t;
          break;
        }
        if (t === e.length)
          break;
      }
      s.id = Number(e.substring(r, t + 1));
    }
    if (e.charAt(++t)) {
      const r = this.tryParse(e.substr(t));
      if (Ue.isPayloadValid(s.type, r))
        s.data = r;
      else
        throw new Error("invalid payload");
    }
    return s;
  }
  tryParse(e) {
    try {
      return JSON.parse(e, this.reviver);
    } catch {
      return !1;
    }
  }
  static isPayloadValid(e, t) {
    switch (e) {
      case m.CONNECT:
        return nt(t);
      case m.DISCONNECT:
        return t === void 0;
      case m.CONNECT_ERROR:
        return typeof t == "string" || nt(t);
      case m.EVENT:
      case m.BINARY_EVENT:
        return Array.isArray(t) && (typeof t[0] == "number" || typeof t[0] == "string" && Dn.indexOf(t[0]) === -1);
      case m.ACK:
      case m.BINARY_ACK:
        return Array.isArray(t);
    }
  }
  /**
   * Deallocates a parser's resources
   */
  destroy() {
    this.reconstructor && (this.reconstructor.finishedReconstruction(), this.reconstructor = null);
  }
}
class Hn {
  constructor(e) {
    this.packet = e, this.buffers = [], this.reconPack = e;
  }
  /**
   * Method to be called when binary data received from connection
   * after a BINARY_EVENT packet.
   *
   * @param {Buffer | ArrayBuffer} binData - the raw binary data received
   * @return {null | Object} returns null if more binary data is expected or
   *   a reconstructed packet object if all buffers have been received.
   */
  takeBinaryData(e) {
    if (this.buffers.push(e), this.buffers.length === this.reconPack.attachments) {
      const t = Pn(this.reconPack, this.buffers);
      return this.finishedReconstruction(), t;
    }
    return null;
  }
  /**
   * Cleans up binary packet reconstruction variables.
   */
  finishedReconstruction() {
    this.reconPack = null, this.buffers = [];
  }
}
const In = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Decoder: Ue,
  Encoder: Un,
  get PacketType() {
    return m;
  },
  protocol: qn
}, Symbol.toStringTag, { value: "Module" }));
function x(n, e, t) {
  return n.on(e, t), function() {
    n.off(e, t);
  };
}
const Mn = Object.freeze({
  connect: 1,
  connect_error: 1,
  disconnect: 1,
  disconnecting: 1,
  // EventEmitter reserved events: https://nodejs.org/api/events.html#events_event_newlistener
  newListener: 1,
  removeListener: 1
});
class Rt extends k {
  /**
   * `Socket` constructor.
   */
  constructor(e, t, s) {
    super(), this.connected = !1, this.recovered = !1, this.receiveBuffer = [], this.sendBuffer = [], this._queue = [], this._queueSeq = 0, this.ids = 0, this.acks = {}, this.flags = {}, this.io = e, this.nsp = t, s && s.auth && (this.auth = s.auth), this._opts = Object.assign({}, s), this.io._autoConnect && this.open();
  }
  /**
   * Whether the socket is currently disconnected
   *
   * @example
   * const socket = io();
   *
   * socket.on("connect", () => {
   *   console.log(socket.disconnected); // false
   * });
   *
   * socket.on("disconnect", () => {
   *   console.log(socket.disconnected); // true
   * });
   */
  get disconnected() {
    return !this.connected;
  }
  /**
   * Subscribe to open, close and packet events
   *
   * @private
   */
  subEvents() {
    if (this.subs)
      return;
    const e = this.io;
    this.subs = [
      x(e, "open", this.onopen.bind(this)),
      x(e, "packet", this.onpacket.bind(this)),
      x(e, "error", this.onerror.bind(this)),
      x(e, "close", this.onclose.bind(this))
    ];
  }
  /**
   * Whether the Socket will try to reconnect when its Manager connects or reconnects.
   *
   * @example
   * const socket = io();
   *
   * console.log(socket.active); // true
   *
   * socket.on("disconnect", (reason) => {
   *   if (reason === "io server disconnect") {
   *     // the disconnection was initiated by the server, you need to manually reconnect
   *     console.log(socket.active); // false
   *   }
   *   // else the socket will automatically try to reconnect
   *   console.log(socket.active); // true
   * });
   */
  get active() {
    return !!this.subs;
  }
  /**
   * "Opens" the socket.
   *
   * @example
   * const socket = io({
   *   autoConnect: false
   * });
   *
   * socket.connect();
   */
  connect() {
    return this.connected ? this : (this.subEvents(), this.io._reconnecting || this.io.open(), this.io._readyState === "open" && this.onopen(), this);
  }
  /**
   * Alias for {@link connect()}.
   */
  open() {
    return this.connect();
  }
  /**
   * Sends a `message` event.
   *
   * This method mimics the WebSocket.send() method.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/send
   *
   * @example
   * socket.send("hello");
   *
   * // this is equivalent to
   * socket.emit("message", "hello");
   *
   * @return self
   */
  send(...e) {
    return e.unshift("message"), this.emit.apply(this, e), this;
  }
  /**
   * Override `emit`.
   * If the event is in `events`, it's emitted normally.
   *
   * @example
   * socket.emit("hello", "world");
   *
   * // all serializable datastructures are supported (no need to call JSON.stringify)
   * socket.emit("hello", 1, "2", { 3: ["4"], 5: Uint8Array.from([6]) });
   *
   * // with an acknowledgement from the server
   * socket.emit("hello", "world", (val) => {
   *   // ...
   * });
   *
   * @return self
   */
  emit(e, ...t) {
    var s, i, r;
    if (Mn.hasOwnProperty(e))
      throw new Error('"' + e.toString() + '" is a reserved event name');
    if (t.unshift(e), this._opts.retries && !this.flags.fromQueue && !this.flags.volatile)
      return this._addToQueue(t), this;
    const o = {
      type: m.EVENT,
      data: t
    };
    if (o.options = {}, o.options.compress = this.flags.compress !== !1, typeof t[t.length - 1] == "function") {
      const u = this.ids++, c = t.pop();
      this._registerAckCallback(u, c), o.id = u;
    }
    const a = (i = (s = this.io.engine) === null || s === void 0 ? void 0 : s.transport) === null || i === void 0 ? void 0 : i.writable, h = this.connected && !(!((r = this.io.engine) === null || r === void 0) && r._hasPingExpired());
    return this.flags.volatile && !a || (h ? (this.notifyOutgoingListeners(o), this.packet(o)) : this.sendBuffer.push(o)), this.flags = {}, this;
  }
  /**
   * @private
   */
  _registerAckCallback(e, t) {
    var s;
    const i = (s = this.flags.timeout) !== null && s !== void 0 ? s : this._opts.ackTimeout;
    if (i === void 0) {
      this.acks[e] = t;
      return;
    }
    const r = this.io.setTimeoutFn(() => {
      delete this.acks[e];
      for (let a = 0; a < this.sendBuffer.length; a++)
        this.sendBuffer[a].id === e && this.sendBuffer.splice(a, 1);
      t.call(this, new Error("operation has timed out"));
    }, i), o = (...a) => {
      this.io.clearTimeoutFn(r), t.apply(this, a);
    };
    o.withError = !0, this.acks[e] = o;
  }
  /**
   * Emits an event and waits for an acknowledgement
   *
   * @example
   * // without timeout
   * const response = await socket.emitWithAck("hello", "world");
   *
   * // with a specific timeout
   * try {
   *   const response = await socket.timeout(1000).emitWithAck("hello", "world");
   * } catch (err) {
   *   // the server did not acknowledge the event in the given delay
   * }
   *
   * @return a Promise that will be fulfilled when the server acknowledges the event
   */
  emitWithAck(e, ...t) {
    return new Promise((s, i) => {
      const r = (o, a) => o ? i(o) : s(a);
      r.withError = !0, t.push(r), this.emit(e, ...t);
    });
  }
  /**
   * Add the packet to the queue.
   * @param args
   * @private
   */
  _addToQueue(e) {
    let t;
    typeof e[e.length - 1] == "function" && (t = e.pop());
    const s = {
      id: this._queueSeq++,
      tryCount: 0,
      pending: !1,
      args: e,
      flags: Object.assign({ fromQueue: !0 }, this.flags)
    };
    e.push((i, ...r) => s !== this._queue[0] ? void 0 : (i !== null ? s.tryCount > this._opts.retries && (this._queue.shift(), t && t(i)) : (this._queue.shift(), t && t(null, ...r)), s.pending = !1, this._drainQueue())), this._queue.push(s), this._drainQueue();
  }
  /**
   * Send the first packet of the queue, and wait for an acknowledgement from the server.
   * @param force - whether to resend a packet that has not been acknowledged yet
   *
   * @private
   */
  _drainQueue(e = !1) {
    if (!this.connected || this._queue.length === 0)
      return;
    const t = this._queue[0];
    t.pending && !e || (t.pending = !0, t.tryCount++, this.flags = t.flags, this.emit.apply(this, t.args));
  }
  /**
   * Sends a packet.
   *
   * @param packet
   * @private
   */
  packet(e) {
    e.nsp = this.nsp, this.io._packet(e);
  }
  /**
   * Called upon engine `open`.
   *
   * @private
   */
  onopen() {
    typeof this.auth == "function" ? this.auth((e) => {
      this._sendConnectPacket(e);
    }) : this._sendConnectPacket(this.auth);
  }
  /**
   * Sends a CONNECT packet to initiate the Socket.IO session.
   *
   * @param data
   * @private
   */
  _sendConnectPacket(e) {
    this.packet({
      type: m.CONNECT,
      data: this._pid ? Object.assign({ pid: this._pid, offset: this._lastOffset }, e) : e
    });
  }
  /**
   * Called upon engine or manager `error`.
   *
   * @param err
   * @private
   */
  onerror(e) {
    this.connected || this.emitReserved("connect_error", e);
  }
  /**
   * Called upon engine `close`.
   *
   * @param reason
   * @param description
   * @private
   */
  onclose(e, t) {
    this.connected = !1, delete this.id, this.emitReserved("disconnect", e, t), this._clearAcks();
  }
  /**
   * Clears the acknowledgement handlers upon disconnection, since the client will never receive an acknowledgement from
   * the server.
   *
   * @private
   */
  _clearAcks() {
    Object.keys(this.acks).forEach((e) => {
      if (!this.sendBuffer.some((s) => String(s.id) === e)) {
        const s = this.acks[e];
        delete this.acks[e], s.withError && s.call(this, new Error("socket has been disconnected"));
      }
    });
  }
  /**
   * Called with socket packet.
   *
   * @param packet
   * @private
   */
  onpacket(e) {
    if (e.nsp === this.nsp)
      switch (e.type) {
        case m.CONNECT:
          e.data && e.data.sid ? this.onconnect(e.data.sid, e.data.pid) : this.emitReserved("connect_error", new Error("It seems you are trying to reach a Socket.IO server in v2.x with a v3.x client, but they are not compatible (more information here: https://socket.io/docs/v3/migrating-from-2-x-to-3-0/)"));
          break;
        case m.EVENT:
        case m.BINARY_EVENT:
          this.onevent(e);
          break;
        case m.ACK:
        case m.BINARY_ACK:
          this.onack(e);
          break;
        case m.DISCONNECT:
          this.ondisconnect();
          break;
        case m.CONNECT_ERROR:
          this.destroy();
          const s = new Error(e.data.message);
          s.data = e.data.data, this.emitReserved("connect_error", s);
          break;
      }
  }
  /**
   * Called upon a server event.
   *
   * @param packet
   * @private
   */
  onevent(e) {
    const t = e.data || [];
    e.id != null && t.push(this.ack(e.id)), this.connected ? this.emitEvent(t) : this.receiveBuffer.push(Object.freeze(t));
  }
  emitEvent(e) {
    if (this._anyListeners && this._anyListeners.length) {
      const t = this._anyListeners.slice();
      for (const s of t)
        s.apply(this, e);
    }
    super.emit.apply(this, e), this._pid && e.length && typeof e[e.length - 1] == "string" && (this._lastOffset = e[e.length - 1]);
  }
  /**
   * Produces an ack callback to emit with an event.
   *
   * @private
   */
  ack(e) {
    const t = this;
    let s = !1;
    return function(...i) {
      s || (s = !0, t.packet({
        type: m.ACK,
        id: e,
        data: i
      }));
    };
  }
  /**
   * Called upon a server acknowledgement.
   *
   * @param packet
   * @private
   */
  onack(e) {
    const t = this.acks[e.id];
    typeof t == "function" && (delete this.acks[e.id], t.withError && e.data.unshift(null), t.apply(this, e.data));
  }
  /**
   * Called upon server connect.
   *
   * @private
   */
  onconnect(e, t) {
    this.id = e, this.recovered = t && this._pid === t, this._pid = t, this.connected = !0, this.emitBuffered(), this.emitReserved("connect"), this._drainQueue(!0);
  }
  /**
   * Emit buffered events (received and emitted).
   *
   * @private
   */
  emitBuffered() {
    this.receiveBuffer.forEach((e) => this.emitEvent(e)), this.receiveBuffer = [], this.sendBuffer.forEach((e) => {
      this.notifyOutgoingListeners(e), this.packet(e);
    }), this.sendBuffer = [];
  }
  /**
   * Called upon server disconnect.
   *
   * @private
   */
  ondisconnect() {
    this.destroy(), this.onclose("io server disconnect");
  }
  /**
   * Called upon forced client/server side disconnections,
   * this method ensures the manager stops tracking us and
   * that reconnections don't get triggered for this.
   *
   * @private
   */
  destroy() {
    this.subs && (this.subs.forEach((e) => e()), this.subs = void 0), this.io._destroy(this);
  }
  /**
   * Disconnects the socket manually. In that case, the socket will not try to reconnect.
   *
   * If this is the last active Socket instance of the {@link Manager}, the low-level connection will be closed.
   *
   * @example
   * const socket = io();
   *
   * socket.on("disconnect", (reason) => {
   *   // console.log(reason); prints "io client disconnect"
   * });
   *
   * socket.disconnect();
   *
   * @return self
   */
  disconnect() {
    return this.connected && this.packet({ type: m.DISCONNECT }), this.destroy(), this.connected && this.onclose("io client disconnect"), this;
  }
  /**
   * Alias for {@link disconnect()}.
   *
   * @return self
   */
  close() {
    return this.disconnect();
  }
  /**
   * Sets the compress flag.
   *
   * @example
   * socket.compress(false).emit("hello");
   *
   * @param compress - if `true`, compresses the sending data
   * @return self
   */
  compress(e) {
    return this.flags.compress = e, this;
  }
  /**
   * Sets a modifier for a subsequent event emission that the event message will be dropped when this socket is not
   * ready to send messages.
   *
   * @example
   * socket.volatile.emit("hello"); // the server may or may not receive it
   *
   * @returns self
   */
  get volatile() {
    return this.flags.volatile = !0, this;
  }
  /**
   * Sets a modifier for a subsequent event emission that the callback will be called with an error when the
   * given number of milliseconds have elapsed without an acknowledgement from the server:
   *
   * @example
   * socket.timeout(5000).emit("my-event", (err) => {
   *   if (err) {
   *     // the server did not acknowledge the event in the given delay
   *   }
   * });
   *
   * @returns self
   */
  timeout(e) {
    return this.flags.timeout = e, this;
  }
  /**
   * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
   * callback.
   *
   * @example
   * socket.onAny((event, ...args) => {
   *   console.log(`got ${event}`);
   * });
   *
   * @param listener
   */
  onAny(e) {
    return this._anyListeners = this._anyListeners || [], this._anyListeners.push(e), this;
  }
  /**
   * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
   * callback. The listener is added to the beginning of the listeners array.
   *
   * @example
   * socket.prependAny((event, ...args) => {
   *   console.log(`got event ${event}`);
   * });
   *
   * @param listener
   */
  prependAny(e) {
    return this._anyListeners = this._anyListeners || [], this._anyListeners.unshift(e), this;
  }
  /**
   * Removes the listener that will be fired when any event is emitted.
   *
   * @example
   * const catchAllListener = (event, ...args) => {
   *   console.log(`got event ${event}`);
   * }
   *
   * socket.onAny(catchAllListener);
   *
   * // remove a specific listener
   * socket.offAny(catchAllListener);
   *
   * // or remove all listeners
   * socket.offAny();
   *
   * @param listener
   */
  offAny(e) {
    if (!this._anyListeners)
      return this;
    if (e) {
      const t = this._anyListeners;
      for (let s = 0; s < t.length; s++)
        if (e === t[s])
          return t.splice(s, 1), this;
    } else
      this._anyListeners = [];
    return this;
  }
  /**
   * Returns an array of listeners that are listening for any event that is specified. This array can be manipulated,
   * e.g. to remove listeners.
   */
  listenersAny() {
    return this._anyListeners || [];
  }
  /**
   * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
   * callback.
   *
   * Note: acknowledgements sent to the server are not included.
   *
   * @example
   * socket.onAnyOutgoing((event, ...args) => {
   *   console.log(`sent event ${event}`);
   * });
   *
   * @param listener
   */
  onAnyOutgoing(e) {
    return this._anyOutgoingListeners = this._anyOutgoingListeners || [], this._anyOutgoingListeners.push(e), this;
  }
  /**
   * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
   * callback. The listener is added to the beginning of the listeners array.
   *
   * Note: acknowledgements sent to the server are not included.
   *
   * @example
   * socket.prependAnyOutgoing((event, ...args) => {
   *   console.log(`sent event ${event}`);
   * });
   *
   * @param listener
   */
  prependAnyOutgoing(e) {
    return this._anyOutgoingListeners = this._anyOutgoingListeners || [], this._anyOutgoingListeners.unshift(e), this;
  }
  /**
   * Removes the listener that will be fired when any event is emitted.
   *
   * @example
   * const catchAllListener = (event, ...args) => {
   *   console.log(`sent event ${event}`);
   * }
   *
   * socket.onAnyOutgoing(catchAllListener);
   *
   * // remove a specific listener
   * socket.offAnyOutgoing(catchAllListener);
   *
   * // or remove all listeners
   * socket.offAnyOutgoing();
   *
   * @param [listener] - the catch-all listener (optional)
   */
  offAnyOutgoing(e) {
    if (!this._anyOutgoingListeners)
      return this;
    if (e) {
      const t = this._anyOutgoingListeners;
      for (let s = 0; s < t.length; s++)
        if (e === t[s])
          return t.splice(s, 1), this;
    } else
      this._anyOutgoingListeners = [];
    return this;
  }
  /**
   * Returns an array of listeners that are listening for any event that is specified. This array can be manipulated,
   * e.g. to remove listeners.
   */
  listenersAnyOutgoing() {
    return this._anyOutgoingListeners || [];
  }
  /**
   * Notify the listeners for each packet sent
   *
   * @param packet
   *
   * @private
   */
  notifyOutgoingListeners(e) {
    if (this._anyOutgoingListeners && this._anyOutgoingListeners.length) {
      const t = this._anyOutgoingListeners.slice();
      for (const s of t)
        s.apply(this, e.data);
    }
  }
}
function U(n) {
  n = n || {}, this.ms = n.min || 100, this.max = n.max || 1e4, this.factor = n.factor || 2, this.jitter = n.jitter > 0 && n.jitter <= 1 ? n.jitter : 0, this.attempts = 0;
}
U.prototype.duration = function() {
  var n = this.ms * Math.pow(this.factor, this.attempts++);
  if (this.jitter) {
    var e = Math.random(), t = Math.floor(e * this.jitter * n);
    n = Math.floor(e * 10) & 1 ? n + t : n - t;
  }
  return Math.min(n, this.max) | 0;
};
U.prototype.reset = function() {
  this.attempts = 0;
};
U.prototype.setMin = function(n) {
  this.ms = n;
};
U.prototype.setMax = function(n) {
  this.max = n;
};
U.prototype.setJitter = function(n) {
  this.jitter = n;
};
class Se extends k {
  constructor(e, t) {
    var s;
    super(), this.nsps = {}, this.subs = [], e && typeof e == "object" && (t = e, e = void 0), t = t || {}, t.path = t.path || "/socket.io", this.opts = t, ue(this, t), this.reconnection(t.reconnection !== !1), this.reconnectionAttempts(t.reconnectionAttempts || 1 / 0), this.reconnectionDelay(t.reconnectionDelay || 1e3), this.reconnectionDelayMax(t.reconnectionDelayMax || 5e3), this.randomizationFactor((s = t.randomizationFactor) !== null && s !== void 0 ? s : 0.5), this.backoff = new U({
      min: this.reconnectionDelay(),
      max: this.reconnectionDelayMax(),
      jitter: this.randomizationFactor()
    }), this.timeout(t.timeout == null ? 2e4 : t.timeout), this._readyState = "closed", this.uri = e;
    const i = t.parser || In;
    this.encoder = new i.Encoder(), this.decoder = new i.Decoder(), this._autoConnect = t.autoConnect !== !1, this._autoConnect && this.open();
  }
  reconnection(e) {
    return arguments.length ? (this._reconnection = !!e, e || (this.skipReconnect = !0), this) : this._reconnection;
  }
  reconnectionAttempts(e) {
    return e === void 0 ? this._reconnectionAttempts : (this._reconnectionAttempts = e, this);
  }
  reconnectionDelay(e) {
    var t;
    return e === void 0 ? this._reconnectionDelay : (this._reconnectionDelay = e, (t = this.backoff) === null || t === void 0 || t.setMin(e), this);
  }
  randomizationFactor(e) {
    var t;
    return e === void 0 ? this._randomizationFactor : (this._randomizationFactor = e, (t = this.backoff) === null || t === void 0 || t.setJitter(e), this);
  }
  reconnectionDelayMax(e) {
    var t;
    return e === void 0 ? this._reconnectionDelayMax : (this._reconnectionDelayMax = e, (t = this.backoff) === null || t === void 0 || t.setMax(e), this);
  }
  timeout(e) {
    return arguments.length ? (this._timeout = e, this) : this._timeout;
  }
  /**
   * Starts trying to reconnect if reconnection is enabled and we have not
   * started reconnecting yet
   *
   * @private
   */
  maybeReconnectOnOpen() {
    !this._reconnecting && this._reconnection && this.backoff.attempts === 0 && this.reconnect();
  }
  /**
   * Sets the current transport `socket`.
   *
   * @param {Function} fn - optional, callback
   * @return self
   * @public
   */
  open(e) {
    if (~this._readyState.indexOf("open"))
      return this;
    this.engine = new xn(this.uri, this.opts);
    const t = this.engine, s = this;
    this._readyState = "opening", this.skipReconnect = !1;
    const i = x(t, "open", function() {
      s.onopen(), e && e();
    }), r = (a) => {
      this.cleanup(), this._readyState = "closed", this.emitReserved("error", a), e ? e(a) : this.maybeReconnectOnOpen();
    }, o = x(t, "error", r);
    if (this._timeout !== !1) {
      const a = this._timeout, h = this.setTimeoutFn(() => {
        i(), r(new Error("timeout")), t.close();
      }, a);
      this.opts.autoUnref && h.unref(), this.subs.push(() => {
        this.clearTimeoutFn(h);
      });
    }
    return this.subs.push(i), this.subs.push(o), this;
  }
  /**
   * Alias for open()
   *
   * @return self
   * @public
   */
  connect(e) {
    return this.open(e);
  }
  /**
   * Called upon transport open.
   *
   * @private
   */
  onopen() {
    this.cleanup(), this._readyState = "open", this.emitReserved("open");
    const e = this.engine;
    this.subs.push(
      x(e, "ping", this.onping.bind(this)),
      x(e, "data", this.ondata.bind(this)),
      x(e, "error", this.onerror.bind(this)),
      x(e, "close", this.onclose.bind(this)),
      // @ts-ignore
      x(this.decoder, "decoded", this.ondecoded.bind(this))
    );
  }
  /**
   * Called upon a ping.
   *
   * @private
   */
  onping() {
    this.emitReserved("ping");
  }
  /**
   * Called with data.
   *
   * @private
   */
  ondata(e) {
    try {
      this.decoder.add(e);
    } catch (t) {
      this.onclose("parse error", t);
    }
  }
  /**
   * Called when parser fully decodes a packet.
   *
   * @private
   */
  ondecoded(e) {
    le(() => {
      this.emitReserved("packet", e);
    }, this.setTimeoutFn);
  }
  /**
   * Called upon socket error.
   *
   * @private
   */
  onerror(e) {
    this.emitReserved("error", e);
  }
  /**
   * Creates a new socket for the given `nsp`.
   *
   * @return {Socket}
   * @public
   */
  socket(e, t) {
    let s = this.nsps[e];
    return s ? this._autoConnect && !s.active && s.connect() : (s = new Rt(this, e, t), this.nsps[e] = s), s;
  }
  /**
   * Called upon a socket close.
   *
   * @param socket
   * @private
   */
  _destroy(e) {
    const t = Object.keys(this.nsps);
    for (const s of t)
      if (this.nsps[s].active)
        return;
    this._close();
  }
  /**
   * Writes a packet.
   *
   * @param packet
   * @private
   */
  _packet(e) {
    const t = this.encoder.encode(e);
    for (let s = 0; s < t.length; s++)
      this.engine.write(t[s], e.options);
  }
  /**
   * Clean up transport subscriptions and packet buffer.
   *
   * @private
   */
  cleanup() {
    this.subs.forEach((e) => e()), this.subs.length = 0, this.decoder.destroy();
  }
  /**
   * Close the current socket.
   *
   * @private
   */
  _close() {
    this.skipReconnect = !0, this._reconnecting = !1, this.onclose("forced close");
  }
  /**
   * Alias for close()
   *
   * @private
   */
  disconnect() {
    return this._close();
  }
  /**
   * Called when:
   *
   * - the low-level engine is closed
   * - the parser encountered a badly formatted packet
   * - all sockets are disconnected
   *
   * @private
   */
  onclose(e, t) {
    var s;
    this.cleanup(), (s = this.engine) === null || s === void 0 || s.close(), this.backoff.reset(), this._readyState = "closed", this.emitReserved("close", e, t), this._reconnection && !this.skipReconnect && this.reconnect();
  }
  /**
   * Attempt a reconnection.
   *
   * @private
   */
  reconnect() {
    if (this._reconnecting || this.skipReconnect)
      return this;
    const e = this;
    if (this.backoff.attempts >= this._reconnectionAttempts)
      this.backoff.reset(), this.emitReserved("reconnect_failed"), this._reconnecting = !1;
    else {
      const t = this.backoff.duration();
      this._reconnecting = !0;
      const s = this.setTimeoutFn(() => {
        e.skipReconnect || (this.emitReserved("reconnect_attempt", e.backoff.attempts), !e.skipReconnect && e.open((i) => {
          i ? (e._reconnecting = !1, e.reconnect(), this.emitReserved("reconnect_error", i)) : e.onreconnect();
        }));
      }, t);
      this.opts.autoUnref && s.unref(), this.subs.push(() => {
        this.clearTimeoutFn(s);
      });
    }
  }
  /**
   * Called upon successful reconnect.
   *
   * @private
   */
  onreconnect() {
    const e = this.backoff.attempts;
    this._reconnecting = !1, this.backoff.reset(), this.emitReserved("reconnect", e);
  }
}
const F = {};
function ie(n, e) {
  typeof n == "object" && (e = n, n = void 0), e = e || {};
  const t = Nn(n, e.path || "/socket.io"), s = t.source, i = t.id, r = t.path, o = F[i] && r in F[i].nsps, a = e.forceNew || e["force new connection"] || e.multiplex === !1 || o;
  let h;
  return a ? h = new Se(s, e) : (F[i] || (F[i] = new Se(s, e)), h = F[i]), t.query && !e.query && (e.query = t.queryKey), h.socket(t.path, e);
}
Object.assign(ie, {
  Manager: Se,
  Socket: Rt,
  io: ie,
  connect: ie
});
class $n {
  constructor(e, t) {
    P(this, "socket", null);
    P(this, "maxReconnectAttempts", 5);
    P(this, "eventHandlers", /* @__PURE__ */ new Map());
    this.serverUrl = e, this.apiKey = t;
  }
  // 连接到服务器
  connect() {
    var e;
    if ((e = this.socket) != null && e.connected) {
      console.log("已经连接到服务器");
      return;
    }
    console.log(`🔄 正在连接到 ${this.serverUrl}`), this.socket = ie(this.serverUrl, {
      auth: {
        apiKey: this.apiKey,
        clientInfo: {
          userAgent: navigator.userAgent,
          url: window.location.href,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        }
      },
      reconnection: !0,
      reconnectionDelay: 1e3,
      reconnectionDelayMax: 5e3,
      reconnectionAttempts: this.maxReconnectAttempts,
      timeout: 1e4
    }), this.setupEventHandlers();
  }
  // 设置事件监听
  setupEventHandlers() {
    this.socket && (this.socket.on("connect", () => {
      console.log("✅ 已连接到智能助手服务器"), this.emit("status", { connected: !0 });
    }), this.socket.on("disconnect", (e) => {
      console.log("❌ 连接断开:", e), this.emit("status", { connected: !1, reason: e });
    }), this.socket.on("reconnect_attempt", (e) => {
      console.log(`🔄 重连尝试 ${e}/${this.maxReconnectAttempts}`), this.emit("reconnecting", { attempt: e, maxAttempts: this.maxReconnectAttempts });
    }), this.socket.on("reconnect", (e) => {
      console.log(`✅ 重连成功，尝试了 ${e} 次`), this.emit("reconnected", { attempt: e });
    }), this.socket.on("reconnect_failed", () => {
      console.error("❌ 重连失败，请检查网络连接"), this.emit("reconnect_failed", {});
    }), this.socket.on("connect_error", (e) => {
      console.error("❌ 连接错误:", e.message), this.emit("connect_error", { error: e.message });
    }), this.socket.on("response", (e) => {
      console.log("📥 收到服务器响应:", e), this.emit("response", e);
    }), this.socket.on("error", (e) => {
      console.error("❌ 服务器错误:", e), this.emit("error", e);
    }));
  }
  // 发送消息到服务器
  sendMessage(e, t) {
    var i;
    if (!((i = this.socket) != null && i.connected)) {
      console.error("❌ 未连接到服务器，无法发送消息"), this.emit("error", { message: "未连接到服务器" });
      return;
    }
    const s = {
      id: this.generateMessageId(),
      content: e.trim(),
      context: {
        pageUrl: window.location.href,
        pageTitle: document.title,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        ...t
      }
    };
    console.log("📤 发送消息:", s), this.socket.emit("message", s);
  }
  // 订阅事件
  on(e, t) {
    this.eventHandlers.has(e) || this.eventHandlers.set(e, []), this.eventHandlers.get(e).push(t);
  }
  // 取消订阅事件
  off(e, t) {
    if (this.eventHandlers.has(e))
      if (t) {
        const s = this.eventHandlers.get(e), i = s.indexOf(t);
        i > -1 && s.splice(i, 1);
      } else
        this.eventHandlers.delete(e);
  }
  // 触发事件
  emit(e, t) {
    (this.eventHandlers.get(e) || []).forEach((i) => {
      try {
        i(t);
      } catch (r) {
        console.error(`事件处理器错误 [${e}]:`, r);
      }
    });
  }
  // 断开连接
  disconnect() {
    this.socket && (console.log("🔌 主动断开连接"), this.socket.disconnect(), this.socket = null);
  }
  // 获取连接状态
  get isConnected() {
    var e;
    return ((e = this.socket) == null ? void 0 : e.connected) || !1;
  }
  // 生成消息ID
  generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
const A = class A {
  constructor(e) {
    P(this, "wsService");
    P(this, "container", null);
    this.config = e, this.config = {
      serverUrl: "http://localhost:3001",
      position: "bottom-right",
      theme: "auto",
      ...e
    }, this.wsService = new $n(
      this.config.serverUrl,
      this.config.apiKey
    );
  }
  // 单例模式 - 确保整个页面只有一个助手
  static init(e) {
    return A.instance ? (console.warn("WebAssistant 已经初始化过了"), A.instance) : (A.instance = new A(e), A.instance.mount(), A.instance);
  }
  // 把悬浮组件挂载到页面上
  mount() {
    this.container = document.createElement("div"), this.container.id = "web-assistant-root", this.container.style.cssText = `
      position: fixed;
      z-index: 999999;
      pointer-events: none;
    `, this.setPosition(), document.body.appendChild(this.container), Ht(
      at(zt, {
        config: this.config,
        wsService: this.wsService
      }),
      this.container
    ), console.log("✅ WebAssistant 已启动");
  }
  // 设置悬浮球位置
  setPosition() {
    if (!this.container) return;
    const t = {
      "bottom-right": { bottom: "20px", right: "20px" },
      "bottom-left": { bottom: "20px", left: "20px" },
      "top-right": { top: "20px", right: "20px" },
      "top-left": { top: "20px", left: "20px" }
    }[this.config.position];
    Object.assign(this.container.style, t);
  }
  // 销毁实例
  static destroy() {
    var e;
    (e = A.instance) != null && e.container && (A.instance.container.remove(), A.instance = null);
  }
};
P(A, "instance", null);
let xe = A;
typeof window < "u" && (window.WebAssistant = xe);
export {
  xe as WebAssistant
};
