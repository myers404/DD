var Hi = Object.defineProperty;
var qr = (t) => {
  throw TypeError(t);
};
var Yi = (t, e, r) => e in t ? Hi(t, e, { enumerable: !0, configurable: !0, writable: !0, value: r }) : t[e] = r;
var ur = (t, e, r) => Yi(t, typeof e != "symbol" ? e + "" : e, r), vr = (t, e, r) => e.has(t) || qr("Cannot " + r);
var T = (t, e, r) => (vr(t, e, "read from private field"), r ? r.call(t) : e.get(t)), ae = (t, e, r) => e.has(t) ? qr("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, r), ft = (t, e, r, i) => (vr(t, e, "write to private field"), i ? i.call(t, r) : e.set(t, r), r), ot = (t, e, r) => (vr(t, e, "access private method"), r);
var xr = Array.isArray, Qi = Array.prototype.indexOf, Sr = Array.from, Gi = Object.defineProperty, St = Object.getOwnPropertyDescriptor, Zr = Object.getOwnPropertyDescriptors, Ji = Object.prototype, Wi = Array.prototype, Er = Object.getPrototypeOf, Nr = Object.isExtensible;
const $r = () => {
};
function Ki(t) {
  return t();
}
function hr(t) {
  for (var e = 0; e < t.length; e++)
    t[e]();
}
function Xi(t, e) {
  if (Array.isArray(t))
    return t;
  if (!(Symbol.iterator in t))
    return Array.from(t);
  const r = [];
  for (const i of t)
    if (r.push(i), r.length === e) break;
  return r;
}
const Ue = 2, ei = 4, er = 8, Ir = 16, tt = 32, vt = 64, kr = 128, Le = 256, Gt = 512, Ae = 1024, et = 2048, ct = 4096, Ze = 8192, Cr = 16384, ti = 32768, tr = 65536, Zi = 1 << 19, ri = 1 << 20, pr = 1 << 21, gt = Symbol("$state"), $i = Symbol("");
function ii(t) {
  return t === this.v;
}
function en(t, e) {
  return t != t ? e == e : t !== e || t !== null && typeof t == "object" || typeof t == "function";
}
function ni(t) {
  return !en(t, this.v);
}
function tn(t) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function rn() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function nn(t) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function sn() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function an() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function on() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function ln() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
let Bt = !1;
function un() {
  Bt = !0;
}
const Dr = 1, Tr = 2, si = 4, vn = 8, cn = 16, ai = 1, dn = 2, xe = Symbol(), fn = "http://www.w3.org/1999/xhtml";
function oi(t) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
let te = null;
function Vr(t) {
  te = t;
}
function We(t, e = !1, r) {
  var i = te = {
    p: te,
    c: null,
    d: !1,
    e: null,
    m: !1,
    s: t,
    x: null,
    l: null
  };
  Bt && !e && (te.l = {
    s: null,
    u: null,
    r1: [],
    r2: It(!1)
  }), gi(() => {
    i.d = !0;
  });
}
function Ke(t) {
  const e = te;
  if (e !== null) {
    const o = e.e;
    if (o !== null) {
      var r = J, i = K;
      e.e = null;
      try {
        for (var s = 0; s < o.length; s++) {
          var n = o[s];
          nt(n.effect), Je(n.reaction), Mr(n.fn);
        }
      } finally {
        nt(r), Je(i);
      }
    }
    te = e.p, e.m = !0;
  }
  return (
    /** @type {T} */
    {}
  );
}
function Ht() {
  return !Bt || te !== null && te.l === null;
}
function Fe(t) {
  if (typeof t != "object" || t === null || gt in t)
    return t;
  const e = Er(t);
  if (e !== Ji && e !== Wi)
    return t;
  var r = /* @__PURE__ */ new Map(), i = xr(t), s = /* @__PURE__ */ U(0), n = K, o = (l) => {
    var v = K;
    Je(n);
    var u = l();
    return Je(v), u;
  };
  return i && r.set("length", /* @__PURE__ */ U(
    /** @type {any[]} */
    t.length
  )), new Proxy(
    /** @type {any} */
    t,
    {
      defineProperty(l, v, u) {
        return (!("value" in u) || u.configurable === !1 || u.enumerable === !1 || u.writable === !1) && an(), o(() => {
          var m = r.get(v);
          m === void 0 ? (m = /* @__PURE__ */ U(u.value), r.set(v, m)) : j(m, u.value, !0);
        }), !0;
      },
      deleteProperty(l, v) {
        var u = r.get(v);
        if (u === void 0) {
          if (v in l) {
            const d = o(() => /* @__PURE__ */ U(xe));
            r.set(v, d), cr(s);
          }
        } else {
          if (i && typeof v == "string") {
            var m = (
              /** @type {Source<number>} */
              r.get("length")
            ), h = Number(v);
            Number.isInteger(h) && h < m.v && j(m, h);
          }
          j(u, xe), cr(s);
        }
        return !0;
      },
      get(l, v, u) {
        if (v === gt)
          return t;
        var m = r.get(v), h = v in l;
        if (m === void 0 && (!h || St(l, v)?.writable) && (m = o(() => {
          var y = Fe(h ? l[v] : xe), x = /* @__PURE__ */ U(y);
          return x;
        }), r.set(v, m)), m !== void 0) {
          var d = a(m);
          return d === xe ? void 0 : d;
        }
        return Reflect.get(l, v, u);
      },
      getOwnPropertyDescriptor(l, v) {
        var u = Reflect.getOwnPropertyDescriptor(l, v);
        if (u && "value" in u) {
          var m = r.get(v);
          m && (u.value = a(m));
        } else if (u === void 0) {
          var h = r.get(v), d = h?.v;
          if (h !== void 0 && d !== xe)
            return {
              enumerable: !0,
              configurable: !0,
              value: d,
              writable: !0
            };
        }
        return u;
      },
      has(l, v) {
        if (v === gt)
          return !0;
        var u = r.get(v), m = u !== void 0 && u.v !== xe || Reflect.has(l, v);
        if (u !== void 0 || J !== null && (!m || St(l, v)?.writable)) {
          u === void 0 && (u = o(() => {
            var d = m ? Fe(l[v]) : xe, y = /* @__PURE__ */ U(d);
            return y;
          }), r.set(v, u));
          var h = a(u);
          if (h === xe)
            return !1;
        }
        return m;
      },
      set(l, v, u, m) {
        var h = r.get(v), d = v in l;
        if (i && v === "length")
          for (var y = u; y < /** @type {Source<number>} */
          h.v; y += 1) {
            var x = r.get(y + "");
            x !== void 0 ? j(x, xe) : y in l && (x = o(() => /* @__PURE__ */ U(xe)), r.set(y + "", x));
          }
        if (h === void 0)
          (!d || St(l, v)?.writable) && (h = o(() => {
            var E = /* @__PURE__ */ U(void 0);
            return j(E, Fe(u)), E;
          }), r.set(v, h));
        else {
          d = h.v !== xe;
          var B = o(() => Fe(u));
          j(h, B);
        }
        var A = Reflect.getOwnPropertyDescriptor(l, v);
        if (A?.set && A.set.call(m, u), !d) {
          if (i && typeof v == "string") {
            var q = (
              /** @type {Source<number>} */
              r.get("length")
            ), I = Number(v);
            Number.isInteger(I) && I >= q.v && j(q, I + 1);
          }
          cr(s);
        }
        return !0;
      },
      ownKeys(l) {
        a(s);
        var v = Reflect.ownKeys(l).filter((h) => {
          var d = r.get(h);
          return d === void 0 || d.v !== xe;
        });
        for (var [u, m] of r)
          m.v !== xe && !(u in l) && v.push(u);
        return v;
      },
      setPrototypeOf() {
        on();
      }
    }
  );
}
function cr(t, e = 1) {
  j(t, t.v + e);
}
// @__NO_SIDE_EFFECTS__
function rr(t) {
  var e = Ue | et, r = K !== null && (K.f & Ue) !== 0 ? (
    /** @type {Derived} */
    K
  ) : null;
  return J === null || r !== null && (r.f & Le) !== 0 ? e |= Le : J.f |= ri, {
    ctx: te,
    deps: null,
    effects: null,
    equals: ii,
    f: e,
    fn: t,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      null
    ),
    wv: 0,
    parent: r ?? J
  };
}
// @__NO_SIDE_EFFECTS__
function Me(t) {
  const e = /* @__PURE__ */ rr(t);
  return Ii(e), e;
}
// @__NO_SIDE_EFFECTS__
function li(t) {
  const e = /* @__PURE__ */ rr(t);
  return e.equals = ni, e;
}
function ui(t) {
  var e = t.effects;
  if (e !== null) {
    t.effects = null;
    for (var r = 0; r < e.length; r += 1)
      Ge(
        /** @type {Effect} */
        e[r]
      );
  }
}
function _n(t) {
  for (var e = t.parent; e !== null; ) {
    if ((e.f & Ue) === 0)
      return (
        /** @type {Effect} */
        e
      );
    e = e.parent;
  }
  return null;
}
function vi(t) {
  var e, r = J;
  nt(_n(t));
  try {
    ui(t), e = Ti(t);
  } finally {
    nt(r);
  }
  return e;
}
function ci(t) {
  var e = vi(t);
  if (t.equals(e) || (t.v = e, t.wv = Ci()), !wt) {
    var r = (it || (t.f & Le) !== 0) && t.deps !== null ? ct : Ae;
    Be(t, r);
  }
}
const Et = /* @__PURE__ */ new Map();
function It(t, e) {
  var r = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: t,
    reactions: null,
    equals: ii,
    rv: 0,
    wv: 0
  };
  return r;
}
// @__NO_SIDE_EFFECTS__
function U(t, e) {
  const r = It(t);
  return Ii(r), r;
}
// @__NO_SIDE_EFFECTS__
function hn(t, e = !1, r = !0) {
  var s;
  const i = It(t);
  return e || (i.equals = ni), Bt && r && te !== null && te.l !== null && ((s = te.l).s ?? (s.s = [])).push(i), i;
}
function j(t, e, r = !1) {
  K !== null && !Qe && Ht() && (K.f & (Ue | Ir)) !== 0 && !$e?.includes(t) && ln();
  let i = r ? Fe(e) : e;
  return gr(t, i);
}
function gr(t, e) {
  if (!t.equals(e)) {
    var r = t.v;
    wt ? Et.set(t, e) : Et.set(t, r), t.v = e, (t.f & Ue) !== 0 && ((t.f & et) !== 0 && vi(
      /** @type {Derived} */
      t
    ), Be(t, (t.f & Le) === 0 ? Ae : ct)), t.wv = Ci(), di(t, et), Ht() && J !== null && (J.f & Ae) !== 0 && (J.f & (tt | vt)) === 0 && (Oe === null ? In([t]) : Oe.push(t));
  }
  return e;
}
function di(t, e) {
  var r = t.reactions;
  if (r !== null)
    for (var i = Ht(), s = r.length, n = 0; n < s; n++) {
      var o = r[n], l = o.f;
      (l & et) === 0 && (!i && o === J || (Be(o, e), (l & (Ae | Le)) !== 0 && ((l & Ue) !== 0 ? di(
        /** @type {Derived} */
        o,
        ct
      ) : or(
        /** @type {Effect} */
        o
      ))));
    }
}
let pn = !1;
var Fr, fi, _i, hi;
function gn() {
  if (Fr === void 0) {
    Fr = window, fi = /Firefox/.test(navigator.userAgent);
    var t = Element.prototype, e = Node.prototype, r = Text.prototype;
    _i = St(e, "firstChild").get, hi = St(e, "nextSibling").get, Nr(t) && (t.__click = void 0, t.__className = void 0, t.__attributes = null, t.__style = void 0, t.__e = void 0), Nr(r) && (r.__t = void 0);
  }
}
function ir(t = "") {
  return document.createTextNode(t);
}
// @__NO_SIDE_EFFECTS__
function Te(t) {
  return _i.call(t);
}
// @__NO_SIDE_EFFECTS__
function nr(t) {
  return hi.call(t);
}
function c(t, e) {
  return /* @__PURE__ */ Te(t);
}
function je(t, e) {
  {
    var r = (
      /** @type {DocumentFragment} */
      /* @__PURE__ */ Te(
        /** @type {Node} */
        t
      )
    );
    return r instanceof Comment && r.data === "" ? /* @__PURE__ */ nr(r) : r;
  }
}
function g(t, e = 1, r = !1) {
  let i = t;
  for (; e--; )
    i = /** @type {TemplateNode} */
    /* @__PURE__ */ nr(i);
  return i;
}
function mn(t) {
  t.textContent = "";
}
function pi(t) {
  J === null && K === null && nn(), K !== null && (K.f & Le) !== 0 && J === null && rn(), wt && tn();
}
function yn(t, e) {
  var r = e.last;
  r === null ? e.last = e.first = t : (r.next = t, t.prev = r, e.last = t);
}
function dt(t, e, r, i = !0) {
  var s = J, n = {
    ctx: te,
    deps: null,
    nodes_start: null,
    nodes_end: null,
    f: t | et,
    first: null,
    fn: e,
    last: null,
    next: null,
    parent: s,
    prev: null,
    teardown: null,
    transitions: null,
    wv: 0
  };
  if (r)
    try {
      jr(n), n.f |= ti;
    } catch (v) {
      throw Ge(n), v;
    }
  else e !== null && or(n);
  var o = r && n.deps === null && n.first === null && n.nodes_start === null && n.teardown === null && (n.f & (ri | kr)) === 0;
  if (!o && i && (s !== null && yn(n, s), K !== null && (K.f & Ue) !== 0)) {
    var l = (
      /** @type {Derived} */
      K
    );
    (l.effects ?? (l.effects = [])).push(n);
  }
  return n;
}
function gi(t) {
  const e = dt(er, null, !1);
  return Be(e, Ae), e.teardown = t, e;
}
function Se(t) {
  pi();
  var e = J !== null && (J.f & tt) !== 0 && te !== null && !te.m;
  if (e) {
    var r = (
      /** @type {ComponentContext} */
      te
    );
    (r.e ?? (r.e = [])).push({
      fn: t,
      effect: J,
      reaction: K
    });
  } else {
    var i = Mr(t);
    return i;
  }
}
function bn(t) {
  return pi(), Lr(t);
}
function ht(t) {
  const e = dt(vt, t, !0);
  return () => {
    Ge(e);
  };
}
function wn(t) {
  const e = dt(vt, t, !0);
  return (r = {}) => new Promise((i) => {
    r.outro ? Jt(e, () => {
      Ge(e), i(void 0);
    }) : (Ge(e), i(void 0));
  });
}
function Mr(t) {
  return dt(ei, t, !1);
}
function Lr(t) {
  return dt(er, t, !0);
}
function D(t, e = [], r = rr) {
  const i = e.map(r);
  return sr(() => t(...i.map(a)));
}
function sr(t, e = 0) {
  return dt(er | Ir | e, t, !0);
}
function yt(t, e = !0) {
  return dt(er | tt, t, !0, e);
}
function mi(t) {
  var e = t.teardown;
  if (e !== null) {
    const r = wt, i = K;
    Ur(!0), Je(null);
    try {
      e.call(null);
    } finally {
      Ur(r), Je(i);
    }
  }
}
function yi(t, e = !1) {
  var r = t.first;
  for (t.first = t.last = null; r !== null; ) {
    var i = r.next;
    (r.f & vt) !== 0 ? r.parent = null : Ge(r, e), r = i;
  }
}
function xn(t) {
  for (var e = t.first; e !== null; ) {
    var r = e.next;
    (e.f & tt) === 0 && Ge(e), e = r;
  }
}
function Ge(t, e = !0) {
  var r = !1;
  (e || (t.f & Zi) !== 0) && t.nodes_start !== null && t.nodes_end !== null && (bi(
    t.nodes_start,
    /** @type {TemplateNode} */
    t.nodes_end
  ), r = !0), yi(t, e && !r), $t(t, 0), Be(t, Cr);
  var i = t.transitions;
  if (i !== null)
    for (const n of i)
      n.stop();
  mi(t);
  var s = t.parent;
  s !== null && s.first !== null && wi(t), t.next = t.prev = t.teardown = t.ctx = t.deps = t.fn = t.nodes_start = t.nodes_end = null;
}
function bi(t, e) {
  for (; t !== null; ) {
    var r = t === e ? null : (
      /** @type {TemplateNode} */
      /* @__PURE__ */ nr(t)
    );
    t.remove(), t = r;
  }
}
function wi(t) {
  var e = t.parent, r = t.prev, i = t.next;
  r !== null && (r.next = i), i !== null && (i.prev = r), e !== null && (e.first === t && (e.first = i), e.last === t && (e.last = r));
}
function Jt(t, e) {
  var r = [];
  Ar(t, r, !0), xi(r, () => {
    Ge(t), e && e();
  });
}
function xi(t, e) {
  var r = t.length;
  if (r > 0) {
    var i = () => --r || e();
    for (var s of t)
      s.out(i);
  } else
    e();
}
function Ar(t, e, r) {
  if ((t.f & Ze) === 0) {
    if (t.f ^= Ze, t.transitions !== null)
      for (const o of t.transitions)
        (o.is_global || r) && e.push(o);
    for (var i = t.first; i !== null; ) {
      var s = i.next, n = (i.f & tr) !== 0 || (i.f & tt) !== 0;
      Ar(i, e, n ? r : !1), i = s;
    }
  }
}
function Wt(t) {
  Si(t, !0);
}
function Si(t, e) {
  if ((t.f & Ze) !== 0) {
    t.f ^= Ze, (t.f & Ae) !== 0 && (Be(t, et), or(t));
    for (var r = t.first; r !== null; ) {
      var i = r.next, s = (r.f & tr) !== 0 || (r.f & tt) !== 0;
      Si(r, s ? e : !1), r = i;
    }
    if (t.transitions !== null)
      for (const n of t.transitions)
        (n.is_global || e) && n.in();
  }
}
let Kt = [];
function Sn() {
  var t = Kt;
  Kt = [], hr(t);
}
function Or(t) {
  Kt.length === 0 && queueMicrotask(Sn), Kt.push(t);
}
function En(t) {
  var e = (
    /** @type {Effect} */
    J
  );
  if ((e.f & ti) === 0) {
    if ((e.f & kr) === 0)
      throw t;
    e.fn(t);
  } else
    Ei(t, e);
}
function Ei(t, e) {
  for (; e !== null; ) {
    if ((e.f & kr) !== 0)
      try {
        e.fn(t);
        return;
      } catch {
      }
    e = e.parent;
  }
  throw t;
}
let mr = !1, Xt = null, lt = !1, wt = !1;
function Ur(t) {
  wt = t;
}
let Qt = [];
let K = null, Qe = !1;
function Je(t) {
  K = t;
}
let J = null;
function nt(t) {
  J = t;
}
let $e = null;
function Ii(t) {
  K !== null && K.f & pr && ($e === null ? $e = [t] : $e.push(t));
}
let pe = null, De = 0, Oe = null;
function In(t) {
  Oe = t;
}
let ki = 1, Zt = 0, it = !1;
function Ci() {
  return ++ki;
}
function ar(t) {
  var e = t.f;
  if ((e & et) !== 0)
    return !0;
  if ((e & ct) !== 0) {
    var r = t.deps, i = (e & Le) !== 0;
    if (r !== null) {
      var s, n, o = (e & Gt) !== 0, l = i && J !== null && !it, v = r.length;
      if (o || l) {
        var u = (
          /** @type {Derived} */
          t
        ), m = u.parent;
        for (s = 0; s < v; s++)
          n = r[s], (o || !n?.reactions?.includes(u)) && (n.reactions ?? (n.reactions = [])).push(u);
        o && (u.f ^= Gt), l && m !== null && (m.f & Le) === 0 && (u.f ^= Le);
      }
      for (s = 0; s < v; s++)
        if (n = r[s], ar(
          /** @type {Derived} */
          n
        ) && ci(
          /** @type {Derived} */
          n
        ), n.wv > t.wv)
          return !0;
    }
    (!i || J !== null && !it) && Be(t, Ae);
  }
  return !1;
}
function Di(t, e, r = !0) {
  var i = t.reactions;
  if (i !== null)
    for (var s = 0; s < i.length; s++) {
      var n = i[s];
      $e?.includes(t) || ((n.f & Ue) !== 0 ? Di(
        /** @type {Derived} */
        n,
        e,
        !1
      ) : e === n && (r ? Be(n, et) : (n.f & Ae) !== 0 && Be(n, ct), or(
        /** @type {Effect} */
        n
      )));
    }
}
function Ti(t) {
  var y;
  var e = pe, r = De, i = Oe, s = K, n = it, o = $e, l = te, v = Qe, u = t.f;
  pe = /** @type {null | Value[]} */
  null, De = 0, Oe = null, it = (u & Le) !== 0 && (Qe || !lt || K === null), K = (u & (tt | vt)) === 0 ? t : null, $e = null, Vr(t.ctx), Qe = !1, Zt++, t.f |= pr;
  try {
    var m = (
      /** @type {Function} */
      (0, t.fn)()
    ), h = t.deps;
    if (pe !== null) {
      var d;
      if ($t(t, De), h !== null && De > 0)
        for (h.length = De + pe.length, d = 0; d < pe.length; d++)
          h[De + d] = pe[d];
      else
        t.deps = h = pe;
      if (!it)
        for (d = De; d < h.length; d++)
          ((y = h[d]).reactions ?? (y.reactions = [])).push(t);
    } else h !== null && De < h.length && ($t(t, De), h.length = De);
    if (Ht() && Oe !== null && !Qe && h !== null && (t.f & (Ue | ct | et)) === 0)
      for (d = 0; d < /** @type {Source[]} */
      Oe.length; d++)
        Di(
          Oe[d],
          /** @type {Effect} */
          t
        );
    return s !== null && s !== t && (Zt++, Oe !== null && (i === null ? i = Oe : i.push(.../** @type {Source[]} */
    Oe))), m;
  } catch (x) {
    En(x);
  } finally {
    pe = e, De = r, Oe = i, K = s, it = n, $e = o, Vr(l), Qe = v, t.f ^= pr;
  }
}
function kn(t, e) {
  let r = e.reactions;
  if (r !== null) {
    var i = Qi.call(r, t);
    if (i !== -1) {
      var s = r.length - 1;
      s === 0 ? r = e.reactions = null : (r[i] = r[s], r.pop());
    }
  }
  r === null && (e.f & Ue) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (pe === null || !pe.includes(e)) && (Be(e, ct), (e.f & (Le | Gt)) === 0 && (e.f ^= Gt), ui(
    /** @type {Derived} **/
    e
  ), $t(
    /** @type {Derived} **/
    e,
    0
  ));
}
function $t(t, e) {
  var r = t.deps;
  if (r !== null)
    for (var i = e; i < r.length; i++)
      kn(t, r[i]);
}
function jr(t) {
  var e = t.f;
  if ((e & Cr) === 0) {
    Be(t, Ae);
    var r = J, i = lt;
    J = t, lt = !0;
    try {
      (e & Ir) !== 0 ? xn(t) : yi(t), mi(t);
      var s = Ti(t);
      t.teardown = typeof s == "function" ? s : null, t.wv = ki;
      var n;
    } finally {
      lt = i, J = r;
    }
  }
}
function Cn() {
  try {
    sn();
  } catch (t) {
    if (Xt !== null)
      Ei(t, Xt);
    else
      throw t;
  }
}
function Dn() {
  var t = lt;
  try {
    var e = 0;
    for (lt = !0; Qt.length > 0; ) {
      e++ > 1e3 && Cn();
      var r = Qt, i = r.length;
      Qt = [];
      for (var s = 0; s < i; s++) {
        var n = Mn(r[s]);
        Tn(n);
      }
      Et.clear();
    }
  } finally {
    mr = !1, lt = t, Xt = null;
  }
}
function Tn(t) {
  var e = t.length;
  if (e !== 0)
    for (var r = 0; r < e; r++) {
      var i = t[r];
      (i.f & (Cr | Ze)) === 0 && ar(i) && (jr(i), i.deps === null && i.first === null && i.nodes_start === null && (i.teardown === null ? wi(i) : i.fn = null));
    }
}
function or(t) {
  mr || (mr = !0, queueMicrotask(Dn));
  for (var e = Xt = t; e.parent !== null; ) {
    e = e.parent;
    var r = e.f;
    if ((r & (vt | tt)) !== 0) {
      if ((r & Ae) === 0) return;
      e.f ^= Ae;
    }
  }
  Qt.push(e);
}
function Mn(t) {
  for (var e = [], r = t; r !== null; ) {
    var i = r.f, s = (i & (tt | vt)) !== 0, n = s && (i & Ae) !== 0;
    if (!n && (i & Ze) === 0) {
      (i & ei) !== 0 ? e.push(r) : s ? r.f ^= Ae : ar(r) && jr(r);
      var o = r.first;
      if (o !== null) {
        r = o;
        continue;
      }
    }
    var l = r.parent;
    for (r = r.next; r === null && l !== null; )
      r = l.next, l = l.parent;
  }
  return e;
}
function a(t) {
  var e = t.f, r = (e & Ue) !== 0;
  if (K !== null && !Qe) {
    if (!$e?.includes(t)) {
      var i = K.deps;
      t.rv < Zt && (t.rv = Zt, pe === null && i !== null && i[De] === t ? De++ : pe === null ? pe = [t] : (!it || !pe.includes(t)) && pe.push(t));
    }
  } else if (r && /** @type {Derived} */
  t.deps === null && /** @type {Derived} */
  t.effects === null) {
    var s = (
      /** @type {Derived} */
      t
    ), n = s.parent;
    n !== null && (n.f & Le) === 0 && (s.f ^= Le);
  }
  return r && (s = /** @type {Derived} */
  t, ar(s) && ci(s)), wt && Et.has(t) ? Et.get(t) : t.v;
}
function Yt(t) {
  var e = Qe;
  try {
    return Qe = !0, t();
  } finally {
    Qe = e;
  }
}
const Ln = -7169;
function Be(t, e) {
  t.f = t.f & Ln | e;
}
function An(t) {
  if (!(typeof t != "object" || !t || t instanceof EventTarget)) {
    if (gt in t)
      yr(t);
    else if (!Array.isArray(t))
      for (let e in t) {
        const r = t[e];
        typeof r == "object" && r && gt in r && yr(r);
      }
  }
}
function yr(t, e = /* @__PURE__ */ new Set()) {
  if (typeof t == "object" && t !== null && // We don't want to traverse DOM elements
  !(t instanceof EventTarget) && !e.has(t)) {
    e.add(t), t instanceof Date && t.getTime();
    for (let i in t)
      try {
        yr(t[i], e);
      } catch {
      }
    const r = Er(t);
    if (r !== Object.prototype && r !== Array.prototype && r !== Map.prototype && r !== Set.prototype && r !== Date.prototype) {
      const i = Zr(r);
      for (let s in i) {
        const n = i[s].get;
        if (n)
          try {
            n.call(t);
          } catch {
          }
      }
    }
  }
}
const On = ["touchstart", "touchmove"];
function jn(t) {
  return On.includes(t);
}
let Br = !1;
function Pn() {
  Br || (Br = !0, document.addEventListener(
    "reset",
    (t) => {
      Promise.resolve().then(() => {
        if (!t.defaultPrevented)
          for (
            const e of
            /**@type {HTMLFormElement} */
            t.target.elements
          )
            e.__on_r?.();
      });
    },
    // In the capture phase to guarantee we get noticed of it (no possiblity of stopPropagation)
    { capture: !0 }
  ));
}
function Mi(t) {
  var e = K, r = J;
  Je(null), nt(null);
  try {
    return t();
  } finally {
    Je(e), nt(r);
  }
}
function zn(t, e, r, i = r) {
  t.addEventListener(e, () => Mi(r));
  const s = t.__on_r;
  s ? t.__on_r = () => {
    s(), i(!0);
  } : t.__on_r = () => i(!0), Pn();
}
const Li = /* @__PURE__ */ new Set(), br = /* @__PURE__ */ new Set();
function Rn(t, e, r, i = {}) {
  function s(n) {
    if (i.capture || xt.call(e, n), !n.cancelBubble)
      return Mi(() => r?.call(this, n));
  }
  return t.startsWith("pointer") || t.startsWith("touch") || t === "wheel" ? Or(() => {
    e.addEventListener(t, s, i);
  }) : e.addEventListener(t, s, i), s;
}
function qn(t, e, r, i, s) {
  var n = { capture: i, passive: s }, o = Rn(t, e, r, n);
  (e === document.body || // @ts-ignore
  e === window || // @ts-ignore
  e === document || // Firefox has quirky behavior, it can happen that we still get "canplay" events when the element is already removed
  e instanceof HTMLMediaElement) && gi(() => {
    e.removeEventListener(t, o, n);
  });
}
function st(t) {
  for (var e = 0; e < t.length; e++)
    Li.add(t[e]);
  for (var r of br)
    r(t);
}
function xt(t) {
  var e = this, r = (
    /** @type {Node} */
    e.ownerDocument
  ), i = t.type, s = t.composedPath?.() || [], n = (
    /** @type {null | Element} */
    s[0] || t.target
  ), o = 0, l = t.__root;
  if (l) {
    var v = s.indexOf(l);
    if (v !== -1 && (e === document || e === /** @type {any} */
    window)) {
      t.__root = e;
      return;
    }
    var u = s.indexOf(e);
    if (u === -1)
      return;
    v <= u && (o = v);
  }
  if (n = /** @type {Element} */
  s[o] || t.target, n !== e) {
    Gi(t, "currentTarget", {
      configurable: !0,
      get() {
        return n || r;
      }
    });
    var m = K, h = J;
    Je(null), nt(null);
    try {
      for (var d, y = []; n !== null; ) {
        var x = n.assignedSlot || n.parentNode || /** @type {any} */
        n.host || null;
        try {
          var B = n["__" + i];
          if (B != null && (!/** @type {any} */
          n.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          t.target === n))
            if (xr(B)) {
              var [A, ...q] = B;
              A.apply(n, [t, ...q]);
            } else
              B.call(n, t);
        } catch (I) {
          d ? y.push(I) : d = I;
        }
        if (t.cancelBubble || x === e || x === null)
          break;
        n = x;
      }
      if (d) {
        for (let I of y)
          queueMicrotask(() => {
            throw I;
          });
        throw d;
      }
    } finally {
      t.__root = e, delete t.currentTarget, Je(m), nt(h);
    }
  }
}
function Pr(t) {
  var e = document.createElement("template");
  return e.innerHTML = t.replaceAll("<!>", "<!---->"), e.content;
}
function ut(t, e) {
  var r = (
    /** @type {Effect} */
    J
  );
  r.nodes_start === null && (r.nodes_start = t, r.nodes_end = e);
}
// @__NO_SIDE_EFFECTS__
function w(t, e) {
  var r = (e & ai) !== 0, i = (e & dn) !== 0, s, n = !t.startsWith("<!>");
  return () => {
    s === void 0 && (s = Pr(n ? t : "<!>" + t), r || (s = /** @type {Node} */
    /* @__PURE__ */ Te(s)));
    var o = (
      /** @type {TemplateNode} */
      i || fi ? document.importNode(s, !0) : s.cloneNode(!0)
    );
    if (r) {
      var l = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Te(o)
      ), v = (
        /** @type {TemplateNode} */
        o.lastChild
      );
      ut(l, v);
    } else
      ut(o, o);
    return o;
  };
}
// @__NO_SIDE_EFFECTS__
function Nn(t, e, r = "svg") {
  var i = !t.startsWith("<!>"), s = (e & ai) !== 0, n = `<${r}>${i ? t : "<!>" + t}</${r}>`, o;
  return () => {
    if (!o) {
      var l = (
        /** @type {DocumentFragment} */
        Pr(n)
      ), v = (
        /** @type {Element} */
        /* @__PURE__ */ Te(l)
      );
      if (s)
        for (o = document.createDocumentFragment(); /* @__PURE__ */ Te(v); )
          o.appendChild(
            /** @type {Node} */
            /* @__PURE__ */ Te(v)
          );
      else
        o = /** @type {Element} */
        /* @__PURE__ */ Te(v);
    }
    var u = (
      /** @type {TemplateNode} */
      o.cloneNode(!0)
    );
    if (s) {
      var m = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Te(u)
      ), h = (
        /** @type {TemplateNode} */
        u.lastChild
      );
      ut(m, h);
    } else
      ut(u, u);
    return u;
  };
}
// @__NO_SIDE_EFFECTS__
function zr(t, e) {
  return /* @__PURE__ */ Nn(t, e, "svg");
}
function bt(t = "") {
  {
    var e = ir(t + "");
    return ut(e, e), e;
  }
}
function pt() {
  var t = document.createDocumentFragment(), e = document.createComment(""), r = ir();
  return t.append(e, r), ut(e, r), t;
}
function f(t, e) {
  t !== null && t.before(
    /** @type {Node} */
    e
  );
}
function M(t, e) {
  var r = e == null ? "" : typeof e == "object" ? e + "" : e;
  r !== (t.__t ?? (t.__t = t.nodeValue)) && (t.__t = r, t.nodeValue = r + "");
}
function Vn(t, e) {
  return Fn(t, e);
}
const _t = /* @__PURE__ */ new Map();
function Fn(t, { target: e, anchor: r, props: i = {}, events: s, context: n, intro: o = !0 }) {
  gn();
  var l = /* @__PURE__ */ new Set(), v = (h) => {
    for (var d = 0; d < h.length; d++) {
      var y = h[d];
      if (!l.has(y)) {
        l.add(y);
        var x = jn(y);
        e.addEventListener(y, xt, { passive: x });
        var B = _t.get(y);
        B === void 0 ? (document.addEventListener(y, xt, { passive: x }), _t.set(y, 1)) : _t.set(y, B + 1);
      }
    }
  };
  v(Sr(Li)), br.add(v);
  var u = void 0, m = wn(() => {
    var h = r ?? e.appendChild(ir());
    return yt(() => {
      if (n) {
        We({});
        var d = (
          /** @type {ComponentContext} */
          te
        );
        d.c = n;
      }
      s && (i.$$events = s), u = t(h, i) || {}, n && Ke();
    }), () => {
      for (var d of l) {
        e.removeEventListener(d, xt);
        var y = (
          /** @type {number} */
          _t.get(d)
        );
        --y === 0 ? (document.removeEventListener(d, xt), _t.delete(d)) : _t.set(d, y);
      }
      br.delete(v), h !== r && h.parentNode?.removeChild(h);
    };
  });
  return Un.set(u, m), u;
}
let Un = /* @__PURE__ */ new WeakMap();
function S(t, e, [r, i] = [0, 0]) {
  var s = t, n = null, o = null, l = xe, v = r > 0 ? tr : 0, u = !1;
  const m = (d, y = !0) => {
    u = !0, h(y, d);
  }, h = (d, y) => {
    l !== (l = d) && (l ? (n ? Wt(n) : y && (n = yt(() => y(s))), o && Jt(o, () => {
      o = null;
    })) : (o ? Wt(o) : y && (o = yt(() => y(s, [r + 1, i]))), n && Jt(n, () => {
      n = null;
    })));
  };
  sr(() => {
    u = !1, e(m), u || h(null, null);
  }, v);
}
function Pe(t, e) {
  return e;
}
function Bn(t, e, r, i) {
  for (var s = [], n = e.length, o = 0; o < n; o++)
    Ar(e[o].e, s, !0);
  var l = n > 0 && s.length === 0 && r !== null;
  if (l) {
    var v = (
      /** @type {Element} */
      /** @type {Element} */
      r.parentNode
    );
    mn(v), v.append(
      /** @type {Element} */
      r
    ), i.clear(), rt(t, e[0].prev, e[n - 1].next);
  }
  xi(s, () => {
    for (var u = 0; u < n; u++) {
      var m = e[u];
      l || (i.delete(m.k), rt(t, m.prev, m.next)), Ge(m.e, !l);
    }
  });
}
function ze(t, e, r, i, s, n = null) {
  var o = t, l = { flags: e, items: /* @__PURE__ */ new Map(), first: null }, v = (e & si) !== 0;
  if (v) {
    var u = (
      /** @type {Element} */
      t
    );
    o = u.appendChild(ir());
  }
  var m = null, h = !1, d = /* @__PURE__ */ li(() => {
    var y = r();
    return xr(y) ? y : y == null ? [] : Sr(y);
  });
  sr(() => {
    var y = a(d), x = y.length;
    h && x === 0 || (h = x === 0, Hn(y, l, o, s, e, i, r), n !== null && (x === 0 ? m ? Wt(m) : m = yt(() => n(o)) : m !== null && Jt(m, () => {
      m = null;
    })), a(d));
  });
}
function Hn(t, e, r, i, s, n, o) {
  var l = (s & vn) !== 0, v = (s & (Dr | Tr)) !== 0, u = t.length, m = e.items, h = e.first, d = h, y, x = null, B, A = [], q = [], I, E, b, L;
  if (l)
    for (L = 0; L < u; L += 1)
      I = t[L], E = n(I, L), b = m.get(E), b !== void 0 && (b.a?.measure(), (B ?? (B = /* @__PURE__ */ new Set())).add(b));
  for (L = 0; L < u; L += 1) {
    if (I = t[L], E = n(I, L), b = m.get(E), b === void 0) {
      var z = d ? (
        /** @type {TemplateNode} */
        d.e.nodes_start
      ) : r;
      x = Qn(
        z,
        e,
        x,
        x === null ? e.first : x.next,
        I,
        E,
        L,
        i,
        s,
        o
      ), m.set(E, x), A = [], q = [], d = x.next;
      continue;
    }
    if (v && Yn(b, I, L, s), (b.e.f & Ze) !== 0 && (Wt(b.e), l && (b.a?.unfix(), (B ?? (B = /* @__PURE__ */ new Set())).delete(b))), b !== d) {
      if (y !== void 0 && y.has(b)) {
        if (A.length < q.length) {
          var H = q[0], W;
          x = H.prev;
          var Z = A[0], X = A[A.length - 1];
          for (W = 0; W < A.length; W += 1)
            Hr(A[W], H, r);
          for (W = 0; W < q.length; W += 1)
            y.delete(q[W]);
          rt(e, Z.prev, X.next), rt(e, x, Z), rt(e, X, H), d = H, x = X, L -= 1, A = [], q = [];
        } else
          y.delete(b), Hr(b, d, r), rt(e, b.prev, b.next), rt(e, b, x === null ? e.first : x.next), rt(e, x, b), x = b;
        continue;
      }
      for (A = [], q = []; d !== null && d.k !== E; )
        (d.e.f & Ze) === 0 && (y ?? (y = /* @__PURE__ */ new Set())).add(d), q.push(d), d = d.next;
      if (d === null)
        continue;
      b = d;
    }
    A.push(b), x = b, d = b.next;
  }
  if (d !== null || y !== void 0) {
    for (var ue = y === void 0 ? [] : Sr(y); d !== null; )
      (d.e.f & Ze) === 0 && ue.push(d), d = d.next;
    var me = ue.length;
    if (me > 0) {
      var Re = (s & si) !== 0 && u === 0 ? r : null;
      if (l) {
        for (L = 0; L < me; L += 1)
          ue[L].a?.measure();
        for (L = 0; L < me; L += 1)
          ue[L].a?.fix();
      }
      Bn(e, ue, Re, m);
    }
  }
  l && Or(() => {
    if (B !== void 0)
      for (b of B)
        b.a?.apply();
  }), J.first = e.first && e.first.e, J.last = x && x.e;
}
function Yn(t, e, r, i) {
  (i & Dr) !== 0 && gr(t.v, e), (i & Tr) !== 0 ? gr(
    /** @type {Value<number>} */
    t.i,
    r
  ) : t.i = r;
}
function Qn(t, e, r, i, s, n, o, l, v, u) {
  var m = (v & Dr) !== 0, h = (v & cn) === 0, d = m ? h ? /* @__PURE__ */ hn(s, !1, !1) : It(s) : s, y = (v & Tr) === 0 ? o : It(o), x = {
    i: y,
    v: d,
    k: n,
    a: null,
    // @ts-expect-error
    e: null,
    prev: r,
    next: i
  };
  try {
    return x.e = yt(() => l(t, d, y, u), pn), x.e.prev = r && r.e, x.e.next = i && i.e, r === null ? e.first = x : (r.next = x, r.e.next = x.e), i !== null && (i.prev = x, i.e.prev = x.e), x;
  } finally {
  }
}
function Hr(t, e, r) {
  for (var i = t.next ? (
    /** @type {TemplateNode} */
    t.next.e.nodes_start
  ) : r, s = e ? (
    /** @type {TemplateNode} */
    e.e.nodes_start
  ) : r, n = (
    /** @type {TemplateNode} */
    t.e.nodes_start
  ); n !== i; ) {
    var o = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ nr(n)
    );
    s.before(n), n = o;
  }
}
function rt(t, e, r) {
  e === null ? t.first = r : (e.next = r, e.e.next = r && r.e), r !== null && (r.prev = e, r.e.prev = e && e.e);
}
function Gn(t, e, r = !1, i = !1, s = !1) {
  var n = t, o = "";
  D(() => {
    var l = (
      /** @type {Effect} */
      J
    );
    if (o !== (o = e() ?? "") && (l.nodes_start !== null && (bi(
      l.nodes_start,
      /** @type {TemplateNode} */
      l.nodes_end
    ), l.nodes_start = l.nodes_end = null), o !== "")) {
      var v = o + "";
      r ? v = `<svg>${v}</svg>` : i && (v = `<math>${v}</math>`);
      var u = Pr(v);
      if ((r || i) && (u = /** @type {Element} */
      /* @__PURE__ */ Te(u)), ut(
        /** @type {TemplateNode} */
        /* @__PURE__ */ Te(u),
        /** @type {TemplateNode} */
        u.lastChild
      ), r || i)
        for (; /* @__PURE__ */ Te(u); )
          n.before(
            /** @type {Node} */
            /* @__PURE__ */ Te(u)
          );
      else
        n.before(u);
    }
  });
}
function Yr(t, e, ...r) {
  var i = t, s = $r, n;
  sr(() => {
    s !== (s = e()) && (n && (Ge(n), n = null), n = yt(() => (
      /** @type {SnippetFn} */
      s(i, ...r)
    )));
  }, tr);
}
const Qr = [...` 	
\r\f \v\uFEFF`];
function Jn(t, e, r) {
  var i = t == null ? "" : "" + t;
  if (e && (i = i ? i + " " + e : e), r) {
    for (var s in r)
      if (r[s])
        i = i ? i + " " + s : s;
      else if (i.length)
        for (var n = s.length, o = 0; (o = i.indexOf(s, o)) >= 0; ) {
          var l = o + n;
          (o === 0 || Qr.includes(i[o - 1])) && (l === i.length || Qr.includes(i[l])) ? i = (o === 0 ? "" : i.substring(0, o)) + i.substring(l + 1) : o = l;
        }
  }
  return i === "" ? null : i;
}
function Wn(t, e) {
  return t == null ? null : String(t);
}
function fe(t, e, r, i, s, n) {
  var o = t.__className;
  if (o !== r || o === void 0) {
    var l = Jn(r, i, n);
    l == null ? t.removeAttribute("class") : e ? t.className = l : t.setAttribute("class", l), t.__className = r;
  } else if (n && s !== n)
    for (var v in n) {
      var u = !!n[v];
      (s == null || u !== !!s[v]) && t.classList.toggle(v, u);
    }
  return n;
}
function wr(t, e, r, i) {
  var s = t.__style;
  if (s !== e) {
    var n = Wn(e);
    n == null ? t.removeAttribute("style") : t.style.cssText = n, t.__style = e;
  }
  return i;
}
const Kn = Symbol("is custom element"), Xn = Symbol("is html");
function Zn(t, e) {
  var r = Ai(t);
  r.checked !== (r.checked = // treat null and undefined the same for the initial value
  e ?? void 0) && (t.checked = e);
}
function kt(t, e, r, i) {
  var s = Ai(t);
  s[e] !== (s[e] = r) && (e === "loading" && (t[$i] = r), r == null ? t.removeAttribute(e) : typeof r != "string" && $n(t).includes(e) ? t[e] = r : t.setAttribute(e, r));
}
function Ai(t) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    // @ts-expect-error
    t.__attributes ?? (t.__attributes = {
      [Kn]: t.nodeName.includes("-"),
      [Xn]: t.namespaceURI === fn
    })
  );
}
var Gr = /* @__PURE__ */ new Map();
function $n(t) {
  var e = Gr.get(t.nodeName);
  if (e) return e;
  Gr.set(t.nodeName, e = []);
  for (var r, i = t, s = Element.prototype; s !== i; ) {
    r = Zr(i);
    for (var n in r)
      r[n].set && e.push(n);
    i = Er(i);
  }
  return e;
}
function Oi(t, e, r = e) {
  var i = Ht();
  zn(t, "input", (s) => {
    var n = s ? t.defaultValue : t.value;
    if (n = dr(t) ? fr(n) : n, r(n), i && n !== (n = e())) {
      var o = t.selectionStart, l = t.selectionEnd;
      t.value = n ?? "", l !== null && (t.selectionStart = o, t.selectionEnd = Math.min(l, t.value.length));
    }
  }), // If we are hydrating and the value has since changed,
  // then use the updated value from the input instead.
  // If defaultValue is set, then value == defaultValue
  // TODO Svelte 6: remove input.value check and set to empty string?
  Yt(e) == null && t.value && r(dr(t) ? fr(t.value) : t.value), Lr(() => {
    var s = e();
    dr(t) && s === fr(t.value) || t.type === "date" && !s && !t.value || s !== t.value && (t.value = s ?? "");
  });
}
function dr(t) {
  var e = t.type;
  return e === "number" || e === "range";
}
function fr(t) {
  return t === "" ? null : +t;
}
function Jr(t, e) {
  return t === e || t?.[gt] === e;
}
function ji(t = {}, e, r, i) {
  return Mr(() => {
    var s, n;
    return Lr(() => {
      s = n, n = [], Yt(() => {
        t !== r(...n) && (e(t, ...n), s && Jr(r(...s), t) && e(null, ...s));
      });
    }), () => {
      Or(() => {
        n && Jr(r(...n), t) && e(null, ...n);
      });
    };
  }), t;
}
function Pi(t = !1) {
  const e = (
    /** @type {ComponentContextLegacy} */
    te
  ), r = e.l.u;
  if (!r) return;
  let i = () => An(e.s);
  if (t) {
    let s = 0, n = (
      /** @type {Record<string, any>} */
      {}
    );
    const o = /* @__PURE__ */ rr(() => {
      let l = !1;
      const v = e.s;
      for (const u in v)
        v[u] !== n[u] && (n[u] = v[u], l = !0);
      return l && s++, s;
    });
    i = () => a(o);
  }
  r.b.length && bn(() => {
    Wr(e, i), hr(r.b);
  }), Se(() => {
    const s = Yt(() => r.m.map(Ki));
    return () => {
      for (const n of s)
        typeof n == "function" && n();
    };
  }), r.a.length && Se(() => {
    Wr(e, i), hr(r.a);
  });
}
function Wr(t, e) {
  if (t.l.s)
    for (const r of t.l.s) a(r);
  e();
}
function ge(t, e, r, i) {
  var s;
  s = /** @type {V} */
  t[e];
  var n = (
    /** @type {V} */
    i
  ), o = !0, l = () => (o && (o = !1, n = /** @type {V} */
  i), n);
  s === void 0 && i !== void 0 && (s = l());
  var v;
  return v = () => {
    var u = (
      /** @type {V} */
      t[e]
    );
    return u === void 0 ? l() : (o = !0, u);
  }, v;
}
function zi(t) {
  te === null && oi(), Bt && te.l !== null ? ts(te).m.push(t) : Se(() => {
    const e = Yt(t);
    if (typeof e == "function") return (
      /** @type {() => void} */
      e
    );
  });
}
function es(t) {
  te === null && oi(), zi(() => () => Yt(t));
}
function ts(t) {
  var e = (
    /** @type {ComponentContextLegacy} */
    t.l
  );
  return e.u ?? (e.u = { a: [], b: [], m: [] });
}
const rs = "5";
var Xr;
typeof window < "u" && ((Xr = window.__svelte ?? (window.__svelte = {})).v ?? (Xr.v = /* @__PURE__ */ new Set())).add(rs);
function _r(t, e) {
  let r;
  return function(...i) {
    clearTimeout(r), r = setTimeout(() => t.apply(this, i), e);
  };
}
function is(t, e) {
  let r;
  return function(...i) {
    r || (t.apply(this, i), r = !0, setTimeout(() => r = !1, e));
  };
}
class ns {
  constructor(e, r = {}) {
    this.baseUrl = e || "http://localhost:8080/api/v1", this.modelId = r.modelId, this.authToken = r.authToken, this.timeout = r.timeout || 3e4, this.retryAttempts = r.retryAttempts || 2, this.retryDelay = r.retryDelay || 1e3;
  }
  async request(e, r = {}) {
    const i = `${this.baseUrl}${e}`, s = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Request-ID": this.generateRequestId(),
        ...this.authToken && { Authorization: `Bearer ${this.authToken}` },
        ...r.headers
      },
      ...r
    };
    s.body && typeof s.body == "object" && (s.body = JSON.stringify(s.body));
    let n;
    for (let o = 0; o < this.retryAttempts; o++)
      try {
        const l = new AbortController(), v = setTimeout(() => l.abort(), this.timeout), u = await fetch(i, {
          ...s,
          signal: l.signal
        });
        if (clearTimeout(v), u.status === 401)
          throw new Error("Authentication required");
        if (u.status === 404) {
          const h = new Error("Resource not found");
          throw h.code = "NOT_FOUND", h;
        }
        if (u.status === 429) {
          const h = u.headers.get("Retry-After");
          throw new Error(`Rate limited. Retry after ${h}s`);
        }
        if (!u.ok) {
          const h = await u.json().catch(() => ({}));
          throw new Error(h.error?.message || `HTTP ${u.status}: ${u.statusText}`);
        }
        const m = await u.json();
        return m.data !== void 0 ? m : { data: m };
      } catch (l) {
        if (n = l, l.message.includes("4") || l.name === "AbortError" || response?.status >= 400 && response?.status < 500)
          throw l;
        o < this.retryAttempts - 1 && await this.delay(this.retryDelay * Math.pow(2, o));
      }
    throw n;
  }
  generateRequestId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  delay(e) {
    return new Promise((r) => setTimeout(r, e));
  }
  // Model endpoints
  async getModel() {
    if (!this.modelId) throw new Error("Model ID required");
    return this.request(`/models/${this.modelId}`);
  }
  async getModelOptions() {
    if (!this.modelId) throw new Error("Model ID required");
    return this.request(`/models/${this.modelId}/options`);
  }
  async getModelGroups() {
    if (!this.modelId) throw new Error("Model ID required");
    return this.request(`/models/${this.modelId}/groups`);
  }
  // Configuration endpoints
  async createConfiguration(e = {}) {
    const r = {
      model_id: this.modelId,
      selections: this.formatSelections(e)
    };
    return this.request("/configurations", {
      method: "POST",
      body: r
    });
  }
  async updateConfiguration(e, r) {
    const i = {
      model_id: this.modelId,
      selections: this.formatSelections(r)
    };
    return this.request(`/configurations/${e}`, {
      method: "PUT",
      body: i
    });
  }
  async validateConfiguration(e) {
    const r = {
      model_id: this.modelId,
      selections: this.formatSelections(e)
    };
    return this.request("/configurations/validate-selection", {
      method: "POST",
      body: r
    });
  }
  async getConfiguration(e) {
    return this.request(`/configurations/${e}`);
  }
  async deleteConfiguration(e) {
    return this.request(`/configurations/${e}`, {
      method: "DELETE"
    });
  }
  // Pricing endpoints
  async calculatePricing(e, r = {}) {
    const i = {
      model_id: this.modelId,
      selections: this.formatSelections(e),
      context: r
    };
    return this.request("/pricing/calculate", {
      method: "POST",
      body: i
    });
  }
  async simulatePricing(e) {
    const r = {
      model_id: this.modelId,
      scenarios: e.map((i) => ({
        ...i,
        selections: this.formatSelections(i.selections)
      }))
    };
    return this.request("/pricing/simulate", {
      method: "POST",
      body: r
    });
  }
  async getVolumeTiers() {
    return this.request(`/pricing/volume-tiers/${this.modelId}`);
  }
  // Analytics endpoints
  async getConfigurationAnalytics(e = "30d") {
    return this.request(`/analytics/configurations?model_id=${this.modelId}&range=${e}`);
  }
  async getPricingAnalytics(e = "30d") {
    return this.request(`/analytics/pricing?model_id=${this.modelId}&range=${e}`);
  }
  // Utility methods
  formatSelections(e) {
    return Array.isArray(e) ? e : Object.entries(e).filter(([r, i]) => i > 0).map(([r, i]) => ({ option_id: r, quantity: i }));
  }
  setModelId(e) {
    this.modelId = e;
  }
  setAuthToken(e) {
    this.authToken = e;
  }
}
const Ri = "cpq_";
function ss(t, e) {
  try {
    localStorage.setItem(Ri + t, JSON.stringify(e));
  } catch (r) {
    console.warn("Failed to persist data:", r);
  }
}
function as(t) {
  try {
    const e = localStorage.getItem(Ri + t);
    return e ? JSON.parse(e) : null;
  } catch (e) {
    return console.warn("Failed to recover data:", e), null;
  }
}
var Ct, Dt, Tt, Mt, Lt, At, Ot, jt, Pt, zt, Rt, qt, Nt, Vt, Ft, Ut, de, mt, Ve, Ee, qi, Ni, Vi, Fi, Ui, Bi;
class os {
  constructor() {
    ae(this, Ee);
    ae(this, Ct, /* @__PURE__ */ U(""));
    ae(this, Dt, /* @__PURE__ */ U(null));
    ae(this, Tt, /* @__PURE__ */ U(Fe({})));
    ae(this, Mt, /* @__PURE__ */ U(Fe({ violations: [], isValid: !0 })));
    ae(this, Lt, /* @__PURE__ */ U(null));
    ae(this, At, /* @__PURE__ */ U(!1));
    ae(this, Ot, /* @__PURE__ */ U(!1));
    ae(this, jt, /* @__PURE__ */ U(!1));
    ae(this, Pt, /* @__PURE__ */ U(null));
    ae(this, zt, /* @__PURE__ */ U(0));
    ae(this, Rt, /* @__PURE__ */ U(null));
    ae(this, qt, /* @__PURE__ */ U(null));
    ae(this, Nt, /* @__PURE__ */ U(!1));
    ae(this, Vt, /* @__PURE__ */ U(Fe([])));
    ae(this, Ft, /* @__PURE__ */ U(-1));
    ur(this, "maxHistorySize", 50);
    ae(this, Ut, /* @__PURE__ */ U(Fe(navigator.onLine)));
    ur(this, "retryQueue", []);
    // API client
    ae(this, de, null);
    ae(this, mt, !1);
    ae(this, Ve, []);
  }
  get modelId() {
    return a(T(this, Ct));
  }
  set modelId(e) {
    j(T(this, Ct), e, !0);
  }
  get model() {
    return a(T(this, Dt));
  }
  set model(e) {
    j(T(this, Dt), e, !0);
  }
  get selections() {
    return a(T(this, Tt));
  }
  set selections(e) {
    j(T(this, Tt), e, !0);
  }
  get validationResults() {
    return a(T(this, Mt));
  }
  set validationResults(e) {
    j(T(this, Mt), e, !0);
  }
  get pricingData() {
    return a(T(this, Lt));
  }
  set pricingData(e) {
    j(T(this, Lt), e, !0);
  }
  get isLoading() {
    return a(T(this, At));
  }
  set isLoading(e) {
    j(T(this, At), e, !0);
  }
  get isValidating() {
    return a(T(this, Ot));
  }
  set isValidating(e) {
    j(T(this, Ot), e, !0);
  }
  get isPricing() {
    return a(T(this, jt));
  }
  set isPricing(e) {
    j(T(this, jt), e, !0);
  }
  get error() {
    return a(T(this, Pt));
  }
  set error(e) {
    j(T(this, Pt), e, !0);
  }
  get currentStep() {
    return a(T(this, zt));
  }
  set currentStep(e) {
    j(T(this, zt), e, !0);
  }
  get configurationId() {
    return a(T(this, Rt));
  }
  set configurationId(e) {
    j(T(this, Rt), e, !0);
  }
  get lastSaved() {
    return a(T(this, qt));
  }
  set lastSaved(e) {
    j(T(this, qt), e, !0);
  }
  get isDirty() {
    return a(T(this, Nt));
  }
  set isDirty(e) {
    j(T(this, Nt), e, !0);
  }
  get history() {
    return a(T(this, Vt));
  }
  set history(e) {
    j(T(this, Vt), e, !0);
  }
  get historyIndex() {
    return a(T(this, Ft));
  }
  set historyIndex(e) {
    j(T(this, Ft), e, !0);
  }
  get isOnline() {
    return a(T(this, Ut));
  }
  set isOnline(e) {
    j(T(this, Ut), e, !0);
  }
  // Computed values
  get isValid() {
    return this.validationResults.isValid && this.validationResults.violations.length === 0;
  }
  get totalPrice() {
    return this.pricingData?.total_price || 0;
  }
  get basePrice() {
    return this.pricingData?.base_price || 0;
  }
  get adjustments() {
    return this.pricingData?.adjustments || [];
  }
  get selectedOptions() {
    return this.model?.option_groups ? this.model.option_groups.flatMap((e) => e.options.filter((r) => this.selections[r.id] > 0).map((r) => ({
      ...r,
      quantity: this.selections[r.id],
      group_name: e.name
    }))) : [];
  }
  get completionPercentage() {
    if (!this.model?.option_groups) return 0;
    const e = this.model.option_groups.filter((i) => i.required);
    if (!e.length) return 100;
    const r = e.filter((i) => i.options.some((s) => this.selections[s.id] > 0));
    return Math.round(r.length / e.length * 100);
  }
  get canProceedToNextStep() {
    return this.completionPercentage >= 100 && this.isValid && !this.isValidating;
  }
  get canUndo() {
    return this.historyIndex > 0;
  }
  get canRedo() {
    return this.historyIndex < this.history.length - 1;
  }
  // Initialize store
  initialize(e = window.__API_BASE_URL__) {
    T(this, mt) || (ft(this, mt, !0), ft(this, de, new ns(e)), ot(this, Ee, Ui).call(this), ot(this, Ee, qi).call(this), ot(this, Ee, Ni).call(this));
  }
  // Clean up resources
  destroy() {
    T(this, Ve).forEach((e) => e()), ft(this, Ve, []), ft(this, de, null), ft(this, mt, !1);
  }
  // Public methods
  setModelId(e) {
    this.modelId !== e && (this.modelId = e, (this.model || this.error) && this.reset());
  }
  async loadModel() {
    if (!T(this, de) || this.isLoading || !this.modelId) {
      console.log("Skipping loadModel:", {
        api: !!T(this, de),
        isLoading: this.isLoading,
        modelId: this.modelId
      });
      return;
    }
    console.log("Loading model:", this.modelId), this.isLoading = !0, this.error = null;
    try {
      const e = await T(this, de).getModel();
      if (console.log("Model loaded successfully:", e), this.model = e.data || e, this.model?.option_groups)
        for (const r of this.model.option_groups)
          r.required && r.selection_type === "single" && r.min_selections > 0 && !r.options.some((s) => this.selections[s.id] > 0) && r.options.length > 0 && (this.selections[r.options[0].id] = 1);
    } catch (e) {
      console.error("Failed to load model:", e), this.error = {
        type: "load",
        message: e.message || "Failed to load model",
        code: e.code
      }, !this.isOnline && !e.message.includes("404") && this.retryQueue.push(() => this.loadModel());
    } finally {
      this.isLoading = !1;
    }
  }
  updateSelection(e, r) {
    const i = { ...this.selections };
    if (r > 0 ? this.selections[e] = r : delete this.selections[e], this.model?.option_groups) {
      const s = this.model.option_groups.flatMap((n) => n.options).find((n) => n.id === e);
      if (s) {
        const n = this.model.option_groups.find((o) => o.options.some((l) => l.id === s.id));
        if (n?.selection_type === "single" && r > 0)
          for (const o of n.options)
            o.id !== e && delete this.selections[o.id];
      }
    }
    JSON.stringify(i) !== JSON.stringify(this.selections) && (this.isDirty = !0, ot(this, Ee, Bi).call(this));
  }
  async validateSelections() {
    if (!(!T(this, de) || this.isValidating)) {
      this.isValidating = !0;
      try {
        const e = await T(this, de).validateConfiguration(this.selections);
        this.validationResults = {
          violations: e.data?.violations || [],
          isValid: e.data?.is_valid ?? !0
        };
      } catch (e) {
        this.isOnline ? this.error = { type: "validation", message: e.message } : this.validationResults = { violations: [], isValid: !0 };
      } finally {
        this.isValidating = !1;
      }
    }
  }
  async calculatePricing() {
    if (!(!T(this, de) || this.isPricing)) {
      this.isPricing = !0;
      try {
        const e = await T(this, de).calculatePricing(this.selections);
        this.pricingData = e.data || e;
      } catch (e) {
        this.isOnline ? this.error = { type: "pricing", message: e.message } : this.pricingData = this.pricingData || null;
      } finally {
        this.isPricing = !1;
      }
    }
  }
  async saveConfiguration() {
    if (!(!T(this, de) || !this.isDirty))
      try {
        let e;
        return this.configurationId ? e = await T(this, de).updateConfiguration(this.configurationId, this.selections) : (e = await T(this, de).createConfiguration(this.selections), this.configurationId = e.data?.id || e.id), this.lastSaved = /* @__PURE__ */ new Date(), this.isDirty = !1, e;
      } catch (e) {
        throw this.isOnline ? this.error = { type: "save", message: e.message } : this.retryQueue.push(() => this.saveConfiguration()), e;
      }
  }
  undo() {
    this.canUndo && (this.historyIndex--, this.selections = { ...this.history[this.historyIndex].selections }, this.isDirty = !0);
  }
  redo() {
    this.canRedo && (this.historyIndex++, this.selections = { ...this.history[this.historyIndex].selections }, this.isDirty = !0);
  }
  nextStep() {
    this.canProceedToNextStep && (this.currentStep = Math.min(this.currentStep + 1, 3));
  }
  previousStep() {
    this.currentStep = Math.max(this.currentStep - 1, 0);
  }
  reset() {
    this.model = null, this.selections = {}, this.validationResults = { violations: [], isValid: !0 }, this.pricingData = null, this.currentStep = 0, this.configurationId = null, this.lastSaved = null, this.isDirty = !1, this.error = null, this.isLoading = !1, this.isValidating = !1, this.isPricing = !1, this.history = [], this.historyIndex = -1, this.retryQueue = [];
  }
  clearError() {
    this.error = null;
  }
}
Ct = new WeakMap(), Dt = new WeakMap(), Tt = new WeakMap(), Mt = new WeakMap(), Lt = new WeakMap(), At = new WeakMap(), Ot = new WeakMap(), jt = new WeakMap(), Pt = new WeakMap(), zt = new WeakMap(), Rt = new WeakMap(), qt = new WeakMap(), Nt = new WeakMap(), Vt = new WeakMap(), Ft = new WeakMap(), Ut = new WeakMap(), de = new WeakMap(), mt = new WeakMap(), Ve = new WeakMap(), Ee = new WeakSet(), qi = function() {
  const e = ht(() => {
    Se(() => {
      this.modelId && T(this, de) && !this.model && !this.error && (T(this, de).modelId = this.modelId, this.loadModel());
    });
  });
  T(this, Ve).push(e);
  const r = _r(
    () => {
      Object.keys(this.selections).length > 0 && this.validateSelections();
    },
    300
  ), i = ht(() => {
    Se(() => {
      JSON.stringify(this.selections), r();
    });
  });
  T(this, Ve).push(i);
  const s = _r(
    () => {
      this.isValid && Object.keys(this.selections).length > 0 && this.calculatePricing();
    },
    500
  ), n = ht(() => {
    Se(() => {
      this.isValid + JSON.stringify(this.selections), s();
    });
  });
  T(this, Ve).push(n);
  const o = _r(
    () => {
      this.isDirty && this.saveConfiguration();
    },
    2e3
  ), l = ht(() => {
    Se(() => {
      this.isDirty && o();
    });
  });
  T(this, Ve).push(l);
  const v = ht(() => {
    Se(() => {
      ot(this, Ee, Fi).call(this);
    });
  });
  T(this, Ve).push(v);
}, Ni = function() {
  const e = () => {
    this.isOnline = !0, ot(this, Ee, Vi).call(this);
  }, r = () => {
    this.isOnline = !1;
  };
  window.addEventListener("online", e), window.addEventListener("offline", r), T(this, Ve).push(() => {
    window.removeEventListener("online", e), window.removeEventListener("offline", r);
  });
}, Vi = async function() {
  for (; this.retryQueue.length > 0 && this.isOnline; ) {
    const e = this.retryQueue.shift();
    try {
      await e();
    } catch (r) {
      console.error("Retry failed:", r);
    }
  }
}, Fi = function() {
  const e = {
    modelId: this.modelId,
    selections: this.selections,
    configurationId: this.configurationId,
    currentStep: this.currentStep,
    lastSaved: this.lastSaved
  };
  ss("cpq_config_state", e);
}, Ui = function() {
  const e = as("cpq_config_state");
  e && (this.modelId = e.modelId || "", this.selections = e.selections || {}, this.configurationId = e.configurationId || null, this.currentStep = e.currentStep || 0, this.lastSaved = e.lastSaved || null);
}, Bi = function() {
  this.history = this.history.slice(0, this.historyIndex + 1), this.history.push({
    selections: { ...this.selections },
    timestamp: Date.now()
  }), this.history.length > this.maxHistorySize && (this.history = this.history.slice(-this.maxHistorySize)), this.historyIndex = this.history.length - 1;
};
const _ = new os();
var ls = /* @__PURE__ */ zr('<svg viewBox="0 0 20 20" fill="currentColor" class="svelte-fs3n5v"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>'), us = /* @__PURE__ */ w('<div><div class="step-icon svelte-fs3n5v"><!></div> <span class="step-name svelte-fs3n5v"> </span></div>'), vs = /* @__PURE__ */ w('<div class="progress-indicator svelte-fs3n5v"><div class="progress-bar svelte-fs3n5v"><div class="progress-fill svelte-fs3n5v"></div></div> <div class="progress-steps svelte-fs3n5v"></div> <div class="progress-text svelte-fs3n5v"> </div></div>');
function cs(t, e) {
  let r = ge(e, "currentStep", 3, 0), i = ge(e, "completionPercentage", 3, 0);
  const s = [
    { name: "Configure", icon: "1" },
    { name: "Validate", icon: "2" },
    { name: "Price", icon: "3" },
    { name: "Complete", icon: "4" }
  ];
  var n = vs(), o = c(n), l = c(o), v = g(o, 2);
  ze(v, 21, () => s, Pe, (h, d, y) => {
    var x = us();
    let B;
    var A = c(x), q = c(A);
    {
      var I = (z) => {
        var H = ls();
        f(z, H);
      }, E = (z) => {
        var H = bt();
        D(() => M(H, a(d).icon)), f(z, H);
      };
      S(q, (z) => {
        y < r() ? z(I) : z(E, !1);
      });
    }
    var b = g(A, 2), L = c(b);
    D(
      (z) => {
        B = fe(x, 1, "step svelte-fs3n5v", null, B, z), M(L, a(d).name);
      },
      [
        () => ({
          active: y === r(),
          completed: y < r()
        })
      ]
    ), f(h, x);
  });
  var u = g(v, 2), m = c(u);
  D(() => {
    wr(l, `width: ${i() ?? ""}%`), M(m, `${i() ?? ""}% Complete`);
  }), f(t, n);
}
var ds = /* @__PURE__ */ w('<p class="loading-message svelte-c70bjm"> </p>'), fs = /* @__PURE__ */ w('<div><div class="spinner-content svelte-c70bjm"><div></div> <!></div></div>');
function _s(t, e) {
  let r = ge(e, "size", 3, "medium"), i = ge(e, "message", 3, ""), s = ge(e, "overlay", 3, !1);
  const n = {
    small: "w-4 h-4",
    medium: "w-8 h-8",
    large: "w-12 h-12"
  };
  var o = fs();
  let l;
  var v = c(o), u = c(v), m = g(u, 2);
  {
    var h = (d) => {
      var y = ds(), x = c(y);
      D(() => M(x, i())), f(d, y);
    };
    S(m, (d) => {
      i() && d(h);
    });
  }
  D(
    (d) => {
      l = fe(o, 1, "loading-spinner svelte-c70bjm", null, l, d), fe(u, 1, `spinner ${n[r()] ?? ""}`, "svelte-c70bjm");
    },
    [() => ({ overlay: s() })]
  ), f(t, o);
}
function hs(t, e, r, i) {
  j(e, !1), j(r, ""), i() && i()();
}
var ps = /* @__PURE__ */ w('<button class="retry-btn svelte-me7lub">Try Again</button>'), gs = /* @__PURE__ */ w('<div class="error-boundary svelte-me7lub"><div class="error-content svelte-me7lub"><svg class="error-icon svelte-me7lub" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg> <h3 class="svelte-me7lub">Something went wrong</h3> <p class="svelte-me7lub"> </p> <!></div></div>');
function ms(t, e) {
  We(e, !0);
  let r = ge(e, "error", 3, null), i = ge(e, "onRetry", 3, null), s = ge(e, "fallback", 3, null), n = /* @__PURE__ */ U(!1), o = /* @__PURE__ */ U("");
  Se(() => {
    r() && (j(n, !0), j(o, r().message || "An unexpected error occurred", !0));
  });
  var l = pt(), v = je(l);
  {
    var u = (h) => {
      var d = pt(), y = je(d);
      {
        var x = (A) => {
          var q = pt(), I = je(q);
          Yr(I, s), f(A, q);
        }, B = (A) => {
          var q = gs(), I = c(q), E = g(c(I), 4), b = c(E), L = g(E, 2);
          {
            var z = (H) => {
              var W = ps();
              W.__click = [
                hs,
                n,
                o,
                i
              ], f(H, W);
            };
            S(L, (H) => {
              i() && H(z);
            });
          }
          D(() => M(b, a(o))), f(A, q);
        };
        S(y, (A) => {
          s() ? A(x) : A(B, !1);
        });
      }
      f(h, d);
    }, m = (h) => {
      var d = pt(), y = je(d);
      Yr(y, () => e.children ?? $r), f(h, d);
    };
    S(v, (h) => {
      a(n) ? h(u) : h(m, !1);
    });
  }
  f(t, l), Ke();
}
st(["click"]);
function ys(t) {
  const {
    items: e,
    itemHeight: r,
    containerHeight: i,
    buffer: s = 5
  } = t;
  let n = $state(0), o = $derived(Math.floor(n / r)), l = $derived(Math.ceil((n + i) / r)), v = $derived(Math.max(0, o - s)), u = $derived(Math.min(e.length, l + s)), m = $derived(v * r);
  return {
    visibleItems: $derived(e.slice(v, u)),
    totalHeight: e.length * r,
    offsetY: m,
    updateScroll(h) {
      n = h;
    }
  };
}
function Ne(t) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(t);
}
function bs(t, e, r, i, s) {
  if (e.group.selection_type === "single") {
    const n = a(r) ? 0 : 1;
    j(i, n, !0), _.updateSelection(e.option.id, n);
  } else
    s(a(r) ? -a(i) : 1);
}
var ws = /* @__PURE__ */ w('<span class="option-sku svelte-cwem91"> </span>'), xs = /* @__PURE__ */ w('<span class="price-unit svelte-cwem91"> </span>'), Ss = /* @__PURE__ */ w('<p class="option-description svelte-cwem91"> </p>'), Es = /* @__PURE__ */ w('<span class="attribute svelte-cwem91"><span class="attribute-key svelte-cwem91"> </span> <span class="attribute-value svelte-cwem91"> </span></span>'), Is = /* @__PURE__ */ w('<div class="option-attributes svelte-cwem91"></div>'), ks = /* @__PURE__ */ w('<div class="error-text svelte-cwem91"> </div>'), Cs = /* @__PURE__ */ w('<div class="option-errors svelte-cwem91"></div>'), Ds = /* @__PURE__ */ w('<label class="radio-control svelte-cwem91"><input type="radio" class="radio-input svelte-cwem91"/> <span class="radio-label svelte-cwem91">Select</span></label>'), Ts = (t, e) => e(-1), Ms = (t, e) => e(parseInt(t.target.value) || 0), Ls = (t, e) => e(1), As = /* @__PURE__ */ w('<div class="quantity-total svelte-cwem91"> </div>'), Os = /* @__PURE__ */ w('<div class="quantity-controls svelte-cwem91"><button type="button" class="quantity-btn svelte-cwem91" aria-label="Decrease quantity"><svg class="icon svelte-cwem91" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" class="svelte-cwem91"></path></svg></button> <input type="number" class="quantity-input svelte-cwem91" min="0"/> <button type="button" class="quantity-btn svelte-cwem91" aria-label="Increase quantity"><svg class="icon svelte-cwem91" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" class="svelte-cwem91"></path></svg></button></div> <!>', 1), js = /* @__PURE__ */ w('<div class="availability-warning svelte-cwem91">Limited availability</div>'), Ps = /* @__PURE__ */ w('<div class="availability-error svelte-cwem91">Out of stock</div>'), zs = /* @__PURE__ */ w('<div><div class="option-header svelte-cwem91"><div class="option-info svelte-cwem91"><h4 class="option-name svelte-cwem91"> </h4> <!></div> <div class="option-price svelte-cwem91"> <!></div></div> <!> <!> <!> <div class="option-controls svelte-cwem91"><!></div> <!></div>');
function Kr(t, e) {
  We(e, !0);
  let r = /* @__PURE__ */ U(Fe(_.selections[e.option.id] || 0)), i = /* @__PURE__ */ Me(() => a(r) > 0), s = !1;
  const n = is(
    (p) => {
      _.updateSelection(e.option.id, p);
    },
    100
  );
  let o = /* @__PURE__ */ Me(() => _.validationResults.violations.filter((p) => p.option_id === e.option.id));
  function l(p) {
    const k = Math.max(0, a(r) + p);
    if (e.group.max_selections && p > 0) {
      const C = e.group.options.filter((P) => _.selections[P.id] > 0).length;
      if (!a(i) && C >= e.group.max_selections)
        return;
    }
    j(r, k, !0), n(k);
  }
  Se(() => {
    j(r, _.selections[e.option.id] || 0, !0);
  });
  var v = zs();
  let u;
  var m = c(v), h = c(m), d = c(h), y = c(d), x = g(d, 2);
  {
    var B = (p) => {
      var k = ws(), C = c(k);
      D(() => M(C, `SKU: ${e.option.sku ?? ""}`)), f(p, k);
    };
    S(x, (p) => {
      e.option.sku && p(B);
    });
  }
  var A = g(h, 2), q = c(A), I = g(q);
  {
    var E = (p) => {
      var k = xs(), C = c(k);
      D(() => M(C, `/${e.option.price_unit ?? ""}`)), f(p, k);
    };
    S(I, (p) => {
      e.option.price_unit && p(E);
    });
  }
  var b = g(m, 2);
  {
    var L = (p) => {
      var k = Ss(), C = c(k);
      D(() => M(C, e.option.description)), f(p, k);
    };
    S(b, (p) => {
      e.option.description && p(L);
    });
  }
  var z = g(b, 2);
  {
    var H = (p) => {
      var k = Is();
      ze(k, 21, () => Object.entries(e.option.attributes), Pe, (C, P) => {
        var N = /* @__PURE__ */ Me(() => Xi(a(P), 2));
        let $ = () => a(N)[0], V = () => a(N)[1];
        var le = Es(), ne = c(le), re = c(ne), ve = g(ne, 2), Ie = c(ve);
        D(() => {
          M(re, `${$() ?? ""}:`), M(Ie, V());
        }), f(C, le);
      }), f(p, k);
    };
    S(z, (p) => {
      e.option.attributes && Object.keys(e.option.attributes).length > 0 && p(H);
    });
  }
  var W = g(z, 2);
  {
    var Z = (p) => {
      var k = Cs();
      ze(k, 21, () => a(o), Pe, (C, P) => {
        var N = ks(), $ = c(N);
        D(() => M($, a(P).message)), f(C, N);
      }), f(p, k);
    };
    S(W, (p) => {
      a(o).length > 0 && p(Z);
    });
  }
  var X = g(W, 2), ue = c(X);
  {
    var me = (p) => {
      var k = Ds(), C = c(k);
      C.__change = [
        bs,
        e,
        i,
        r,
        l
      ], D(() => {
        kt(C, "name", `group-${e.group.id}`), Zn(C, a(i));
      }), f(p, k);
    }, Re = (p) => {
      var k = Os(), C = je(k), P = c(C);
      P.__click = [Ts, l];
      var N = g(P, 2);
      N.__change = [Ms, n];
      var $ = g(N, 2);
      $.__click = [Ls, l];
      var V = g(C, 2);
      {
        var le = (ne) => {
          var re = As(), ve = c(re);
          D((Ie) => M(ve, `Total: ${Ie ?? ""}`), [
            () => Ne(e.option.base_price * a(r))
          ]), f(ne, re);
        };
        S(V, (ne) => {
          a(r) > 0 && ne(le);
        });
      }
      D(() => {
        P.disabled = a(r) === 0, kt(N, "max", e.option.max_quantity || 999), $.disabled = e.option.max_quantity && a(r) >= e.option.max_quantity;
      }), Oi(N, () => a(r), (ne) => j(r, ne)), f(p, k);
    };
    S(ue, (p) => {
      e.group.selection_type === "single" ? p(me) : p(Re, !1);
    });
  }
  var ye = g(X, 2);
  {
    var O = (p) => {
      var k = js();
      f(p, k);
    }, R = (p, k) => {
      {
        var C = (P) => {
          var N = Ps();
          f(P, N);
        };
        S(
          p,
          (P) => {
            e.option.availability === "out_of_stock" && P(C);
          },
          k
        );
      }
    };
    S(ye, (p) => {
      e.option.availability === "limited" ? p(O) : p(R, !1);
    });
  }
  D(
    (p, k) => {
      u = fe(v, 1, "option-card svelte-cwem91", null, u, p), M(y, e.option.name), M(q, `${k ?? ""} `);
    },
    [
      () => ({
        selected: a(i),
        "has-errors": a(o).length > 0,
        loading: s
      }),
      () => Ne(e.option.base_price)
    ]
  ), f(t, v), Ke();
}
st(["change", "click"]);
var Rs = (t, e) => j(e, !a(e)), qs = /* @__PURE__ */ w('<span class="required-badge svelte-4o0mr">Required</span>'), Ns = /* @__PURE__ */ w('<span class="selection-type">Single selection</span>'), Vs = /* @__PURE__ */ w('<span class="selection-type">Multiple selection <!></span>'), Fs = /* @__PURE__ */ w('<span class="selection-count svelte-4o0mr"> </span>'), Us = /* @__PURE__ */ w('<p class="group-description svelte-4o0mr"> </p>'), Bs = /* @__PURE__ */ w('<div class="error-message svelte-4o0mr"><svg class="error-icon svelte-4o0mr" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg> </div>'), Hs = /* @__PURE__ */ w('<div class="group-errors svelte-4o0mr"></div>'), Ys = /* @__PURE__ */ w('<div class="search-box svelte-4o0mr"><input type="search" placeholder="Search options..." class="search-input svelte-4o0mr"/></div>'), Qs = /* @__PURE__ */ w('<div class="virtual-scroll-container svelte-4o0mr" style="height: 600px"><div><div></div></div></div>'), Gs = /* @__PURE__ */ w('<div class="options-grid svelte-4o0mr"></div>'), Js = /* @__PURE__ */ w('<div class="no-results svelte-4o0mr"> </div>'), Ws = /* @__PURE__ */ w('<div class="group-content svelte-4o0mr"><!> <!> <!> <div><!></div> <!></div>'), Ks = /* @__PURE__ */ w('<div><div class="group-header svelte-4o0mr"><div class="header-content svelte-4o0mr"><h3 class="group-title svelte-4o0mr"> <!></h3> <div class="group-meta svelte-4o0mr"><!> <!></div></div> <button class="expand-toggle svelte-4o0mr"><svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg></button></div> <!></div>');
function Xs(t, e) {
  We(e, !0);
  let r = /* @__PURE__ */ U(!0), i = /* @__PURE__ */ U(""), s = /* @__PURE__ */ U(!1), n = /* @__PURE__ */ U(null), o, l = /* @__PURE__ */ Me(() => e.group.options.filter((O) => O.name.toLowerCase().includes(a(i).toLowerCase()) || O.description?.toLowerCase().includes(a(i).toLowerCase())));
  Se(() => {
    a(l).length > 20 ? (j(s, !0), j(
      n,
      ys({
        items: a(l),
        itemHeight: 120,
        containerHeight: 600,
        buffer: 3
      }),
      !0
    )) : (j(s, !1), j(n, null));
  });
  let v = /* @__PURE__ */ Me(() => e.group.options.some((O) => _.selections[O.id] > 0)), u = /* @__PURE__ */ Me(() => _.validationResults.violations.some((O) => O.group_id === e.group.id || e.group.options.some((R) => O.option_id === R.id))), m = /* @__PURE__ */ Me(() => _.validationResults.violations.filter((O) => O.group_id === e.group.id || e.group.options.some((R) => O.option_id === R.id)));
  function h(O) {
    a(n) && a(n).updateScroll(O.target.scrollTop);
  }
  var d = Ks();
  let y;
  var x = c(d);
  x.__click = [Rs, r];
  var B = c(x), A = c(B), q = c(A), I = g(q);
  {
    var E = (O) => {
      var R = qs();
      f(O, R);
    };
    S(I, (O) => {
      e.group.required && O(E);
    });
  }
  var b = g(A, 2), L = c(b);
  {
    var z = (O) => {
      var R = Ns();
      f(O, R);
    }, H = (O, R) => {
      {
        var p = (k) => {
          var C = Vs(), P = g(c(C));
          {
            var N = ($) => {
              var V = bt();
              D(() => M(V, `(${(e.group.min_selections || 0) ?? ""}-${e.group.max_selections || "∞"})`)), f($, V);
            };
            S(P, ($) => {
              (e.group.min_selections > 0 || e.group.max_selections) && $(N);
            });
          }
          f(k, C);
        };
        S(
          O,
          (k) => {
            e.group.selection_type === "multiple" && k(p);
          },
          R
        );
      }
    };
    S(L, (O) => {
      e.group.selection_type === "single" ? O(z) : O(H, !1);
    });
  }
  var W = g(L, 2);
  {
    var Z = (O) => {
      var R = Fs(), p = c(R);
      D((k) => M(p, `${k ?? ""} selected`), [
        () => e.group.options.filter((k) => _.selections[k.id] > 0).length
      ]), f(O, R);
    };
    S(W, (O) => {
      a(v) && O(Z);
    });
  }
  var X = g(B, 2), ue = c(X);
  let me;
  var Re = g(x, 2);
  {
    var ye = (O) => {
      var R = Ws(), p = c(R);
      {
        var k = (F) => {
          var Q = Us(), se = c(Q);
          D(() => M(se, e.group.description)), f(F, Q);
        };
        S(p, (F) => {
          e.group.description && F(k);
        });
      }
      var C = g(p, 2);
      {
        var P = (F) => {
          var Q = Hs();
          ze(Q, 21, () => a(m), Pe, (se, _e) => {
            var be = Bs(), Y = g(c(be));
            D(() => M(Y, ` ${a(_e).message ?? ""}`)), f(se, be);
          }), f(F, Q);
        };
        S(C, (F) => {
          a(m).length > 0 && F(P);
        });
      }
      var N = g(C, 2);
      {
        var $ = (F) => {
          var Q = Ys(), se = c(Q);
          Oi(se, () => a(i), (_e) => j(i, _e)), f(F, Q);
        };
        S(N, (F) => {
          a(l).length > 10 && F($);
        });
      }
      var V = g(N, 2);
      let le;
      var ne = c(V);
      {
        var re = (F) => {
          var Q = Qs(), se = c(Q), _e = c(se);
          ze(_e, 21, () => a(n)?.visibleItems || [], Pe, (be, Y) => {
            Kr(be, {
              get option() {
                return a(Y);
              },
              get group() {
                return e.group;
              }
            });
          }), ji(Q, (be) => o = be, () => o), D(() => {
            wr(se, `height: ${(a(n)?.totalHeight || 0) ?? ""}px; position: relative;`), wr(_e, `transform: translateY(${(a(n)?.offsetY || 0) ?? ""}px);`);
          }), qn("scroll", Q, h), f(F, Q);
        }, ve = (F) => {
          var Q = Gs();
          ze(Q, 21, () => a(l), Pe, (se, _e) => {
            Kr(se, {
              get option() {
                return a(_e);
              },
              get group() {
                return e.group;
              }
            });
          }), f(F, Q);
        };
        S(ne, (F) => {
          a(s) && a(n) ? F(re) : F(ve, !1);
        });
      }
      var Ie = g(V, 2);
      {
        var qe = (F) => {
          var Q = Js(), se = c(Q);
          D(() => M(se, `No options found matching "${a(i) ?? ""}"`)), f(F, Q);
        };
        S(Ie, (F) => {
          a(l).length === 0 && F(qe);
        });
      }
      D((F) => le = fe(V, 1, "options-container", null, le, F), [
        () => ({ virtual: a(s) })
      ]), f(O, R);
    };
    S(Re, (O) => {
      a(r) && O(ye);
    });
  }
  D(
    (O, R) => {
      y = fe(d, 1, "option-group svelte-4o0mr", null, y, O), M(q, `${e.group.name ?? ""} `), kt(X, "aria-label", a(r) ? "Collapse" : "Expand"), me = fe(ue, 0, "icon svelte-4o0mr", null, me, R);
    },
    [
      () => ({ "has-errors": a(u) }),
      () => ({ rotated: a(r) })
    ]
  ), f(t, d), Ke();
}
st(["click"]);
var Zs = /* @__PURE__ */ w('<span class="calculating svelte-jzost2"><span class="spinner svelte-jzost2"></span> Calculating...</span>'), $s = (t, e) => j(e, !a(e)), ea = /* @__PURE__ */ w('<button class="toggle-btn svelte-jzost2"> </button>'), ta = /* @__PURE__ */ w('<div class="price-row savings svelte-jzost2"><span>Total Savings</span> <span> </span></div>'), ra = /* @__PURE__ */ w('<div class="price-per-unit svelte-jzost2"> </div>'), ia = /* @__PURE__ */ w('<span class="item-quantity svelte-jzost2"> </span>'), na = /* @__PURE__ */ w('<div class="item-group svelte-jzost2"> </div>'), sa = /* @__PURE__ */ w('<div class="item-reason svelte-jzost2"> </div>'), aa = /* @__PURE__ */ w('<span class="percentage svelte-jzost2"> </span>'), oa = /* @__PURE__ */ w("<span> <!></span>"), la = /* @__PURE__ */ w('<div><div class="item-info svelte-jzost2"><div class="item-name svelte-jzost2"> <!></div> <!> <!></div> <div class="item-price svelte-jzost2"><!></div></div>'), ua = /* @__PURE__ */ w('<div class="pricing-breakdown svelte-jzost2"><h4 class="breakdown-title svelte-jzost2">Price Breakdown</h4> <div class="breakdown-items svelte-jzost2"></div></div>'), va = (t, e) => j(e, !a(e)), ca = /* @__PURE__ */ w('<div class="discount-item svelte-jzost2"><div><div class="discount-name svelte-jzost2"> </div> <div class="discount-tier svelte-jzost2"> </div></div> <div class="discount-save svelte-jzost2"> </div></div>'), da = /* @__PURE__ */ w('<div class="volume-details svelte-jzost2"></div>'), fa = /* @__PURE__ */ w('<div class="volume-discounts svelte-jzost2"><button class="volume-header svelte-jzost2"><span>Volume Discounts Applied</span> <span class="discount-amount svelte-jzost2"> </span></button> <!></div>'), _a = /* @__PURE__ */ w('<div class="pricing-summary svelte-jzost2"><div class="price-row subtotal svelte-jzost2"><span>Subtotal</span> <span> </span></div> <!> <div class="price-row total svelte-jzost2"><span>Total Price</span> <span class="total-amount svelte-jzost2"> </span></div> <!></div> <!> <!>', 1), ha = /* @__PURE__ */ w('<div class="no-selections svelte-jzost2"><p>Select options to see pricing</p></div>'), pa = /* @__PURE__ */ w('<div class="pricing-display svelte-jzost2"><div class="pricing-header svelte-jzost2"><h3 class="pricing-title svelte-jzost2">Pricing Summary <!></h3> <!></div> <!></div>');
function ga(t, e) {
  We(e, !0);
  let r = ge(e, "detailed", 3, !0), i = /* @__PURE__ */ U(Fe(r())), s = /* @__PURE__ */ U(!1), n = /* @__PURE__ */ Me(() => () => {
    if (!_.pricingData) return null;
    const I = _.pricingData, E = [];
    return _.selectedOptions.forEach((b) => {
      E.push({
        type: "option",
        name: b.name,
        quantity: b.quantity,
        unitPrice: b.base_price,
        total: b.base_price * b.quantity,
        group: b.group_name
      });
    }), I.adjustments && I.adjustments.forEach((b) => {
      E.push({
        type: "adjustment",
        name: b.description || b.type,
        reason: b.reason,
        amount: b.amount,
        percentage: b.percentage
      });
    }), E;
  }), o = /* @__PURE__ */ Me(() => () => _.pricingData?.adjustments ? _.pricingData.adjustments.filter((I) => I.type === "volume_discount").map((I) => ({ ...I, saved: Math.abs(I.amount) })) : []), l = /* @__PURE__ */ Me(() => () => _.pricingData?.adjustments ? _.pricingData.adjustments.filter((I) => I.amount < 0).reduce((I, E) => I + Math.abs(E.amount), 0) : 0);
  var v = pa(), u = c(v), m = c(u), h = g(c(m));
  {
    var d = (I) => {
      var E = Zs();
      f(I, E);
    };
    S(h, (I) => {
      _.isPricing && I(d);
    });
  }
  var y = g(m, 2);
  {
    var x = (I) => {
      var E = ea();
      E.__click = [$s, i];
      var b = c(E);
      D(() => M(b, `${a(i) ? "Hide" : "Show"} Details`)), f(I, E);
    };
    S(y, (I) => {
      r() && a(n) && a(n).length > 0 && I(x);
    });
  }
  var B = g(u, 2);
  {
    var A = (I) => {
      var E = _a(), b = je(E), L = c(b), z = g(c(L), 2), H = c(z), W = g(L, 2);
      {
        var Z = (C) => {
          var P = ta(), N = g(c(P), 2), $ = c(N);
          D((V) => M($, `-${V ?? ""}`), [
            () => Ne(a(l))
          ]), f(C, P);
        };
        S(W, (C) => {
          a(l) > 0 && C(Z);
        });
      }
      var X = g(W, 2), ue = g(c(X), 2), me = c(ue), Re = g(X, 2);
      {
        var ye = (C) => {
          var P = ra(), N = c(P);
          D(($) => M(N, `${$ ?? ""} per unit`), [
            () => Ne(_.pricingData.price_per_unit)
          ]), f(C, P);
        };
        S(Re, (C) => {
          _.pricingData.price_per_unit && C(ye);
        });
      }
      var O = g(b, 2);
      {
        var R = (C) => {
          var P = ua(), N = g(c(P), 2);
          ze(N, 21, () => a(n), Pe, ($, V) => {
            var le = la(), ne = c(le), re = c(ne), ve = c(re), Ie = g(ve);
            {
              var qe = (G) => {
                var oe = ia(), ce = c(oe);
                D(() => M(ce, `×${a(V).quantity ?? ""}`)), f(G, oe);
              };
              S(Ie, (G) => {
                a(V).quantity > 1 && G(qe);
              });
            }
            var F = g(re, 2);
            {
              var Q = (G) => {
                var oe = na(), ce = c(oe);
                D(() => M(ce, a(V).group)), f(G, oe);
              };
              S(F, (G) => {
                a(V).group && G(Q);
              });
            }
            var se = g(F, 2);
            {
              var _e = (G) => {
                var oe = sa(), ce = c(oe);
                D(() => M(ce, a(V).reason)), f(G, oe);
              };
              S(se, (G) => {
                a(V).reason && G(_e);
              });
            }
            var be = g(ne, 2), Y = c(be);
            {
              var ie = (G) => {
                var oe = bt();
                D((ce) => M(oe, ce), [
                  () => Ne(a(V).total)
                ]), f(G, oe);
              }, ke = (G, oe) => {
                {
                  var ce = (He) => {
                    var ee = oa();
                    let Ce;
                    var Ye = c(ee), at = g(Ye);
                    {
                      var he = (we) => {
                        var Xe = aa(), lr = c(Xe);
                        D(() => M(lr, `(${a(V).percentage ?? ""}%)`)), f(we, Xe);
                      };
                      S(at, (we) => {
                        a(V).percentage && we(he);
                      });
                    }
                    D(
                      (we, Xe) => {
                        Ce = fe(ee, 1, "svelte-jzost2", null, Ce, we), M(Ye, `${a(V).amount < 0 ? "-" : "+"}${Xe ?? ""} `);
                      },
                      [
                        () => ({ discount: a(V).amount < 0 }),
                        () => Ne(Math.abs(a(V).amount))
                      ]
                    ), f(He, ee);
                  };
                  S(
                    G,
                    (He) => {
                      a(V).type === "adjustment" && He(ce);
                    },
                    oe
                  );
                }
              };
              S(Y, (G) => {
                a(V).type === "option" ? G(ie) : G(ke, !1);
              });
            }
            D(() => {
              fe(le, 1, `breakdown-item type-${a(V).type ?? ""}`, "svelte-jzost2"), M(ve, `${a(V).name ?? ""} `);
            }), f($, le);
          }), f(C, P);
        };
        S(O, (C) => {
          a(i) && a(n) && C(R);
        });
      }
      var p = g(O, 2);
      {
        var k = (C) => {
          var P = fa(), N = c(P);
          N.__click = [va, s];
          var $ = g(c(N), 2), V = c($), le = g(N, 2);
          {
            var ne = (re) => {
              var ve = da();
              ze(ve, 21, () => a(o), Pe, (Ie, qe) => {
                var F = ca(), Q = c(F), se = c(Q), _e = c(se), be = g(se, 2), Y = c(be), ie = g(Q, 2), ke = c(ie);
                D(
                  (G) => {
                    M(_e, a(qe).description), M(Y, `Tier: ${a(qe).tier_name || "Volume"}`), M(ke, `Save ${G ?? ""}`);
                  },
                  [
                    () => Ne(a(qe).saved)
                  ]
                ), f(Ie, F);
              }), f(re, ve);
            };
            S(le, (re) => {
              a(s) && re(ne);
            });
          }
          D((re) => M(V, `Save ${re ?? ""}`), [
            () => Ne(a(o).reduce((re, ve) => re + ve.saved, 0))
          ]), f(C, P);
        };
        S(p, (C) => {
          a(o).length > 0 && C(k);
        });
      }
      D(
        (C, P) => {
          M(H, C), M(me, P);
        },
        [
          () => Ne(_.basePrice),
          () => Ne(_.totalPrice)
        ]
      ), f(I, E);
    }, q = (I, E) => {
      {
        var b = (L) => {
          var z = ha();
          f(L, z);
        };
        S(
          I,
          (L) => {
            !_.isPricing && _.selectedOptions.length === 0 && L(b);
          },
          E
        );
      }
    };
    S(B, (I) => {
      _.pricingData ? I(A) : I(q, !1);
    });
  }
  f(t, v), Ke();
}
st(["click"]);
var ma = /* @__PURE__ */ w('<span class="validating-indicator svelte-hbmmex"><span class="spinner svelte-hbmmex"></span> Checking...</span>'), ya = /* @__PURE__ */ zr('<svg class="status-icon svelte-hbmmex" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg> Valid', 1), ba = /* @__PURE__ */ zr('<svg class="status-icon svelte-hbmmex" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg> ', 1), wa = /* @__PURE__ */ w("<div><!></div>"), xa = (t, e) => j(e, "all"), Sa = (t, e) => j(e, "error"), Ea = /* @__PURE__ */ w("<button> </button>"), Ia = (t, e) => j(e, "warning"), ka = /* @__PURE__ */ w("<button> </button>"), Ca = (t, e) => j(e, "info"), Da = /* @__PURE__ */ w("<button> </button>"), Ta = /* @__PURE__ */ w('<div class="violation-details svelte-hbmmex"> </div>'), Ma = /* @__PURE__ */ w('<span class="affected-option svelte-hbmmex"> </span> <!>', 1), La = /* @__PURE__ */ w('<div class="affected-options svelte-hbmmex">Affects: <!></div>'), Aa = /* @__PURE__ */ w('<div class="rule-expression svelte-hbmmex">Rule: <code class="svelte-hbmmex"> </code></div>'), Oa = /* @__PURE__ */ w("<li> </li>"), ja = /* @__PURE__ */ w('<div class="violation-suggestions svelte-hbmmex"><div class="suggestions-title svelte-hbmmex">Suggestions:</div> <ul class="suggestions-list svelte-hbmmex"></ul></div>'), Pa = (t, e, r) => e(a(r)), za = /* @__PURE__ */ w('<button class="auto-fix-btn svelte-hbmmex"><svg class="fix-icon svelte-hbmmex" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd"></path></svg> Auto-fix</button>'), Ra = /* @__PURE__ */ w('<div><div class="violation-header svelte-hbmmex"><svg class="violation-icon svelte-hbmmex" viewBox="0 0 20 20"><!></svg> <div class="violation-content svelte-hbmmex"><div class="violation-message svelte-hbmmex"> </div> <!> <!> <!></div></div> <!> <!></div>'), qa = /* @__PURE__ */ w('<div class="validation-filters svelte-hbmmex"><button> </button> <!> <!> <!></div> <div class="violations-list svelte-hbmmex"></div>', 1), Na = /* @__PURE__ */ w('<div class="valid-message svelte-hbmmex"><svg class="valid-icon svelte-hbmmex" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg> <p class="svelte-hbmmex">Your configuration is valid and meets all requirements.</p></div>'), Va = /* @__PURE__ */ w('<div class="validation-display svelte-hbmmex"><div class="validation-header svelte-hbmmex"><h3 class="validation-title svelte-hbmmex">Configuration Validation <!></h3> <!></div> <!></div>');
function Fa(t, e) {
  We(e, !0);
  let r = !0, i = /* @__PURE__ */ U("all"), s = /* @__PURE__ */ Me(() => () => {
    const E = _.validationResults.violations || [], b = { error: [], warning: [], info: [] };
    return E.forEach((L) => {
      const z = L.severity || "error";
      b[z] && b[z].push(L);
    }), b;
  }), n = /* @__PURE__ */ Me(() => () => a(i) === "all" ? _.validationResults.violations || [] : a(s)()[a(i)] || []);
  function o(E) {
    switch (E) {
      case "warning":
        return '<path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />';
      case "info":
        return '<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />';
      default:
        return '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />';
    }
  }
  function l(E) {
    switch (E) {
      case "warning":
        return "var(--warning)";
      case "info":
        return "var(--primary)";
      default:
        return "var(--error)";
    }
  }
  function v(E) {
    if (E.auto_fix_action) {
      const b = E.auto_fix_action;
      b.type === "add_selection" ? _.updateSelection(b.option_id, b.quantity || 1) : b.type === "remove_selection" && _.updateSelection(b.option_id, 0);
    }
  }
  var u = Va(), m = c(u), h = c(m), d = g(c(h));
  {
    var y = (E) => {
      var b = ma();
      f(E, b);
    };
    S(d, (E) => {
      _.isValidating && E(y);
    });
  }
  var x = g(h, 2);
  {
    var B = (E) => {
      var b = wa();
      let L;
      var z = c(b);
      {
        var H = (Z) => {
          var X = ya();
          f(Z, X);
        }, W = (Z) => {
          var X = ba(), ue = g(je(X));
          D(() => M(ue, `${a(n).length ?? ""} Issues`)), f(Z, X);
        };
        S(z, (Z) => {
          _.isValid ? Z(H) : Z(W, !1);
        });
      }
      D((Z) => L = fe(b, 1, "validation-status svelte-hbmmex", null, L, Z), [() => ({ valid: _.isValid })]), f(E, b);
    };
    S(x, (E) => {
      _.isValidating || E(B);
    });
  }
  var A = g(m, 2);
  {
    var q = (E) => {
      var b = qa(), L = je(b), z = c(L);
      let H;
      z.__click = [xa, i];
      var W = c(z), Z = g(z, 2);
      {
        var X = (R) => {
          var p = Ea();
          let k;
          p.__click = [Sa, i];
          var C = c(p);
          D(
            (P, N) => {
              k = fe(p, 1, "filter-btn error svelte-hbmmex", null, k, P), M(C, `Errors (${N ?? ""})`);
            },
            [
              () => ({ active: a(i) === "error" }),
              () => a(s)().error.length
            ]
          ), f(R, p);
        };
        S(Z, (R) => {
          a(s)().error.length > 0 && R(X);
        });
      }
      var ue = g(Z, 2);
      {
        var me = (R) => {
          var p = ka();
          let k;
          p.__click = [Ia, i];
          var C = c(p);
          D(
            (P, N) => {
              k = fe(p, 1, "filter-btn warning svelte-hbmmex", null, k, P), M(C, `Warnings (${N ?? ""})`);
            },
            [
              () => ({
                active: a(i) === "warning"
              }),
              () => a(s)().warning.length
            ]
          ), f(R, p);
        };
        S(ue, (R) => {
          a(s)().warning.length > 0 && R(me);
        });
      }
      var Re = g(ue, 2);
      {
        var ye = (R) => {
          var p = Da();
          let k;
          p.__click = [Ca, i];
          var C = c(p);
          D(
            (P, N) => {
              k = fe(p, 1, "filter-btn info svelte-hbmmex", null, k, P), M(C, `Info (${N ?? ""})`);
            },
            [
              () => ({ active: a(i) === "info" }),
              () => a(s)().info.length
            ]
          ), f(R, p);
        };
        S(Re, (R) => {
          a(s)().info.length > 0 && R(ye);
        });
      }
      var O = g(L, 2);
      ze(O, 21, () => a(n), Pe, (R, p) => {
        var k = Ra(), C = c(k), P = c(C), N = c(P);
        Gn(N, () => o(a(p).severity || "error"), !0);
        var $ = g(P, 2), V = c($), le = c(V), ne = g(V, 2);
        {
          var re = (Y) => {
            var ie = Ta(), ke = c(ie);
            D(() => M(ke, a(p).details)), f(Y, ie);
          };
          S(ne, (Y) => {
            a(p).details && Y(re);
          });
        }
        var ve = g(ne, 2);
        {
          var Ie = (Y) => {
            var ie = La(), ke = g(c(ie));
            ze(ke, 17, () => a(p).affected_options, Pe, (G, oe, ce) => {
              var He = Ma(), ee = je(He), Ce = c(ee), Ye = g(ee, 2);
              {
                var at = (he) => {
                  var we = bt(",");
                  f(he, we);
                };
                S(Ye, (he) => {
                  ce < a(p).affected_options.length - 1 && he(at);
                });
              }
              D((he) => M(Ce, he), [
                () => _.model?.option_groups.flatMap((he) => he.options).find((he) => he.id === a(oe))?.name || a(oe)
              ]), f(G, He);
            }), f(Y, ie);
          };
          S(ve, (Y) => {
            a(p).affected_options && a(p).affected_options.length > 0 && Y(Ie);
          });
        }
        var qe = g(ve, 2);
        {
          var F = (Y) => {
            var ie = Aa(), ke = g(c(ie)), G = c(ke);
            D(() => M(G, a(p).rule_expression)), f(Y, ie);
          };
          S(qe, (Y) => {
            a(p).rule_expression && r && Y(F);
          });
        }
        var Q = g(C, 2);
        {
          var se = (Y) => {
            var ie = ja(), ke = g(c(ie), 2);
            ze(ke, 21, () => a(p).suggestions, Pe, (G, oe) => {
              var ce = Oa(), He = c(ce);
              D(() => M(He, a(oe))), f(G, ce);
            }), f(Y, ie);
          };
          S(Q, (Y) => {
            a(p).suggestions && a(p).suggestions.length > 0 && Y(se);
          });
        }
        var _e = g(Q, 2);
        {
          var be = (Y) => {
            var ie = za();
            ie.__click = [Pa, v, p], f(Y, ie);
          };
          S(_e, (Y) => {
            a(p).auto_fix_action && Y(be);
          });
        }
        D(
          (Y) => {
            fe(k, 1, `violation-item severity-${a(p).severity || "error"}`, "svelte-hbmmex"), kt(P, "fill", Y), M(le, a(p).message);
          },
          [
            () => l(a(p).severity || "error")
          ]
        ), f(R, k);
      }), D(
        (R) => {
          H = fe(z, 1, "filter-btn svelte-hbmmex", null, H, R), M(W, `All (${_.validationResults.violations.length ?? ""})`);
        },
        [
          () => ({ active: a(i) === "all" })
        ]
      ), f(E, b);
    }, I = (E, b) => {
      {
        var L = (z) => {
          var H = Na();
          f(z, H);
        };
        S(
          E,
          (z) => {
            _.isValid && !_.isValidating && z(L);
          },
          b
        );
      }
    };
    S(A, (E) => {
      !_.isValid && a(n).length > 0 ? E(q) : E(I, !1);
    });
  }
  f(t, u), Ke();
}
st(["click"]);
un();
async function Ua() {
  try {
    await _.saveConfiguration();
  } catch (t) {
    console.error("Failed to save:", t);
  }
}
var Ba = /* @__PURE__ */ w('<div class="configuration-summary svelte-31i1s8"><h3 class="svelte-31i1s8">Configuration Summary</h3> <div class="summary-stats svelte-31i1s8"><div class="stat svelte-31i1s8"><span class="stat-value svelte-31i1s8"> </span> <span class="stat-label svelte-31i1s8">Options Selected</span></div> <div class="stat svelte-31i1s8"><span class="stat-value svelte-31i1s8"> </span> <span class="stat-label svelte-31i1s8">Total Price</span></div></div> <div class="summary-actions svelte-31i1s8"><button class="action-btn primary svelte-31i1s8">Save Configuration</button> <button class="action-btn secondary svelte-31i1s8">Export</button></div></div>');
function Ha(t, e) {
  We(e, !1);
  function r() {
    const x = {
      modelId: _.modelId,
      modelName: _.model?.name,
      selections: _.selections,
      pricing: _.pricingData,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    }, B = new Blob([JSON.stringify(x, null, 2)], { type: "application/json" }), A = URL.createObjectURL(B), q = document.createElement("a");
    q.href = A, q.download = `configuration-${Date.now()}.json`, q.click(), URL.revokeObjectURL(A);
  }
  Pi();
  var i = Ba(), s = g(c(i), 2), n = c(s), o = c(n), l = c(o), v = g(n, 2), u = c(v), m = c(u), h = g(s, 2), d = c(h);
  d.__click = [Ua];
  var y = g(d, 2);
  y.__click = r, D(
    (x) => {
      M(l, _.selectedOptions.length), M(m, x);
    },
    [
      () => Ne(_.totalPrice)
    ],
    li
  ), f(t, i), Ke();
}
st(["click"]);
var Ya = /* @__PURE__ */ w(`<div class="network-banner offline svelte-id3e46"><svg class="icon svelte-id3e46" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd"></path><path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z"></path></svg> <span>You're offline - changes will be saved when connection is restored</span></div>`);
function Qa(t, e) {
  We(e, !0);
  let r = /* @__PURE__ */ U(!1);
  Se(() => {
    j(r, !_.isOnline);
  });
  var i = pt(), s = je(i);
  {
    var n = (o) => {
      var l = Ya();
      f(o, l);
    };
    S(s, (o) => {
      a(r) && o(n);
    });
  }
  f(t, i), Ke();
}
var Ga = () => _.undo(), Ja = () => _.redo(), Wa = /* @__PURE__ */ w('<div class="undo-redo svelte-2vt889"><button class="action-btn svelte-2vt889" title="Undo"><svg viewBox="0 0 20 20" fill="currentColor" class="svelte-2vt889"><path d="M12.207 2.293a1 1 0 010 1.414L10.914 5H13a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5h-2.586l1.293 1.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z"></path></svg></button> <button class="action-btn svelte-2vt889" title="Redo"><svg viewBox="0 0 20 20" fill="currentColor" class="svelte-2vt889"><path d="M7.793 2.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L9.086 7H7a5 5 0 00-5 5v2a1 1 0 11-2 0v-2a7 7 0 017-7h2.586L7.793 3.707a1 1 0 010-1.414z"></path></svg></button></div>');
function Ka(t, e) {
  We(e, !1), Pi();
  var r = Wa(), i = c(r);
  i.__click = [Ga];
  var s = g(i, 2);
  s.__click = [Ja], D(() => {
    i.disabled = !_.canUndo, s.disabled = !_.canRedo;
  }), f(t, r), Ke();
}
st(["click"]);
var Xa = /* @__PURE__ */ w('<div class="error-state svelte-1m2ujmu"><svg class="error-icon svelte-1m2ujmu" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg> <h2 class="svelte-1m2ujmu">Model Not Found</h2> <p class="svelte-1m2ujmu"> </p> <p class="error-details svelte-1m2ujmu">Please check the model ID and try again.</p></div>'), Za = /* @__PURE__ */ w('<p class="configurator-description svelte-1m2ujmu"> </p>'), $a = () => _.previousStep(), eo = /* @__PURE__ */ w('<span class="save-indicator svelte-1m2ujmu"><!></span>'), to = (t, e) => {
  _.currentStep === 3 ? e() : _.nextStep();
}, ro = /* @__PURE__ */ w('<div class="configurator-header svelte-1m2ujmu"><div class="header-content"><h1 class="configurator-title svelte-1m2ujmu"> </h1> <!></div> <!></div> <!> <div><div class="options-panel svelte-1m2ujmu"><!></div> <div class="sidebar-panel svelte-1m2ujmu"><!> <!> <!></div></div> <div class="configurator-actions svelte-1m2ujmu"><button type="button" class="btn btn-secondary svelte-1m2ujmu">Previous</button> <div class="action-group svelte-1m2ujmu"><!> <button type="button" class="btn btn-primary svelte-1m2ujmu"> </button></div></div>', 1), io = /* @__PURE__ */ w('<div class="no-model svelte-1m2ujmu"><p>No model selected</p></div>'), no = /* @__PURE__ */ w('<div class="configurator-content svelte-1m2ujmu"><!></div>'), so = /* @__PURE__ */ w("<div><!> <!></div>");
function ao(t, e) {
  We(e, !0);
  let r = ge(e, "theme", 3, "light"), i = ge(e, "apiUrl", 3, "http://localhost:8080/api/v1"), s = ge(e, "embedMode", 3, !1), n = ge(e, "onComplete", 3, null), o = ge(e, "onConfigurationChange", 3, null), l = ge(e, "onError", 3, null), v;
  typeof window < "u" && (window.__API_BASE_URL__ = i()), zi(() => {
    if (_.initialize(i()), e.modelId && setTimeout(
      () => {
        _.setModelId(e.modelId);
      },
      0
    ), document.documentElement.setAttribute("data-theme", r()), o()) {
      const A = ht(() => {
        Se(() => {
          _.isDirty && _.selections && o()({
            selections: _.selections,
            validation: _.validationResults,
            pricing: _.pricingData
          });
        });
      });
      return () => A();
    }
  }), es(() => {
    _.destroy();
  });
  function u() {
    const A = {
      modelId: _.modelId,
      selections: _.selections,
      pricing: _.pricingData,
      validation: _.validationResults
    };
    n() && n()(A);
  }
  function m(A) {
    console.error("Configuration error:", A), l() && l()(A);
  }
  function h() {
    _.clearError(), _.loadModel();
  }
  Se(() => {
    _.error && m(_.error);
  });
  var d = so();
  let y;
  var x = c(d);
  Qa(x, {});
  var B = g(x, 2);
  ms(B, {
    get error() {
      return _.error;
    },
    onRetry: h,
    children: (q) => {
      var I = no(), E = c(I);
      {
        var b = (z) => {
          var H = Xa(), W = g(c(H), 4), Z = c(W);
          D(() => M(Z, `The model with ID "${e.modelId ?? ""}" could not be found.`)), f(z, H);
        }, L = (z, H) => {
          {
            var W = (X) => {
              _s(X, {
                size: "large",
                message: "Loading configuration..."
              });
            }, Z = (X, ue) => {
              {
                var me = (ye) => {
                  var O = ro(), R = je(O), p = c(R), k = c(p), C = c(k), P = g(k, 2);
                  {
                    var N = (ee) => {
                      var Ce = Za(), Ye = c(Ce);
                      D(() => M(Ye, _.model.description)), f(ee, Ce);
                    };
                    S(P, (ee) => {
                      _.model.description && ee(N);
                    });
                  }
                  var $ = g(p, 2);
                  Ka($, {});
                  var V = g(R, 2);
                  cs(V, {
                    get currentStep() {
                      return _.currentStep;
                    },
                    get completionPercentage() {
                      return _.completionPercentage;
                    }
                  });
                  var le = g(V, 2);
                  let ne;
                  var re = c(le), ve = c(re);
                  {
                    var Ie = (ee) => {
                      var Ce = pt(), Ye = je(Ce);
                      ze(Ye, 17, () => _.model.option_groups, Pe, (at, he) => {
                        Xs(at, {
                          get group() {
                            return a(he);
                          }
                        });
                      }), f(ee, Ce);
                    };
                    S(ve, (ee) => {
                      _.model.option_groups && ee(Ie);
                    });
                  }
                  var qe = g(re, 2), F = c(qe);
                  Fa(F, {});
                  var Q = g(F, 2);
                  const se = /* @__PURE__ */ Me(() => !s());
                  ga(Q, {
                    get detailed() {
                      return a(se);
                    }
                  });
                  var _e = g(Q, 2);
                  {
                    var be = (ee) => {
                      Ha(ee, {});
                    };
                    S(_e, (ee) => {
                      _.completionPercentage === 100 && ee(be);
                    });
                  }
                  var Y = g(le, 2), ie = c(Y);
                  ie.__click = [$a];
                  var ke = g(ie, 2), G = c(ke);
                  {
                    var oe = (ee) => {
                      var Ce = eo(), Ye = c(Ce);
                      {
                        var at = (we) => {
                          var Xe = bt();
                          D((lr) => M(Xe, `Last saved ${lr ?? ""}`), [
                            () => new Date(_.lastSaved).toLocaleTimeString()
                          ]), f(we, Xe);
                        }, he = (we) => {
                          var Xe = bt("Unsaved changes");
                          f(we, Xe);
                        };
                        S(Ye, (we) => {
                          _.lastSaved ? we(at) : we(he, !1);
                        });
                      }
                      f(ee, Ce);
                    };
                    S(G, (ee) => {
                      _.isDirty && ee(oe);
                    });
                  }
                  var ce = g(G, 2);
                  ce.__click = [to, u];
                  var He = c(ce);
                  D(
                    (ee) => {
                      M(C, _.model.name), ne = fe(le, 1, "configurator-body svelte-1m2ujmu", null, ne, ee), ie.disabled = _.currentStep === 0, ce.disabled = !_.canProceedToNextStep && _.currentStep < 3, M(He, _.currentStep === 3 ? "Complete" : "Next");
                    },
                    [() => ({ compact: s() })]
                  ), f(ye, O);
                }, Re = (ye) => {
                  var O = io();
                  f(ye, O);
                };
                S(
                  X,
                  (ye) => {
                    _.model ? ye(me) : ye(Re, !1);
                  },
                  ue
                );
              }
            };
            S(
              z,
              (X) => {
                _.isLoading ? X(W) : X(Z, !1);
              },
              H
            );
          }
        };
        S(E, (z) => {
          _.error && _.error.code === "NOT_FOUND" ? z(b) : z(L, !1);
        });
      }
      f(q, I);
    },
    $$slots: { default: !0 }
  }), ji(d, (A) => v = A, () => v), D(
    (A) => {
      y = fe(d, 1, "cpq-configurator svelte-1m2ujmu", null, y, A), kt(d, "data-theme", r());
    },
    [() => ({ "embed-mode": s() })]
  ), f(t, d), Ke();
}
st(["click"]);
const Rr = new URLSearchParams(window.location.search), oo = Rr.get("model") || window.location.pathname.split("/").pop(), lo = Rr.get("theme") || "light", uo = Rr.get("api") || "http://localhost:8080/api/v1", co = Vn(ao, {
  target: document.body,
  props: {
    modelId: oo,
    theme: lo,
    apiUrl: uo,
    embedMode: !0,
    onComplete: (t) => {
      window.parent !== window && window.parent.postMessage({
        type: "cpq-configuration-complete",
        configuration: t
      }, "*");
    },
    onConfigurationChange: (t) => {
      window.parent !== window && window.parent.postMessage({
        type: "cpq-configuration-change",
        configuration: t
      }, "*");
    },
    onError: (t) => {
      window.parent !== window && window.parent.postMessage({
        type: "cpq-error",
        error: t.message
      }, "*");
    }
  }
});
export {
  co as default
};
