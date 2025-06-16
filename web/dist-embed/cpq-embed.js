var or = (t) => {
  throw TypeError(t);
};
var ar = (t, e, r) => e.has(t) || or("Cannot " + r);
var G = (t, e, r) => (ar(t, e, "read from private field"), r ? r.call(t) : e.get(t)), ue = (t, e, r) => e.has(t) ? or("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, r), ce = (t, e, r, i) => (ar(t, e, "write to private field"), i ? i.call(t, r) : e.set(t, r), r);
var Tt = Array.isArray, oi = Array.prototype.indexOf, Jt = Array.from, ai = Object.defineProperty, Qe = Object.getOwnPropertyDescriptor, li = Object.getOwnPropertyDescriptors, ui = Object.prototype, ci = Array.prototype, wr = Object.getPrototypeOf, lr = Object.isExtensible;
function vi(t) {
  for (var e = 0; e < t.length; e++)
    t[e]();
}
function di(t, e) {
  if (Array.isArray(t))
    return t;
  if (!(Symbol.iterator in t))
    return Array.from(t);
  const r = [];
  for (const i of t)
    if (r.push(i), r.length === e) break;
  return r;
}
const Se = 2, Ar = 4, qt = 8, Kt = 16, Ne = 32, He = 64, Qt = 128, ge = 256, wt = 512, me = 1024, De = 2048, We = 4096, Ce = 8192, Zt = 16384, kr = 32768, Xt = 65536, fi = 1 << 19, Sr = 1 << 20, Ft = 1 << 21, Ze = Symbol("$state"), _i = Symbol("legacy props"), pi = Symbol("");
function Er(t) {
  return t === this.v;
}
function hi(t, e) {
  return t != t ? e == e : t !== e || t !== null && typeof t == "object" || typeof t == "function";
}
function $t(t) {
  return !hi(t, this.v);
}
function gi(t) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function mi() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function yi(t) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function bi() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function wi(t) {
  throw new Error("https://svelte.dev/e/props_invalid_value");
}
function Ai() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function ki() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function Si() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
const er = 1, tr = 2, xr = 4, Ei = 8, xi = 16, Ii = 1, Pi = 4, Ci = 8, Oi = 16, Ti = 1, qi = 2, fe = Symbol(), Di = "http://www.w3.org/1999/xhtml";
function Ir(t) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
let pe = null;
function ur(t) {
  pe = t;
}
function je(t, e = !1, r) {
  var i = pe = {
    p: pe,
    c: null,
    d: !1,
    e: null,
    m: !1,
    s: t,
    x: null,
    l: null
  };
  jr(() => {
    i.d = !0;
  });
}
function ze(t) {
  const e = pe;
  if (e !== null) {
    const o = e.e;
    if (o !== null) {
      var r = K, i = J;
      e.e = null;
      try {
        for (var s = 0; s < o.length; s++) {
          var n = o[s];
          Ve(n.effect), Ie(n.reaction), zr(n.fn);
        }
      } finally {
        Ve(r), Ie(i);
      }
    }
    pe = e.p, e.m = !0;
  }
  return (
    /** @type {T} */
    {}
  );
}
function Pr() {
  return !0;
}
function Pe(t) {
  if (typeof t != "object" || t === null || Ze in t)
    return t;
  const e = wr(t);
  if (e !== ui && e !== ci)
    return t;
  var r = /* @__PURE__ */ new Map(), i = Tt(t), s = /* @__PURE__ */ Y(0), n = J, o = (u) => {
    var a = J;
    Ie(n);
    var c = u();
    return Ie(a), c;
  };
  return i && r.set("length", /* @__PURE__ */ Y(
    /** @type {any[]} */
    t.length
  )), new Proxy(
    /** @type {any} */
    t,
    {
      defineProperty(u, a, c) {
        return (!("value" in c) || c.configurable === !1 || c.enumerable === !1 || c.writable === !1) && Ai(), o(() => {
          var p = r.get(a);
          p === void 0 ? (p = /* @__PURE__ */ Y(c.value), r.set(a, p)) : T(p, c.value, !0);
        }), !0;
      },
      deleteProperty(u, a) {
        var c = r.get(a);
        if (c === void 0) {
          if (a in u) {
            const l = o(() => /* @__PURE__ */ Y(fe));
            r.set(a, l), zt(s);
          }
        } else {
          if (i && typeof a == "string") {
            var p = (
              /** @type {Source<number>} */
              r.get("length")
            ), f = Number(a);
            Number.isInteger(f) && f < p.v && T(p, f);
          }
          T(c, fe), zt(s);
        }
        return !0;
      },
      get(u, a, c) {
        if (a === Ze)
          return t;
        var p = r.get(a), f = a in u;
        if (p === void 0 && (!f || Qe(u, a)?.writable) && (p = o(() => {
          var _ = Pe(f ? u[a] : fe), g = /* @__PURE__ */ Y(_);
          return g;
        }), r.set(a, p)), p !== void 0) {
          var l = d(p);
          return l === fe ? void 0 : l;
        }
        return Reflect.get(u, a, c);
      },
      getOwnPropertyDescriptor(u, a) {
        var c = Reflect.getOwnPropertyDescriptor(u, a);
        if (c && "value" in c) {
          var p = r.get(a);
          p && (c.value = d(p));
        } else if (c === void 0) {
          var f = r.get(a), l = f?.v;
          if (f !== void 0 && l !== fe)
            return {
              enumerable: !0,
              configurable: !0,
              value: l,
              writable: !0
            };
        }
        return c;
      },
      has(u, a) {
        if (a === Ze)
          return !0;
        var c = r.get(a), p = c !== void 0 && c.v !== fe || Reflect.has(u, a);
        if (c !== void 0 || K !== null && (!p || Qe(u, a)?.writable)) {
          c === void 0 && (c = o(() => {
            var l = p ? Pe(u[a]) : fe, _ = /* @__PURE__ */ Y(l);
            return _;
          }), r.set(a, c));
          var f = d(c);
          if (f === fe)
            return !1;
        }
        return p;
      },
      set(u, a, c, p) {
        var f = r.get(a), l = a in u;
        if (i && a === "length")
          for (var _ = c; _ < /** @type {Source<number>} */
          f.v; _ += 1) {
            var g = r.get(_ + "");
            g !== void 0 ? T(g, fe) : _ in u && (g = o(() => /* @__PURE__ */ Y(fe)), r.set(_ + "", g));
          }
        if (f === void 0)
          (!l || Qe(u, a)?.writable) && (f = o(() => {
            var x = /* @__PURE__ */ Y(void 0);
            return T(x, Pe(c)), x;
          }), r.set(a, f));
        else {
          l = f.v !== fe;
          var P = o(() => Pe(c));
          T(f, P);
        }
        var S = Reflect.getOwnPropertyDescriptor(u, a);
        if (S?.set && S.set.call(p, c), !l) {
          if (i && typeof a == "string") {
            var F = (
              /** @type {Source<number>} */
              r.get("length")
            ), M = Number(a);
            Number.isInteger(M) && M >= F.v && T(F, M + 1);
          }
          zt(s);
        }
        return !0;
      },
      ownKeys(u) {
        d(s);
        var a = Reflect.ownKeys(u).filter((f) => {
          var l = r.get(f);
          return l === void 0 || l.v !== fe;
        });
        for (var [c, p] of r)
          p.v !== fe && !(c in u) && a.push(c);
        return a;
      },
      setPrototypeOf() {
        ki();
      }
    }
  );
}
function zt(t, e = 1) {
  T(t, t.v + e);
}
function cr(t) {
  try {
    if (t !== null && typeof t == "object" && Ze in t)
      return t[Ze];
  } catch {
  }
  return t;
}
function Mi(t, e) {
  return Object.is(cr(t), cr(e));
}
// @__NO_SIDE_EFFECTS__
function Dt(t) {
  var e = Se | De, r = J !== null && (J.f & Se) !== 0 ? (
    /** @type {Derived} */
    J
  ) : null;
  return K === null || r !== null && (r.f & ge) !== 0 ? e |= ge : K.f |= Sr, {
    ctx: pe,
    deps: null,
    effects: null,
    equals: Er,
    f: e,
    fn: t,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      null
    ),
    wv: 0,
    parent: r ?? K
  };
}
// @__NO_SIDE_EFFECTS__
function ke(t) {
  const e = /* @__PURE__ */ Dt(t);
  return Yr(e), e;
}
// @__NO_SIDE_EFFECTS__
function Ri(t) {
  const e = /* @__PURE__ */ Dt(t);
  return e.equals = $t, e;
}
function Cr(t) {
  var e = t.effects;
  if (e !== null) {
    t.effects = null;
    for (var r = 0; r < e.length; r += 1)
      Re(
        /** @type {Effect} */
        e[r]
      );
  }
}
function Ni(t) {
  for (var e = t.parent; e !== null; ) {
    if ((e.f & Se) === 0)
      return (
        /** @type {Effect} */
        e
      );
    e = e.parent;
  }
  return null;
}
function Or(t) {
  var e, r = K;
  Ve(Ni(t));
  try {
    Cr(t), e = Kr(t);
  } finally {
    Ve(r);
  }
  return e;
}
function Tr(t) {
  var e = Or(t);
  if (t.equals(e) || (t.v = e, t.wv = Wr()), !ft) {
    var r = (Ue || (t.f & ge) !== 0) && t.deps !== null ? We : me;
    Ee(t, r);
  }
}
const _t = /* @__PURE__ */ new Map();
function At(t, e) {
  var r = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: t,
    reactions: null,
    equals: Er,
    rv: 0,
    wv: 0
  };
  return r;
}
// @__NO_SIDE_EFFECTS__
function Y(t, e) {
  const r = At(t);
  return Yr(r), r;
}
// @__NO_SIDE_EFFECTS__
function qr(t, e = !1, r = !0) {
  const i = At(t);
  return e || (i.equals = $t), i;
}
function T(t, e, r = !1) {
  J !== null && !xe && Pr() && (J.f & (Se | Kt)) !== 0 && !Oe?.includes(t) && Si();
  let i = r ? Pe(e) : e;
  return Ut(t, i);
}
function Ut(t, e) {
  if (!t.equals(e)) {
    var r = t.v;
    ft ? _t.set(t, e) : _t.set(t, r), t.v = e, (t.f & Se) !== 0 && ((t.f & De) !== 0 && Or(
      /** @type {Derived} */
      t
    ), Ee(t, (t.f & ge) === 0 ? me : We)), t.wv = Wr(), Dr(t, De), K !== null && (K.f & me) !== 0 && (K.f & (Ne | He)) === 0 && (we === null ? Ki([t]) : we.push(t));
  }
  return e;
}
function Dr(t, e) {
  var r = t.reactions;
  if (r !== null)
    for (var i = r.length, s = 0; s < i; s++) {
      var n = r[s], o = n.f;
      (o & De) === 0 && (Ee(n, e), (o & (me | ge)) !== 0 && ((o & Se) !== 0 ? Dr(
        /** @type {Derived} */
        n,
        We
      ) : jt(
        /** @type {Effect} */
        n
      )));
    }
}
let ji = !1;
var vr, Mr, Rr, Nr;
function zi() {
  if (vr === void 0) {
    vr = window, Mr = /Firefox/.test(navigator.userAgent);
    var t = Element.prototype, e = Node.prototype, r = Text.prototype;
    Rr = Qe(e, "firstChild").get, Nr = Qe(e, "nextSibling").get, lr(t) && (t.__click = void 0, t.__className = void 0, t.__attributes = null, t.__style = void 0, t.__e = void 0), lr(r) && (r.__t = void 0);
  }
}
function Mt(t = "") {
  return document.createTextNode(t);
}
// @__NO_SIDE_EFFECTS__
function kt(t) {
  return Rr.call(t);
}
// @__NO_SIDE_EFFECTS__
function Rt(t) {
  return Nr.call(t);
}
function v(t, e) {
  return /* @__PURE__ */ kt(t);
}
function Me(t, e) {
  {
    var r = (
      /** @type {DocumentFragment} */
      /* @__PURE__ */ kt(
        /** @type {Node} */
        t
      )
    );
    return r instanceof Comment && r.data === "" ? /* @__PURE__ */ Rt(r) : r;
  }
}
function h(t, e = 1, r = !1) {
  let i = t;
  for (; e--; )
    i = /** @type {TemplateNode} */
    /* @__PURE__ */ Rt(i);
  return i;
}
function Li(t) {
  t.textContent = "";
}
function Fi(t) {
  K === null && J === null && yi(), J !== null && (J.f & ge) !== 0 && K === null && mi(), ft && gi();
}
function Ui(t, e) {
  var r = e.last;
  r === null ? e.last = e.first = t : (r.next = t, t.prev = r, e.last = t);
}
function Je(t, e, r, i = !0) {
  var s = K, n = {
    ctx: pe,
    deps: null,
    nodes_start: null,
    nodes_end: null,
    f: t | De,
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
      sr(n), n.f |= kr;
    } catch (a) {
      throw Re(n), a;
    }
  else e !== null && jt(n);
  var o = r && n.deps === null && n.first === null && n.nodes_start === null && n.teardown === null && (n.f & (Sr | Qt)) === 0;
  if (!o && i && (s !== null && Ui(n, s), J !== null && (J.f & Se) !== 0)) {
    var u = (
      /** @type {Derived} */
      J
    );
    (u.effects ?? (u.effects = [])).push(n);
  }
  return n;
}
function jr(t) {
  const e = Je(qt, null, !1);
  return Ee(e, me), e.teardown = t, e;
}
function Fe(t) {
  Fi();
  var e = K !== null && (K.f & Ne) !== 0 && pe !== null && !pe.m;
  if (e) {
    var r = (
      /** @type {ComponentContext} */
      pe
    );
    (r.e ?? (r.e = [])).push({
      fn: t,
      effect: K,
      reaction: J
    });
  } else {
    var i = zr(t);
    return i;
  }
}
function Vi(t) {
  const e = Je(He, t, !0);
  return () => {
    Re(e);
  };
}
function Bi(t) {
  const e = Je(He, t, !0);
  return (r = {}) => new Promise((i) => {
    r.outro ? St(e, () => {
      Re(e), i(void 0);
    }) : (Re(e), i(void 0));
  });
}
function zr(t) {
  return Je(Ar, t, !1);
}
function Gi(t) {
  return Je(qt, t, !0);
}
function D(t, e = [], r = Dt) {
  const i = e.map(r);
  return rr(() => t(...i.map(d)));
}
function rr(t, e = 0) {
  return Je(qt | Kt | e, t, !0);
}
function pt(t, e = !0) {
  return Je(qt | Ne, t, !0, e);
}
function Lr(t) {
  var e = t.teardown;
  if (e !== null) {
    const r = ft, i = J;
    dr(!0), Ie(null);
    try {
      e.call(null);
    } finally {
      dr(r), Ie(i);
    }
  }
}
function Fr(t, e = !1) {
  var r = t.first;
  for (t.first = t.last = null; r !== null; ) {
    var i = r.next;
    (r.f & He) !== 0 ? r.parent = null : Re(r, e), r = i;
  }
}
function Yi(t) {
  for (var e = t.first; e !== null; ) {
    var r = e.next;
    (e.f & Ne) === 0 && Re(e), e = r;
  }
}
function Re(t, e = !0) {
  var r = !1;
  (e || (t.f & fi) !== 0) && t.nodes_start !== null && t.nodes_end !== null && (Hi(
    t.nodes_start,
    /** @type {TemplateNode} */
    t.nodes_end
  ), r = !0), Fr(t, e && !r), Ct(t, 0), Ee(t, Zt);
  var i = t.transitions;
  if (i !== null)
    for (const n of i)
      n.stop();
  Lr(t);
  var s = t.parent;
  s !== null && s.first !== null && Ur(t), t.next = t.prev = t.teardown = t.ctx = t.deps = t.fn = t.nodes_start = t.nodes_end = null;
}
function Hi(t, e) {
  for (; t !== null; ) {
    var r = t === e ? null : (
      /** @type {TemplateNode} */
      /* @__PURE__ */ Rt(t)
    );
    t.remove(), t = r;
  }
}
function Ur(t) {
  var e = t.parent, r = t.prev, i = t.next;
  r !== null && (r.next = i), i !== null && (i.prev = r), e !== null && (e.first === t && (e.first = i), e.last === t && (e.last = r));
}
function St(t, e) {
  var r = [];
  ir(t, r, !0), Vr(r, () => {
    Re(t), e && e();
  });
}
function Vr(t, e) {
  var r = t.length;
  if (r > 0) {
    var i = () => --r || e();
    for (var s of t)
      s.out(i);
  } else
    e();
}
function ir(t, e, r) {
  if ((t.f & Ce) === 0) {
    if (t.f ^= Ce, t.transitions !== null)
      for (const o of t.transitions)
        (o.is_global || r) && e.push(o);
    for (var i = t.first; i !== null; ) {
      var s = i.next, n = (i.f & Xt) !== 0 || (i.f & Ne) !== 0;
      ir(i, e, n ? r : !1), i = s;
    }
  }
}
function Et(t) {
  Br(t, !0);
}
function Br(t, e) {
  if ((t.f & Ce) !== 0) {
    t.f ^= Ce, (t.f & me) !== 0 && (Ee(t, De), jt(t));
    for (var r = t.first; r !== null; ) {
      var i = r.next, s = (r.f & Xt) !== 0 || (r.f & Ne) !== 0;
      Br(r, s ? e : !1), r = i;
    }
    if (t.transitions !== null)
      for (const n of t.transitions)
        (n.is_global || e) && n.in();
  }
}
let xt = [];
function Wi() {
  var t = xt;
  xt = [], vi(t);
}
function Vt(t) {
  xt.length === 0 && queueMicrotask(Wi), xt.push(t);
}
function Ji(t) {
  var e = (
    /** @type {Effect} */
    K
  );
  if ((e.f & kr) === 0) {
    if ((e.f & Qt) === 0)
      throw t;
    e.fn(t);
  } else
    Gr(t, e);
}
function Gr(t, e) {
  for (; e !== null; ) {
    if ((e.f & Qt) !== 0)
      try {
        e.fn(t);
        return;
      } catch {
      }
    e = e.parent;
  }
  throw t;
}
let Bt = !1, It = null, Ge = !1, ft = !1;
function dr(t) {
  ft = t;
}
let bt = [];
let J = null, xe = !1;
function Ie(t) {
  J = t;
}
let K = null;
function Ve(t) {
  K = t;
}
let Oe = null;
function Yr(t) {
  J !== null && J.f & Ft && (Oe === null ? Oe = [t] : Oe.push(t));
}
let ve = null, he = 0, we = null;
function Ki(t) {
  we = t;
}
let Hr = 1, Pt = 0, Ue = !1;
function Wr() {
  return ++Hr;
}
function Nt(t) {
  var e = t.f;
  if ((e & De) !== 0)
    return !0;
  if ((e & We) !== 0) {
    var r = t.deps, i = (e & ge) !== 0;
    if (r !== null) {
      var s, n, o = (e & wt) !== 0, u = i && K !== null && !Ue, a = r.length;
      if (o || u) {
        var c = (
          /** @type {Derived} */
          t
        ), p = c.parent;
        for (s = 0; s < a; s++)
          n = r[s], (o || !n?.reactions?.includes(c)) && (n.reactions ?? (n.reactions = [])).push(c);
        o && (c.f ^= wt), u && p !== null && (p.f & ge) === 0 && (c.f ^= ge);
      }
      for (s = 0; s < a; s++)
        if (n = r[s], Nt(
          /** @type {Derived} */
          n
        ) && Tr(
          /** @type {Derived} */
          n
        ), n.wv > t.wv)
          return !0;
    }
    (!i || K !== null && !Ue) && Ee(t, me);
  }
  return !1;
}
function Jr(t, e, r = !0) {
  var i = t.reactions;
  if (i !== null)
    for (var s = 0; s < i.length; s++) {
      var n = i[s];
      Oe?.includes(t) || ((n.f & Se) !== 0 ? Jr(
        /** @type {Derived} */
        n,
        e,
        !1
      ) : e === n && (r ? Ee(n, De) : (n.f & me) !== 0 && Ee(n, We), jt(
        /** @type {Effect} */
        n
      )));
    }
}
function Kr(t) {
  var _;
  var e = ve, r = he, i = we, s = J, n = Ue, o = Oe, u = pe, a = xe, c = t.f;
  ve = /** @type {null | Value[]} */
  null, he = 0, we = null, Ue = (c & ge) !== 0 && (xe || !Ge || J === null), J = (c & (Ne | He)) === 0 ? t : null, Oe = null, ur(t.ctx), xe = !1, Pt++, t.f |= Ft;
  try {
    var p = (
      /** @type {Function} */
      (0, t.fn)()
    ), f = t.deps;
    if (ve !== null) {
      var l;
      if (Ct(t, he), f !== null && he > 0)
        for (f.length = he + ve.length, l = 0; l < ve.length; l++)
          f[he + l] = ve[l];
      else
        t.deps = f = ve;
      if (!Ue)
        for (l = he; l < f.length; l++)
          ((_ = f[l]).reactions ?? (_.reactions = [])).push(t);
    } else f !== null && he < f.length && (Ct(t, he), f.length = he);
    if (Pr() && we !== null && !xe && f !== null && (t.f & (Se | We | De)) === 0)
      for (l = 0; l < /** @type {Source[]} */
      we.length; l++)
        Jr(
          we[l],
          /** @type {Effect} */
          t
        );
    return s !== null && s !== t && (Pt++, we !== null && (i === null ? i = we : i.push(.../** @type {Source[]} */
    we))), p;
  } catch (g) {
    Ji(g);
  } finally {
    ve = e, he = r, we = i, J = s, Ue = n, Oe = o, ur(u), xe = a, t.f ^= Ft;
  }
}
function Qi(t, e) {
  let r = e.reactions;
  if (r !== null) {
    var i = oi.call(r, t);
    if (i !== -1) {
      var s = r.length - 1;
      s === 0 ? r = e.reactions = null : (r[i] = r[s], r.pop());
    }
  }
  r === null && (e.f & Se) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (ve === null || !ve.includes(e)) && (Ee(e, We), (e.f & (ge | wt)) === 0 && (e.f ^= wt), Cr(
    /** @type {Derived} **/
    e
  ), Ct(
    /** @type {Derived} **/
    e,
    0
  ));
}
function Ct(t, e) {
  var r = t.deps;
  if (r !== null)
    for (var i = e; i < r.length; i++)
      Qi(t, r[i]);
}
function sr(t) {
  var e = t.f;
  if ((e & Zt) === 0) {
    Ee(t, me);
    var r = K, i = Ge;
    K = t, Ge = !0;
    try {
      (e & Kt) !== 0 ? Yi(t) : Fr(t), Lr(t);
      var s = Kr(t);
      t.teardown = typeof s == "function" ? s : null, t.wv = Hr;
      var n;
    } finally {
      Ge = i, K = r;
    }
  }
}
function Zi() {
  try {
    bi();
  } catch (t) {
    if (It !== null)
      Gr(t, It);
    else
      throw t;
  }
}
function Xi() {
  var t = Ge;
  try {
    var e = 0;
    for (Ge = !0; bt.length > 0; ) {
      e++ > 1e3 && Zi();
      var r = bt, i = r.length;
      bt = [];
      for (var s = 0; s < i; s++) {
        var n = es(r[s]);
        $i(n);
      }
      _t.clear();
    }
  } finally {
    Bt = !1, Ge = t, It = null;
  }
}
function $i(t) {
  var e = t.length;
  if (e !== 0)
    for (var r = 0; r < e; r++) {
      var i = t[r];
      (i.f & (Zt | Ce)) === 0 && Nt(i) && (sr(i), i.deps === null && i.first === null && i.nodes_start === null && (i.teardown === null ? Ur(i) : i.fn = null));
    }
}
function jt(t) {
  Bt || (Bt = !0, queueMicrotask(Xi));
  for (var e = It = t; e.parent !== null; ) {
    e = e.parent;
    var r = e.f;
    if ((r & (He | Ne)) !== 0) {
      if ((r & me) === 0) return;
      e.f ^= me;
    }
  }
  bt.push(e);
}
function es(t) {
  for (var e = [], r = t; r !== null; ) {
    var i = r.f, s = (i & (Ne | He)) !== 0, n = s && (i & me) !== 0;
    if (!n && (i & Ce) === 0) {
      (i & Ar) !== 0 ? e.push(r) : s ? r.f ^= me : Nt(r) && sr(r);
      var o = r.first;
      if (o !== null) {
        r = o;
        continue;
      }
    }
    var u = r.parent;
    for (r = r.next; r === null && u !== null; )
      r = u.next, u = u.parent;
  }
  return e;
}
function d(t) {
  var e = t.f, r = (e & Se) !== 0;
  if (J !== null && !xe) {
    if (!Oe?.includes(t)) {
      var i = J.deps;
      t.rv < Pt && (t.rv = Pt, ve === null && i !== null && i[he] === t ? he++ : ve === null ? ve = [t] : (!Ue || !ve.includes(t)) && ve.push(t));
    }
  } else if (r && /** @type {Derived} */
  t.deps === null && /** @type {Derived} */
  t.effects === null) {
    var s = (
      /** @type {Derived} */
      t
    ), n = s.parent;
    n !== null && (n.f & ge) === 0 && (s.f ^= ge);
  }
  return r && (s = /** @type {Derived} */
  t, Nt(s) && Tr(s)), ft && _t.has(t) ? _t.get(t) : t.v;
}
function Gt(t) {
  var e = xe;
  try {
    return xe = !0, t();
  } finally {
    xe = e;
  }
}
const ts = -7169;
function Ee(t, e) {
  t.f = t.f & ts | e;
}
const rs = ["touchstart", "touchmove"];
function is(t) {
  return rs.includes(t);
}
let fr = !1;
function ss() {
  fr || (fr = !0, document.addEventListener(
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
function ns(t) {
  var e = J, r = K;
  Ie(null), Ve(null);
  try {
    return t();
  } finally {
    Ie(e), Ve(r);
  }
}
function os(t, e, r, i = r) {
  t.addEventListener(e, () => ns(r));
  const s = t.__on_r;
  s ? t.__on_r = () => {
    s(), i(!0);
  } : t.__on_r = () => i(!0), ss();
}
const Qr = /* @__PURE__ */ new Set(), Yt = /* @__PURE__ */ new Set();
function ht(t) {
  for (var e = 0; e < t.length; e++)
    Qr.add(t[e]);
  for (var r of Yt)
    r(t);
}
function mt(t) {
  var e = this, r = (
    /** @type {Node} */
    e.ownerDocument
  ), i = t.type, s = t.composedPath?.() || [], n = (
    /** @type {null | Element} */
    s[0] || t.target
  ), o = 0, u = t.__root;
  if (u) {
    var a = s.indexOf(u);
    if (a !== -1 && (e === document || e === /** @type {any} */
    window)) {
      t.__root = e;
      return;
    }
    var c = s.indexOf(e);
    if (c === -1)
      return;
    a <= c && (o = a);
  }
  if (n = /** @type {Element} */
  s[o] || t.target, n !== e) {
    ai(t, "currentTarget", {
      configurable: !0,
      get() {
        return n || r;
      }
    });
    var p = J, f = K;
    Ie(null), Ve(null);
    try {
      for (var l, _ = []; n !== null; ) {
        var g = n.assignedSlot || n.parentNode || /** @type {any} */
        n.host || null;
        try {
          var P = n["__" + i];
          if (P != null && (!/** @type {any} */
          n.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          t.target === n))
            if (Tt(P)) {
              var [S, ...F] = P;
              S.apply(n, [t, ...F]);
            } else
              P.call(n, t);
        } catch (M) {
          l ? _.push(M) : l = M;
        }
        if (t.cancelBubble || g === e || g === null)
          break;
        n = g;
      }
      if (l) {
        for (let M of _)
          queueMicrotask(() => {
            throw M;
          });
        throw l;
      }
    } finally {
      t.__root = e, delete t.currentTarget, Ie(p), Ve(f);
    }
  }
}
function as(t) {
  var e = document.createElement("template");
  return e.innerHTML = t.replaceAll("<!>", "<!---->"), e.content;
}
function Ot(t, e) {
  var r = (
    /** @type {Effect} */
    K
  );
  r.nodes_start === null && (r.nodes_start = t, r.nodes_end = e);
}
// @__NO_SIDE_EFFECTS__
function A(t, e) {
  var r = (e & Ti) !== 0, i = (e & qi) !== 0, s, n = !t.startsWith("<!>");
  return () => {
    s === void 0 && (s = as(n ? t : "<!>" + t), r || (s = /** @type {Node} */
    /* @__PURE__ */ kt(s)));
    var o = (
      /** @type {TemplateNode} */
      i || Mr ? document.importNode(s, !0) : s.cloneNode(!0)
    );
    if (r) {
      var u = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ kt(o)
      ), a = (
        /** @type {TemplateNode} */
        o.lastChild
      );
      Ot(u, a);
    } else
      Ot(o, o);
    return o;
  };
}
function _r(t = "") {
  {
    var e = Mt(t + "");
    return Ot(e, e), e;
  }
}
function Ye() {
  var t = document.createDocumentFragment(), e = document.createComment(""), r = Mt();
  return t.append(e, r), Ot(e, r), t;
}
function m(t, e) {
  t !== null && t.before(
    /** @type {Node} */
    e
  );
}
function O(t, e) {
  var r = e == null ? "" : typeof e == "object" ? e + "" : e;
  r !== (t.__t ?? (t.__t = t.nodeValue)) && (t.__t = r, t.nodeValue = r + "");
}
function ls(t, e) {
  return us(t, e);
}
const Ke = /* @__PURE__ */ new Map();
function us(t, { target: e, anchor: r, props: i = {}, events: s, context: n, intro: o = !0 }) {
  zi();
  var u = /* @__PURE__ */ new Set(), a = (f) => {
    for (var l = 0; l < f.length; l++) {
      var _ = f[l];
      if (!u.has(_)) {
        u.add(_);
        var g = is(_);
        e.addEventListener(_, mt, { passive: g });
        var P = Ke.get(_);
        P === void 0 ? (document.addEventListener(_, mt, { passive: g }), Ke.set(_, 1)) : Ke.set(_, P + 1);
      }
    }
  };
  a(Jt(Qr)), Yt.add(a);
  var c = void 0, p = Bi(() => {
    var f = r ?? e.appendChild(Mt());
    return pt(() => {
      if (n) {
        je({});
        var l = (
          /** @type {ComponentContext} */
          pe
        );
        l.c = n;
      }
      s && (i.$$events = s), c = t(f, i) || {}, n && ze();
    }), () => {
      for (var l of u) {
        e.removeEventListener(l, mt);
        var _ = (
          /** @type {number} */
          Ke.get(l)
        );
        --_ === 0 ? (document.removeEventListener(l, mt), Ke.delete(l)) : Ke.set(l, _);
      }
      Yt.delete(a), f !== r && f.parentNode?.removeChild(f);
    };
  });
  return cs.set(c, p), c;
}
let cs = /* @__PURE__ */ new WeakMap();
function I(t, e, [r, i] = [0, 0]) {
  var s = t, n = null, o = null, u = fe, a = r > 0 ? Xt : 0, c = !1;
  const p = (l, _ = !0) => {
    c = !0, f(_, l);
  }, f = (l, _) => {
    u !== (u = l) && (u ? (n ? Et(n) : _ && (n = pt(() => _(s))), o && St(o, () => {
      o = null;
    })) : (o ? Et(o) : _ && (o = pt(() => _(s, [r + 1, i]))), n && St(n, () => {
      n = null;
    })));
  };
  rr(() => {
    c = !1, e(p), c || f(null, null);
  }, a);
}
function Te(t, e) {
  return e;
}
function vs(t, e, r, i) {
  for (var s = [], n = e.length, o = 0; o < n; o++)
    ir(e[o].e, s, !0);
  var u = n > 0 && s.length === 0 && r !== null;
  if (u) {
    var a = (
      /** @type {Element} */
      /** @type {Element} */
      r.parentNode
    );
    Li(a), a.append(
      /** @type {Element} */
      r
    ), i.clear(), Le(t, e[0].prev, e[n - 1].next);
  }
  Vr(s, () => {
    for (var c = 0; c < n; c++) {
      var p = e[c];
      u || (i.delete(p.k), Le(t, p.prev, p.next)), Re(p.e, !u);
    }
  });
}
function qe(t, e, r, i, s, n = null) {
  var o = t, u = { flags: e, items: /* @__PURE__ */ new Map(), first: null }, a = (e & xr) !== 0;
  if (a) {
    var c = (
      /** @type {Element} */
      t
    );
    o = c.appendChild(Mt());
  }
  var p = null, f = !1, l = /* @__PURE__ */ Ri(() => {
    var _ = r();
    return Tt(_) ? _ : _ == null ? [] : Jt(_);
  });
  rr(() => {
    var _ = d(l), g = _.length;
    f && g === 0 || (f = g === 0, ds(_, u, o, s, e, i, r), n !== null && (g === 0 ? p ? Et(p) : p = pt(() => n(o)) : p !== null && St(p, () => {
      p = null;
    })), d(l));
  });
}
function ds(t, e, r, i, s, n, o) {
  var u = (s & Ei) !== 0, a = (s & (er | tr)) !== 0, c = t.length, p = e.items, f = e.first, l = f, _, g = null, P, S = [], F = [], M, x, b, y;
  if (u)
    for (y = 0; y < c; y += 1)
      M = t[y], x = n(M, y), b = p.get(x), b !== void 0 && (b.a?.measure(), (P ?? (P = /* @__PURE__ */ new Set())).add(b));
  for (y = 0; y < c; y += 1) {
    if (M = t[y], x = n(M, y), b = p.get(x), b === void 0) {
      var N = l ? (
        /** @type {TemplateNode} */
        l.e.nodes_start
      ) : r;
      g = _s(
        N,
        e,
        g,
        g === null ? e.first : g.next,
        M,
        x,
        y,
        i,
        s,
        o
      ), p.set(x, g), S = [], F = [], l = g.next;
      continue;
    }
    if (a && fs(b, M, y, s), (b.e.f & Ce) !== 0 && (Et(b.e), u && (b.a?.unfix(), (P ?? (P = /* @__PURE__ */ new Set())).delete(b))), b !== l) {
      if (_ !== void 0 && _.has(b)) {
        if (S.length < F.length) {
          var E = F[0], j;
          g = E.prev;
          var te = S[0], X = S[S.length - 1];
          for (j = 0; j < S.length; j += 1)
            pr(S[j], E, r);
          for (j = 0; j < F.length; j += 1)
            _.delete(F[j]);
          Le(e, te.prev, X.next), Le(e, g, te), Le(e, X, E), l = E, g = X, y -= 1, S = [], F = [];
        } else
          _.delete(b), pr(b, l, r), Le(e, b.prev, b.next), Le(e, b, g === null ? e.first : g.next), Le(e, g, b), g = b;
        continue;
      }
      for (S = [], F = []; l !== null && l.k !== x; )
        (l.e.f & Ce) === 0 && (_ ?? (_ = /* @__PURE__ */ new Set())).add(l), F.push(l), l = l.next;
      if (l === null)
        continue;
      b = l;
    }
    S.push(b), g = b, l = b.next;
  }
  if (l !== null || _ !== void 0) {
    for (var re = _ === void 0 ? [] : Jt(_); l !== null; )
      (l.e.f & Ce) === 0 && re.push(l), l = l.next;
    var ie = re.length;
    if (ie > 0) {
      var Z = (s & xr) !== 0 && c === 0 ? r : null;
      if (u) {
        for (y = 0; y < ie; y += 1)
          re[y].a?.measure();
        for (y = 0; y < ie; y += 1)
          re[y].a?.fix();
      }
      vs(e, re, Z, p);
    }
  }
  u && Vt(() => {
    if (P !== void 0)
      for (b of P)
        b.a?.apply();
  }), K.first = e.first && e.first.e, K.last = g && g.e;
}
function fs(t, e, r, i) {
  (i & er) !== 0 && Ut(t.v, e), (i & tr) !== 0 ? Ut(
    /** @type {Value<number>} */
    t.i,
    r
  ) : t.i = r;
}
function _s(t, e, r, i, s, n, o, u, a, c) {
  var p = (a & er) !== 0, f = (a & xi) === 0, l = p ? f ? /* @__PURE__ */ qr(s, !1, !1) : At(s) : s, _ = (a & tr) === 0 ? o : At(o), g = {
    i: _,
    v: l,
    k: n,
    a: null,
    // @ts-expect-error
    e: null,
    prev: r,
    next: i
  };
  try {
    return g.e = pt(() => u(t, l, _, c), ji), g.e.prev = r && r.e, g.e.next = i && i.e, r === null ? e.first = g : (r.next = g, r.e.next = g.e), i !== null && (i.prev = g, i.e.prev = g.e), g;
  } finally {
  }
}
function pr(t, e, r) {
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
      /* @__PURE__ */ Rt(n)
    );
    s.before(n), n = o;
  }
}
function Le(t, e, r) {
  e === null ? t.first = r : (e.next = r, e.e.next = r && r.e), r !== null && (r.prev = e, r.e.prev = e && e.e);
}
function ps(t, e, r, i, s) {
  var n = e.$$slots?.[r], o = !1;
  n === !0 && (n = e.children, o = !0), n === void 0 || n(t, o ? () => i : i);
}
const hr = [...` 	
\r\f \v\uFEFF`];
function hs(t, e, r) {
  var i = t == null ? "" : "" + t;
  if (e && (i = i ? i + " " + e : e), r) {
    for (var s in r)
      if (r[s])
        i = i ? i + " " + s : s;
      else if (i.length)
        for (var n = s.length, o = 0; (o = i.indexOf(s, o)) >= 0; ) {
          var u = o + n;
          (o === 0 || hr.includes(i[o - 1])) && (u === i.length || hr.includes(i[u])) ? i = (o === 0 ? "" : i.substring(0, o)) + i.substring(u + 1) : o = u;
        }
  }
  return i === "" ? null : i;
}
function gs(t, e) {
  return t == null ? null : String(t);
}
function ye(t, e, r, i, s, n) {
  var o = t.__className;
  if (o !== r || o === void 0) {
    var u = hs(r, i, n);
    u == null ? t.removeAttribute("class") : e ? t.className = u : t.setAttribute("class", u), t.__className = r;
  } else if (n && s !== n)
    for (var a in n) {
      var c = !!n[a];
      (s == null || c !== !!s[a]) && t.classList.toggle(a, c);
    }
  return n;
}
function Zr(t, e, r, i) {
  var s = t.__style;
  if (s !== e) {
    var n = gs(e);
    n == null ? t.removeAttribute("style") : t.style.cssText = n, t.__style = e;
  }
  return i;
}
const ms = Symbol("is custom element"), ys = Symbol("is html");
function bs(t, e) {
  var r = $r(t);
  r.value === (r.value = // treat null and undefined the same for the initial value
  e ?? void 0) || // @ts-expect-error
  // `progress` elements always need their value set when it's `0`
  t.value === e && (e !== 0 || t.nodeName !== "PROGRESS") || (t.value = e ?? "");
}
function Xr(t, e, r, i) {
  var s = $r(t);
  s[e] !== (s[e] = r) && (e === "loading" && (t[pi] = r), r == null ? t.removeAttribute(e) : typeof r != "string" && ws(t).includes(e) ? t[e] = r : t.setAttribute(e, r));
}
function $r(t) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    // @ts-expect-error
    t.__attributes ?? (t.__attributes = {
      [ms]: t.nodeName.includes("-"),
      [ys]: t.namespaceURI === Di
    })
  );
}
var gr = /* @__PURE__ */ new Map();
function ws(t) {
  var e = gr.get(t.nodeName);
  if (e) return e;
  gr.set(t.nodeName, e = []);
  for (var r, i = t, s = Element.prototype; s !== i; ) {
    r = li(i);
    for (var n in r)
      r[n].set && e.push(n);
    i = wr(i);
  }
  return e;
}
const Lt = /* @__PURE__ */ new Set();
function mr(t, e, r, i, s = i) {
  var n = r.getAttribute("type") === "checkbox", o = t;
  if (e !== null)
    for (var u of e)
      o = o[u] ?? (o[u] = []);
  o.push(r), os(
    r,
    "change",
    () => {
      var a = r.__value;
      n && (a = As(o, a, r.checked)), s(a);
    },
    // TODO better default value handling
    () => s(n ? [] : null)
  ), Gi(() => {
    var a = i();
    n ? (a = a || [], r.checked = a.includes(r.__value)) : r.checked = Mi(r.__value, a);
  }), jr(() => {
    var a = o.indexOf(r);
    a !== -1 && o.splice(a, 1);
  }), Lt.has(o) || (Lt.add(o), Vt(() => {
    o.sort((a, c) => a.compareDocumentPosition(c) === 4 ? -1 : 1), Lt.delete(o);
  })), Vt(() => {
  });
}
function As(t, e, r) {
  for (var i = /* @__PURE__ */ new Set(), s = 0; s < t.length; s += 1)
    t[s].checked && i.add(t[s].__value);
  return r || i.delete(e), Array.from(i);
}
let yt = !1;
function ks(t) {
  var e = yt;
  try {
    return yt = !1, [t(), yt];
  } finally {
    yt = e;
  }
}
function yr(t) {
  return t.ctx?.d ?? !1;
}
function _e(t, e, r, i) {
  var s = (r & Ii) !== 0, n = !0, o = (r & Ci) !== 0, u = (r & Oi) !== 0, a = !1, c;
  o ? [c, a] = ks(() => (
    /** @type {V} */
    t[e]
  )) : c = /** @type {V} */
  t[e];
  var p = Ze in t || _i in t, f = o && (Qe(t, e)?.set ?? (p && e in t && ((y) => t[e] = y))) || void 0, l = (
    /** @type {V} */
    i
  ), _ = !0, g = !1, P = () => (g = !0, _ && (_ = !1, u ? l = Gt(
    /** @type {() => V} */
    i
  ) : l = /** @type {V} */
  i), l);
  c === void 0 && i !== void 0 && (f && n && wi(), c = P(), f && f(c));
  var S;
  if (S = () => {
    var y = (
      /** @type {V} */
      t[e]
    );
    return y === void 0 ? P() : (_ = !0, g = !1, y);
  }, (r & Pi) === 0 && n)
    return S;
  if (f) {
    var F = t.$$legacy;
    return function(y, N) {
      return arguments.length > 0 ? ((!N || F || a) && f(N ? S() : y), y) : S();
    };
  }
  var M = !1, x = /* @__PURE__ */ qr(c), b = /* @__PURE__ */ Dt(() => {
    var y = S(), N = d(x);
    return M ? (M = !1, N) : x.v = y;
  });
  return o && d(b), s || (b.equals = $t), function(y, N) {
    if (arguments.length > 0) {
      const E = N ? d(b) : o ? Pe(y) : y;
      if (!b.equals(E)) {
        if (M = !0, T(x, E), g && l !== void 0 && (l = E), yr(b))
          return y;
        Gt(() => d(b));
      }
      return y;
    }
    return yr(b) ? b.v : d(b);
  };
}
function ei(t) {
  pe === null && Ir(), Fe(() => {
    const e = Gt(t);
    if (typeof e == "function") return (
      /** @type {() => void} */
      e
    );
  });
}
function Ss(t, e, { bubbles: r = !1, cancelable: i = !1 } = {}) {
  return new CustomEvent(t, { detail: e, bubbles: r, cancelable: i });
}
function Es() {
  const t = pe;
  return t === null && Ir(), (e, r, i) => {
    const s = (
      /** @type {Record<string, Function | Function[]>} */
      t.s.$$events?.[
        /** @type {any} */
        e
      ]
    );
    if (s) {
      const n = Tt(s) ? s.slice() : [s], o = Ss(
        /** @type {string} */
        e,
        r,
        i
      );
      for (const u of n)
        u.call(t.x, o);
      return !o.defaultPrevented;
    }
    return !0;
  };
}
const xs = "5";
var br;
typeof window < "u" && ((br = window.__svelte ?? (window.__svelte = {})).v ?? (br.v = /* @__PURE__ */ new Set())).add(xs);
class Is {
  constructor(e, r = {}) {
    this.baseUrl = e || window.__API_BASE_URL__ || "http://localhost:8080/api/v1", this.modelId = r.modelId, this.authToken = r.authToken || localStorage.getItem("auth_token"), this.timeout = r.timeout || 1e4, console.log("API Client initialized:", {
      baseUrl: this.baseUrl,
      modelId: this.modelId,
      hasAuth: !!this.authToken
    });
  }
  async request(e, r = {}) {
    e.startsWith("/") || (e = "/" + e);
    const i = `${this.baseUrl}${e}`;
    console.log("API Request:", r.method || "GET", i);
    const s = {
      method: "GET",
      mode: "cors",
      credentials: "omit",
      headers: {
        "Content-Type": "application/json",
        ...this.authToken && { Authorization: `Bearer ${this.authToken}` },
        ...r.headers
      },
      ...r
    };
    s.body && typeof s.body == "object" && (s.body = JSON.stringify(s.body));
    try {
      const n = new AbortController(), o = setTimeout(() => n.abort(), this.timeout), u = await fetch(i, {
        ...s,
        signal: n.signal
      });
      if (clearTimeout(o), !u.ok) {
        const c = await u.text();
        let p = `HTTP ${u.status}: ${u.statusText}`;
        try {
          const f = JSON.parse(c);
          p = f.message || f.error || p;
        } catch {
          c.includes("<html") || (p = c || p);
        }
        throw console.error(`API Error from ${e}:`, p), u.status === 404 ? new Error(`Endpoint not found: ${i}. Please check if the backend server is running and the API path is correct.`) : new Error(p);
      }
      const a = await u.json();
      if (console.log(`API Response from ${e}:`, a), a.success !== void 0) {
        if (a.success && a.data !== void 0)
          return a.data;
        if (!a.success)
          throw new Error(a.error || a.message || "Request failed");
      }
      return (e.includes("/groups") || e.includes("/options")) && console.log(
        `Note: ${e} returned unwrapped response, structure:`,
        Array.isArray(a) ? "Array" : typeof a,
        "Keys:",
        a ? Object.keys(a).slice(0, 5) : "none"
      ), a;
    } catch (n) {
      throw n.name === "AbortError" ? new Error("Request timeout") : n;
    }
  }
  setAuthToken(e) {
    this.authToken = e, e ? localStorage.setItem("auth_token", e) : localStorage.removeItem("auth_token");
  }
  // Authentication
  async login(e, r) {
    const i = await this.request("/auth/login", {
      method: "POST",
      body: { username: e, password: r }
    });
    return i.token && this.setAuthToken(i.token), i;
  }
  async validateToken() {
    return this.request("/auth/validate", { method: "POST" });
  }
  // Model Management
  async getModel() {
    if (!this.modelId) throw new Error("Model ID required");
    const e = await this.request(`/models/${this.modelId}`);
    if (console.log("getModel response:", e), e && e.id && !e.option_groups && !e.groups)
      try {
        const r = await this.getModelOptions();
        e.options = r;
      } catch (r) {
        console.warn("Failed to fetch model options separately:", r);
      }
    return e;
  }
  async getModelOptions() {
    if (!this.modelId) throw new Error("Model ID required");
    const e = await this.request(`/models/${this.modelId}/options`);
    return console.log("getModelOptions response:", e), e;
  }
  async getModelGroups() {
    if (!this.modelId) throw new Error("Model ID required");
    const e = await this.request(`/models/${this.modelId}/groups?include=options`);
    return console.log("getModelGroups response:", e), e;
  }
  async getModelStatistics() {
    if (!this.modelId) throw new Error("Model ID required");
    return this.request(`/models/${this.modelId}/statistics`);
  }
  // Configuration Management
  async createConfiguration(e = {}) {
    return this.request("/configurations", {
      method: "POST",
      body: {
        model_id: this.modelId,
        selections: this.formatSelections(e)
      }
    });
  }
  async getConfiguration(e) {
    return this.request(`/configurations/${e}?model_id=${this.modelId}`);
  }
  async updateConfiguration(e, r) {
    return this.request(`/configurations/${e}`, {
      method: "PUT",
      body: {
        model_id: this.modelId,
        selections: this.formatSelections(r)
      }
    });
  }
  async validateSelections(e) {
    return this.request("/configurations/validate-selection", {
      method: "POST",
      body: {
        model_id: this.modelId,
        selections: this.formatSelections(e)
      }
    });
  }
  async getAvailableOptions(e) {
    return this.request(`/configurations/${e}/available-options?model_id=${this.modelId}`);
  }
  // Pricing
  async calculatePricing(e, r = {}) {
    return this.request("/pricing/calculate", {
      method: "POST",
      body: {
        model_id: this.modelId,
        selections: this.formatSelections(e),
        context: r
      }
    });
  }
  async getVolumeTiers() {
    return this.request(`/pricing/volume-tiers/${this.modelId}`);
  }
  async simulatePricing(e) {
    return this.request("/pricing/simulate", {
      method: "POST",
      body: {
        model_id: this.modelId,
        scenarios: e
      }
    });
  }
  // Utility methods
  formatSelections(e) {
    return Object.entries(e).filter(([r, i]) => i > 0).map(([r, i]) => ({
      option_id: r,
      quantity: i
    }));
  }
}
var Xe, $e, et, tt, rt, it, st, nt, ot, at, lt, ut, ct, vt, dt;
class Ps {
  constructor() {
    ue(this, Xe);
    ue(this, $e);
    ue(this, et);
    ue(this, tt);
    ue(this, rt);
    ue(this, it);
    ue(this, st);
    ue(this, nt);
    ue(this, ot);
    ue(this, at);
    ue(this, lt);
    ue(this, ut);
    ue(this, ct);
    ue(this, vt);
    ue(this, dt);
    ce(this, Xe, /* @__PURE__ */ Y("")), ce(this, $e, /* @__PURE__ */ Y(null)), ce(this, et, /* @__PURE__ */ Y(Pe({}))), ce(this, tt, /* @__PURE__ */ Y(Pe([]))), ce(this, rt, /* @__PURE__ */ Y(null)), ce(this, it, /* @__PURE__ */ Y(Pe([]))), ce(this, st, /* @__PURE__ */ Y(!1)), ce(this, nt, /* @__PURE__ */ Y(!1)), ce(this, ot, /* @__PURE__ */ Y(!1)), ce(this, at, /* @__PURE__ */ Y(null)), ce(this, lt, /* @__PURE__ */ Y(0)), ce(this, ut, /* @__PURE__ */ Y(null)), ce(this, ct, /* @__PURE__ */ Y(null)), ce(this, vt, /* @__PURE__ */ Y(!1)), ce(this, dt, /* @__PURE__ */ Y(0)), this.api = null, this._initialized = !1, this._debounceTimers = /* @__PURE__ */ new Map(), this._loadingPromise = null;
  }
  get modelId() {
    return d(G(this, Xe));
  }
  set modelId(e) {
    T(G(this, Xe), e, !0);
  }
  get model() {
    return d(G(this, $e));
  }
  set model(e) {
    T(G(this, $e), e, !0);
  }
  get selections() {
    return d(G(this, et));
  }
  set selections(e) {
    T(G(this, et), e, !0);
  }
  get validationResults() {
    return d(G(this, tt));
  }
  set validationResults(e) {
    T(G(this, tt), e, !0);
  }
  get pricingData() {
    return d(G(this, rt));
  }
  set pricingData(e) {
    T(G(this, rt), e, !0);
  }
  get availableOptions() {
    return d(G(this, it));
  }
  set availableOptions(e) {
    T(G(this, it), e, !0);
  }
  get isLoading() {
    return d(G(this, st));
  }
  set isLoading(e) {
    T(G(this, st), e, !0);
  }
  get isValidating() {
    return d(G(this, nt));
  }
  set isValidating(e) {
    T(G(this, nt), e, !0);
  }
  get isPricing() {
    return d(G(this, ot));
  }
  set isPricing(e) {
    T(G(this, ot), e, !0);
  }
  get error() {
    return d(G(this, at));
  }
  set error(e) {
    T(G(this, at), e, !0);
  }
  get retryCount() {
    return d(G(this, lt));
  }
  set retryCount(e) {
    T(G(this, lt), e, !0);
  }
  get configurationId() {
    return d(G(this, ut));
  }
  set configurationId(e) {
    T(G(this, ut), e, !0);
  }
  get lastSaved() {
    return d(G(this, ct));
  }
  set lastSaved(e) {
    T(G(this, ct), e, !0);
  }
  get isDirty() {
    return d(G(this, vt));
  }
  set isDirty(e) {
    T(G(this, vt), e, !0);
  }
  get currentStep() {
    return d(G(this, dt));
  }
  set currentStep(e) {
    T(G(this, dt), e, !0);
  }
  // Initialize store and effects
  initialize() {
    this._initialized || (this._initialized = !0, console.log("🔧 ConfigurationStore initialized"), this._testConnection(), Fe(() => {
      this.modelId && !this._loadingPromise && (this.api = new Is(window.__API_BASE_URL__, { modelId: this.modelId }), this.loadModel());
    }), Fe(() => {
      this.api && Object.keys(this.selections).length > 0 && this.model && this._debounce("validate", () => this.validateSelections(), 300);
    }), Fe(() => {
      this.api && this.isValid && Object.keys(this.selections).length > 0 && this.model && this._debounce("pricing", () => this.calculatePricing(), 500);
    }), Fe(() => {
      this.isDirty && this.configurationId && this._debounce("save", () => this.saveConfiguration(), 3e4);
    }));
  }
  // Derived state
  get isValid() {
    return this.validationResults.length === 0;
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
    if (!this.model?.option_groups || !Array.isArray(this.model.option_groups)) return [];
    const e = [];
    for (const r of this.model.option_groups)
      if (!(!r.options || !Array.isArray(r.options)))
        for (const i of r.options)
          this.selections[i.id] > 0 && e.push({
            ...i,
            quantity: this.selections[i.id],
            group_name: r.name,
            group_id: r.id
          });
    return e;
  }
  get completionPercentage() {
    if (!this.model?.option_groups || !Array.isArray(this.model.option_groups)) return 0;
    const e = this.model.option_groups.filter((i) => i.required);
    if (e.length === 0) return 100;
    const r = e.filter((i) => i.options && Array.isArray(i.options) && i.options.some((s) => this.selections[s.id] > 0));
    return Math.round(r.length / e.length * 100);
  }
  get canProceedToNextStep() {
    return this.completionPercentage >= 100 && this.isValid;
  }
  // Core methods
  setModelId(e) {
    console.log("setModelId called with:", e), this.modelId !== e && (this.modelId = e, this.reset());
  }
  async loadModel() {
    if (!(!this.api || this._loadingPromise))
      return this._loadingPromise = this._executeWithRetry(async () => {
        this.isLoading = !0, this.error = null;
        try {
          let e;
          try {
            e = await this.api.getModel(), console.log("Raw model response:", e);
          } catch (s) {
            throw s.message.includes("404") ? new Error(`Model "${this.modelId}" not found. Use the debug test page to list available models, or check /api/v1/models endpoint.`) : s;
          }
          if (!e || typeof e != "object")
            throw new Error("Invalid model data received");
          if (this.model = {
            id: e.id || e.ID || e.model_id,
            name: e.name || e.Name || "Configuration",
            description: e.description || e.Description,
            option_groups: []
          }, e.option_groups && Array.isArray(e.option_groups))
            this.model.option_groups = e.option_groups, console.log("Using option_groups from model");
          else if (e.groups && Array.isArray(e.groups))
            this.model.option_groups = e.groups, console.log("Using groups from model");
          else if (e.data?.groups && Array.isArray(e.data.groups))
            this.model.option_groups = e.data.groups, console.log("Using groups from model.data");
          else {
            console.log("Fetching groups separately...");
            try {
              const s = await this.api.getModelGroups();
              console.log("Groups API response:", s), Array.isArray(s) ? this.model.option_groups = s : s.groups ? this.model.option_groups = s.groups : s.option_groups ? this.model.option_groups = s.option_groups : s.data && Array.isArray(s.data) ? this.model.option_groups = s.data : s.data?.groups && (this.model.option_groups = s.data.groups);
            } catch (s) {
              console.error("Failed to load groups:", s);
            }
          }
          if ((!this.model.option_groups || this.model.option_groups.length === 0) && (e.options || e.Options)) {
            console.log("No groups found, but model has flat options array");
            const s = e.options || e.Options, n = /* @__PURE__ */ new Map();
            s.forEach((o) => {
              const u = o.group_id || o.groupId || o.group || "default";
              n.has(u) || n.set(u, {
                id: u,
                name: o.group_name || o.groupName || u,
                options: []
              }), n.get(u).options.push(o);
            }), this.model.option_groups = Array.from(n.values()), console.log("Created groups from flat options:", this.model.option_groups);
          }
          if (console.log("Groups loaded:", this.model.option_groups?.length || 0, "groups"), this.model.option_groups?.length > 0 && (console.log("First group structure:", this.model.option_groups[0]), console.log("Group properties:", Object.keys(this.model.option_groups[0]))), !this.model.option_groups.some((s) => s.options && Array.isArray(s.options) && s.options.length > 0 || s.Options && Array.isArray(s.Options) && s.Options.length > 0 || s.items && Array.isArray(s.items) && s.items.length > 0 || s.choices && Array.isArray(s.choices) && s.choices.length > 0) && this.model.option_groups.length > 0) {
            console.log("No options found in groups, fetching options separately...");
            try {
              const s = await this.api.getModelOptions();
              console.log("Options API response:", s);
              let n = [];
              Array.isArray(s) ? n = s : s.options ? n = s.options : s.data && Array.isArray(s.data) ? n = s.data : s.data?.options && (n = s.data.options), console.log("Total options found:", n.length), n.length > 0 && (console.log("First option structure:", n[0]), console.log("Option properties:", Object.keys(n[0]))), n.length > 0 && (this.model.option_groups = this.model.option_groups.map((o) => {
                const u = n.filter((a) => a.group_id === o.id || a.groupId === o.id || a.group === o.id || a.group_name === o.name || a.groupName === o.name || a.group_id === o.name || // Also check if group has a different ID property
                o.group_id && (a.group_id === o.group_id || a.group === o.group_id));
                return console.log(`Group "${o.name}" matched ${u.length} options`), u.length === 0 && this.model.option_groups.length === 1 ? (console.warn("No options matched group criteria, showing all options in single group"), { ...o, options: n }) : { ...o, options: u };
              }));
            } catch (s) {
              console.error("Failed to load options:", s);
            }
          }
          this.model.option_groups = this.model.option_groups.map((s) => {
            let n = [];
            return Array.isArray(s.options) ? n = s.options : Array.isArray(s.Options) ? n = s.Options : Array.isArray(s.items) ? n = s.items : Array.isArray(s.choices) ? n = s.choices : s.data?.options && Array.isArray(s.data.options) && (n = s.data.options), { ...s, options: n };
          }), this.model.option_groups.reduce((s, n) => s + (n.options?.length || 0), 0) === 0 && this.model.option_groups.length > 0 ? (console.warn("No options found in any group. Creating demo options for testing..."), this.usingDemoData = !0, this.model.option_groups = this.model.option_groups.map((s, n) => ({
            ...s,
            options: this._createDemoOptions(s, n)
          }))) : this.usingDemoData = !1, console.log("=== Final Model Structure ==="), console.log("Model:", this.model), console.log("Groups summary:", this.model.option_groups.map((s) => ({
            id: s.id,
            name: s.name,
            optionsCount: s.options?.length || 0,
            options: s.options?.slice(0, 2)
            // Show first 2 options
          }))), this._initializeSelections();
        } finally {
          this.isLoading = !1, this._loadingPromise = null;
        }
      }), this._loadingPromise;
  }
  updateSelection(e, r) {
    r = Math.max(0, r);
    const i = this._getGroupForOption(e);
    if (i) {
      if (i.selection_type === "single" && r > 0 && i.options && Array.isArray(i.options))
        for (const s of i.options)
          s.id !== e && (this.selections[s.id] = 0);
      i.max_selections && r > i.max_selections && (r = i.max_selections);
    }
    r === 0 ? delete this.selections[e] : this.selections[e] = r, this.isDirty = !0;
  }
  async validateSelections() {
    if (!(!this.api || this.isValidating)) {
      if (Object.keys(this.selections).length === 0) {
        this.validationResults = [];
        return;
      }
      await this._executeWithRetry(async () => {
        this.isValidating = !0;
        try {
          const e = await this.api.validateSelections(this.selections);
          this.validationResults = e.validation_errors || [], this.availableOptions = e.available_options || [];
        } finally {
          this.isValidating = !1;
        }
      });
    }
  }
  async calculatePricing(e = {}) {
    !this.api || this.isPricing || !this.isValid || await this._executeWithRetry(async () => {
      this.isPricing = !0;
      try {
        const r = await this.api.calculatePricing(this.selections, e);
        this.pricingData = r;
      } finally {
        this.isPricing = !1;
      }
    });
  }
  async createConfiguration() {
    if (!this.api) return;
    const e = await this.api.createConfiguration(this.selections);
    return this.configurationId = e.id, this.isDirty = !1, this.lastSaved = /* @__PURE__ */ new Date(), e;
  }
  async saveConfiguration() {
    if (!(!this.api || !this.configurationId || !this.isDirty))
      try {
        await this.api.updateConfiguration(this.configurationId, this.selections), this.isDirty = !1, this.lastSaved = /* @__PURE__ */ new Date();
      } catch (e) {
        console.error("Failed to save configuration:", e);
      }
  }
  async loadConfiguration(e) {
    this.api && await this._executeWithRetry(async () => {
      this.isLoading = !0;
      try {
        const r = await this.api.getConfiguration(e);
        this.configurationId = r.id, this.selections = this._parseSelections(r.selections), this.isDirty = !1, await Promise.all([
          this.validateSelections(),
          this.calculatePricing()
        ]);
      } finally {
        this.isLoading = !1;
      }
    });
  }
  async loadAvailableOptions() {
    if (!(!this.api || !this.configurationId))
      try {
        const e = await this.api.getAvailableOptions(this.configurationId);
        this.availableOptions = e.available_options || [];
      } catch (e) {
        console.error("Failed to load available options:", e);
      }
  }
  exportConfiguration() {
    return {
      model_id: this.modelId,
      selections: this.selections,
      timestamp: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(),
      total_price: this.totalPrice,
      is_valid: this.isValid
    };
  }
  importConfiguration(e) {
    if (e.model_id !== this.modelId)
      throw new Error("Configuration is for a different model");
    this.selections = e.selections || {}, this.isDirty = !0;
  }
  reset() {
    this.selections = {}, this.validationResults = [], this.pricingData = null, this.availableOptions = [], this.error = null, this.configurationId = null, this.isDirty = !1, this.currentStep = 0, this._clearAllTimers();
  }
  // Test API connection
  async _testConnection() {
    if (window.__API_BASE_URL__)
      try {
        const e = await fetch(`${window.__API_BASE_URL__}/health`);
        e.ok ? console.log("✅ API connection successful") : console.warn("⚠️ API health check returned:", e.status);
      } catch (e) {
        console.error("❌ API connection failed:", e.message);
      }
  }
  // Utility methods
  _debounce(e, r, i) {
    this._clearTimer(e);
    const s = setTimeout(r, i);
    this._debounceTimers.set(e, s);
  }
  _clearTimer(e) {
    const r = this._debounceTimers.get(e);
    r && (clearTimeout(r), this._debounceTimers.delete(e));
  }
  _clearAllTimers() {
    for (const e of this._debounceTimers.values())
      clearTimeout(e);
    this._debounceTimers.clear();
  }
  _getGroupForOption(e) {
    if (!this.model?.option_groups || !Array.isArray(this.model.option_groups)) return null;
    for (const r of this.model.option_groups)
      if (r.options && Array.isArray(r.options) && r.options.some((i) => i.id === e))
        return r;
    return null;
  }
  _initializeSelections() {
    if (!(!this.model?.option_groups || !Array.isArray(this.model.option_groups))) {
      for (const e of this.model.option_groups)
        if (!(!e.options || !Array.isArray(e.options)))
          for (const r of e.options)
            r.preselected && !this.selections[r.id] && (this.selections[r.id] = 1);
    }
  }
  _parseSelections(e) {
    const r = {};
    for (const i of e)
      i.quantity > 0 && (r[i.option_id] = i.quantity);
    return r;
  }
  async _executeWithRetry(e, r = 3) {
    for (let i = 0; i <= r; i++)
      try {
        return await e();
      } catch (s) {
        if (this.error = s.message, this.retryCount = i, i === r || s.message.includes("401") || s.message.includes("404"))
          throw console.error("API call failed after retries:", s.message), s;
        await new Promise((n) => setTimeout(n, Math.pow(2, i) * 1e3));
      }
  }
}
Xe = new WeakMap(), $e = new WeakMap(), et = new WeakMap(), tt = new WeakMap(), rt = new WeakMap(), it = new WeakMap(), st = new WeakMap(), nt = new WeakMap(), ot = new WeakMap(), at = new WeakMap(), lt = new WeakMap(), ut = new WeakMap(), ct = new WeakMap(), vt = new WeakMap(), dt = new WeakMap();
const w = new Ps();
var Cs = /* @__PURE__ */ A("<div></div>"), Os = /* @__PURE__ */ A('<div><div class="step-icon svelte-19jrra3"><!></div> <div class="step-label svelte-19jrra3"> </div></div> <!>', 1), Ts = /* @__PURE__ */ A('<div class="progress-indicator svelte-19jrra3"><div class="steps svelte-19jrra3"></div> <div class="progress-bar svelte-19jrra3"><div class="progress-fill svelte-19jrra3"></div></div></div>');
function qs(t, e) {
  je(e, !0);
  let r = _e(e, "steps", 19, () => []), i = _e(e, "currentStep", 3, 0), s = _e(e, "completionPercentage", 3, 0);
  var n = Ts(), o = v(n);
  qe(o, 21, r, Te, (c, p, f) => {
    var l = Os(), _ = Me(l);
    let g;
    var P = v(_), S = v(P);
    {
      var F = (E) => {
        var j = _r("✓");
        m(E, j);
      }, M = (E) => {
        var j = _r();
        D(() => O(j, d(p).icon || f + 1)), m(E, j);
      };
      I(S, (E) => {
        f < i() ? E(F) : E(M, !1);
      });
    }
    var x = h(P, 2), b = v(x), y = h(_, 2);
    {
      var N = (E) => {
        var j = Cs();
        let te;
        D((X) => te = ye(j, 1, "step-connector svelte-19jrra3", null, te, X), [
          () => ({ completed: f < i() })
        ]), m(E, j);
      };
      I(y, (E) => {
        f < r().length - 1 && E(N);
      });
    }
    D(
      (E) => {
        g = ye(_, 1, "step svelte-19jrra3", null, g, E), O(b, d(p).label);
      },
      [
        () => ({
          active: f === i(),
          completed: f < i()
        })
      ]
    ), m(c, l);
  });
  var u = h(o, 2), a = v(u);
  D(() => Zr(a, `width: ${s() ?? ""}%`)), m(t, n), ze();
}
var Ds = /* @__PURE__ */ A('<div><div class="spinner svelte-kq7kpf"></div> <p class="message svelte-kq7kpf"> </p></div>');
function Ms(t, e) {
  let r = _e(e, "message", 3, "Loading..."), i = _e(e, "size", 3, "medium");
  var s = Ds(), n = h(v(s), 2), o = v(n);
  D(() => {
    ye(s, 1, `loading-spinner ${i() ?? ""}`, "svelte-kq7kpf"), O(o, r());
  }), m(t, s);
}
function Rs(t, e, r) {
  T(e, null), T(r, null);
}
function Ns() {
  location.reload();
}
var js = /* @__PURE__ */ A('<div class="error-boundary svelte-1dzw8vs"><div class="error-content svelte-1dzw8vs"><h2 class="svelte-1dzw8vs">Something went wrong</h2> <p class="error-message svelte-1dzw8vs"> </p> <!> <div class="error-actions svelte-1dzw8vs"><button class="btn btn-secondary svelte-1dzw8vs">Try Again</button> <button class="btn btn-primary svelte-1dzw8vs">Reload Page</button></div></div></div>');
function zs(t, e) {
  je(e, !0);
  let r = /* @__PURE__ */ Y(null), i = /* @__PURE__ */ Y(null);
  ei(() => {
    const a = (c) => {
      T(r, c.error || new Error("Unknown error"), !0), T(
        i,
        {
          componentStack: c.filename || "Unknown",
          lineNumber: c.lineno,
          columnNumber: c.colno
        },
        !0
      ), console.error("Error caught by boundary:", d(r)), c.preventDefault();
    };
    return window.addEventListener("error", a), window.addEventListener("unhandledrejection", (c) => {
      T(r, new Error(c.reason), !0), T(i, { componentStack: "Promise rejection" }, !0), c.preventDefault();
    }), () => {
      window.removeEventListener("error", a);
    };
  });
  var s = Ye(), n = Me(s);
  {
    var o = (a) => {
      var c = js(), p = v(c), f = h(v(p), 2), l = v(f), _ = h(f, 2);
      I(_, (F) => {
      });
      var g = h(_, 2), P = v(g);
      P.__click = [Rs, r, i];
      var S = h(P, 2);
      S.__click = [Ns], D(() => O(l, d(r).message)), m(a, c);
    }, u = (a) => {
      var c = Ye(), p = Me(c);
      ps(p, e, "default", {}), m(a, c);
    };
    I(n, (a) => {
      d(r) ? a(o) : a(u, !1);
    });
  }
  m(t, s), ze();
}
ht(["click"]);
function Ls(t, e, r, i) {
  d(e) < r() && i(d(e) + 1);
}
function Fs(t, e, r) {
  d(e) > 0 && r(d(e) - 1);
}
function Us(t, e, r) {
  e(d(r) ? 0 : 1);
}
var Vs = /* @__PURE__ */ A('<span class="sku svelte-14bz86j"> </span>'), Bs = /* @__PURE__ */ A('<p class="description svelte-14bz86j"> </p>'), Gs = /* @__PURE__ */ A('<span class="price-each svelte-14bz86j">each</span>'), Ys = /* @__PURE__ */ A('<span class="total-price svelte-14bz86j"> </span>'), Hs = /* @__PURE__ */ A("<button> </button>"), Ws = (t, e) => e(parseInt(t.target.value) || 0), Js = /* @__PURE__ */ A('<div class="quantity-controls svelte-14bz86j"><button class="qty-button svelte-14bz86j" aria-label="Decrease quantity">−</button> <input type="number" min="0" aria-label="Quantity" class="svelte-14bz86j"/> <button class="qty-button svelte-14bz86j" aria-label="Increase quantity">+</button></div>'), Ks = /* @__PURE__ */ A('<div class="unavailable-overlay svelte-14bz86j"><span class="svelte-14bz86j">Not available with current selection</span></div>'), Qs = /* @__PURE__ */ A('<div><div class="option-header svelte-14bz86j"><h4 class="svelte-14bz86j"> </h4> <!></div> <!> <div class="price-section svelte-14bz86j"><span class="base-price svelte-14bz86j"> <!></span> <!></div> <div class="actions svelte-14bz86j"><!></div> <!></div>');
function Zs(t, e) {
  je(e, !0);
  let r = /* @__PURE__ */ ke(() => w.selections[e.option.id] || 0), i = /* @__PURE__ */ ke(() => d(r) > 0), s = /* @__PURE__ */ ke(() => !w.availableOptions.length || w.availableOptions.some((k) => k.option_id === e.option.id)), n = /* @__PURE__ */ ke(() => d(r) * (e.option.base_price || 0));
  function o() {
    return e.group.selection_type === "single" ? 1 : e.group.max_selections || 10;
  }
  function u(k) {
    !d(s) && k > 0 || w.updateSelection(e.option.id, k);
  }
  var a = Qs();
  let c;
  var p = v(a), f = v(p), l = v(f), _ = h(f, 2);
  {
    var g = (k) => {
      var q = Vs(), C = v(q);
      D(() => O(C, `SKU: ${e.option.sku ?? ""}`)), m(k, q);
    };
    I(_, (k) => {
      e.option.sku && k(g);
    });
  }
  var P = h(p, 2);
  {
    var S = (k) => {
      var q = Bs(), C = v(q);
      D(() => O(C, e.option.description)), m(k, q);
    };
    I(P, (k) => {
      e.option.description && k(S);
    });
  }
  var F = h(P, 2), M = v(F), x = v(M), b = h(x);
  {
    var y = (k) => {
      var q = Gs();
      m(k, q);
    };
    I(b, (k) => {
      d(r) > 1 && k(y);
    });
  }
  var N = h(M, 2);
  {
    var E = (k) => {
      var q = Ys(), C = v(q);
      D((z) => O(C, `Total: $${z ?? ""}`), [() => d(n).toFixed(2)]), m(k, q);
    };
    I(N, (k) => {
      d(r) > 1 && k(E);
    });
  }
  var j = h(F, 2), te = v(j);
  {
    var X = (k) => {
      var q = Hs();
      let C;
      q.__click = [Us, u, i];
      var z = v(q);
      D(
        (H) => {
          C = ye(q, 1, "select-button svelte-14bz86j", null, C, H), q.disabled = !d(s), O(z, d(i) ? "✓ Selected" : "Select");
        },
        [() => ({ selected: d(i) })]
      ), m(k, q);
    }, re = (k) => {
      var q = Js(), C = v(q);
      C.__click = [Fs, r, u];
      var z = h(C, 2);
      z.__change = [Ws, u];
      var H = h(z, 2);
      H.__click = [
        Ls,
        r,
        o,
        u
      ], D(
        (U, W) => {
          C.disabled = d(r) === 0, bs(z, d(r)), Xr(z, "max", U), z.disabled = !d(s), H.disabled = W;
        },
        [
          o,
          () => d(r) >= o() || !d(s)
        ]
      ), m(k, q);
    };
    I(te, (k) => {
      e.group.selection_type === "single" ? k(X) : k(re, !1);
    });
  }
  var ie = h(j, 2);
  {
    var Z = (k) => {
      var q = Ks();
      m(k, q);
    };
    I(ie, (k) => {
      !d(s) && !d(i) && k(Z);
    });
  }
  D(
    (k, q) => {
      c = ye(a, 1, "option-card svelte-14bz86j", null, c, k), O(l, e.option.name), O(x, `$${q ?? ""} `);
    },
    [
      () => ({
        selected: d(i),
        unavailable: !d(s)
      }),
      () => (e.option.base_price || 0).toFixed(2)
    ]
  ), m(t, a), ze();
}
ht(["click", "change"]);
var Xs = (t, e) => T(e, !d(e)), $s = /* @__PURE__ */ A('<span class="required svelte-6zoark">*</span>'), en = /* @__PURE__ */ A('<p class="group-description svelte-6zoark"> </p>'), tn = /* @__PURE__ */ A('<span class="selection-constraint svelte-6zoark"> </span>'), rn = /* @__PURE__ */ A('<span class="selection-constraint svelte-6zoark"> </span>'), sn = /* @__PURE__ */ A('<div class="no-options svelte-6zoark"><p class="svelte-6zoark">No options available</p> <p class="help-text svelte-6zoark">Check API response</p></div>'), nn = /* @__PURE__ */ A('<div class="group-content svelte-6zoark"><div class="selection-info svelte-6zoark"><span class="selection-type svelte-6zoark"> </span> <!> <!></div> <div class="options-grid svelte-6zoark"><!></div></div>'), on = /* @__PURE__ */ A('<div><div class="group-header svelte-6zoark"><div class="group-info svelte-6zoark"><h3 class="svelte-6zoark"> <!></h3> <!></div> <button class="expand-toggle svelte-6zoark" aria-label="Toggle group"><svg width="20" height="20" viewBox="0 0 20 20"><path fill="currentColor" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"></path></svg></button></div> <!></div>');
function an(t, e) {
  je(e, !0);
  let r = /* @__PURE__ */ Y(!0), i = /* @__PURE__ */ ke(() => e.group.options && Array.isArray(e.group.options) && e.group.options.some((x) => w.selections[x.id] > 0));
  Fe(() => {
    e.group.options?.length === 0 && console.warn(`⚠️ Group "${e.group.name}" has no options!`, {
      groupId: e.group.id,
      groupData: e.group
    });
  });
  var s = on();
  let n;
  var o = v(s);
  o.__click = [Xs, r];
  var u = v(o), a = v(u), c = v(a), p = h(c);
  {
    var f = (x) => {
      var b = $s();
      m(x, b);
    };
    I(p, (x) => {
      e.group.required && x(f);
    });
  }
  var l = h(a, 2);
  {
    var _ = (x) => {
      var b = en(), y = v(b);
      D(() => O(y, e.group.description)), m(x, b);
    };
    I(l, (x) => {
      e.group.description && x(_);
    });
  }
  var g = h(u, 2), P = v(g);
  let S;
  var F = h(o, 2);
  {
    var M = (x) => {
      var b = nn(), y = v(b), N = v(y), E = v(N), j = h(N, 2);
      {
        var te = (C) => {
          var z = tn(), H = v(z);
          D(() => O(H, `Min: ${e.group.min_selections ?? ""}`)), m(C, z);
        };
        I(j, (C) => {
          e.group.min_selections && C(te);
        });
      }
      var X = h(j, 2);
      {
        var re = (C) => {
          var z = rn(), H = v(z);
          D(() => O(H, `Max: ${e.group.max_selections ?? ""}`)), m(C, z);
        };
        I(X, (C) => {
          e.group.max_selections && C(re);
        });
      }
      var ie = h(y, 2), Z = v(ie);
      {
        var k = (C) => {
          var z = Ye(), H = Me(z);
          qe(H, 17, () => e.group.options, Te, (U, W) => {
            Zs(U, {
              get option() {
                return d(W);
              },
              get group() {
                return e.group;
              }
            });
          }), m(C, z);
        }, q = (C) => {
          var z = sn();
          m(C, z);
        };
        I(Z, (C) => {
          e.group.options && Array.isArray(e.group.options) ? C(k) : C(q, !1);
        });
      }
      D(() => O(E, e.group.selection_type === "single" ? "Choose one" : "Choose multiple")), m(x, b);
    };
    I(F, (x) => {
      d(r) && x(M);
    });
  }
  D(
    (x, b) => {
      n = ye(s, 1, "option-group svelte-6zoark", null, n, x), O(c, `${e.group.name ?? ""} `), S = ye(P, 0, "icon svelte-6zoark", null, S, b);
    },
    [
      () => ({ "has-selection": d(i) }),
      () => ({ rotated: !d(r) })
    ]
  ), m(t, s), ze();
}
ht(["click"]);
var ln = /* @__PURE__ */ A('<div class="loading svelte-13kqu2s"><span class="spinner svelte-13kqu2s"></span> Calculating price...</div>'), un = /* @__PURE__ */ A('<div class="price-line adjustment svelte-13kqu2s"><span class="label svelte-13kqu2s"> </span> <span> </span></div>'), cn = /* @__PURE__ */ A('<div class="adjustments svelte-13kqu2s"></div>'), vn = /* @__PURE__ */ A('<div class="price-line svelte-13kqu2s"><span class="label svelte-13kqu2s">Savings</span> <span class="amount discount svelte-13kqu2s"> </span></div>'), dn = /* @__PURE__ */ A('<div class="price-line svelte-13kqu2s"><span class="label svelte-13kqu2s">Additional Charges</span> <span class="amount svelte-13kqu2s"> </span></div>'), fn = /* @__PURE__ */ A("<!> <!>", 1), _n = /* @__PURE__ */ A('<div class="price-breakdown svelte-13kqu2s"><div class="price-line svelte-13kqu2s"><span class="label svelte-13kqu2s">Base Price</span> <span class="amount svelte-13kqu2s"> </span></div> <!></div>'), pn = /* @__PURE__ */ A('<div class="savings-badge svelte-13kqu2s"> </div>'), hn = /* @__PURE__ */ A('<div class="price-summary svelte-13kqu2s"><div class="price-line total svelte-13kqu2s"><span class="label svelte-13kqu2s">Total Price</span> <span class="amount svelte-13kqu2s"> </span></div> <!> <!></div>'), gn = /* @__PURE__ */ A("<div><!></div>");
function Ht(t, e) {
  je(e, !0);
  let r = _e(e, "detailed", 3, !1), i = _e(e, "showBreakdown", 3, !0), s = /* @__PURE__ */ ke(() => w.adjustments.filter((l) => l.amount < 0).reduce((l, _) => l + Math.abs(_.amount), 0)), n = /* @__PURE__ */ ke(() => w.adjustments.filter((l) => l.amount > 0).reduce((l, _) => l + _.amount, 0)), o = (l) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(l);
  var u = gn();
  let a;
  var c = v(u);
  {
    var p = (l) => {
      var _ = ln();
      m(l, _);
    }, f = (l) => {
      var _ = hn(), g = v(_), P = h(v(g), 2), S = v(P), F = h(g, 2);
      {
        var M = (y) => {
          var N = _n(), E = v(N), j = h(v(E), 2), te = v(j), X = h(E, 2);
          {
            var re = (Z) => {
              var k = cn();
              qe(k, 21, () => w.adjustments, Te, (q, C) => {
                var z = un(), H = v(z), U = v(H), W = h(H, 2);
                let ne;
                var ae = v(W);
                D(
                  (ee, de) => {
                    O(U, `${d(C).type === "discount" ? "−" : "+"}
                    ${d(C).description ?? ""}`), ne = ye(W, 1, "amount svelte-13kqu2s", null, ne, ee), O(ae, de);
                  },
                  [
                    () => ({ discount: d(C).amount < 0 }),
                    () => o(Math.abs(d(C).amount))
                  ]
                ), m(q, z);
              }), m(Z, k);
            }, ie = (Z) => {
              var k = fn(), q = Me(k);
              {
                var C = (U) => {
                  var W = vn(), ne = h(v(W), 2), ae = v(ne);
                  D((ee) => O(ae, `−${ee ?? ""}`), [() => o(d(s))]), m(U, W);
                };
                I(q, (U) => {
                  d(s) > 0 && U(C);
                });
              }
              var z = h(q, 2);
              {
                var H = (U) => {
                  var W = dn(), ne = h(v(W), 2), ae = v(ne);
                  D((ee) => O(ae, `+${ee ?? ""}`), [
                    () => o(d(n))
                  ]), m(U, W);
                };
                I(z, (U) => {
                  d(n) > 0 && U(H);
                });
              }
              m(Z, k);
            };
            I(X, (Z) => {
              r() && w.adjustments.length > 0 ? Z(re) : Z(ie, !1);
            });
          }
          D((Z) => O(te, Z), [
            () => o(w.basePrice)
          ]), m(y, N);
        };
        I(F, (y) => {
          i() && (w.basePrice !== w.totalPrice || r()) && y(M);
        });
      }
      var x = h(F, 2);
      {
        var b = (y) => {
          var N = pn(), E = v(N);
          D((j) => O(E, `You save ${j ?? ""}!`), [() => o(d(s))]), m(y, N);
        };
        I(x, (y) => {
          d(s) > 0 && y(b);
        });
      }
      D((y) => O(S, y), [
        () => o(w.totalPrice)
      ]), m(l, _);
    };
    I(c, (l) => {
      w.isPricing ? l(p) : l(f, !1);
    });
  }
  D((l) => a = ye(u, 1, "pricing-display svelte-13kqu2s", null, a, l), [() => ({ detailed: r() })]), m(t, u), ze();
}
var mn = /* @__PURE__ */ A('<div class="validating svelte-bayq38"><span class="spinner svelte-bayq38"></span> Validating configuration...</div>'), yn = /* @__PURE__ */ A('<p class="svelte-bayq38">Your current selection meets all requirements.</p>'), bn = /* @__PURE__ */ A('<div class="valid-state svelte-bayq38"><span class="icon svelte-bayq38">✅</span> <div class="message"><h4 class="svelte-bayq38">Configuration Valid</h4> <!></div></div>'), wn = /* @__PURE__ */ A('<h4 class="severity-header svelte-bayq38"> </h4>'), An = /* @__PURE__ */ A('<span class="compact-icon svelte-bayq38"> </span>'), kn = /* @__PURE__ */ A('<span class="error-field svelte-bayq38"> </span>'), Sn = /* @__PURE__ */ A('<li><!> <span class="error-message svelte-bayq38"> </span> <!></li>'), En = /* @__PURE__ */ A('<div class="severity-group svelte-bayq38"><!> <ul class="error-list svelte-bayq38"></ul></div>'), xn = /* @__PURE__ */ A('<li class="svelte-bayq38"> </li>'), In = /* @__PURE__ */ A('<div class="suggestions svelte-bayq38"><h4 class="svelte-bayq38">Suggestions</h4> <ul class="svelte-bayq38"></ul></div>'), Pn = /* @__PURE__ */ A('<div class="validation-results svelte-bayq38"><!> <!></div>'), Cn = /* @__PURE__ */ A("<div><!></div>");
function Wt(t, e) {
  je(e, !0);
  let r = _e(e, "compact", 3, !1), i = /* @__PURE__ */ ke(() => () => {
    const f = { error: [], warning: [], info: [] };
    for (const l of w.validationResults) {
      const _ = l.severity || "error";
      f[_].push(l);
    }
    return f;
  });
  const s = { error: "❌", warning: "⚠️", info: "ℹ️" }, n = {
    error: "#dc2626",
    warning: "#f59e0b",
    info: "#3b82f6"
  };
  var o = Cn();
  let u;
  var a = v(o);
  {
    var c = (f) => {
      var l = mn();
      m(f, l);
    }, p = (f, l) => {
      {
        var _ = (P) => {
          var S = bn(), F = h(v(S), 2), M = h(v(F), 2);
          {
            var x = (b) => {
              var y = yn();
              m(b, y);
            };
            I(M, (b) => {
              r() || b(x);
            });
          }
          m(P, S);
        }, g = (P) => {
          var S = Pn(), F = v(S);
          qe(F, 17, () => Object.entries(d(i)()), Te, (b, y) => {
            var N = /* @__PURE__ */ ke(() => di(d(y), 2));
            let E = () => d(N)[0], j = () => d(N)[1];
            var te = Ye(), X = Me(te);
            {
              var re = (ie) => {
                var Z = En(), k = v(Z);
                {
                  var q = (z) => {
                    var H = wn(), U = v(H);
                    D(
                      (W) => {
                        Zr(H, `color: ${n[E()] ?? ""}`), O(U, `${s[E()] ?? ""} ${W ?? ""}s`);
                      },
                      [
                        () => E().charAt(0).toUpperCase() + E().slice(1)
                      ]
                    ), m(z, H);
                  };
                  I(k, (z) => {
                    r() || z(q);
                  });
                }
                var C = h(k, 2);
                qe(C, 21, j, Te, (z, H) => {
                  var U = Sn(), W = v(U);
                  {
                    var ne = (V) => {
                      var R = An(), L = v(R);
                      D(() => O(L, s[E()])), m(V, R);
                    };
                    I(W, (V) => {
                      r() && V(ne);
                    });
                  }
                  var ae = h(W, 2), ee = v(ae), de = h(ae, 2);
                  {
                    var B = (V) => {
                      var R = kn(), L = v(R);
                      D(() => O(L, `(${d(H).field ?? ""})`)), m(V, R);
                    };
                    I(de, (V) => {
                      d(H).field && !r() && V(B);
                    });
                  }
                  D(() => {
                    ye(U, 1, `error-item ${E() ?? ""}`, "svelte-bayq38"), O(ee, d(H).message);
                  }), m(z, U);
                }), m(ie, Z);
              };
              I(X, (ie) => {
                j().length > 0 && ie(re);
              });
            }
            m(b, te);
          });
          var M = h(F, 2);
          {
            var x = (b) => {
              var y = In(), N = h(v(y), 2);
              qe(N, 21, () => w.validationResults.filter((E) => E.suggestion), Te, (E, j) => {
                var te = xn(), X = v(te);
                D(() => O(X, d(j).suggestion)), m(E, te);
              }), m(b, y);
            };
            I(M, (b) => {
              !r() && w.validationResults.some((y) => y.suggestion) && b(x);
            });
          }
          m(P, S);
        };
        I(
          f,
          (P) => {
            w.validationResults.length === 0 ? P(_) : P(g, !1);
          },
          l
        );
      }
    };
    I(a, (f) => {
      w.isValidating ? f(c) : f(p, !1);
    });
  }
  D((f) => u = ye(o, 1, "validation-display svelte-bayq38", null, u, f), [() => ({ compact: r() })]), m(t, o), ze();
}
async function On(t, e) {
  try {
    const r = w.exportConfiguration();
    await navigator.clipboard.writeText(JSON.stringify(r, null, 2)), T(e, !0), setTimeout(() => T(e, !1), 2e3);
  } catch (r) {
    console.error("Failed to copy:", r);
  }
}
async function Tn() {
  w.configurationId ? await w.saveConfiguration() : await w.createConfiguration();
}
var qn = (t, e) => T(e, !0), Dn = /* @__PURE__ */ A('<tr><td class="svelte-10y69ed"> </td><td class="muted svelte-10y69ed"> </td><td class="center svelte-10y69ed"> </td><td class="right svelte-10y69ed"> </td><td class="right bold svelte-10y69ed"> </td></tr>'), Mn = /* @__PURE__ */ A('<tr><td colspan="5" class="no-data svelte-10y69ed">No options selected</td></tr>'), Rn = /* @__PURE__ */ A('<section class="section svelte-10y69ed"><h3 class="svelte-10y69ed">Validation Results</h3> <!></section>'), Nn = /* @__PURE__ */ A('<span class="save-status svelte-10y69ed"> </span>'), jn = (t, e) => T(e, !1), zn = (t) => t.stopPropagation(), Ln = (t, e) => T(e, !1), Fn = /* @__PURE__ */ A('<div class="dialog-overlay svelte-10y69ed"><div class="dialog svelte-10y69ed"><h3 class="svelte-10y69ed">Export Configuration</h3> <div class="export-options svelte-10y69ed"><label class="svelte-10y69ed"><input type="radio"/> JSON (Complete configuration data)</label> <label class="svelte-10y69ed"><input type="radio"/> CSV (Selected options only)</label></div> <div class="dialog-actions svelte-10y69ed"><button class="btn btn-secondary svelte-10y69ed">Cancel</button> <button class="btn btn-primary svelte-10y69ed">Export</button></div></div></div>'), Un = /* @__PURE__ */ A('<div class="configuration-summary svelte-10y69ed"><div class="summary-header svelte-10y69ed"><h2 class="svelte-10y69ed">Configuration Summary</h2> <div class="actions svelte-10y69ed"><button class="btn btn-secondary svelte-10y69ed">Export</button> <button class="btn btn-primary svelte-10y69ed">Save Configuration</button></div></div> <div class="metrics-grid svelte-10y69ed"><div class="metric svelte-10y69ed"><div class="metric-value svelte-10y69ed"> </div> <div class="metric-label svelte-10y69ed">Options Selected</div></div> <div class="metric svelte-10y69ed"><div class="metric-value svelte-10y69ed"> </div> <div class="metric-label svelte-10y69ed">Complete</div></div> <div class="metric svelte-10y69ed"><div> </div> <div class="metric-label svelte-10y69ed">Status</div></div></div> <section class="section svelte-10y69ed"><h3 class="svelte-10y69ed">Selected Options</h3> <div class="options-table svelte-10y69ed"><table class="svelte-10y69ed"><thead><tr><th class="svelte-10y69ed">Option</th><th class="svelte-10y69ed">Group</th><th class="svelte-10y69ed">Quantity</th><th class="svelte-10y69ed">Unit Price</th><th class="svelte-10y69ed">Total</th></tr></thead><tbody><!></tbody></table></div></section> <section class="section svelte-10y69ed"><h3 class="svelte-10y69ed">Pricing Details</h3> <!></section> <!> <div class="summary-actions svelte-10y69ed"><button class="btn btn-secondary svelte-10y69ed"> </button> <!></div> <!></div>');
function Vn(t, e) {
  je(e, !0);
  const r = [];
  let i = /* @__PURE__ */ Y(!1), s = /* @__PURE__ */ Y(!1), n = /* @__PURE__ */ Y("json");
  function o() {
    const B = w.exportConfiguration();
    let V, R, L;
    if (d(n) === "json")
      V = JSON.stringify(B, null, 2), R = "application/json", L = "json";
    else {
      const le = [
        "Option",
        "Quantity",
        "Unit Price",
        "Total Price"
      ], be = w.selectedOptions.map(($) => [
        $.name,
        $.quantity,
        $.base_price.toFixed(2),
        ($.quantity * $.base_price).toFixed(2)
      ]);
      V = [
        le.join(","),
        ...be.map(($) => $.join(","))
      ].join(`
`), R = "text/csv", L = "csv";
    }
    const Q = new Blob([V], { type: R }), se = URL.createObjectURL(Q), oe = document.createElement("a");
    oe.href = se, oe.download = `configuration-${Date.now()}.${L}`, oe.click(), URL.revokeObjectURL(se), T(i, !1);
  }
  var u = Un(), a = v(u), c = h(v(a), 2), p = v(c);
  p.__click = [qn, i];
  var f = h(p, 2);
  f.__click = [Tn];
  var l = h(a, 2), _ = v(l), g = v(_), P = v(g), S = h(_, 2), F = v(S), M = v(F), x = h(S, 2), b = v(x);
  let y;
  var N = v(b), E = h(l, 2), j = h(v(E), 2), te = v(j), X = h(v(te)), re = v(X);
  {
    var ie = (B) => {
      var V = Ye(), R = Me(V);
      qe(R, 17, () => w.selectedOptions, Te, (L, Q) => {
        var se = Dn(), oe = v(se), le = v(oe), be = h(oe), $ = v(be), Ae = h(be), Be = v(Ae), gt = h(Ae), ti = v(gt), ri = h(gt), ii = v(ri);
        D(
          (si, ni) => {
            O(le, d(Q).name), O($, d(Q).group_name), O(Be, d(Q).quantity), O(ti, `$${si ?? ""}`), O(ii, `$${ni ?? ""}`);
          },
          [
            () => (d(Q).base_price || 0).toFixed(2),
            () => ((d(Q).quantity || 0) * (d(Q).base_price || 0)).toFixed(2)
          ]
        ), m(L, se);
      }), m(B, V);
    }, Z = (B) => {
      var V = Mn();
      m(B, V);
    };
    I(re, (B) => {
      w.selectedOptions.length > 0 ? B(ie) : B(Z, !1);
    });
  }
  var k = h(E, 2), q = h(v(k), 2);
  Ht(q, { detailed: !0 });
  var C = h(k, 2);
  {
    var z = (B) => {
      var V = Rn(), R = h(v(V), 2);
      Wt(R, {}), m(B, V);
    };
    I(C, (B) => {
      w.validationResults.length > 0 && B(z);
    });
  }
  var H = h(C, 2), U = v(H);
  U.__click = [On, s];
  var W = v(U), ne = h(U, 2);
  {
    var ae = (B) => {
      var V = Nn(), R = v(V);
      D((L) => O(R, `Last saved: ${L ?? ""}`), [
        () => w.lastSaved.toLocaleTimeString()
      ]), m(B, V);
    };
    I(ne, (B) => {
      w.lastSaved && B(ae);
    });
  }
  var ee = h(H, 2);
  {
    var de = (B) => {
      var V = Fn();
      V.__click = [jn, i];
      var R = v(V);
      R.__click = [zn];
      var L = h(v(R), 2), Q = v(L), se = v(Q);
      se.value = se.__value = "json";
      var oe = h(Q, 2), le = v(oe);
      le.value = le.__value = "csv";
      var be = h(L, 2), $ = v(be);
      $.__click = [Ln, i];
      var Ae = h($, 2);
      Ae.__click = o, mr(r, [], se, () => d(n), (Be) => T(n, Be)), mr(r, [], le, () => d(n), (Be) => T(n, Be)), m(B, V);
    };
    I(ee, (B) => {
      d(i) && B(de);
    });
  }
  D(
    (B) => {
      O(P, w.selectedOptions.length), O(M, `${w.completionPercentage ?? ""}%`), y = ye(b, 1, "metric-value status svelte-10y69ed", null, y, B), O(N, w.isValid ? "✓ Valid" : "✗ Invalid"), O(W, d(s) ? "✓ Copied!" : "Copy Configuration");
    },
    [() => ({ valid: w.isValid })]
  ), m(t, u), ze();
}
ht(["click"]);
var Bn = () => location.reload(), Gn = /* @__PURE__ */ A('<div class="error-container svelte-fpbtyb"><div class="error-message svelte-fpbtyb"><h3 class="svelte-fpbtyb">Configuration Error</h3> <p> </p> <button class="btn btn-primary svelte-fpbtyb">Reload Page</button></div></div>'), Yn = /* @__PURE__ */ A('<div class="option-groups svelte-fpbtyb"></div>'), Hn = /* @__PURE__ */ A('<div class="no-options svelte-fpbtyb"><h3 class="svelte-fpbtyb">⚠️ No Options Found</h3> <p class="svelte-fpbtyb">Groups exist but contain no options.</p> <p class="help svelte-fpbtyb">Check console for API details or use the debug test page.</p></div>'), Wn = /* @__PURE__ */ A('<div class="no-options svelte-fpbtyb"><h3 class="svelte-fpbtyb">⚠️ No Configuration Options Available</h3> <p class="svelte-fpbtyb">The model has no option groups configured.</p> <p class="help svelte-fpbtyb">Check the browser console for API response details.</p></div>'), Jn = /* @__PURE__ */ A('<div class="configuration-step"><h2> </h2> <!> <div class="step-actions svelte-fpbtyb"><button class="btn btn-primary svelte-fpbtyb">Continue to Validation</button></div></div>'), Kn = /* @__PURE__ */ A('<div class="validation-step"><h2>Configuration Validation</h2> <!> <div class="step-actions svelte-fpbtyb"><button class="btn btn-secondary svelte-fpbtyb">Back</button> <button class="btn btn-primary svelte-fpbtyb">Continue to Pricing</button></div></div>'), Qn = /* @__PURE__ */ A('<div class="pricing-step"><h2>Pricing Details</h2> <!> <div class="step-actions svelte-fpbtyb"><button class="btn btn-secondary svelte-fpbtyb">Back</button> <button class="btn btn-primary svelte-fpbtyb">Continue to Summary</button></div></div>'), Zn = /* @__PURE__ */ A('<div class="summary-step"><h2>Configuration Summary</h2> <!> <div class="step-actions svelte-fpbtyb"><button class="btn btn-secondary svelte-fpbtyb">Back</button> <button class="btn btn-success svelte-fpbtyb">Complete Configuration</button></div></div>'), Xn = /* @__PURE__ */ A('<div class="selected-item svelte-fpbtyb"><span> </span> <span class="quantity svelte-fpbtyb"> </span></div>'), $n = /* @__PURE__ */ A('<div class="sidebar-section svelte-fpbtyb"><h3 class="svelte-fpbtyb">Issues</h3> <!></div>'), eo = /* @__PURE__ */ A('<aside class="configurator-sidebar svelte-fpbtyb"><div class="sidebar-section svelte-fpbtyb"><h3 class="svelte-fpbtyb">Current Selection</h3> <div class="selected-items svelte-fpbtyb"></div></div> <div class="sidebar-section svelte-fpbtyb"><h3 class="svelte-fpbtyb">Pricing Summary</h3> <!></div> <!></aside>'), to = /* @__PURE__ */ A('<div class="configurator-container svelte-fpbtyb"><!> <div class="configurator-content svelte-fpbtyb"><!></div> <!></div>'), ro = /* @__PURE__ */ A("<div><!></div>");
function io(t, e) {
  je(e, !0);
  let r = _e(e, "theme", 3, "light"), i = _e(e, "apiUrl", 3, "/api/v1"), s = _e(e, "embedMode", 3, !1), n = _e(e, "onComplete", 3, null), o = _e(e, "onConfigurationChange", 3, null), u = _e(e, "onError", 3, null);
  const a = Es();
  let c = /* @__PURE__ */ Y(!1), p = /* @__PURE__ */ ke(() => [
    {
      id: "configure",
      label: "Configure",
      icon: "⚙️"
    },
    { id: "validate", label: "Validate", icon: "✓" },
    { id: "price", label: "Price", icon: "💰" },
    { id: "summary", label: "Summary", icon: "📋" }
  ]);
  typeof window < "u" && (window.__API_BASE_URL__ = i(), console.log("Configurator initialized with API URL:", i())), ei(() => {
    w.initialize(), w.setModelId(e.modelId), T(c, !0), document.documentElement.setAttribute("data-theme", r());
    const S = Vi(() => {
      Fe(() => {
        o() && Object.keys(w.selections).length > 0 && o()(w.exportConfiguration());
      }), Fe(() => {
        u() && w.error && u()(w.error);
      });
    });
    return () => {
      S(), w.reset();
    };
  });
  function f() {
    const S = w.exportConfiguration();
    a("complete", S), n()?.(S);
  }
  function l() {
    w.currentStep < d(p).length - 1 && w.currentStep++;
  }
  function _() {
    w.currentStep > 0 && w.currentStep--;
  }
  var g = ro(), P = v(g);
  zs(P, {
    children: (S, F) => {
      var M = Ye(), x = Me(M);
      {
        var b = (N) => {
          Ms(N, { message: "Loading configuration..." });
        }, y = (N, E) => {
          {
            var j = (X) => {
              var re = Gn(), ie = v(re), Z = h(v(ie), 2), k = v(Z), q = h(Z, 2);
              q.__click = [Bn], D(() => O(k, w.error)), m(X, re);
            }, te = (X) => {
              var re = to(), ie = v(re);
              qs(ie, {
                get steps() {
                  return d(p);
                },
                get currentStep() {
                  return w.currentStep;
                },
                get completionPercentage() {
                  return w.completionPercentage;
                }
              });
              var Z = h(ie, 2), k = v(Z);
              {
                var q = (U) => {
                  var W = Jn(), ne = v(W), ae = v(ne), ee = h(ne, 2);
                  {
                    var de = (L) => {
                      var Q = Ye();
                      const se = /* @__PURE__ */ ke(() => w.model.option_groups.some(($) => $.options?.length > 0));
                      var oe = Me(Q);
                      {
                        var le = ($) => {
                          var Ae = Yn();
                          qe(Ae, 21, () => w.model.option_groups, Te, (Be, gt) => {
                            an(Be, {
                              get group() {
                                return d(gt);
                              }
                            });
                          }), m($, Ae);
                        }, be = ($) => {
                          var Ae = Hn();
                          m($, Ae);
                        };
                        I(oe, ($) => {
                          d(se) ? $(le) : $(be, !1);
                        });
                      }
                      m(L, Q);
                    }, B = (L) => {
                      var Q = Wn();
                      m(L, Q);
                    };
                    I(ee, (L) => {
                      w.model?.option_groups && Array.isArray(w.model.option_groups) ? L(de) : L(B, !1);
                    });
                  }
                  var V = h(ee, 2), R = v(V);
                  R.__click = l, D(() => {
                    O(ae, `Configure Your ${w.model?.name || "Product"}`), R.disabled = !w.canProceedToNextStep;
                  }), m(U, W);
                }, C = (U, W) => {
                  {
                    var ne = (ee) => {
                      var de = Kn(), B = h(v(de), 2);
                      Wt(B, {});
                      var V = h(B, 2), R = v(V);
                      R.__click = _;
                      var L = h(R, 2);
                      L.__click = l, D(() => L.disabled = !w.isValid), m(ee, de);
                    }, ae = (ee, de) => {
                      {
                        var B = (R) => {
                          var L = Qn(), Q = h(v(L), 2);
                          Ht(Q, { detailed: !0 });
                          var se = h(Q, 2), oe = v(se);
                          oe.__click = _;
                          var le = h(oe, 2);
                          le.__click = l, m(R, L);
                        }, V = (R, L) => {
                          {
                            var Q = (se) => {
                              var oe = Zn(), le = h(v(oe), 2);
                              Vn(le, {});
                              var be = h(le, 2), $ = v(be);
                              $.__click = _;
                              var Ae = h($, 2);
                              Ae.__click = f, m(se, oe);
                            };
                            I(
                              R,
                              (se) => {
                                w.currentStep === 3 && se(Q);
                              },
                              L
                            );
                          }
                        };
                        I(
                          ee,
                          (R) => {
                            w.currentStep === 2 ? R(B) : R(V, !1);
                          },
                          de
                        );
                      }
                    };
                    I(
                      U,
                      (ee) => {
                        w.currentStep === 1 ? ee(ne) : ee(ae, !1);
                      },
                      W
                    );
                  }
                };
                I(k, (U) => {
                  w.currentStep === 0 ? U(q) : U(C, !1);
                });
              }
              var z = h(Z, 2);
              {
                var H = (U) => {
                  var W = eo(), ne = v(W), ae = h(v(ne), 2);
                  qe(ae, 21, () => w.selectedOptions, Te, (R, L) => {
                    var Q = Xn(), se = v(Q), oe = v(se), le = h(se, 2), be = v(le);
                    D(() => {
                      O(oe, d(L).name), O(be, `×${d(L).quantity ?? ""}`);
                    }), m(R, Q);
                  });
                  var ee = h(ne, 2), de = h(v(ee), 2);
                  Ht(de, {});
                  var B = h(ee, 2);
                  {
                    var V = (R) => {
                      var L = $n(), Q = h(v(L), 2);
                      Wt(Q, { compact: !0 }), m(R, L);
                    };
                    I(B, (R) => {
                      w.validationResults.length > 0 && R(V);
                    });
                  }
                  m(U, W);
                };
                I(z, (U) => {
                  s() || U(H);
                });
              }
              m(X, re);
            };
            I(
              N,
              (X) => {
                w.error && w.retryCount >= 3 ? X(j) : X(te, !1);
              },
              E
            );
          }
        };
        I(x, (N) => {
          !d(c) || w.isLoading ? N(b) : N(y, !1);
        });
      }
      m(S, M);
    },
    $$slots: { default: !0 }
  }), D(() => {
    ye(g, 1, `configurator-app ${s() ? "embed-mode" : ""}`, "svelte-fpbtyb"), Xr(g, "data-theme", r());
  }), m(t, g), ze();
}
ht(["click"]);
const nr = new URLSearchParams(window.location.search), so = nr.get("model") || window.location.pathname.split("/").pop(), no = nr.get("theme") || "light", oo = nr.get("api") || "http://localhost:8080/api/v1", lo = ls(io, {
  target: document.body,
  props: {
    modelId: so,
    theme: no,
    apiUrl: oo,
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
  lo as default
};
