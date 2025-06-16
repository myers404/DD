var Bi = Object.defineProperty;
var zr = (t) => {
  throw TypeError(t);
};
var Hi = (t, e, r) => e in t ? Bi(t, e, { enumerable: !0, configurable: !0, writable: !0, value: r }) : t[e] = r;
var ur = (t, e, r) => Hi(t, typeof e != "symbol" ? e + "" : e, r), vr = (t, e, r) => e.has(t) || zr("Cannot " + r);
var T = (t, e, r) => (vr(t, e, "read from private field"), r ? r.call(t) : e.get(t)), ae = (t, e, r) => e.has(t) ? zr("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, r), ft = (t, e, r, i) => (vr(t, e, "write to private field"), i ? i.call(t, r) : e.set(t, r), r), ot = (t, e, r) => (vr(t, e, "access private method"), r);
var xr = Array.isArray, Qi = Array.prototype.indexOf, Sr = Array.from, Yi = Object.defineProperty, St = Object.getOwnPropertyDescriptor, Xr = Object.getOwnPropertyDescriptors, Gi = Object.prototype, Ji = Array.prototype, Er = Object.getPrototypeOf, qr = Object.isExtensible;
const Zr = () => {
};
function Wi(t) {
  return t();
}
function hr(t) {
  for (var e = 0; e < t.length; e++)
    t[e]();
}
function Ki(t, e) {
  if (Array.isArray(t))
    return t;
  if (!(Symbol.iterator in t))
    return Array.from(t);
  const r = [];
  for (const i of t)
    if (r.push(i), r.length === e) break;
  return r;
}
const Fe = 2, $r = 4, er = 8, Ir = 16, tt = 32, vt = 64, Cr = 128, Ae = 256, Gt = 512, Le = 1024, et = 2048, ct = 4096, Ze = 8192, kr = 16384, ei = 32768, tr = 65536, Xi = 1 << 19, ti = 1 << 20, pr = 1 << 21, gt = Symbol("$state"), Zi = Symbol("");
function ri(t) {
  return t === this.v;
}
function $i(t, e) {
  return t != t ? e == e : t !== e || t !== null && typeof t == "object" || typeof t == "function";
}
function ii(t) {
  return !$i(t, this.v);
}
function en(t) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function tn() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function rn(t) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function nn() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function sn() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function an() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function on() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
let Bt = !1;
function ln() {
  Bt = !0;
}
const Dr = 1, Tr = 2, ni = 4, un = 8, vn = 16, si = 1, cn = 2, xe = Symbol(), dn = "http://www.w3.org/1999/xhtml";
function ai(t) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
let te = null;
function Nr(t) {
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
  }), pi(() => {
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
function Ue(t) {
  if (typeof t != "object" || t === null || gt in t)
    return t;
  const e = Er(t);
  if (e !== Gi && e !== Ji)
    return t;
  var r = /* @__PURE__ */ new Map(), i = xr(t), s = /* @__PURE__ */ F(0), n = K, o = (l) => {
    var v = K;
    Je(n);
    var u = l();
    return Je(v), u;
  };
  return i && r.set("length", /* @__PURE__ */ F(
    /** @type {any[]} */
    t.length
  )), new Proxy(
    /** @type {any} */
    t,
    {
      defineProperty(l, v, u) {
        return (!("value" in u) || u.configurable === !1 || u.enumerable === !1 || u.writable === !1) && sn(), o(() => {
          var p = r.get(v);
          p === void 0 ? (p = /* @__PURE__ */ F(u.value), r.set(v, p)) : P(p, u.value, !0);
        }), !0;
      },
      deleteProperty(l, v) {
        var u = r.get(v);
        if (u === void 0) {
          if (v in l) {
            const d = o(() => /* @__PURE__ */ F(xe));
            r.set(v, d), cr(s);
          }
        } else {
          if (i && typeof v == "string") {
            var p = (
              /** @type {Source<number>} */
              r.get("length")
            ), f = Number(v);
            Number.isInteger(f) && f < p.v && P(p, f);
          }
          P(u, xe), cr(s);
        }
        return !0;
      },
      get(l, v, u) {
        if (v === gt)
          return t;
        var p = r.get(v), f = v in l;
        if (p === void 0 && (!f || St(l, v)?.writable) && (p = o(() => {
          var y = Ue(f ? l[v] : xe), x = /* @__PURE__ */ F(y);
          return x;
        }), r.set(v, p)), p !== void 0) {
          var d = a(p);
          return d === xe ? void 0 : d;
        }
        return Reflect.get(l, v, u);
      },
      getOwnPropertyDescriptor(l, v) {
        var u = Reflect.getOwnPropertyDescriptor(l, v);
        if (u && "value" in u) {
          var p = r.get(v);
          p && (u.value = a(p));
        } else if (u === void 0) {
          var f = r.get(v), d = f?.v;
          if (f !== void 0 && d !== xe)
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
        var u = r.get(v), p = u !== void 0 && u.v !== xe || Reflect.has(l, v);
        if (u !== void 0 || J !== null && (!p || St(l, v)?.writable)) {
          u === void 0 && (u = o(() => {
            var d = p ? Ue(l[v]) : xe, y = /* @__PURE__ */ F(d);
            return y;
          }), r.set(v, u));
          var f = a(u);
          if (f === xe)
            return !1;
        }
        return p;
      },
      set(l, v, u, p) {
        var f = r.get(v), d = v in l;
        if (i && v === "length")
          for (var y = u; y < /** @type {Source<number>} */
          f.v; y += 1) {
            var x = r.get(y + "");
            x !== void 0 ? P(x, xe) : y in l && (x = o(() => /* @__PURE__ */ F(xe)), r.set(y + "", x));
          }
        if (f === void 0)
          (!d || St(l, v)?.writable) && (f = o(() => {
            var E = /* @__PURE__ */ F(void 0);
            return P(E, Ue(u)), E;
          }), r.set(v, f));
        else {
          d = f.v !== xe;
          var B = o(() => Ue(u));
          P(f, B);
        }
        var L = Reflect.getOwnPropertyDescriptor(l, v);
        if (L?.set && L.set.call(p, u), !d) {
          if (i && typeof v == "string") {
            var q = (
              /** @type {Source<number>} */
              r.get("length")
            ), I = Number(v);
            Number.isInteger(I) && I >= q.v && P(q, I + 1);
          }
          cr(s);
        }
        return !0;
      },
      ownKeys(l) {
        a(s);
        var v = Reflect.ownKeys(l).filter((f) => {
          var d = r.get(f);
          return d === void 0 || d.v !== xe;
        });
        for (var [u, p] of r)
          p.v !== xe && !(u in l) && v.push(u);
        return v;
      },
      setPrototypeOf() {
        an();
      }
    }
  );
}
function cr(t, e = 1) {
  P(t, t.v + e);
}
// @__NO_SIDE_EFFECTS__
function rr(t) {
  var e = Fe | et, r = K !== null && (K.f & Fe) !== 0 ? (
    /** @type {Derived} */
    K
  ) : null;
  return J === null || r !== null && (r.f & Ae) !== 0 ? e |= Ae : J.f |= ti, {
    ctx: te,
    deps: null,
    effects: null,
    equals: ri,
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
  return Ei(e), e;
}
// @__NO_SIDE_EFFECTS__
function oi(t) {
  const e = /* @__PURE__ */ rr(t);
  return e.equals = ii, e;
}
function li(t) {
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
function fn(t) {
  for (var e = t.parent; e !== null; ) {
    if ((e.f & Fe) === 0)
      return (
        /** @type {Effect} */
        e
      );
    e = e.parent;
  }
  return null;
}
function ui(t) {
  var e, r = J;
  nt(fn(t));
  try {
    li(t), e = Di(t);
  } finally {
    nt(r);
  }
  return e;
}
function vi(t) {
  var e = ui(t);
  if (t.equals(e) || (t.v = e, t.wv = Ci()), !wt) {
    var r = (it || (t.f & Ae) !== 0) && t.deps !== null ? ct : Le;
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
    equals: ri,
    rv: 0,
    wv: 0
  };
  return r;
}
// @__NO_SIDE_EFFECTS__
function F(t, e) {
  const r = It(t);
  return Ei(r), r;
}
// @__NO_SIDE_EFFECTS__
function _n(t, e = !1, r = !0) {
  var s;
  const i = It(t);
  return e || (i.equals = ii), Bt && r && te !== null && te.l !== null && ((s = te.l).s ?? (s.s = [])).push(i), i;
}
function P(t, e, r = !1) {
  K !== null && !Ye && Ht() && (K.f & (Fe | Ir)) !== 0 && !$e?.includes(t) && on();
  let i = r ? Ue(e) : e;
  return gr(t, i);
}
function gr(t, e) {
  if (!t.equals(e)) {
    var r = t.v;
    wt ? Et.set(t, e) : Et.set(t, r), t.v = e, (t.f & Fe) !== 0 && ((t.f & et) !== 0 && ui(
      /** @type {Derived} */
      t
    ), Be(t, (t.f & Ae) === 0 ? Le : ct)), t.wv = Ci(), ci(t, et), Ht() && J !== null && (J.f & Le) !== 0 && (J.f & (tt | vt)) === 0 && (Oe === null ? En([t]) : Oe.push(t));
  }
  return e;
}
function ci(t, e) {
  var r = t.reactions;
  if (r !== null)
    for (var i = Ht(), s = r.length, n = 0; n < s; n++) {
      var o = r[n], l = o.f;
      (l & et) === 0 && (!i && o === J || (Be(o, e), (l & (Le | Ae)) !== 0 && ((l & Fe) !== 0 ? ci(
        /** @type {Derived} */
        o,
        ct
      ) : or(
        /** @type {Effect} */
        o
      ))));
    }
}
let hn = !1;
var Vr, di, fi, _i;
function pn() {
  if (Vr === void 0) {
    Vr = window, di = /Firefox/.test(navigator.userAgent);
    var t = Element.prototype, e = Node.prototype, r = Text.prototype;
    fi = St(e, "firstChild").get, _i = St(e, "nextSibling").get, qr(t) && (t.__click = void 0, t.__className = void 0, t.__attributes = null, t.__style = void 0, t.__e = void 0), qr(r) && (r.__t = void 0);
  }
}
function ir(t = "") {
  return document.createTextNode(t);
}
// @__NO_SIDE_EFFECTS__
function Te(t) {
  return fi.call(t);
}
// @__NO_SIDE_EFFECTS__
function nr(t) {
  return _i.call(t);
}
function c(t, e) {
  return /* @__PURE__ */ Te(t);
}
function Pe(t, e) {
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
function m(t, e = 1, r = !1) {
  let i = t;
  for (; e--; )
    i = /** @type {TemplateNode} */
    /* @__PURE__ */ nr(i);
  return i;
}
function gn(t) {
  t.textContent = "";
}
function hi(t) {
  J === null && K === null && rn(), K !== null && (K.f & Ae) !== 0 && J === null && tn(), wt && en();
}
function mn(t, e) {
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
      Pr(n), n.f |= ei;
    } catch (v) {
      throw Ge(n), v;
    }
  else e !== null && or(n);
  var o = r && n.deps === null && n.first === null && n.nodes_start === null && n.teardown === null && (n.f & (ti | Cr)) === 0;
  if (!o && i && (s !== null && mn(n, s), K !== null && (K.f & Fe) !== 0)) {
    var l = (
      /** @type {Derived} */
      K
    );
    (l.effects ?? (l.effects = [])).push(n);
  }
  return n;
}
function pi(t) {
  const e = dt(er, null, !1);
  return Be(e, Le), e.teardown = t, e;
}
function Se(t) {
  hi();
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
function yn(t) {
  return hi(), Ar(t);
}
function ht(t) {
  const e = dt(vt, t, !0);
  return () => {
    Ge(e);
  };
}
function bn(t) {
  const e = dt(vt, t, !0);
  return (r = {}) => new Promise((i) => {
    r.outro ? Jt(e, () => {
      Ge(e), i(void 0);
    }) : (Ge(e), i(void 0));
  });
}
function Mr(t) {
  return dt($r, t, !1);
}
function Ar(t) {
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
function gi(t) {
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
function mi(t, e = !1) {
  var r = t.first;
  for (t.first = t.last = null; r !== null; ) {
    var i = r.next;
    (r.f & vt) !== 0 ? r.parent = null : Ge(r, e), r = i;
  }
}
function wn(t) {
  for (var e = t.first; e !== null; ) {
    var r = e.next;
    (e.f & tt) === 0 && Ge(e), e = r;
  }
}
function Ge(t, e = !0) {
  var r = !1;
  (e || (t.f & Xi) !== 0) && t.nodes_start !== null && t.nodes_end !== null && (yi(
    t.nodes_start,
    /** @type {TemplateNode} */
    t.nodes_end
  ), r = !0), mi(t, e && !r), $t(t, 0), Be(t, kr);
  var i = t.transitions;
  if (i !== null)
    for (const n of i)
      n.stop();
  gi(t);
  var s = t.parent;
  s !== null && s.first !== null && bi(t), t.next = t.prev = t.teardown = t.ctx = t.deps = t.fn = t.nodes_start = t.nodes_end = null;
}
function yi(t, e) {
  for (; t !== null; ) {
    var r = t === e ? null : (
      /** @type {TemplateNode} */
      /* @__PURE__ */ nr(t)
    );
    t.remove(), t = r;
  }
}
function bi(t) {
  var e = t.parent, r = t.prev, i = t.next;
  r !== null && (r.next = i), i !== null && (i.prev = r), e !== null && (e.first === t && (e.first = i), e.last === t && (e.last = r));
}
function Jt(t, e) {
  var r = [];
  Lr(t, r, !0), wi(r, () => {
    Ge(t), e && e();
  });
}
function wi(t, e) {
  var r = t.length;
  if (r > 0) {
    var i = () => --r || e();
    for (var s of t)
      s.out(i);
  } else
    e();
}
function Lr(t, e, r) {
  if ((t.f & Ze) === 0) {
    if (t.f ^= Ze, t.transitions !== null)
      for (const o of t.transitions)
        (o.is_global || r) && e.push(o);
    for (var i = t.first; i !== null; ) {
      var s = i.next, n = (i.f & tr) !== 0 || (i.f & tt) !== 0;
      Lr(i, e, n ? r : !1), i = s;
    }
  }
}
function Wt(t) {
  xi(t, !0);
}
function xi(t, e) {
  if ((t.f & Ze) !== 0) {
    t.f ^= Ze, (t.f & Le) !== 0 && (Be(t, et), or(t));
    for (var r = t.first; r !== null; ) {
      var i = r.next, s = (r.f & tr) !== 0 || (r.f & tt) !== 0;
      xi(r, s ? e : !1), r = i;
    }
    if (t.transitions !== null)
      for (const n of t.transitions)
        (n.is_global || e) && n.in();
  }
}
let Kt = [];
function xn() {
  var t = Kt;
  Kt = [], hr(t);
}
function Or(t) {
  Kt.length === 0 && queueMicrotask(xn), Kt.push(t);
}
function Sn(t) {
  var e = (
    /** @type {Effect} */
    J
  );
  if ((e.f & ei) === 0) {
    if ((e.f & Cr) === 0)
      throw t;
    e.fn(t);
  } else
    Si(t, e);
}
function Si(t, e) {
  for (; e !== null; ) {
    if ((e.f & Cr) !== 0)
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
let Yt = [];
let K = null, Ye = !1;
function Je(t) {
  K = t;
}
let J = null;
function nt(t) {
  J = t;
}
let $e = null;
function Ei(t) {
  K !== null && K.f & pr && ($e === null ? $e = [t] : $e.push(t));
}
let pe = null, De = 0, Oe = null;
function En(t) {
  Oe = t;
}
let Ii = 1, Zt = 0, it = !1;
function Ci() {
  return ++Ii;
}
function ar(t) {
  var e = t.f;
  if ((e & et) !== 0)
    return !0;
  if ((e & ct) !== 0) {
    var r = t.deps, i = (e & Ae) !== 0;
    if (r !== null) {
      var s, n, o = (e & Gt) !== 0, l = i && J !== null && !it, v = r.length;
      if (o || l) {
        var u = (
          /** @type {Derived} */
          t
        ), p = u.parent;
        for (s = 0; s < v; s++)
          n = r[s], (o || !n?.reactions?.includes(u)) && (n.reactions ?? (n.reactions = [])).push(u);
        o && (u.f ^= Gt), l && p !== null && (p.f & Ae) === 0 && (u.f ^= Ae);
      }
      for (s = 0; s < v; s++)
        if (n = r[s], ar(
          /** @type {Derived} */
          n
        ) && vi(
          /** @type {Derived} */
          n
        ), n.wv > t.wv)
          return !0;
    }
    (!i || J !== null && !it) && Be(t, Le);
  }
  return !1;
}
function ki(t, e, r = !0) {
  var i = t.reactions;
  if (i !== null)
    for (var s = 0; s < i.length; s++) {
      var n = i[s];
      $e?.includes(t) || ((n.f & Fe) !== 0 ? ki(
        /** @type {Derived} */
        n,
        e,
        !1
      ) : e === n && (r ? Be(n, et) : (n.f & Le) !== 0 && Be(n, ct), or(
        /** @type {Effect} */
        n
      )));
    }
}
function Di(t) {
  var y;
  var e = pe, r = De, i = Oe, s = K, n = it, o = $e, l = te, v = Ye, u = t.f;
  pe = /** @type {null | Value[]} */
  null, De = 0, Oe = null, it = (u & Ae) !== 0 && (Ye || !lt || K === null), K = (u & (tt | vt)) === 0 ? t : null, $e = null, Nr(t.ctx), Ye = !1, Zt++, t.f |= pr;
  try {
    var p = (
      /** @type {Function} */
      (0, t.fn)()
    ), f = t.deps;
    if (pe !== null) {
      var d;
      if ($t(t, De), f !== null && De > 0)
        for (f.length = De + pe.length, d = 0; d < pe.length; d++)
          f[De + d] = pe[d];
      else
        t.deps = f = pe;
      if (!it)
        for (d = De; d < f.length; d++)
          ((y = f[d]).reactions ?? (y.reactions = [])).push(t);
    } else f !== null && De < f.length && ($t(t, De), f.length = De);
    if (Ht() && Oe !== null && !Ye && f !== null && (t.f & (Fe | ct | et)) === 0)
      for (d = 0; d < /** @type {Source[]} */
      Oe.length; d++)
        ki(
          Oe[d],
          /** @type {Effect} */
          t
        );
    return s !== null && s !== t && (Zt++, Oe !== null && (i === null ? i = Oe : i.push(.../** @type {Source[]} */
    Oe))), p;
  } catch (x) {
    Sn(x);
  } finally {
    pe = e, De = r, Oe = i, K = s, it = n, $e = o, Nr(l), Ye = v, t.f ^= pr;
  }
}
function In(t, e) {
  let r = e.reactions;
  if (r !== null) {
    var i = Qi.call(r, t);
    if (i !== -1) {
      var s = r.length - 1;
      s === 0 ? r = e.reactions = null : (r[i] = r[s], r.pop());
    }
  }
  r === null && (e.f & Fe) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (pe === null || !pe.includes(e)) && (Be(e, ct), (e.f & (Ae | Gt)) === 0 && (e.f ^= Gt), li(
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
      In(t, r[i]);
}
function Pr(t) {
  var e = t.f;
  if ((e & kr) === 0) {
    Be(t, Le);
    var r = J, i = lt;
    J = t, lt = !0;
    try {
      (e & Ir) !== 0 ? wn(t) : mi(t), gi(t);
      var s = Di(t);
      t.teardown = typeof s == "function" ? s : null, t.wv = Ii;
      var n;
    } finally {
      lt = i, J = r;
    }
  }
}
function Cn() {
  try {
    nn();
  } catch (t) {
    if (Xt !== null)
      Si(t, Xt);
    else
      throw t;
  }
}
function kn() {
  var t = lt;
  try {
    var e = 0;
    for (lt = !0; Yt.length > 0; ) {
      e++ > 1e3 && Cn();
      var r = Yt, i = r.length;
      Yt = [];
      for (var s = 0; s < i; s++) {
        var n = Tn(r[s]);
        Dn(n);
      }
      Et.clear();
    }
  } finally {
    mr = !1, lt = t, Xt = null;
  }
}
function Dn(t) {
  var e = t.length;
  if (e !== 0)
    for (var r = 0; r < e; r++) {
      var i = t[r];
      (i.f & (kr | Ze)) === 0 && ar(i) && (Pr(i), i.deps === null && i.first === null && i.nodes_start === null && (i.teardown === null ? bi(i) : i.fn = null));
    }
}
function or(t) {
  mr || (mr = !0, queueMicrotask(kn));
  for (var e = Xt = t; e.parent !== null; ) {
    e = e.parent;
    var r = e.f;
    if ((r & (vt | tt)) !== 0) {
      if ((r & Le) === 0) return;
      e.f ^= Le;
    }
  }
  Yt.push(e);
}
function Tn(t) {
  for (var e = [], r = t; r !== null; ) {
    var i = r.f, s = (i & (tt | vt)) !== 0, n = s && (i & Le) !== 0;
    if (!n && (i & Ze) === 0) {
      (i & $r) !== 0 ? e.push(r) : s ? r.f ^= Le : ar(r) && Pr(r);
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
  var e = t.f, r = (e & Fe) !== 0;
  if (K !== null && !Ye) {
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
    n !== null && (n.f & Ae) === 0 && (s.f ^= Ae);
  }
  return r && (s = /** @type {Derived} */
  t, ar(s) && vi(s)), wt && Et.has(t) ? Et.get(t) : t.v;
}
function Qt(t) {
  var e = Ye;
  try {
    return Ye = !0, t();
  } finally {
    Ye = e;
  }
}
const Mn = -7169;
function Be(t, e) {
  t.f = t.f & Mn | e;
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
      const i = Xr(r);
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
const Ln = ["touchstart", "touchmove"];
function On(t) {
  return Ln.includes(t);
}
let Fr = !1;
function Pn() {
  Fr || (Fr = !0, document.addEventListener(
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
function Ti(t) {
  var e = K, r = J;
  Je(null), nt(null);
  try {
    return t();
  } finally {
    Je(e), nt(r);
  }
}
function jn(t, e, r, i = r) {
  t.addEventListener(e, () => Ti(r));
  const s = t.__on_r;
  s ? t.__on_r = () => {
    s(), i(!0);
  } : t.__on_r = () => i(!0), Pn();
}
const Mi = /* @__PURE__ */ new Set(), br = /* @__PURE__ */ new Set();
function Rn(t, e, r, i = {}) {
  function s(n) {
    if (i.capture || xt.call(e, n), !n.cancelBubble)
      return Ti(() => r?.call(this, n));
  }
  return t.startsWith("pointer") || t.startsWith("touch") || t === "wheel" ? Or(() => {
    e.addEventListener(t, s, i);
  }) : e.addEventListener(t, s, i), s;
}
function zn(t, e, r, i, s) {
  var n = { capture: i, passive: s }, o = Rn(t, e, r, n);
  (e === document.body || // @ts-ignore
  e === window || // @ts-ignore
  e === document || // Firefox has quirky behavior, it can happen that we still get "canplay" events when the element is already removed
  e instanceof HTMLMediaElement) && pi(() => {
    e.removeEventListener(t, o, n);
  });
}
function st(t) {
  for (var e = 0; e < t.length; e++)
    Mi.add(t[e]);
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
    Yi(t, "currentTarget", {
      configurable: !0,
      get() {
        return n || r;
      }
    });
    var p = K, f = J;
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
              var [L, ...q] = B;
              L.apply(n, [t, ...q]);
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
      t.__root = e, delete t.currentTarget, Je(p), nt(f);
    }
  }
}
function jr(t) {
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
  var r = (e & si) !== 0, i = (e & cn) !== 0, s, n = !t.startsWith("<!>");
  return () => {
    s === void 0 && (s = jr(n ? t : "<!>" + t), r || (s = /** @type {Node} */
    /* @__PURE__ */ Te(s)));
    var o = (
      /** @type {TemplateNode} */
      i || di ? document.importNode(s, !0) : s.cloneNode(!0)
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
function qn(t, e, r = "svg") {
  var i = !t.startsWith("<!>"), s = (e & si) !== 0, n = `<${r}>${i ? t : "<!>" + t}</${r}>`, o;
  return () => {
    if (!o) {
      var l = (
        /** @type {DocumentFragment} */
        jr(n)
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
      var p = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Te(u)
      ), f = (
        /** @type {TemplateNode} */
        u.lastChild
      );
      ut(p, f);
    } else
      ut(u, u);
    return u;
  };
}
// @__NO_SIDE_EFFECTS__
function Rr(t, e) {
  return /* @__PURE__ */ qn(t, e, "svg");
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
function _(t, e) {
  t !== null && t.before(
    /** @type {Node} */
    e
  );
}
function M(t, e) {
  var r = e == null ? "" : typeof e == "object" ? e + "" : e;
  r !== (t.__t ?? (t.__t = t.nodeValue)) && (t.__t = r, t.nodeValue = r + "");
}
function Nn(t, e) {
  return Vn(t, e);
}
const _t = /* @__PURE__ */ new Map();
function Vn(t, { target: e, anchor: r, props: i = {}, events: s, context: n, intro: o = !0 }) {
  pn();
  var l = /* @__PURE__ */ new Set(), v = (f) => {
    for (var d = 0; d < f.length; d++) {
      var y = f[d];
      if (!l.has(y)) {
        l.add(y);
        var x = On(y);
        e.addEventListener(y, xt, { passive: x });
        var B = _t.get(y);
        B === void 0 ? (document.addEventListener(y, xt, { passive: x }), _t.set(y, 1)) : _t.set(y, B + 1);
      }
    }
  };
  v(Sr(Mi)), br.add(v);
  var u = void 0, p = bn(() => {
    var f = r ?? e.appendChild(ir());
    return yt(() => {
      if (n) {
        We({});
        var d = (
          /** @type {ComponentContext} */
          te
        );
        d.c = n;
      }
      s && (i.$$events = s), u = t(f, i) || {}, n && Ke();
    }), () => {
      for (var d of l) {
        e.removeEventListener(d, xt);
        var y = (
          /** @type {number} */
          _t.get(d)
        );
        --y === 0 ? (document.removeEventListener(d, xt), _t.delete(d)) : _t.set(d, y);
      }
      br.delete(v), f !== r && f.parentNode?.removeChild(f);
    };
  });
  return Un.set(u, p), u;
}
let Un = /* @__PURE__ */ new WeakMap();
function S(t, e, [r, i] = [0, 0]) {
  var s = t, n = null, o = null, l = xe, v = r > 0 ? tr : 0, u = !1;
  const p = (d, y = !0) => {
    u = !0, f(y, d);
  }, f = (d, y) => {
    l !== (l = d) && (l ? (n ? Wt(n) : y && (n = yt(() => y(s))), o && Jt(o, () => {
      o = null;
    })) : (o ? Wt(o) : y && (o = yt(() => y(s, [r + 1, i]))), n && Jt(n, () => {
      n = null;
    })));
  };
  sr(() => {
    u = !1, e(p), u || f(null, null);
  }, v);
}
function je(t, e) {
  return e;
}
function Fn(t, e, r, i) {
  for (var s = [], n = e.length, o = 0; o < n; o++)
    Lr(e[o].e, s, !0);
  var l = n > 0 && s.length === 0 && r !== null;
  if (l) {
    var v = (
      /** @type {Element} */
      /** @type {Element} */
      r.parentNode
    );
    gn(v), v.append(
      /** @type {Element} */
      r
    ), i.clear(), rt(t, e[0].prev, e[n - 1].next);
  }
  wi(s, () => {
    for (var u = 0; u < n; u++) {
      var p = e[u];
      l || (i.delete(p.k), rt(t, p.prev, p.next)), Ge(p.e, !l);
    }
  });
}
function Re(t, e, r, i, s, n = null) {
  var o = t, l = { flags: e, items: /* @__PURE__ */ new Map(), first: null }, v = (e & ni) !== 0;
  if (v) {
    var u = (
      /** @type {Element} */
      t
    );
    o = u.appendChild(ir());
  }
  var p = null, f = !1, d = /* @__PURE__ */ oi(() => {
    var y = r();
    return xr(y) ? y : y == null ? [] : Sr(y);
  });
  sr(() => {
    var y = a(d), x = y.length;
    f && x === 0 || (f = x === 0, Bn(y, l, o, s, e, i, r), n !== null && (x === 0 ? p ? Wt(p) : p = yt(() => n(o)) : p !== null && Jt(p, () => {
      p = null;
    })), a(d));
  });
}
function Bn(t, e, r, i, s, n, o) {
  var l = (s & un) !== 0, v = (s & (Dr | Tr)) !== 0, u = t.length, p = e.items, f = e.first, d = f, y, x = null, B, L = [], q = [], I, E, b, A;
  if (l)
    for (A = 0; A < u; A += 1)
      I = t[A], E = n(I, A), b = p.get(E), b !== void 0 && (b.a?.measure(), (B ?? (B = /* @__PURE__ */ new Set())).add(b));
  for (A = 0; A < u; A += 1) {
    if (I = t[A], E = n(I, A), b = p.get(E), b === void 0) {
      var R = d ? (
        /** @type {TemplateNode} */
        d.e.nodes_start
      ) : r;
      x = Qn(
        R,
        e,
        x,
        x === null ? e.first : x.next,
        I,
        E,
        A,
        i,
        s,
        o
      ), p.set(E, x), L = [], q = [], d = x.next;
      continue;
    }
    if (v && Hn(b, I, A, s), (b.e.f & Ze) !== 0 && (Wt(b.e), l && (b.a?.unfix(), (B ?? (B = /* @__PURE__ */ new Set())).delete(b))), b !== d) {
      if (y !== void 0 && y.has(b)) {
        if (L.length < q.length) {
          var H = q[0], W;
          x = H.prev;
          var Z = L[0], X = L[L.length - 1];
          for (W = 0; W < L.length; W += 1)
            Br(L[W], H, r);
          for (W = 0; W < q.length; W += 1)
            y.delete(q[W]);
          rt(e, Z.prev, X.next), rt(e, x, Z), rt(e, X, H), d = H, x = X, A -= 1, L = [], q = [];
        } else
          y.delete(b), Br(b, d, r), rt(e, b.prev, b.next), rt(e, b, x === null ? e.first : x.next), rt(e, x, b), x = b;
        continue;
      }
      for (L = [], q = []; d !== null && d.k !== E; )
        (d.e.f & Ze) === 0 && (y ?? (y = /* @__PURE__ */ new Set())).add(d), q.push(d), d = d.next;
      if (d === null)
        continue;
      b = d;
    }
    L.push(b), x = b, d = b.next;
  }
  if (d !== null || y !== void 0) {
    for (var ue = y === void 0 ? [] : Sr(y); d !== null; )
      (d.e.f & Ze) === 0 && ue.push(d), d = d.next;
    var me = ue.length;
    if (me > 0) {
      var ze = (s & ni) !== 0 && u === 0 ? r : null;
      if (l) {
        for (A = 0; A < me; A += 1)
          ue[A].a?.measure();
        for (A = 0; A < me; A += 1)
          ue[A].a?.fix();
      }
      Fn(e, ue, ze, p);
    }
  }
  l && Or(() => {
    if (B !== void 0)
      for (b of B)
        b.a?.apply();
  }), J.first = e.first && e.first.e, J.last = x && x.e;
}
function Hn(t, e, r, i) {
  (i & Dr) !== 0 && gr(t.v, e), (i & Tr) !== 0 ? gr(
    /** @type {Value<number>} */
    t.i,
    r
  ) : t.i = r;
}
function Qn(t, e, r, i, s, n, o, l, v, u) {
  var p = (v & Dr) !== 0, f = (v & vn) === 0, d = p ? f ? /* @__PURE__ */ _n(s, !1, !1) : It(s) : s, y = (v & Tr) === 0 ? o : It(o), x = {
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
    return x.e = yt(() => l(t, d, y, u), hn), x.e.prev = r && r.e, x.e.next = i && i.e, r === null ? e.first = x : (r.next = x, r.e.next = x.e), i !== null && (i.prev = x, i.e.prev = x.e), x;
  } finally {
  }
}
function Br(t, e, r) {
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
function Yn(t, e, r = !1, i = !1, s = !1) {
  var n = t, o = "";
  D(() => {
    var l = (
      /** @type {Effect} */
      J
    );
    if (o !== (o = e() ?? "") && (l.nodes_start !== null && (yi(
      l.nodes_start,
      /** @type {TemplateNode} */
      l.nodes_end
    ), l.nodes_start = l.nodes_end = null), o !== "")) {
      var v = o + "";
      r ? v = `<svg>${v}</svg>` : i && (v = `<math>${v}</math>`);
      var u = jr(v);
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
function Hr(t, e, ...r) {
  var i = t, s = Zr, n;
  sr(() => {
    s !== (s = e()) && (n && (Ge(n), n = null), n = yt(() => (
      /** @type {SnippetFn} */
      s(i, ...r)
    )));
  }, tr);
}
const Qr = [...` 	
\r\f \v\uFEFF`];
function Gn(t, e, r) {
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
function Jn(t, e) {
  return t == null ? null : String(t);
}
function fe(t, e, r, i, s, n) {
  var o = t.__className;
  if (o !== r || o === void 0) {
    var l = Gn(r, i, n);
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
    var n = Jn(e);
    n == null ? t.removeAttribute("style") : t.style.cssText = n, t.__style = e;
  }
  return i;
}
const Wn = Symbol("is custom element"), Kn = Symbol("is html");
function Xn(t, e) {
  var r = Ai(t);
  r.checked !== (r.checked = // treat null and undefined the same for the initial value
  e ?? void 0) && (t.checked = e);
}
function Ct(t, e, r, i) {
  var s = Ai(t);
  s[e] !== (s[e] = r) && (e === "loading" && (t[Zi] = r), r == null ? t.removeAttribute(e) : typeof r != "string" && Zn(t).includes(e) ? t[e] = r : t.setAttribute(e, r));
}
function Ai(t) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    // @ts-expect-error
    t.__attributes ?? (t.__attributes = {
      [Wn]: t.nodeName.includes("-"),
      [Kn]: t.namespaceURI === dn
    })
  );
}
var Yr = /* @__PURE__ */ new Map();
function Zn(t) {
  var e = Yr.get(t.nodeName);
  if (e) return e;
  Yr.set(t.nodeName, e = []);
  for (var r, i = t, s = Element.prototype; s !== i; ) {
    r = Xr(i);
    for (var n in r)
      r[n].set && e.push(n);
    i = Er(i);
  }
  return e;
}
function Li(t, e, r = e) {
  var i = Ht();
  jn(t, "input", (s) => {
    var n = s ? t.defaultValue : t.value;
    if (n = dr(t) ? fr(n) : n, r(n), i && n !== (n = e())) {
      var o = t.selectionStart, l = t.selectionEnd;
      t.value = n ?? "", l !== null && (t.selectionStart = o, t.selectionEnd = Math.min(l, t.value.length));
    }
  }), // If we are hydrating and the value has since changed,
  // then use the updated value from the input instead.
  // If defaultValue is set, then value == defaultValue
  // TODO Svelte 6: remove input.value check and set to empty string?
  Qt(e) == null && t.value && r(dr(t) ? fr(t.value) : t.value), Ar(() => {
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
function Gr(t, e) {
  return t === e || t?.[gt] === e;
}
function Oi(t = {}, e, r, i) {
  return Mr(() => {
    var s, n;
    return Ar(() => {
      s = n, n = [], Qt(() => {
        t !== r(...n) && (e(t, ...n), s && Gr(r(...s), t) && e(null, ...s));
      });
    }), () => {
      Or(() => {
        n && Gr(r(...n), t) && e(null, ...n);
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
  r.b.length && yn(() => {
    Jr(e, i), hr(r.b);
  }), Se(() => {
    const s = Qt(() => r.m.map(Wi));
    return () => {
      for (const n of s)
        typeof n == "function" && n();
    };
  }), r.a.length && Se(() => {
    Jr(e, i), hr(r.a);
  });
}
function Jr(t, e) {
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
function ji(t) {
  te === null && ai(), Bt && te.l !== null ? es(te).m.push(t) : Se(() => {
    const e = Qt(t);
    if (typeof e == "function") return (
      /** @type {() => void} */
      e
    );
  });
}
function $n(t) {
  te === null && ai(), ji(() => () => Qt(t));
}
function es(t) {
  var e = (
    /** @type {ComponentContextLegacy} */
    t.l
  );
  return e.u ?? (e.u = { a: [], b: [], m: [] });
}
const ts = "5";
var Kr;
typeof window < "u" && ((Kr = window.__svelte ?? (window.__svelte = {})).v ?? (Kr.v = /* @__PURE__ */ new Set())).add(ts);
function _r(t, e) {
  let r;
  return function(...i) {
    clearTimeout(r), r = setTimeout(() => t.apply(this, i), e);
  };
}
function rs(t, e) {
  let r;
  return function(...i) {
    r || (t.apply(this, i), r = !0, setTimeout(() => r = !1, e));
  };
}
class is {
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
          const f = new Error("Resource not found");
          throw f.code = "NOT_FOUND", f;
        }
        if (u.status === 429) {
          const f = u.headers.get("Retry-After");
          throw new Error(`Rate limited. Retry after ${f}s`);
        }
        if (!u.ok) {
          const f = await u.json().catch(() => ({}));
          throw new Error(f.error?.message || `HTTP ${u.status}: ${u.statusText}`);
        }
        const p = await u.json();
        return p.data !== void 0 ? p : { data: p };
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
function ns(t, e) {
  try {
    localStorage.setItem(Ri + t, JSON.stringify(e));
  } catch (r) {
    console.warn("Failed to persist data:", r);
  }
}
function ss(t) {
  try {
    const e = localStorage.getItem(Ri + t);
    return e ? JSON.parse(e) : null;
  } catch (e) {
    return console.warn("Failed to recover data:", e), null;
  }
}
var kt, Dt, Tt, Mt, At, Lt, Ot, Pt, jt, Rt, zt, qt, Nt, Vt, Ut, Ft, de, mt, Ve, Ee, zi, qi, Ni, Vi, Ui, Fi;
class as {
  constructor() {
    ae(this, Ee);
    ae(this, kt, /* @__PURE__ */ F(""));
    ae(this, Dt, /* @__PURE__ */ F(null));
    ae(this, Tt, /* @__PURE__ */ F(Ue({})));
    ae(this, Mt, /* @__PURE__ */ F(Ue({ violations: [], isValid: !0 })));
    ae(this, At, /* @__PURE__ */ F(null));
    ae(this, Lt, /* @__PURE__ */ F(!1));
    ae(this, Ot, /* @__PURE__ */ F(!1));
    ae(this, Pt, /* @__PURE__ */ F(!1));
    ae(this, jt, /* @__PURE__ */ F(null));
    ae(this, Rt, /* @__PURE__ */ F(0));
    ae(this, zt, /* @__PURE__ */ F(null));
    ae(this, qt, /* @__PURE__ */ F(null));
    ae(this, Nt, /* @__PURE__ */ F(!1));
    ae(this, Vt, /* @__PURE__ */ F(Ue([])));
    ae(this, Ut, /* @__PURE__ */ F(-1));
    ur(this, "maxHistorySize", 50);
    ae(this, Ft, /* @__PURE__ */ F(Ue(navigator.onLine)));
    ur(this, "retryQueue", []);
    // API client
    ae(this, de, null);
    ae(this, mt, !1);
    ae(this, Ve, []);
  }
  get modelId() {
    return a(T(this, kt));
  }
  set modelId(e) {
    P(T(this, kt), e, !0);
  }
  get model() {
    return a(T(this, Dt));
  }
  set model(e) {
    P(T(this, Dt), e, !0);
  }
  get selections() {
    return a(T(this, Tt));
  }
  set selections(e) {
    P(T(this, Tt), e, !0);
  }
  get validationResults() {
    return a(T(this, Mt));
  }
  set validationResults(e) {
    P(T(this, Mt), e, !0);
  }
  get pricingData() {
    return a(T(this, At));
  }
  set pricingData(e) {
    P(T(this, At), e, !0);
  }
  get isLoading() {
    return a(T(this, Lt));
  }
  set isLoading(e) {
    P(T(this, Lt), e, !0);
  }
  get isValidating() {
    return a(T(this, Ot));
  }
  set isValidating(e) {
    P(T(this, Ot), e, !0);
  }
  get isPricing() {
    return a(T(this, Pt));
  }
  set isPricing(e) {
    P(T(this, Pt), e, !0);
  }
  get error() {
    return a(T(this, jt));
  }
  set error(e) {
    P(T(this, jt), e, !0);
  }
  get currentStep() {
    return a(T(this, Rt));
  }
  set currentStep(e) {
    P(T(this, Rt), e, !0);
  }
  get configurationId() {
    return a(T(this, zt));
  }
  set configurationId(e) {
    P(T(this, zt), e, !0);
  }
  get lastSaved() {
    return a(T(this, qt));
  }
  set lastSaved(e) {
    P(T(this, qt), e, !0);
  }
  get isDirty() {
    return a(T(this, Nt));
  }
  set isDirty(e) {
    P(T(this, Nt), e, !0);
  }
  get history() {
    return a(T(this, Vt));
  }
  set history(e) {
    P(T(this, Vt), e, !0);
  }
  get historyIndex() {
    return a(T(this, Ut));
  }
  set historyIndex(e) {
    P(T(this, Ut), e, !0);
  }
  get isOnline() {
    return a(T(this, Ft));
  }
  set isOnline(e) {
    P(T(this, Ft), e, !0);
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
    T(this, mt) || (ft(this, mt, !0), ft(this, de, new is(e)), ot(this, Ee, Ui).call(this), ot(this, Ee, zi).call(this), ot(this, Ee, qi).call(this));
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
    JSON.stringify(i) !== JSON.stringify(this.selections) && (this.isDirty = !0, ot(this, Ee, Fi).call(this));
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
kt = new WeakMap(), Dt = new WeakMap(), Tt = new WeakMap(), Mt = new WeakMap(), At = new WeakMap(), Lt = new WeakMap(), Ot = new WeakMap(), Pt = new WeakMap(), jt = new WeakMap(), Rt = new WeakMap(), zt = new WeakMap(), qt = new WeakMap(), Nt = new WeakMap(), Vt = new WeakMap(), Ut = new WeakMap(), Ft = new WeakMap(), de = new WeakMap(), mt = new WeakMap(), Ve = new WeakMap(), Ee = new WeakSet(), zi = function() {
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
      ot(this, Ee, Vi).call(this);
    });
  });
  T(this, Ve).push(v);
}, qi = function() {
  const e = () => {
    this.isOnline = !0, ot(this, Ee, Ni).call(this);
  }, r = () => {
    this.isOnline = !1;
  };
  window.addEventListener("online", e), window.addEventListener("offline", r), T(this, Ve).push(() => {
    window.removeEventListener("online", e), window.removeEventListener("offline", r);
  });
}, Ni = async function() {
  for (; this.retryQueue.length > 0 && this.isOnline; ) {
    const e = this.retryQueue.shift();
    try {
      await e();
    } catch (r) {
      console.error("Retry failed:", r);
    }
  }
}, Vi = function() {
  const e = {
    modelId: this.modelId,
    selections: this.selections,
    configurationId: this.configurationId,
    currentStep: this.currentStep,
    lastSaved: this.lastSaved
  };
  ns("cpq_config_state", e);
}, Ui = function() {
  const e = ss("cpq_config_state");
  e && (this.modelId = e.modelId || "", this.selections = e.selections || {}, this.configurationId = e.configurationId || null, this.currentStep = e.currentStep || 0, this.lastSaved = e.lastSaved || null);
}, Fi = function() {
  this.history = this.history.slice(0, this.historyIndex + 1), this.history.push({
    selections: { ...this.selections },
    timestamp: Date.now()
  }), this.history.length > this.maxHistorySize && (this.history = this.history.slice(-this.maxHistorySize)), this.historyIndex = this.history.length - 1;
};
const h = new as();
var os = /* @__PURE__ */ Rr('<svg viewBox="0 0 20 20" fill="currentColor" class="svelte-fs3n5v"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>'), ls = /* @__PURE__ */ w('<div><div class="step-icon svelte-fs3n5v"><!></div> <span class="step-name svelte-fs3n5v"> </span></div>'), us = /* @__PURE__ */ w('<div class="progress-indicator svelte-fs3n5v"><div class="progress-bar svelte-fs3n5v"><div class="progress-fill svelte-fs3n5v"></div></div> <div class="progress-steps svelte-fs3n5v"></div> <div class="progress-text svelte-fs3n5v"> </div></div>');
function vs(t, e) {
  let r = ge(e, "currentStep", 3, 0), i = ge(e, "completionPercentage", 3, 0);
  const s = [
    { name: "Configure", icon: "1" },
    { name: "Validate", icon: "2" },
    { name: "Price", icon: "3" },
    { name: "Complete", icon: "4" }
  ];
  var n = us(), o = c(n), l = c(o), v = m(o, 2);
  Re(v, 21, () => s, je, (f, d, y) => {
    var x = ls();
    let B;
    var L = c(x), q = c(L);
    {
      var I = (R) => {
        var H = os();
        _(R, H);
      }, E = (R) => {
        var H = bt();
        D(() => M(H, a(d).icon)), _(R, H);
      };
      S(q, (R) => {
        y < r() ? R(I) : R(E, !1);
      });
    }
    var b = m(L, 2), A = c(b);
    D(
      (R) => {
        B = fe(x, 1, "step svelte-fs3n5v", null, B, R), M(A, a(d).name);
      },
      [
        () => ({
          active: y === r(),
          completed: y < r()
        })
      ]
    ), _(f, x);
  });
  var u = m(v, 2), p = c(u);
  D(() => {
    wr(l, `width: ${i() ?? ""}%`), M(p, `${i() ?? ""}% Complete`);
  }), _(t, n);
}
var cs = /* @__PURE__ */ w('<p class="loading-message svelte-c70bjm"> </p>'), ds = /* @__PURE__ */ w('<div><div class="spinner-content svelte-c70bjm"><div></div> <!></div></div>');
function fs(t, e) {
  let r = ge(e, "size", 3, "medium"), i = ge(e, "message", 3, ""), s = ge(e, "overlay", 3, !1);
  const n = {
    small: "w-4 h-4",
    medium: "w-8 h-8",
    large: "w-12 h-12"
  };
  var o = ds();
  let l;
  var v = c(o), u = c(v), p = m(u, 2);
  {
    var f = (d) => {
      var y = cs(), x = c(y);
      D(() => M(x, i())), _(d, y);
    };
    S(p, (d) => {
      i() && d(f);
    });
  }
  D(
    (d) => {
      l = fe(o, 1, "loading-spinner svelte-c70bjm", null, l, d), fe(u, 1, `spinner ${n[r()] ?? ""}`, "svelte-c70bjm");
    },
    [() => ({ overlay: s() })]
  ), _(t, o);
}
function _s(t, e, r, i) {
  P(e, !1), P(r, ""), i() && i()();
}
var hs = /* @__PURE__ */ w('<button class="retry-btn svelte-me7lub">Try Again</button>'), ps = /* @__PURE__ */ w('<div class="error-boundary svelte-me7lub"><div class="error-content svelte-me7lub"><svg class="error-icon svelte-me7lub" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg> <h3 class="svelte-me7lub">Something went wrong</h3> <p class="svelte-me7lub"> </p> <!></div></div>');
function gs(t, e) {
  We(e, !0);
  let r = ge(e, "error", 3, null), i = ge(e, "onRetry", 3, null), s = ge(e, "fallback", 3, null), n = /* @__PURE__ */ F(!1), o = /* @__PURE__ */ F("");
  Se(() => {
    r() && (P(n, !0), P(o, r().message || "An unexpected error occurred", !0));
  });
  var l = pt(), v = Pe(l);
  {
    var u = (f) => {
      var d = pt(), y = Pe(d);
      {
        var x = (L) => {
          var q = pt(), I = Pe(q);
          Hr(I, s), _(L, q);
        }, B = (L) => {
          var q = ps(), I = c(q), E = m(c(I), 4), b = c(E), A = m(E, 2);
          {
            var R = (H) => {
              var W = hs();
              W.__click = [
                _s,
                n,
                o,
                i
              ], _(H, W);
            };
            S(A, (H) => {
              i() && H(R);
            });
          }
          D(() => M(b, a(o))), _(L, q);
        };
        S(y, (L) => {
          s() ? L(x) : L(B, !1);
        });
      }
      _(f, d);
    }, p = (f) => {
      var d = pt(), y = Pe(d);
      Hr(y, () => e.children ?? Zr), _(f, d);
    };
    S(v, (f) => {
      a(n) ? f(u) : f(p, !1);
    });
  }
  _(t, l), Ke();
}
st(["click"]);
function ms(t) {
  const {
    items: e,
    itemHeight: r,
    containerHeight: i,
    buffer: s = 5
  } = t;
  let n = $state(0), o = $derived(Math.floor(n / r)), l = $derived(Math.ceil((n + i) / r)), v = $derived(Math.max(0, o - s)), u = $derived(Math.min(e.length, l + s)), p = $derived(v * r);
  return {
    visibleItems: $derived(e.slice(v, u)),
    totalHeight: e.length * r,
    offsetY: p,
    updateScroll(f) {
      n = f;
    }
  };
}
function Ne(t) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(t);
}
function ys(t, e, r, i, s) {
  if (e.group.selection_type === "single") {
    const n = a(r) ? 0 : 1;
    P(i, n, !0), h.updateSelection(e.option.id, n);
  } else
    s(a(r) ? -a(i) : 1);
}
var bs = /* @__PURE__ */ w('<span class="option-sku svelte-cwem91"> </span>'), ws = /* @__PURE__ */ w('<span class="price-unit svelte-cwem91"> </span>'), xs = /* @__PURE__ */ w('<p class="option-description svelte-cwem91"> </p>'), Ss = /* @__PURE__ */ w('<span class="attribute svelte-cwem91"><span class="attribute-key svelte-cwem91"> </span> <span class="attribute-value svelte-cwem91"> </span></span>'), Es = /* @__PURE__ */ w('<div class="option-attributes svelte-cwem91"></div>'), Is = /* @__PURE__ */ w('<div class="error-text svelte-cwem91"> </div>'), Cs = /* @__PURE__ */ w('<div class="option-errors svelte-cwem91"></div>'), ks = /* @__PURE__ */ w('<label class="radio-control svelte-cwem91"><input type="radio" class="radio-input svelte-cwem91"/> <span class="radio-label svelte-cwem91">Select</span></label>'), Ds = (t, e) => e(-1), Ts = (t, e) => e(parseInt(t.target.value) || 0), Ms = (t, e) => e(1), As = /* @__PURE__ */ w('<div class="quantity-total svelte-cwem91"> </div>'), Ls = /* @__PURE__ */ w('<div class="quantity-controls svelte-cwem91"><button type="button" class="quantity-btn svelte-cwem91" aria-label="Decrease quantity"><svg class="icon svelte-cwem91" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" class="svelte-cwem91"></path></svg></button> <input type="number" class="quantity-input svelte-cwem91" min="0"/> <button type="button" class="quantity-btn svelte-cwem91" aria-label="Increase quantity"><svg class="icon svelte-cwem91" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" class="svelte-cwem91"></path></svg></button></div> <!>', 1), Os = /* @__PURE__ */ w('<div class="availability-warning svelte-cwem91">Limited availability</div>'), Ps = /* @__PURE__ */ w('<div class="availability-error svelte-cwem91">Out of stock</div>'), js = /* @__PURE__ */ w('<div><div class="option-header svelte-cwem91"><div class="option-info svelte-cwem91"><h4 class="option-name svelte-cwem91"> </h4> <!></div> <div class="option-price svelte-cwem91"> <!></div></div> <!> <!> <!> <div class="option-controls svelte-cwem91"><!></div> <!></div>');
function Wr(t, e) {
  We(e, !0);
  let r = /* @__PURE__ */ F(Ue(h.selections[e.option.id] || 0)), i = /* @__PURE__ */ Me(() => a(r) > 0), s = !1;
  const n = rs(
    (g) => {
      h.updateSelection(e.option.id, g);
    },
    100
  );
  let o = /* @__PURE__ */ Me(() => h.validationResults.violations.filter((g) => g.option_id === e.option.id));
  function l(g) {
    const C = Math.max(0, a(r) + g);
    if (e.group.max_selections && g > 0) {
      const k = e.group.options.filter((j) => h.selections[j.id] > 0).length;
      if (!a(i) && k >= e.group.max_selections)
        return;
    }
    P(r, C, !0), n(C);
  }
  Se(() => {
    P(r, h.selections[e.option.id] || 0, !0);
  });
  var v = js();
  let u;
  var p = c(v), f = c(p), d = c(f), y = c(d), x = m(d, 2);
  {
    var B = (g) => {
      var C = bs(), k = c(C);
      D(() => M(k, `SKU: ${e.option.sku ?? ""}`)), _(g, C);
    };
    S(x, (g) => {
      e.option.sku && g(B);
    });
  }
  var L = m(f, 2), q = c(L), I = m(q);
  {
    var E = (g) => {
      var C = ws(), k = c(C);
      D(() => M(k, `/${e.option.price_unit ?? ""}`)), _(g, C);
    };
    S(I, (g) => {
      e.option.price_unit && g(E);
    });
  }
  var b = m(p, 2);
  {
    var A = (g) => {
      var C = xs(), k = c(C);
      D(() => M(k, e.option.description)), _(g, C);
    };
    S(b, (g) => {
      e.option.description && g(A);
    });
  }
  var R = m(b, 2);
  {
    var H = (g) => {
      var C = Es();
      Re(C, 21, () => Object.entries(e.option.attributes), je, (k, j) => {
        var N = /* @__PURE__ */ Me(() => Ki(a(j), 2));
        let $ = () => a(N)[0], V = () => a(N)[1];
        var le = Ss(), ne = c(le), re = c(ne), ve = m(ne, 2), Ie = c(ve);
        D(() => {
          M(re, `${$() ?? ""}:`), M(Ie, V());
        }), _(k, le);
      }), _(g, C);
    };
    S(R, (g) => {
      e.option.attributes && Object.keys(e.option.attributes).length > 0 && g(H);
    });
  }
  var W = m(R, 2);
  {
    var Z = (g) => {
      var C = Cs();
      Re(C, 21, () => a(o), je, (k, j) => {
        var N = Is(), $ = c(N);
        D(() => M($, a(j).message)), _(k, N);
      }), _(g, C);
    };
    S(W, (g) => {
      a(o).length > 0 && g(Z);
    });
  }
  var X = m(W, 2), ue = c(X);
  {
    var me = (g) => {
      var C = ks(), k = c(C);
      k.__change = [
        ys,
        e,
        i,
        r,
        l
      ], D(() => {
        Ct(k, "name", `group-${e.group.id}`), Xn(k, a(i));
      }), _(g, C);
    }, ze = (g) => {
      var C = Ls(), k = Pe(C), j = c(k);
      j.__click = [Ds, l];
      var N = m(j, 2);
      N.__change = [Ts, n];
      var $ = m(N, 2);
      $.__click = [Ms, l];
      var V = m(k, 2);
      {
        var le = (ne) => {
          var re = As(), ve = c(re);
          D((Ie) => M(ve, `Total: ${Ie ?? ""}`), [
            () => Ne(e.option.base_price * a(r))
          ]), _(ne, re);
        };
        S(V, (ne) => {
          a(r) > 0 && ne(le);
        });
      }
      D(() => {
        j.disabled = a(r) === 0, Ct(N, "max", e.option.max_quantity || 999), $.disabled = e.option.max_quantity && a(r) >= e.option.max_quantity;
      }), Li(N, () => a(r), (ne) => P(r, ne)), _(g, C);
    };
    S(ue, (g) => {
      e.group.selection_type === "single" ? g(me) : g(ze, !1);
    });
  }
  var ye = m(X, 2);
  {
    var O = (g) => {
      var C = Os();
      _(g, C);
    }, z = (g, C) => {
      {
        var k = (j) => {
          var N = Ps();
          _(j, N);
        };
        S(
          g,
          (j) => {
            e.option.availability === "out_of_stock" && j(k);
          },
          C
        );
      }
    };
    S(ye, (g) => {
      e.option.availability === "limited" ? g(O) : g(z, !1);
    });
  }
  D(
    (g, C) => {
      u = fe(v, 1, "option-card svelte-cwem91", null, u, g), M(y, e.option.name), M(q, `${C ?? ""} `);
    },
    [
      () => ({
        selected: a(i),
        "has-errors": a(o).length > 0,
        loading: s
      }),
      () => Ne(e.option.base_price)
    ]
  ), _(t, v), Ke();
}
st(["change", "click"]);
var Rs = (t, e) => P(e, !a(e)), zs = /* @__PURE__ */ w('<span class="required-badge svelte-4o0mr">Required</span>'), qs = /* @__PURE__ */ w('<span class="selection-type">Single selection</span>'), Ns = /* @__PURE__ */ w('<span class="selection-type">Multiple selection <!></span>'), Vs = /* @__PURE__ */ w('<span class="selection-count svelte-4o0mr"> </span>'), Us = /* @__PURE__ */ w('<p class="group-description svelte-4o0mr"> </p>'), Fs = /* @__PURE__ */ w('<div class="error-message svelte-4o0mr"><svg class="error-icon svelte-4o0mr" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg> </div>'), Bs = /* @__PURE__ */ w('<div class="group-errors svelte-4o0mr"></div>'), Hs = /* @__PURE__ */ w('<div class="search-box svelte-4o0mr"><input type="search" placeholder="Search options..." class="search-input svelte-4o0mr"/></div>'), Qs = /* @__PURE__ */ w('<div class="virtual-scroll-container svelte-4o0mr" style="height: 600px"><div><div></div></div></div>'), Ys = /* @__PURE__ */ w('<div class="options-grid svelte-4o0mr"></div>'), Gs = /* @__PURE__ */ w('<div class="no-results svelte-4o0mr"> </div>'), Js = /* @__PURE__ */ w('<div class="group-content svelte-4o0mr"><!> <!> <!> <div><!></div> <!></div>'), Ws = /* @__PURE__ */ w('<div><div class="group-header svelte-4o0mr"><div class="header-content svelte-4o0mr"><h3 class="group-title svelte-4o0mr"> <!></h3> <div class="group-meta svelte-4o0mr"><!> <!></div></div> <button class="expand-toggle svelte-4o0mr"><svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg></button></div> <!></div>');
function Ks(t, e) {
  We(e, !0);
  let r = /* @__PURE__ */ F(!0), i = /* @__PURE__ */ F(""), s = /* @__PURE__ */ F(!1), n = /* @__PURE__ */ F(null), o, l = /* @__PURE__ */ Me(() => e.group.options.filter((O) => O.name.toLowerCase().includes(a(i).toLowerCase()) || O.description?.toLowerCase().includes(a(i).toLowerCase())));
  Se(() => {
    a(l).length > 20 ? (P(s, !0), P(
      n,
      ms({
        items: a(l),
        itemHeight: 120,
        containerHeight: 600,
        buffer: 3
      }),
      !0
    )) : (P(s, !1), P(n, null));
  });
  let v = /* @__PURE__ */ Me(() => e.group.options.some((O) => h.selections[O.id] > 0)), u = /* @__PURE__ */ Me(() => h.validationResults.violations.some((O) => O.group_id === e.group.id || e.group.options.some((z) => O.option_id === z.id))), p = /* @__PURE__ */ Me(() => h.validationResults.violations.filter((O) => O.group_id === e.group.id || e.group.options.some((z) => O.option_id === z.id)));
  function f(O) {
    a(n) && a(n).updateScroll(O.target.scrollTop);
  }
  var d = Ws();
  let y;
  var x = c(d);
  x.__click = [Rs, r];
  var B = c(x), L = c(B), q = c(L), I = m(q);
  {
    var E = (O) => {
      var z = zs();
      _(O, z);
    };
    S(I, (O) => {
      e.group.required && O(E);
    });
  }
  var b = m(L, 2), A = c(b);
  {
    var R = (O) => {
      var z = qs();
      _(O, z);
    }, H = (O, z) => {
      {
        var g = (C) => {
          var k = Ns(), j = m(c(k));
          {
            var N = ($) => {
              var V = bt();
              D(() => M(V, `(${(e.group.min_selections || 0) ?? ""}-${e.group.max_selections || "∞"})`)), _($, V);
            };
            S(j, ($) => {
              (e.group.min_selections > 0 || e.group.max_selections) && $(N);
            });
          }
          _(C, k);
        };
        S(
          O,
          (C) => {
            e.group.selection_type === "multiple" && C(g);
          },
          z
        );
      }
    };
    S(A, (O) => {
      e.group.selection_type === "single" ? O(R) : O(H, !1);
    });
  }
  var W = m(A, 2);
  {
    var Z = (O) => {
      var z = Vs(), g = c(z);
      D((C) => M(g, `${C ?? ""} selected`), [
        () => e.group.options.filter((C) => h.selections[C.id] > 0).length
      ]), _(O, z);
    };
    S(W, (O) => {
      a(v) && O(Z);
    });
  }
  var X = m(B, 2), ue = c(X);
  let me;
  var ze = m(x, 2);
  {
    var ye = (O) => {
      var z = Js(), g = c(z);
      {
        var C = (U) => {
          var Y = Us(), se = c(Y);
          D(() => M(se, e.group.description)), _(U, Y);
        };
        S(g, (U) => {
          e.group.description && U(C);
        });
      }
      var k = m(g, 2);
      {
        var j = (U) => {
          var Y = Bs();
          Re(Y, 21, () => a(p), je, (se, _e) => {
            var be = Fs(), Q = m(c(be));
            D(() => M(Q, ` ${a(_e).message ?? ""}`)), _(se, be);
          }), _(U, Y);
        };
        S(k, (U) => {
          a(p).length > 0 && U(j);
        });
      }
      var N = m(k, 2);
      {
        var $ = (U) => {
          var Y = Hs(), se = c(Y);
          Li(se, () => a(i), (_e) => P(i, _e)), _(U, Y);
        };
        S(N, (U) => {
          a(l).length > 10 && U($);
        });
      }
      var V = m(N, 2);
      let le;
      var ne = c(V);
      {
        var re = (U) => {
          var Y = Qs(), se = c(Y), _e = c(se);
          Re(_e, 21, () => a(n)?.visibleItems || [], je, (be, Q) => {
            Wr(be, {
              get option() {
                return a(Q);
              },
              get group() {
                return e.group;
              }
            });
          }), Oi(Y, (be) => o = be, () => o), D(() => {
            wr(se, `height: ${(a(n)?.totalHeight || 0) ?? ""}px; position: relative;`), wr(_e, `transform: translateY(${(a(n)?.offsetY || 0) ?? ""}px);`);
          }), zn("scroll", Y, f), _(U, Y);
        }, ve = (U) => {
          var Y = Ys();
          Re(Y, 21, () => a(l), je, (se, _e) => {
            Wr(se, {
              get option() {
                return a(_e);
              },
              get group() {
                return e.group;
              }
            });
          }), _(U, Y);
        };
        S(ne, (U) => {
          a(s) && a(n) ? U(re) : U(ve, !1);
        });
      }
      var Ie = m(V, 2);
      {
        var qe = (U) => {
          var Y = Gs(), se = c(Y);
          D(() => M(se, `No options found matching "${a(i) ?? ""}"`)), _(U, Y);
        };
        S(Ie, (U) => {
          a(l).length === 0 && U(qe);
        });
      }
      D((U) => le = fe(V, 1, "options-container", null, le, U), [
        () => ({ virtual: a(s) })
      ]), _(O, z);
    };
    S(ze, (O) => {
      a(r) && O(ye);
    });
  }
  D(
    (O, z) => {
      y = fe(d, 1, "option-group svelte-4o0mr", null, y, O), M(q, `${e.group.name ?? ""} `), Ct(X, "aria-label", a(r) ? "Collapse" : "Expand"), me = fe(ue, 0, "icon svelte-4o0mr", null, me, z);
    },
    [
      () => ({ "has-errors": a(u) }),
      () => ({ rotated: a(r) })
    ]
  ), _(t, d), Ke();
}
st(["click"]);
var Xs = /* @__PURE__ */ w('<span class="calculating svelte-jzost2"><span class="spinner svelte-jzost2"></span> Calculating...</span>'), Zs = (t, e) => P(e, !a(e)), $s = /* @__PURE__ */ w('<button class="toggle-btn svelte-jzost2"> </button>'), ea = /* @__PURE__ */ w('<div class="price-row savings svelte-jzost2"><span>Total Savings</span> <span> </span></div>'), ta = /* @__PURE__ */ w('<div class="price-per-unit svelte-jzost2"> </div>'), ra = /* @__PURE__ */ w('<span class="item-quantity svelte-jzost2"> </span>'), ia = /* @__PURE__ */ w('<div class="item-group svelte-jzost2"> </div>'), na = /* @__PURE__ */ w('<div class="item-reason svelte-jzost2"> </div>'), sa = /* @__PURE__ */ w('<span class="percentage svelte-jzost2"> </span>'), aa = /* @__PURE__ */ w("<span> <!></span>"), oa = /* @__PURE__ */ w('<div><div class="item-info svelte-jzost2"><div class="item-name svelte-jzost2"> <!></div> <!> <!></div> <div class="item-price svelte-jzost2"><!></div></div>'), la = /* @__PURE__ */ w('<div class="pricing-breakdown svelte-jzost2"><h4 class="breakdown-title svelte-jzost2">Price Breakdown</h4> <div class="breakdown-items svelte-jzost2"></div></div>'), ua = (t, e) => P(e, !a(e)), va = /* @__PURE__ */ w('<div class="discount-item svelte-jzost2"><div><div class="discount-name svelte-jzost2"> </div> <div class="discount-tier svelte-jzost2"> </div></div> <div class="discount-save svelte-jzost2"> </div></div>'), ca = /* @__PURE__ */ w('<div class="volume-details svelte-jzost2"></div>'), da = /* @__PURE__ */ w('<div class="volume-discounts svelte-jzost2"><button class="volume-header svelte-jzost2"><span>Volume Discounts Applied</span> <span class="discount-amount svelte-jzost2"> </span></button> <!></div>'), fa = /* @__PURE__ */ w('<div class="pricing-summary svelte-jzost2"><div class="price-row subtotal svelte-jzost2"><span>Subtotal</span> <span> </span></div> <!> <div class="price-row total svelte-jzost2"><span>Total Price</span> <span class="total-amount svelte-jzost2"> </span></div> <!></div> <!> <!>', 1), _a = /* @__PURE__ */ w('<div class="no-selections svelte-jzost2"><p>Select options to see pricing</p></div>'), ha = /* @__PURE__ */ w('<div class="pricing-display svelte-jzost2"><div class="pricing-header svelte-jzost2"><h3 class="pricing-title svelte-jzost2">Pricing Summary <!></h3> <!></div> <!></div>');
function pa(t, e) {
  We(e, !0);
  let r = ge(e, "detailed", 3, !0), i = /* @__PURE__ */ F(Ue(r())), s = /* @__PURE__ */ F(!1), n = /* @__PURE__ */ Me(() => () => {
    if (!h.pricingData) return null;
    const I = h.pricingData, E = [];
    return h.selectedOptions.forEach((b) => {
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
  }), o = /* @__PURE__ */ Me(() => () => h.pricingData?.adjustments ? h.pricingData.adjustments.filter((I) => I.type === "volume_discount").map((I) => ({ ...I, saved: Math.abs(I.amount) })) : []), l = /* @__PURE__ */ Me(() => () => h.pricingData?.adjustments ? h.pricingData.adjustments.filter((I) => I.amount < 0).reduce((I, E) => I + Math.abs(E.amount), 0) : 0);
  var v = ha(), u = c(v), p = c(u), f = m(c(p));
  {
    var d = (I) => {
      var E = Xs();
      _(I, E);
    };
    S(f, (I) => {
      h.isPricing && I(d);
    });
  }
  var y = m(p, 2);
  {
    var x = (I) => {
      var E = $s();
      E.__click = [Zs, i];
      var b = c(E);
      D(() => M(b, `${a(i) ? "Hide" : "Show"} Details`)), _(I, E);
    };
    S(y, (I) => {
      r() && a(n) && a(n).length > 0 && I(x);
    });
  }
  var B = m(u, 2);
  {
    var L = (I) => {
      var E = fa(), b = Pe(E), A = c(b), R = m(c(A), 2), H = c(R), W = m(A, 2);
      {
        var Z = (k) => {
          var j = ea(), N = m(c(j), 2), $ = c(N);
          D((V) => M($, `-${V ?? ""}`), [
            () => Ne(a(l))
          ]), _(k, j);
        };
        S(W, (k) => {
          a(l) > 0 && k(Z);
        });
      }
      var X = m(W, 2), ue = m(c(X), 2), me = c(ue), ze = m(X, 2);
      {
        var ye = (k) => {
          var j = ta(), N = c(j);
          D(($) => M(N, `${$ ?? ""} per unit`), [
            () => Ne(h.pricingData.price_per_unit)
          ]), _(k, j);
        };
        S(ze, (k) => {
          h.pricingData.price_per_unit && k(ye);
        });
      }
      var O = m(b, 2);
      {
        var z = (k) => {
          var j = la(), N = m(c(j), 2);
          Re(N, 21, () => a(n), je, ($, V) => {
            var le = oa(), ne = c(le), re = c(ne), ve = c(re), Ie = m(ve);
            {
              var qe = (G) => {
                var oe = ra(), ce = c(oe);
                D(() => M(ce, `×${a(V).quantity ?? ""}`)), _(G, oe);
              };
              S(Ie, (G) => {
                a(V).quantity > 1 && G(qe);
              });
            }
            var U = m(re, 2);
            {
              var Y = (G) => {
                var oe = ia(), ce = c(oe);
                D(() => M(ce, a(V).group)), _(G, oe);
              };
              S(U, (G) => {
                a(V).group && G(Y);
              });
            }
            var se = m(U, 2);
            {
              var _e = (G) => {
                var oe = na(), ce = c(oe);
                D(() => M(ce, a(V).reason)), _(G, oe);
              };
              S(se, (G) => {
                a(V).reason && G(_e);
              });
            }
            var be = m(ne, 2), Q = c(be);
            {
              var ie = (G) => {
                var oe = bt();
                D((ce) => M(oe, ce), [
                  () => Ne(a(V).total)
                ]), _(G, oe);
              }, Ce = (G, oe) => {
                {
                  var ce = (He) => {
                    var ee = aa();
                    let ke;
                    var Qe = c(ee), at = m(Qe);
                    {
                      var he = (we) => {
                        var Xe = sa(), lr = c(Xe);
                        D(() => M(lr, `(${a(V).percentage ?? ""}%)`)), _(we, Xe);
                      };
                      S(at, (we) => {
                        a(V).percentage && we(he);
                      });
                    }
                    D(
                      (we, Xe) => {
                        ke = fe(ee, 1, "svelte-jzost2", null, ke, we), M(Qe, `${a(V).amount < 0 ? "-" : "+"}${Xe ?? ""} `);
                      },
                      [
                        () => ({ discount: a(V).amount < 0 }),
                        () => Ne(Math.abs(a(V).amount))
                      ]
                    ), _(He, ee);
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
              S(Q, (G) => {
                a(V).type === "option" ? G(ie) : G(Ce, !1);
              });
            }
            D(() => {
              fe(le, 1, `breakdown-item type-${a(V).type ?? ""}`, "svelte-jzost2"), M(ve, `${a(V).name ?? ""} `);
            }), _($, le);
          }), _(k, j);
        };
        S(O, (k) => {
          a(i) && a(n) && k(z);
        });
      }
      var g = m(O, 2);
      {
        var C = (k) => {
          var j = da(), N = c(j);
          N.__click = [ua, s];
          var $ = m(c(N), 2), V = c($), le = m(N, 2);
          {
            var ne = (re) => {
              var ve = ca();
              Re(ve, 21, () => a(o), je, (Ie, qe) => {
                var U = va(), Y = c(U), se = c(Y), _e = c(se), be = m(se, 2), Q = c(be), ie = m(Y, 2), Ce = c(ie);
                D(
                  (G) => {
                    M(_e, a(qe).description), M(Q, `Tier: ${a(qe).tier_name || "Volume"}`), M(Ce, `Save ${G ?? ""}`);
                  },
                  [
                    () => Ne(a(qe).saved)
                  ]
                ), _(Ie, U);
              }), _(re, ve);
            };
            S(le, (re) => {
              a(s) && re(ne);
            });
          }
          D((re) => M(V, `Save ${re ?? ""}`), [
            () => Ne(a(o).reduce((re, ve) => re + ve.saved, 0))
          ]), _(k, j);
        };
        S(g, (k) => {
          a(o).length > 0 && k(C);
        });
      }
      D(
        (k, j) => {
          M(H, k), M(me, j);
        },
        [
          () => Ne(h.basePrice),
          () => Ne(h.totalPrice)
        ]
      ), _(I, E);
    }, q = (I, E) => {
      {
        var b = (A) => {
          var R = _a();
          _(A, R);
        };
        S(
          I,
          (A) => {
            !h.isPricing && h.selectedOptions.length === 0 && A(b);
          },
          E
        );
      }
    };
    S(B, (I) => {
      h.pricingData ? I(L) : I(q, !1);
    });
  }
  _(t, v), Ke();
}
st(["click"]);
var ga = /* @__PURE__ */ w('<span class="validating-indicator svelte-hbmmex"><span class="spinner svelte-hbmmex"></span> Checking...</span>'), ma = /* @__PURE__ */ Rr('<svg class="status-icon svelte-hbmmex" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg> Valid', 1), ya = /* @__PURE__ */ Rr('<svg class="status-icon svelte-hbmmex" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg> ', 1), ba = /* @__PURE__ */ w("<div><!></div>"), wa = (t, e) => P(e, "all"), xa = (t, e) => P(e, "error"), Sa = /* @__PURE__ */ w("<button> </button>"), Ea = (t, e) => P(e, "warning"), Ia = /* @__PURE__ */ w("<button> </button>"), Ca = (t, e) => P(e, "info"), ka = /* @__PURE__ */ w("<button> </button>"), Da = /* @__PURE__ */ w('<div class="violation-details svelte-hbmmex"> </div>'), Ta = /* @__PURE__ */ w('<span class="affected-option svelte-hbmmex"> </span> <!>', 1), Ma = /* @__PURE__ */ w('<div class="affected-options svelte-hbmmex">Affects: <!></div>'), Aa = /* @__PURE__ */ w('<div class="rule-expression svelte-hbmmex">Rule: <code class="svelte-hbmmex"> </code></div>'), La = /* @__PURE__ */ w("<li> </li>"), Oa = /* @__PURE__ */ w('<div class="violation-suggestions svelte-hbmmex"><div class="suggestions-title svelte-hbmmex">Suggestions:</div> <ul class="suggestions-list svelte-hbmmex"></ul></div>'), Pa = (t, e, r) => e(a(r)), ja = /* @__PURE__ */ w('<button class="auto-fix-btn svelte-hbmmex"><svg class="fix-icon svelte-hbmmex" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd"></path></svg> Auto-fix</button>'), Ra = /* @__PURE__ */ w('<div><div class="violation-header svelte-hbmmex"><svg class="violation-icon svelte-hbmmex" viewBox="0 0 20 20"><!></svg> <div class="violation-content svelte-hbmmex"><div class="violation-message svelte-hbmmex"> </div> <!> <!> <!></div></div> <!> <!></div>'), za = /* @__PURE__ */ w('<div class="validation-filters svelte-hbmmex"><button> </button> <!> <!> <!></div> <div class="violations-list svelte-hbmmex"></div>', 1), qa = /* @__PURE__ */ w('<div class="valid-message svelte-hbmmex"><svg class="valid-icon svelte-hbmmex" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg> <p class="svelte-hbmmex">Your configuration is valid and meets all requirements.</p></div>'), Na = /* @__PURE__ */ w('<div class="validation-display svelte-hbmmex"><div class="validation-header svelte-hbmmex"><h3 class="validation-title svelte-hbmmex">Configuration Validation <!></h3> <!></div> <!></div>');
function Va(t, e) {
  We(e, !0);
  let r = !0, i = /* @__PURE__ */ F("all"), s = /* @__PURE__ */ Me(() => () => {
    const E = h.validationResults.violations || [], b = { error: [], warning: [], info: [] };
    return E.forEach((A) => {
      const R = A.severity || "error";
      b[R] && b[R].push(A);
    }), b;
  }), n = /* @__PURE__ */ Me(() => () => a(i) === "all" ? h.validationResults.violations || [] : a(s)()[a(i)] || []);
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
      b.type === "add_selection" ? h.updateSelection(b.option_id, b.quantity || 1) : b.type === "remove_selection" && h.updateSelection(b.option_id, 0);
    }
  }
  var u = Na(), p = c(u), f = c(p), d = m(c(f));
  {
    var y = (E) => {
      var b = ga();
      _(E, b);
    };
    S(d, (E) => {
      h.isValidating && E(y);
    });
  }
  var x = m(f, 2);
  {
    var B = (E) => {
      var b = ba();
      let A;
      var R = c(b);
      {
        var H = (Z) => {
          var X = ma();
          _(Z, X);
        }, W = (Z) => {
          var X = ya(), ue = m(Pe(X));
          D(() => M(ue, `${a(n).length ?? ""} Issues`)), _(Z, X);
        };
        S(R, (Z) => {
          h.isValid ? Z(H) : Z(W, !1);
        });
      }
      D((Z) => A = fe(b, 1, "validation-status svelte-hbmmex", null, A, Z), [() => ({ valid: h.isValid })]), _(E, b);
    };
    S(x, (E) => {
      h.isValidating || E(B);
    });
  }
  var L = m(p, 2);
  {
    var q = (E) => {
      var b = za(), A = Pe(b), R = c(A);
      let H;
      R.__click = [wa, i];
      var W = c(R), Z = m(R, 2);
      {
        var X = (z) => {
          var g = Sa();
          let C;
          g.__click = [xa, i];
          var k = c(g);
          D(
            (j, N) => {
              C = fe(g, 1, "filter-btn error svelte-hbmmex", null, C, j), M(k, `Errors (${N ?? ""})`);
            },
            [
              () => ({ active: a(i) === "error" }),
              () => a(s)().error.length
            ]
          ), _(z, g);
        };
        S(Z, (z) => {
          a(s)().error.length > 0 && z(X);
        });
      }
      var ue = m(Z, 2);
      {
        var me = (z) => {
          var g = Ia();
          let C;
          g.__click = [Ea, i];
          var k = c(g);
          D(
            (j, N) => {
              C = fe(g, 1, "filter-btn warning svelte-hbmmex", null, C, j), M(k, `Warnings (${N ?? ""})`);
            },
            [
              () => ({
                active: a(i) === "warning"
              }),
              () => a(s)().warning.length
            ]
          ), _(z, g);
        };
        S(ue, (z) => {
          a(s)().warning.length > 0 && z(me);
        });
      }
      var ze = m(ue, 2);
      {
        var ye = (z) => {
          var g = ka();
          let C;
          g.__click = [Ca, i];
          var k = c(g);
          D(
            (j, N) => {
              C = fe(g, 1, "filter-btn info svelte-hbmmex", null, C, j), M(k, `Info (${N ?? ""})`);
            },
            [
              () => ({ active: a(i) === "info" }),
              () => a(s)().info.length
            ]
          ), _(z, g);
        };
        S(ze, (z) => {
          a(s)().info.length > 0 && z(ye);
        });
      }
      var O = m(A, 2);
      Re(O, 21, () => a(n), je, (z, g) => {
        var C = Ra(), k = c(C), j = c(k), N = c(j);
        Yn(N, () => o(a(g).severity || "error"), !0);
        var $ = m(j, 2), V = c($), le = c(V), ne = m(V, 2);
        {
          var re = (Q) => {
            var ie = Da(), Ce = c(ie);
            D(() => M(Ce, a(g).details)), _(Q, ie);
          };
          S(ne, (Q) => {
            a(g).details && Q(re);
          });
        }
        var ve = m(ne, 2);
        {
          var Ie = (Q) => {
            var ie = Ma(), Ce = m(c(ie));
            Re(Ce, 17, () => a(g).affected_options, je, (G, oe, ce) => {
              var He = Ta(), ee = Pe(He), ke = c(ee), Qe = m(ee, 2);
              {
                var at = (he) => {
                  var we = bt(",");
                  _(he, we);
                };
                S(Qe, (he) => {
                  ce < a(g).affected_options.length - 1 && he(at);
                });
              }
              D((he) => M(ke, he), [
                () => h.model?.option_groups.flatMap((he) => he.options).find((he) => he.id === a(oe))?.name || a(oe)
              ]), _(G, He);
            }), _(Q, ie);
          };
          S(ve, (Q) => {
            a(g).affected_options && a(g).affected_options.length > 0 && Q(Ie);
          });
        }
        var qe = m(ve, 2);
        {
          var U = (Q) => {
            var ie = Aa(), Ce = m(c(ie)), G = c(Ce);
            D(() => M(G, a(g).rule_expression)), _(Q, ie);
          };
          S(qe, (Q) => {
            a(g).rule_expression && r && Q(U);
          });
        }
        var Y = m(k, 2);
        {
          var se = (Q) => {
            var ie = Oa(), Ce = m(c(ie), 2);
            Re(Ce, 21, () => a(g).suggestions, je, (G, oe) => {
              var ce = La(), He = c(ce);
              D(() => M(He, a(oe))), _(G, ce);
            }), _(Q, ie);
          };
          S(Y, (Q) => {
            a(g).suggestions && a(g).suggestions.length > 0 && Q(se);
          });
        }
        var _e = m(Y, 2);
        {
          var be = (Q) => {
            var ie = ja();
            ie.__click = [Pa, v, g], _(Q, ie);
          };
          S(_e, (Q) => {
            a(g).auto_fix_action && Q(be);
          });
        }
        D(
          (Q) => {
            fe(C, 1, `violation-item severity-${a(g).severity || "error"}`, "svelte-hbmmex"), Ct(j, "fill", Q), M(le, a(g).message);
          },
          [
            () => l(a(g).severity || "error")
          ]
        ), _(z, C);
      }), D(
        (z) => {
          H = fe(R, 1, "filter-btn svelte-hbmmex", null, H, z), M(W, `All (${h.validationResults.violations.length ?? ""})`);
        },
        [
          () => ({ active: a(i) === "all" })
        ]
      ), _(E, b);
    }, I = (E, b) => {
      {
        var A = (R) => {
          var H = qa();
          _(R, H);
        };
        S(
          E,
          (R) => {
            h.isValid && !h.isValidating && R(A);
          },
          b
        );
      }
    };
    S(L, (E) => {
      !h.isValid && a(n).length > 0 ? E(q) : E(I, !1);
    });
  }
  _(t, u), Ke();
}
st(["click"]);
ln();
async function Ua() {
  try {
    await h.saveConfiguration();
  } catch (t) {
    console.error("Failed to save:", t);
  }
}
var Fa = /* @__PURE__ */ w('<div class="configuration-summary svelte-31i1s8"><h3 class="svelte-31i1s8">Configuration Summary</h3> <div class="summary-stats svelte-31i1s8"><div class="stat svelte-31i1s8"><span class="stat-value svelte-31i1s8"> </span> <span class="stat-label svelte-31i1s8">Options Selected</span></div> <div class="stat svelte-31i1s8"><span class="stat-value svelte-31i1s8"> </span> <span class="stat-label svelte-31i1s8">Total Price</span></div></div> <div class="summary-actions svelte-31i1s8"><button class="action-btn primary svelte-31i1s8">Save Configuration</button> <button class="action-btn secondary svelte-31i1s8">Export</button></div></div>');
function Ba(t, e) {
  We(e, !1);
  function r() {
    const x = {
      modelId: h.modelId,
      modelName: h.model?.name,
      selections: h.selections,
      pricing: h.pricingData,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    }, B = new Blob([JSON.stringify(x, null, 2)], { type: "application/json" }), L = URL.createObjectURL(B), q = document.createElement("a");
    q.href = L, q.download = `configuration-${Date.now()}.json`, q.click(), URL.revokeObjectURL(L);
  }
  Pi();
  var i = Fa(), s = m(c(i), 2), n = c(s), o = c(n), l = c(o), v = m(n, 2), u = c(v), p = c(u), f = m(s, 2), d = c(f);
  d.__click = [Ua];
  var y = m(d, 2);
  y.__click = r, D(
    (x) => {
      M(l, h.selectedOptions.length), M(p, x);
    },
    [
      () => Ne(h.totalPrice)
    ],
    oi
  ), _(t, i), Ke();
}
st(["click"]);
var Ha = /* @__PURE__ */ w(`<div class="network-banner offline svelte-id3e46"><svg class="icon svelte-id3e46" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd"></path><path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z"></path></svg> <span>You're offline - changes will be saved when connection is restored</span></div>`);
function Qa(t, e) {
  We(e, !0);
  let r = /* @__PURE__ */ F(!1);
  Se(() => {
    P(r, !h.isOnline);
  });
  var i = pt(), s = Pe(i);
  {
    var n = (o) => {
      var l = Ha();
      _(o, l);
    };
    S(s, (o) => {
      a(r) && o(n);
    });
  }
  _(t, i), Ke();
}
var Ya = () => h.undo(), Ga = () => h.redo(), Ja = /* @__PURE__ */ w('<div class="undo-redo svelte-2vt889"><button class="action-btn svelte-2vt889" title="Undo"><svg viewBox="0 0 20 20" fill="currentColor" class="svelte-2vt889"><path d="M12.207 2.293a1 1 0 010 1.414L10.914 5H13a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5h-2.586l1.293 1.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z"></path></svg></button> <button class="action-btn svelte-2vt889" title="Redo"><svg viewBox="0 0 20 20" fill="currentColor" class="svelte-2vt889"><path d="M7.793 2.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L9.086 7H7a5 5 0 00-5 5v2a1 1 0 11-2 0v-2a7 7 0 017-7h2.586L7.793 3.707a1 1 0 010-1.414z"></path></svg></button></div>');
function Wa(t, e) {
  We(e, !1), Pi();
  var r = Ja(), i = c(r);
  i.__click = [Ya];
  var s = m(i, 2);
  s.__click = [Ga], D(() => {
    i.disabled = !h.canUndo, s.disabled = !h.canRedo;
  }), _(t, r), Ke();
}
st(["click"]);
var Ka = /* @__PURE__ */ w('<div class="error-state svelte-1m2ujmu"><svg class="error-icon svelte-1m2ujmu" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg> <h2 class="svelte-1m2ujmu">Model Not Found</h2> <p class="svelte-1m2ujmu"> </p> <p class="error-details svelte-1m2ujmu">Please check the model ID and try again.</p></div>'), Xa = /* @__PURE__ */ w('<p class="configurator-description svelte-1m2ujmu"> </p>'), Za = () => h.previousStep(), $a = /* @__PURE__ */ w('<span class="save-indicator svelte-1m2ujmu"><!></span>'), eo = (t, e) => {
  h.currentStep === 3 ? e() : h.nextStep();
}, to = /* @__PURE__ */ w('<div class="configurator-header svelte-1m2ujmu"><div class="header-content"><h1 class="configurator-title svelte-1m2ujmu"> </h1> <!></div> <!></div> <!> <div><div class="options-panel svelte-1m2ujmu"><!></div> <div class="sidebar-panel svelte-1m2ujmu"><!> <!> <!></div></div> <div class="configurator-actions svelte-1m2ujmu"><button type="button" class="btn btn-secondary svelte-1m2ujmu">Previous</button> <div class="action-group svelte-1m2ujmu"><!> <button type="button" class="btn btn-primary svelte-1m2ujmu"> </button></div></div>', 1), ro = /* @__PURE__ */ w('<div class="no-model svelte-1m2ujmu"><p>No model selected</p></div>'), io = /* @__PURE__ */ w('<div class="configurator-content svelte-1m2ujmu"><!></div>'), no = /* @__PURE__ */ w("<div><!> <!></div>");
function so(t, e) {
  We(e, !0);
  let r = ge(e, "theme", 3, "light"), i = ge(e, "apiUrl", 3, "http://localhost:8080/api/v1"), s = ge(e, "embedMode", 3, !1), n = ge(e, "onComplete", 3, null), o = ge(e, "onConfigurationChange", 3, null), l = ge(e, "onError", 3, null), v;
  typeof window < "u" && (window.__API_BASE_URL__ = i()), ji(() => {
    if (h.initialize(i()), e.modelId && setTimeout(
      () => {
        h.setModelId(e.modelId);
      },
      0
    ), document.documentElement.setAttribute("data-theme", r()), o()) {
      const L = ht(() => {
        Se(() => {
          h.isDirty && h.selections && o()({
            selections: h.selections,
            validation: h.validationResults,
            pricing: h.pricingData
          });
        });
      });
      return () => L();
    }
  }), $n(() => {
    h.destroy();
  });
  function u() {
    const L = {
      modelId: h.modelId,
      selections: h.selections,
      pricing: h.pricingData,
      validation: h.validationResults
    };
    n() && n()(L);
  }
  function p(L) {
    console.error("Configuration error:", L), l() && l()(L);
  }
  function f() {
    h.clearError(), h.loadModel();
  }
  Se(() => {
    h.error && p(h.error);
  });
  var d = no();
  let y;
  var x = c(d);
  Qa(x, {});
  var B = m(x, 2);
  gs(B, {
    get error() {
      return h.error;
    },
    onRetry: f,
    children: (q) => {
      var I = io(), E = c(I);
      {
        var b = (R) => {
          var H = Ka(), W = m(c(H), 4), Z = c(W);
          D(() => M(Z, `The model with ID "${e.modelId ?? ""}" could not be found.`)), _(R, H);
        }, A = (R, H) => {
          {
            var W = (X) => {
              fs(X, {
                size: "large",
                message: "Loading configuration..."
              });
            }, Z = (X, ue) => {
              {
                var me = (ye) => {
                  var O = to(), z = Pe(O), g = c(z), C = c(g), k = c(C), j = m(C, 2);
                  {
                    var N = (ee) => {
                      var ke = Xa(), Qe = c(ke);
                      D(() => M(Qe, h.model.description)), _(ee, ke);
                    };
                    S(j, (ee) => {
                      h.model.description && ee(N);
                    });
                  }
                  var $ = m(g, 2);
                  Wa($, {});
                  var V = m(z, 2);
                  vs(V, {
                    get currentStep() {
                      return h.currentStep;
                    },
                    get completionPercentage() {
                      return h.completionPercentage;
                    }
                  });
                  var le = m(V, 2);
                  let ne;
                  var re = c(le), ve = c(re);
                  {
                    var Ie = (ee) => {
                      var ke = pt(), Qe = Pe(ke);
                      Re(Qe, 17, () => h.model.option_groups, je, (at, he) => {
                        Ks(at, {
                          get group() {
                            return a(he);
                          }
                        });
                      }), _(ee, ke);
                    };
                    S(ve, (ee) => {
                      h.model.option_groups && ee(Ie);
                    });
                  }
                  var qe = m(re, 2), U = c(qe);
                  Va(U, {});
                  var Y = m(U, 2);
                  const se = /* @__PURE__ */ Me(() => !s());
                  pa(Y, {
                    get detailed() {
                      return a(se);
                    }
                  });
                  var _e = m(Y, 2);
                  {
                    var be = (ee) => {
                      Ba(ee, {});
                    };
                    S(_e, (ee) => {
                      h.completionPercentage === 100 && ee(be);
                    });
                  }
                  var Q = m(le, 2), ie = c(Q);
                  ie.__click = [Za];
                  var Ce = m(ie, 2), G = c(Ce);
                  {
                    var oe = (ee) => {
                      var ke = $a(), Qe = c(ke);
                      {
                        var at = (we) => {
                          var Xe = bt();
                          D((lr) => M(Xe, `Last saved ${lr ?? ""}`), [
                            () => new Date(h.lastSaved).toLocaleTimeString()
                          ]), _(we, Xe);
                        }, he = (we) => {
                          var Xe = bt("Unsaved changes");
                          _(we, Xe);
                        };
                        S(Qe, (we) => {
                          h.lastSaved ? we(at) : we(he, !1);
                        });
                      }
                      _(ee, ke);
                    };
                    S(G, (ee) => {
                      h.isDirty && ee(oe);
                    });
                  }
                  var ce = m(G, 2);
                  ce.__click = [eo, u];
                  var He = c(ce);
                  D(
                    (ee) => {
                      M(k, h.model.name), ne = fe(le, 1, "configurator-body svelte-1m2ujmu", null, ne, ee), ie.disabled = h.currentStep === 0, ce.disabled = !h.canProceedToNextStep && h.currentStep < 3, M(He, h.currentStep === 3 ? "Complete" : "Next");
                    },
                    [() => ({ compact: s() })]
                  ), _(ye, O);
                }, ze = (ye) => {
                  var O = ro();
                  _(ye, O);
                };
                S(
                  X,
                  (ye) => {
                    h.model ? ye(me) : ye(ze, !1);
                  },
                  ue
                );
              }
            };
            S(
              R,
              (X) => {
                h.isLoading ? X(W) : X(Z, !1);
              },
              H
            );
          }
        };
        S(E, (R) => {
          h.error && h.error.code === "NOT_FOUND" ? R(b) : R(A, !1);
        });
      }
      _(q, I);
    },
    $$slots: { default: !0 }
  }), Oi(d, (L) => v = L, () => v), D(
    (L) => {
      y = fe(d, 1, "cpq-configurator svelte-1m2ujmu", null, y, L), Ct(d, "data-theme", r());
    },
    [() => ({ "embed-mode": s() })]
  ), _(t, d), Ke();
}
st(["click"]);
typeof window < "u" && !window.__API_BASE_URL__ && (window.__API_BASE_URL__ = "http://localhost:8080/api/v1");
window.CPQConfigurator = {
  instances: /* @__PURE__ */ new Map(),
  // Main embed function
  embed: function(t) {
    const {
      container: e,
      modelId: r,
      theme: i = "light",
      apiUrl: s = window.__API_BASE_URL__,
      onComplete: n = null,
      onConfigurationChange: o = null,
      onError: l = null,
      ...v
    } = t;
    if (!e || !r)
      throw new Error("CPQConfigurator.embed() requires container and modelId options");
    const u = typeof e == "string" ? document.querySelector(e) : e;
    if (!u)
      throw new Error(`Container element not found: ${e}`);
    window.__API_BASE_URL__ = s;
    const p = this.instances.get(u);
    p && (p.$destroy(), this.instances.delete(u));
    try {
      const f = Nn(so, {
        target: u,
        props: {
          modelId: r,
          theme: i,
          apiUrl: s,
          embedMode: !0,
          onComplete: n,
          onConfigurationChange: o,
          onError: l,
          ...v
        }
      });
      return this.instances.set(u, f), {
        destroy: () => {
          f.$destroy(), this.instances.delete(u);
        },
        update: (d) => {
          Object.assign(f.$state, d);
        },
        getConfiguration: () => f.getConfiguration?.() || null,
        reset: () => {
          f.reset?.();
        }
      };
    } catch (f) {
      throw console.error("Failed to embed configurator:", f), f;
    }
  },
  // Create standalone instance
  create: function(t) {
    const e = document.createElement("div");
    return e.className = "cpq-configurator-container", document.body.appendChild(e), this.embed({
      ...t,
      container: e,
      embedMode: !1
    });
  },
  // Destroy all instances
  destroyAll: function() {
    this.instances.forEach((t, e) => {
      t.$destroy();
    }), this.instances.clear();
  },
  // Version info
  version: "1.0.0"
};
typeof document < "u" && document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-cpq-model-id]").forEach((e) => {
    const r = e.dataset.cpqModelId, i = e.dataset.cpqTheme || "light", s = e.dataset.cpqApiUrl || window.__API_BASE_URL__;
    try {
      window.CPQConfigurator.embed({
        container: e,
        modelId: r,
        theme: i,
        apiUrl: s
      });
    } catch (n) {
      console.error("Auto-initialization failed:", n);
    }
  });
});
const oo = window.CPQConfigurator;
export {
  oo as default
};
