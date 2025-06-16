var gr = (t) => {
  throw TypeError(t);
};
var Ut = (t, e, r) => e.has(t) || gr("Cannot " + r);
var q = (t, e, r) => (Ut(t, e, "read from private field"), r ? r.call(t) : e.get(t)), ae = (t, e, r) => e.has(t) ? gr("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, r), Ae = (t, e, r, i) => (Ut(t, e, "write to private field"), i ? i.call(t, r) : e.set(t, r), r), Ht = (t, e, r) => (Ut(t, e, "access private method"), r);
var Lt = Array.isArray, ci = Array.prototype.indexOf, tr = Array.from, fi = Object.defineProperty, He = Object.getOwnPropertyDescriptor, kr = Object.getOwnPropertyDescriptors, _i = Object.prototype, gi = Array.prototype, rr = Object.getPrototypeOf, hr = Object.isExtensible;
function hi(t) {
  return t();
}
function Qt(t) {
  for (var e = 0; e < t.length; e++)
    t[e]();
}
const ye = 2, Ir = 4, qt = 8, ir = 16, Me = 32, Ze = 64, nr = 128, fe = 256, Pt = 512, _e = 1024, Te = 2048, Be = 4096, Ie = 8192, ar = 16384, Pr = 32768, or = 65536, pi = 1 << 17, mi = 1 << 19, Tr = 1 << 20, Gt = 1 << 21, Ye = Symbol("$state"), xi = Symbol("legacy props"), yi = Symbol("");
function Mr(t) {
  return t === this.v;
}
function bi(t, e) {
  return t != t ? e == e : t !== e || t !== null && typeof t == "object" || typeof t == "function";
}
function sr(t) {
  return !bi(t, this.v);
}
function wi(t) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function Si() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function Ei(t) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function Ci() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function ki(t) {
  throw new Error("https://svelte.dev/e/props_invalid_value");
}
function Ii() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function Pi() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function Ti() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
let Xe = !1;
function Mi() {
  Xe = !0;
}
const lr = 1, dr = 2, Or = 4, Oi = 8, Di = 16, Ri = 1, Ai = 2, Ni = 4, Li = 8, qi = 16, ji = 1, Fi = 2, ue = Symbol(), Vi = "http://www.w3.org/1999/xhtml";
function Dr(t) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
let ne = null;
function pr(t) {
  ne = t;
}
function Oe(t, e = !1, r) {
  var i = ne = {
    p: ne,
    c: null,
    d: !1,
    e: null,
    m: !1,
    s: t,
    x: null,
    l: null
  };
  Xe && !e && (ne.l = {
    s: null,
    u: null,
    r1: [],
    r2: at(!1)
  }), Qi(() => {
    i.d = !0;
  });
}
function De(t) {
  const e = ne;
  if (e !== null) {
    const s = e.e;
    if (s !== null) {
      var r = Z, i = ee;
      e.e = null;
      try {
        for (var n = 0; n < s.length; n++) {
          var a = s[n];
          Ke(a.effect), Ve(a.reaction), Ur(a.fn);
        }
      } finally {
        Ke(r), Ve(i);
      }
    }
    ne = e.p, e.m = !0;
  }
  return (
    /** @type {T} */
    {}
  );
}
function jt() {
  return !Xe || ne !== null && ne.l === null;
}
function Se(t) {
  if (typeof t != "object" || t === null || Ye in t)
    return t;
  const e = rr(t);
  if (e !== _i && e !== gi)
    return t;
  var r = /* @__PURE__ */ new Map(), i = Lt(t), n = /* @__PURE__ */ K(0), a = ee, s = (u) => {
    var v = ee;
    Ve(a);
    var c = u();
    return Ve(v), c;
  };
  return i && r.set("length", /* @__PURE__ */ K(
    /** @type {any[]} */
    t.length
  )), new Proxy(
    /** @type {any} */
    t,
    {
      defineProperty(u, v, c) {
        return (!("value" in c) || c.configurable === !1 || c.enumerable === !1 || c.writable === !1) && Ii(), s(() => {
          var f = r.get(v);
          f === void 0 ? (f = /* @__PURE__ */ K(c.value), r.set(v, f)) : B(f, c.value, !0);
        }), !0;
      },
      deleteProperty(u, v) {
        var c = r.get(v);
        if (c === void 0) {
          if (v in u) {
            const d = s(() => /* @__PURE__ */ K(ue));
            r.set(v, d), Yt(n);
          }
        } else {
          if (i && typeof v == "string") {
            var f = (
              /** @type {Source<number>} */
              r.get("length")
            ), _ = Number(v);
            Number.isInteger(_) && _ < f.v && B(f, _);
          }
          B(c, ue), Yt(n);
        }
        return !0;
      },
      get(u, v, c) {
        if (v === Ye)
          return t;
        var f = r.get(v), _ = v in u;
        if (f === void 0 && (!_ || He(u, v)?.writable) && (f = s(() => {
          var p = Se(_ ? u[v] : ue), m = /* @__PURE__ */ K(p);
          return m;
        }), r.set(v, f)), f !== void 0) {
          var d = l(f);
          return d === ue ? void 0 : d;
        }
        return Reflect.get(u, v, c);
      },
      getOwnPropertyDescriptor(u, v) {
        var c = Reflect.getOwnPropertyDescriptor(u, v);
        if (c && "value" in c) {
          var f = r.get(v);
          f && (c.value = l(f));
        } else if (c === void 0) {
          var _ = r.get(v), d = _?.v;
          if (_ !== void 0 && d !== ue)
            return {
              enumerable: !0,
              configurable: !0,
              value: d,
              writable: !0
            };
        }
        return c;
      },
      has(u, v) {
        if (v === Ye)
          return !0;
        var c = r.get(v), f = c !== void 0 && c.v !== ue || Reflect.has(u, v);
        if (c !== void 0 || Z !== null && (!f || He(u, v)?.writable)) {
          c === void 0 && (c = s(() => {
            var d = f ? Se(u[v]) : ue, p = /* @__PURE__ */ K(d);
            return p;
          }), r.set(v, c));
          var _ = l(c);
          if (_ === ue)
            return !1;
        }
        return f;
      },
      set(u, v, c, f) {
        var _ = r.get(v), d = v in u;
        if (i && v === "length")
          for (var p = c; p < /** @type {Source<number>} */
          _.v; p += 1) {
            var m = r.get(p + "");
            m !== void 0 ? B(m, ue) : p in u && (m = s(() => /* @__PURE__ */ K(ue)), r.set(p + "", m));
          }
        if (_ === void 0)
          (!d || He(u, v)?.writable) && (_ = s(() => {
            var y = /* @__PURE__ */ K(void 0);
            return B(y, Se(c)), y;
          }), r.set(v, _));
        else {
          d = _.v !== ue;
          var D = s(() => Se(c));
          B(_, D);
        }
        var R = Reflect.getOwnPropertyDescriptor(u, v);
        if (R?.set && R.set.call(f, c), !d) {
          if (i && typeof v == "string") {
            var A = (
              /** @type {Source<number>} */
              r.get("length")
            ), T = Number(v);
            Number.isInteger(T) && T >= A.v && B(A, T + 1);
          }
          Yt(n);
        }
        return !0;
      },
      ownKeys(u) {
        l(n);
        var v = Reflect.ownKeys(u).filter((_) => {
          var d = r.get(_);
          return d === void 0 || d.v !== ue;
        });
        for (var [c, f] of r)
          f.v !== ue && !(c in u) && v.push(c);
        return v;
      },
      setPrototypeOf() {
        Pi();
      }
    }
  );
}
function Yt(t, e = 1) {
  B(t, t.v + e);
}
// @__NO_SIDE_EFFECTS__
function Je(t) {
  var e = ye | Te, r = ee !== null && (ee.f & ye) !== 0 ? (
    /** @type {Derived} */
    ee
  ) : null;
  return Z === null || r !== null && (r.f & fe) !== 0 ? e |= fe : Z.f |= Tr, {
    ctx: ne,
    deps: null,
    effects: null,
    equals: Mr,
    f: e,
    fn: t,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      null
    ),
    wv: 0,
    parent: r ?? Z
  };
}
// @__NO_SIDE_EFFECTS__
function he(t) {
  const e = /* @__PURE__ */ Je(t);
  return Kr(e), e;
}
// @__NO_SIDE_EFFECTS__
function Rr(t) {
  const e = /* @__PURE__ */ Je(t);
  return e.equals = sr, e;
}
function Ar(t) {
  var e = t.effects;
  if (e !== null) {
    t.effects = null;
    for (var r = 0; r < e.length; r += 1)
      Fe(
        /** @type {Effect} */
        e[r]
      );
  }
}
function zi(t) {
  for (var e = t.parent; e !== null; ) {
    if ((e.f & ye) === 0)
      return (
        /** @type {Effect} */
        e
      );
    e = e.parent;
  }
  return null;
}
function Nr(t) {
  var e, r = Z;
  Ke(zi(t));
  try {
    Ar(t), e = ei(t);
  } finally {
    Ke(r);
  }
  return e;
}
function Lr(t) {
  var e = Nr(t);
  if (t.equals(e) || (t.v = e, t.wv = Xr()), !et) {
    var r = (qe || (t.f & fe) !== 0) && t.deps !== null ? Be : _e;
    be(t, r);
  }
}
const nt = /* @__PURE__ */ new Map();
function at(t, e) {
  var r = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: t,
    reactions: null,
    equals: Mr,
    rv: 0,
    wv: 0
  };
  return r;
}
// @__NO_SIDE_EFFECTS__
function K(t, e) {
  const r = at(t);
  return Kr(r), r;
}
// @__NO_SIDE_EFFECTS__
function qr(t, e = !1, r = !0) {
  var n;
  const i = at(t);
  return e || (i.equals = sr), Xe && r && ne !== null && ne.l !== null && ((n = ne.l).s ?? (n.s = [])).push(i), i;
}
function B(t, e, r = !1) {
  ee !== null && !we && jt() && (ee.f & (ye | ir)) !== 0 && !Pe?.includes(t) && Ti();
  let i = r ? Se(e) : e;
  return Jt(t, i);
}
function Jt(t, e) {
  if (!t.equals(e)) {
    var r = t.v;
    et ? nt.set(t, e) : nt.set(t, r), t.v = e, (t.f & ye) !== 0 && ((t.f & Te) !== 0 && Nr(
      /** @type {Derived} */
      t
    ), be(t, (t.f & fe) === 0 ? _e : Be)), t.wv = Xr(), jr(t, Te), jt() && Z !== null && (Z.f & _e) !== 0 && (Z.f & (Me | Ze)) === 0 && (ge === null ? tn([t]) : ge.push(t));
  }
  return e;
}
function ur(t, e = 1) {
  var r = l(t), i = e === 1 ? r++ : r--;
  return B(t, r), i;
}
function jr(t, e) {
  var r = t.reactions;
  if (r !== null)
    for (var i = jt(), n = r.length, a = 0; a < n; a++) {
      var s = r[a], u = s.f;
      (u & Te) === 0 && (!i && s === Z || (be(s, e), (u & (_e | fe)) !== 0 && ((u & ye) !== 0 ? jr(
        /** @type {Derived} */
        s,
        Be
      ) : Bt(
        /** @type {Effect} */
        s
      ))));
    }
}
let Bi = !1;
var mr, Fr, Vr, zr;
function Ui() {
  if (mr === void 0) {
    mr = window, Fr = /Firefox/.test(navigator.userAgent);
    var t = Element.prototype, e = Node.prototype, r = Text.prototype;
    Vr = He(e, "firstChild").get, zr = He(e, "nextSibling").get, hr(t) && (t.__click = void 0, t.__className = void 0, t.__attributes = null, t.__style = void 0, t.__e = void 0), hr(r) && (r.__t = void 0);
  }
}
function Ft(t = "") {
  return document.createTextNode(t);
}
// @__NO_SIDE_EFFECTS__
function We(t) {
  return Vr.call(t);
}
// @__NO_SIDE_EFFECTS__
function Vt(t) {
  return zr.call(t);
}
function o(t, e) {
  return /* @__PURE__ */ We(t);
}
function je(t, e) {
  {
    var r = (
      /** @type {DocumentFragment} */
      /* @__PURE__ */ We(
        /** @type {Node} */
        t
      )
    );
    return r instanceof Comment && r.data === "" ? /* @__PURE__ */ Vt(r) : r;
  }
}
function g(t, e = 1, r = !1) {
  let i = t;
  for (; e--; )
    i = /** @type {TemplateNode} */
    /* @__PURE__ */ Vt(i);
  return i;
}
function Hi(t) {
  t.textContent = "";
}
function Br(t) {
  Z === null && ee === null && Ei(), ee !== null && (ee.f & fe) !== 0 && Z === null && Si(), et && wi();
}
function Yi(t, e) {
  var r = e.last;
  r === null ? e.last = e.first = t : (r.next = t, t.prev = r, e.last = t);
}
function $e(t, e, r, i = !0) {
  var n = Z, a = {
    ctx: ne,
    deps: null,
    nodes_start: null,
    nodes_end: null,
    f: t | Te,
    first: null,
    fn: e,
    last: null,
    next: null,
    parent: n,
    prev: null,
    teardown: null,
    transitions: null,
    wv: 0
  };
  if (r)
    try {
      fr(a), a.f |= Pr;
    } catch (v) {
      throw Fe(a), v;
    }
  else e !== null && Bt(a);
  var s = r && a.deps === null && a.first === null && a.nodes_start === null && a.teardown === null && (a.f & (Tr | nr)) === 0;
  if (!s && i && (n !== null && Yi(a, n), ee !== null && (ee.f & ye) !== 0)) {
    var u = (
      /** @type {Derived} */
      ee
    );
    (u.effects ?? (u.effects = [])).push(a);
  }
  return a;
}
function Qi(t) {
  const e = $e(qt, null, !1);
  return be(e, _e), e.teardown = t, e;
}
function xe(t) {
  Br();
  var e = Z !== null && (Z.f & Me) !== 0 && ne !== null && !ne.m;
  if (e) {
    var r = (
      /** @type {ComponentContext} */
      ne
    );
    (r.e ?? (r.e = [])).push({
      fn: t,
      effect: Z,
      reaction: ee
    });
  } else {
    var i = Ur(t);
    return i;
  }
}
function Gi(t) {
  return Br(), Wi(t);
}
function Ji(t) {
  const e = $e(Ze, t, !0);
  return (r = {}) => new Promise((i) => {
    r.outro ? Tt(e, () => {
      Fe(e), i(void 0);
    }) : (Fe(e), i(void 0));
  });
}
function Ur(t) {
  return $e(Ir, t, !1);
}
function Wi(t) {
  return $e(qt, t, !0);
}
function O(t, e = [], r = Je) {
  const i = e.map(r);
  return vr(() => t(...i.map(l)));
}
function vr(t, e = 0) {
  return $e(qt | ir | e, t, !0);
}
function ot(t, e = !0) {
  return $e(qt | Me, t, !0, e);
}
function Hr(t) {
  var e = t.teardown;
  if (e !== null) {
    const r = et, i = ee;
    xr(!0), Ve(null);
    try {
      e.call(null);
    } finally {
      xr(r), Ve(i);
    }
  }
}
function Yr(t, e = !1) {
  var r = t.first;
  for (t.first = t.last = null; r !== null; ) {
    var i = r.next;
    (r.f & Ze) !== 0 ? r.parent = null : Fe(r, e), r = i;
  }
}
function Ki(t) {
  for (var e = t.first; e !== null; ) {
    var r = e.next;
    (e.f & Me) === 0 && Fe(e), e = r;
  }
}
function Fe(t, e = !0) {
  var r = !1;
  (e || (t.f & mi) !== 0) && t.nodes_start !== null && t.nodes_end !== null && (Zi(
    t.nodes_start,
    /** @type {TemplateNode} */
    t.nodes_end
  ), r = !0), Yr(t, e && !r), At(t, 0), be(t, ar);
  var i = t.transitions;
  if (i !== null)
    for (const a of i)
      a.stop();
  Hr(t);
  var n = t.parent;
  n !== null && n.first !== null && Qr(t), t.next = t.prev = t.teardown = t.ctx = t.deps = t.fn = t.nodes_start = t.nodes_end = null;
}
function Zi(t, e) {
  for (; t !== null; ) {
    var r = t === e ? null : (
      /** @type {TemplateNode} */
      /* @__PURE__ */ Vt(t)
    );
    t.remove(), t = r;
  }
}
function Qr(t) {
  var e = t.parent, r = t.prev, i = t.next;
  r !== null && (r.next = i), i !== null && (i.prev = r), e !== null && (e.first === t && (e.first = i), e.last === t && (e.last = r));
}
function Tt(t, e) {
  var r = [];
  cr(t, r, !0), Gr(r, () => {
    Fe(t), e && e();
  });
}
function Gr(t, e) {
  var r = t.length;
  if (r > 0) {
    var i = () => --r || e();
    for (var n of t)
      n.out(i);
  } else
    e();
}
function cr(t, e, r) {
  if ((t.f & Ie) === 0) {
    if (t.f ^= Ie, t.transitions !== null)
      for (const s of t.transitions)
        (s.is_global || r) && e.push(s);
    for (var i = t.first; i !== null; ) {
      var n = i.next, a = (i.f & or) !== 0 || (i.f & Me) !== 0;
      cr(i, e, a ? r : !1), i = n;
    }
  }
}
function Mt(t) {
  Jr(t, !0);
}
function Jr(t, e) {
  if ((t.f & Ie) !== 0) {
    t.f ^= Ie, (t.f & _e) !== 0 && (be(t, Te), Bt(t));
    for (var r = t.first; r !== null; ) {
      var i = r.next, n = (r.f & or) !== 0 || (r.f & Me) !== 0;
      Jr(r, n ? e : !1), r = i;
    }
    if (t.transitions !== null)
      for (const a of t.transitions)
        (a.is_global || e) && a.in();
  }
}
let Ot = [];
function Xi() {
  var t = Ot;
  Ot = [], Qt(t);
}
function $i(t) {
  Ot.length === 0 && queueMicrotask(Xi), Ot.push(t);
}
function en(t) {
  var e = (
    /** @type {Effect} */
    Z
  );
  if ((e.f & Pr) === 0) {
    if ((e.f & nr) === 0)
      throw t;
    e.fn(t);
  } else
    Wr(t, e);
}
function Wr(t, e) {
  for (; e !== null; ) {
    if ((e.f & nr) !== 0)
      try {
        e.fn(t);
        return;
      } catch {
      }
    e = e.parent;
  }
  throw t;
}
let Wt = !1, Dt = null, ze = !1, et = !1;
function xr(t) {
  et = t;
}
let It = [];
let ee = null, we = !1;
function Ve(t) {
  ee = t;
}
let Z = null;
function Ke(t) {
  Z = t;
}
let Pe = null;
function Kr(t) {
  ee !== null && ee.f & Gt && (Pe === null ? Pe = [t] : Pe.push(t));
}
let de = null, ce = 0, ge = null;
function tn(t) {
  ge = t;
}
let Zr = 1, Rt = 0, qe = !1;
function Xr() {
  return ++Zr;
}
function zt(t) {
  var e = t.f;
  if ((e & Te) !== 0)
    return !0;
  if ((e & Be) !== 0) {
    var r = t.deps, i = (e & fe) !== 0;
    if (r !== null) {
      var n, a, s = (e & Pt) !== 0, u = i && Z !== null && !qe, v = r.length;
      if (s || u) {
        var c = (
          /** @type {Derived} */
          t
        ), f = c.parent;
        for (n = 0; n < v; n++)
          a = r[n], (s || !a?.reactions?.includes(c)) && (a.reactions ?? (a.reactions = [])).push(c);
        s && (c.f ^= Pt), u && f !== null && (f.f & fe) === 0 && (c.f ^= fe);
      }
      for (n = 0; n < v; n++)
        if (a = r[n], zt(
          /** @type {Derived} */
          a
        ) && Lr(
          /** @type {Derived} */
          a
        ), a.wv > t.wv)
          return !0;
    }
    (!i || Z !== null && !qe) && be(t, _e);
  }
  return !1;
}
function $r(t, e, r = !0) {
  var i = t.reactions;
  if (i !== null)
    for (var n = 0; n < i.length; n++) {
      var a = i[n];
      Pe?.includes(t) || ((a.f & ye) !== 0 ? $r(
        /** @type {Derived} */
        a,
        e,
        !1
      ) : e === a && (r ? be(a, Te) : (a.f & _e) !== 0 && be(a, Be), Bt(
        /** @type {Effect} */
        a
      )));
    }
}
function ei(t) {
  var p;
  var e = de, r = ce, i = ge, n = ee, a = qe, s = Pe, u = ne, v = we, c = t.f;
  de = /** @type {null | Value[]} */
  null, ce = 0, ge = null, qe = (c & fe) !== 0 && (we || !ze || ee === null), ee = (c & (Me | Ze)) === 0 ? t : null, Pe = null, pr(t.ctx), we = !1, Rt++, t.f |= Gt;
  try {
    var f = (
      /** @type {Function} */
      (0, t.fn)()
    ), _ = t.deps;
    if (de !== null) {
      var d;
      if (At(t, ce), _ !== null && ce > 0)
        for (_.length = ce + de.length, d = 0; d < de.length; d++)
          _[ce + d] = de[d];
      else
        t.deps = _ = de;
      if (!qe)
        for (d = ce; d < _.length; d++)
          ((p = _[d]).reactions ?? (p.reactions = [])).push(t);
    } else _ !== null && ce < _.length && (At(t, ce), _.length = ce);
    if (jt() && ge !== null && !we && _ !== null && (t.f & (ye | Be | Te)) === 0)
      for (d = 0; d < /** @type {Source[]} */
      ge.length; d++)
        $r(
          ge[d],
          /** @type {Effect} */
          t
        );
    return n !== null && n !== t && (Rt++, ge !== null && (i === null ? i = ge : i.push(.../** @type {Source[]} */
    ge))), f;
  } catch (m) {
    en(m);
  } finally {
    de = e, ce = r, ge = i, ee = n, qe = a, Pe = s, pr(u), we = v, t.f ^= Gt;
  }
}
function rn(t, e) {
  let r = e.reactions;
  if (r !== null) {
    var i = ci.call(r, t);
    if (i !== -1) {
      var n = r.length - 1;
      n === 0 ? r = e.reactions = null : (r[i] = r[n], r.pop());
    }
  }
  r === null && (e.f & ye) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (de === null || !de.includes(e)) && (be(e, Be), (e.f & (fe | Pt)) === 0 && (e.f ^= Pt), Ar(
    /** @type {Derived} **/
    e
  ), At(
    /** @type {Derived} **/
    e,
    0
  ));
}
function At(t, e) {
  var r = t.deps;
  if (r !== null)
    for (var i = e; i < r.length; i++)
      rn(t, r[i]);
}
function fr(t) {
  var e = t.f;
  if ((e & ar) === 0) {
    be(t, _e);
    var r = Z, i = ze;
    Z = t, ze = !0;
    try {
      (e & ir) !== 0 ? Ki(t) : Yr(t), Hr(t);
      var n = ei(t);
      t.teardown = typeof n == "function" ? n : null, t.wv = Zr;
      var a;
    } finally {
      ze = i, Z = r;
    }
  }
}
function nn() {
  try {
    Ci();
  } catch (t) {
    if (Dt !== null)
      Wr(t, Dt);
    else
      throw t;
  }
}
function an() {
  var t = ze;
  try {
    var e = 0;
    for (ze = !0; It.length > 0; ) {
      e++ > 1e3 && nn();
      var r = It, i = r.length;
      It = [];
      for (var n = 0; n < i; n++) {
        var a = sn(r[n]);
        on(a);
      }
      nt.clear();
    }
  } finally {
    Wt = !1, ze = t, Dt = null;
  }
}
function on(t) {
  var e = t.length;
  if (e !== 0)
    for (var r = 0; r < e; r++) {
      var i = t[r];
      (i.f & (ar | Ie)) === 0 && zt(i) && (fr(i), i.deps === null && i.first === null && i.nodes_start === null && (i.teardown === null ? Qr(i) : i.fn = null));
    }
}
function Bt(t) {
  Wt || (Wt = !0, queueMicrotask(an));
  for (var e = Dt = t; e.parent !== null; ) {
    e = e.parent;
    var r = e.f;
    if ((r & (Ze | Me)) !== 0) {
      if ((r & _e) === 0) return;
      e.f ^= _e;
    }
  }
  It.push(e);
}
function sn(t) {
  for (var e = [], r = t; r !== null; ) {
    var i = r.f, n = (i & (Me | Ze)) !== 0, a = n && (i & _e) !== 0;
    if (!a && (i & Ie) === 0) {
      (i & Ir) !== 0 ? e.push(r) : n ? r.f ^= _e : zt(r) && fr(r);
      var s = r.first;
      if (s !== null) {
        r = s;
        continue;
      }
    }
    var u = r.parent;
    for (r = r.next; r === null && u !== null; )
      r = u.next, u = u.parent;
  }
  return e;
}
function l(t) {
  var e = t.f, r = (e & ye) !== 0;
  if (ee !== null && !we) {
    if (!Pe?.includes(t)) {
      var i = ee.deps;
      t.rv < Rt && (t.rv = Rt, de === null && i !== null && i[ce] === t ? ce++ : de === null ? de = [t] : (!qe || !de.includes(t)) && de.push(t));
    }
  } else if (r && /** @type {Derived} */
  t.deps === null && /** @type {Derived} */
  t.effects === null) {
    var n = (
      /** @type {Derived} */
      t
    ), a = n.parent;
    a !== null && (a.f & fe) === 0 && (n.f ^= fe);
  }
  return r && (n = /** @type {Derived} */
  t, zt(n) && Lr(n)), et && nt.has(t) ? nt.get(t) : t.v;
}
function Nt(t) {
  var e = we;
  try {
    return we = !0, t();
  } finally {
    we = e;
  }
}
const ln = -7169;
function be(t, e) {
  t.f = t.f & ln | e;
}
function dn(t) {
  if (!(typeof t != "object" || !t || t instanceof EventTarget)) {
    if (Ye in t)
      Kt(t);
    else if (!Array.isArray(t))
      for (let e in t) {
        const r = t[e];
        typeof r == "object" && r && Ye in r && Kt(r);
      }
  }
}
function Kt(t, e = /* @__PURE__ */ new Set()) {
  if (typeof t == "object" && t !== null && // We don't want to traverse DOM elements
  !(t instanceof EventTarget) && !e.has(t)) {
    e.add(t), t instanceof Date && t.getTime();
    for (let i in t)
      try {
        Kt(t[i], e);
      } catch {
      }
    const r = rr(t);
    if (r !== Object.prototype && r !== Array.prototype && r !== Map.prototype && r !== Set.prototype && r !== Date.prototype) {
      const i = kr(r);
      for (let n in i) {
        const a = i[n].get;
        if (a)
          try {
            a.call(t);
          } catch {
          }
      }
    }
  }
}
const un = ["touchstart", "touchmove"];
function vn(t) {
  return un.includes(t);
}
const ti = /* @__PURE__ */ new Set(), Zt = /* @__PURE__ */ new Set();
function tt(t) {
  for (var e = 0; e < t.length; e++)
    ti.add(t[e]);
  for (var r of Zt)
    r(t);
}
function Et(t) {
  var e = this, r = (
    /** @type {Node} */
    e.ownerDocument
  ), i = t.type, n = t.composedPath?.() || [], a = (
    /** @type {null | Element} */
    n[0] || t.target
  ), s = 0, u = t.__root;
  if (u) {
    var v = n.indexOf(u);
    if (v !== -1 && (e === document || e === /** @type {any} */
    window)) {
      t.__root = e;
      return;
    }
    var c = n.indexOf(e);
    if (c === -1)
      return;
    v <= c && (s = v);
  }
  if (a = /** @type {Element} */
  n[s] || t.target, a !== e) {
    fi(t, "currentTarget", {
      configurable: !0,
      get() {
        return a || r;
      }
    });
    var f = ee, _ = Z;
    Ve(null), Ke(null);
    try {
      for (var d, p = []; a !== null; ) {
        var m = a.assignedSlot || a.parentNode || /** @type {any} */
        a.host || null;
        try {
          var D = a["__" + i];
          if (D != null && (!/** @type {any} */
          a.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          t.target === a))
            if (Lt(D)) {
              var [R, ...A] = D;
              R.apply(a, [t, ...A]);
            } else
              D.call(a, t);
        } catch (T) {
          d ? p.push(T) : d = T;
        }
        if (t.cancelBubble || m === e || m === null)
          break;
        a = m;
      }
      if (d) {
        for (let T of p)
          queueMicrotask(() => {
            throw T;
          });
        throw d;
      }
    } finally {
      t.__root = e, delete t.currentTarget, Ve(f), Ke(_);
    }
  }
}
function ri(t) {
  var e = document.createElement("template");
  return e.innerHTML = t.replaceAll("<!>", "<!---->"), e.content;
}
function st(t, e) {
  var r = (
    /** @type {Effect} */
    Z
  );
  r.nodes_start === null && (r.nodes_start = t, r.nodes_end = e);
}
// @__NO_SIDE_EFFECTS__
function E(t, e) {
  var r = (e & ji) !== 0, i = (e & Fi) !== 0, n, a = !t.startsWith("<!>");
  return () => {
    n === void 0 && (n = ri(a ? t : "<!>" + t), r || (n = /** @type {Node} */
    /* @__PURE__ */ We(n)));
    var s = (
      /** @type {TemplateNode} */
      i || Fr ? document.importNode(n, !0) : n.cloneNode(!0)
    );
    if (r) {
      var u = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ We(s)
      ), v = (
        /** @type {TemplateNode} */
        s.lastChild
      );
      st(u, v);
    } else
      st(s, s);
    return s;
  };
}
// @__NO_SIDE_EFFECTS__
function cn(t, e, r = "svg") {
  var i = !t.startsWith("<!>"), n = `<${r}>${i ? t : "<!>" + t}</${r}>`, a;
  return () => {
    if (!a) {
      var s = (
        /** @type {DocumentFragment} */
        ri(n)
      ), u = (
        /** @type {Element} */
        /* @__PURE__ */ We(s)
      );
      a = /** @type {Element} */
      /* @__PURE__ */ We(u);
    }
    var v = (
      /** @type {TemplateNode} */
      a.cloneNode(!0)
    );
    return st(v, v), v;
  };
}
// @__NO_SIDE_EFFECTS__
function ii(t, e) {
  return /* @__PURE__ */ cn(t, e, "svg");
}
function Ct(t = "") {
  {
    var e = Ft(t + "");
    return st(e, e), e;
  }
}
function rt() {
  var t = document.createDocumentFragment(), e = document.createComment(""), r = Ft();
  return t.append(e, r), st(e, r), t;
}
function w(t, e) {
  t !== null && t.before(
    /** @type {Node} */
    e
  );
}
function I(t, e) {
  var r = e == null ? "" : typeof e == "object" ? e + "" : e;
  r !== (t.__t ?? (t.__t = t.nodeValue)) && (t.__t = r, t.nodeValue = r + "");
}
function fn(t, e) {
  return _n(t, e);
}
const Ue = /* @__PURE__ */ new Map();
function _n(t, { target: e, anchor: r, props: i = {}, events: n, context: a, intro: s = !0 }) {
  Ui();
  var u = /* @__PURE__ */ new Set(), v = (_) => {
    for (var d = 0; d < _.length; d++) {
      var p = _[d];
      if (!u.has(p)) {
        u.add(p);
        var m = vn(p);
        e.addEventListener(p, Et, { passive: m });
        var D = Ue.get(p);
        D === void 0 ? (document.addEventListener(p, Et, { passive: m }), Ue.set(p, 1)) : Ue.set(p, D + 1);
      }
    }
  };
  v(tr(ti)), Zt.add(v);
  var c = void 0, f = Ji(() => {
    var _ = r ?? e.appendChild(Ft());
    return ot(() => {
      if (a) {
        Oe({});
        var d = (
          /** @type {ComponentContext} */
          ne
        );
        d.c = a;
      }
      n && (i.$$events = n), c = t(_, i) || {}, a && De();
    }), () => {
      for (var d of u) {
        e.removeEventListener(d, Et);
        var p = (
          /** @type {number} */
          Ue.get(d)
        );
        --p === 0 ? (document.removeEventListener(d, Et), Ue.delete(d)) : Ue.set(d, p);
      }
      Zt.delete(v), _ !== r && _.parentNode?.removeChild(_);
    };
  });
  return gn.set(c, f), c;
}
let gn = /* @__PURE__ */ new WeakMap();
function P(t, e, [r, i] = [0, 0]) {
  var n = t, a = null, s = null, u = ue, v = r > 0 ? or : 0, c = !1;
  const f = (d, p = !0) => {
    c = !0, _(p, d);
  }, _ = (d, p) => {
    u !== (u = d) && (u ? (a ? Mt(a) : p && (a = ot(() => p(n))), s && Tt(s, () => {
      s = null;
    })) : (s ? Mt(s) : p && (s = ot(() => p(n, [r + 1, i]))), a && Tt(a, () => {
      a = null;
    })));
  };
  vr(() => {
    c = !1, e(f), c || _(null, null);
  }, v);
}
function pe(t, e) {
  return e;
}
function hn(t, e, r, i) {
  for (var n = [], a = e.length, s = 0; s < a; s++)
    cr(e[s].e, n, !0);
  var u = a > 0 && n.length === 0 && r !== null;
  if (u) {
    var v = (
      /** @type {Element} */
      /** @type {Element} */
      r.parentNode
    );
    Hi(v), v.append(
      /** @type {Element} */
      r
    ), i.clear(), Ne(t, e[0].prev, e[a - 1].next);
  }
  Gr(n, () => {
    for (var c = 0; c < a; c++) {
      var f = e[c];
      u || (i.delete(f.k), Ne(t, f.prev, f.next)), Fe(f.e, !u);
    }
  });
}
function me(t, e, r, i, n, a = null) {
  var s = t, u = { flags: e, items: /* @__PURE__ */ new Map(), first: null }, v = (e & Or) !== 0;
  if (v) {
    var c = (
      /** @type {Element} */
      t
    );
    s = c.appendChild(Ft());
  }
  var f = null, _ = !1, d = /* @__PURE__ */ Rr(() => {
    var p = r();
    return Lt(p) ? p : p == null ? [] : tr(p);
  });
  vr(() => {
    var p = l(d), m = p.length;
    _ && m === 0 || (_ = m === 0, pn(p, u, s, n, e, i, r), a !== null && (m === 0 ? f ? Mt(f) : f = ot(() => a(s)) : f !== null && Tt(f, () => {
      f = null;
    })), l(d));
  });
}
function pn(t, e, r, i, n, a, s) {
  var u = (n & Oi) !== 0, v = (n & (lr | dr)) !== 0, c = t.length, f = e.items, _ = e.first, d = _, p, m = null, D, R = [], A = [], T, y, x, S;
  if (u)
    for (S = 0; S < c; S += 1)
      T = t[S], y = a(T, S), x = f.get(y), x !== void 0 && (x.a?.measure(), (D ?? (D = /* @__PURE__ */ new Set())).add(x));
  for (S = 0; S < c; S += 1) {
    if (T = t[S], y = a(T, S), x = f.get(y), x === void 0) {
      var k = d ? (
        /** @type {TemplateNode} */
        d.e.nodes_start
      ) : r;
      m = xn(
        k,
        e,
        m,
        m === null ? e.first : m.next,
        T,
        y,
        S,
        i,
        n,
        s
      ), f.set(y, m), R = [], A = [], d = m.next;
      continue;
    }
    if (v && mn(x, T, S, n), (x.e.f & Ie) !== 0 && (Mt(x.e), u && (x.a?.unfix(), (D ?? (D = /* @__PURE__ */ new Set())).delete(x))), x !== d) {
      if (p !== void 0 && p.has(x)) {
        if (R.length < A.length) {
          var N = A[0], L;
          m = N.prev;
          var J = R[0], Y = R[R.length - 1];
          for (L = 0; L < R.length; L += 1)
            yr(R[L], N, r);
          for (L = 0; L < A.length; L += 1)
            p.delete(A[L]);
          Ne(e, J.prev, Y.next), Ne(e, m, J), Ne(e, Y, N), d = N, m = Y, S -= 1, R = [], A = [];
        } else
          p.delete(x), yr(x, d, r), Ne(e, x.prev, x.next), Ne(e, x, m === null ? e.first : m.next), Ne(e, m, x), m = x;
        continue;
      }
      for (R = [], A = []; d !== null && d.k !== y; )
        (d.e.f & Ie) === 0 && (p ?? (p = /* @__PURE__ */ new Set())).add(d), A.push(d), d = d.next;
      if (d === null)
        continue;
      x = d;
    }
    R.push(x), m = x, d = x.next;
  }
  if (d !== null || p !== void 0) {
    for (var U = p === void 0 ? [] : tr(p); d !== null; )
      (d.e.f & Ie) === 0 && U.push(d), d = d.next;
    var X = U.length;
    if (X > 0) {
      var W = (n & Or) !== 0 && c === 0 ? r : null;
      if (u) {
        for (S = 0; S < X; S += 1)
          U[S].a?.measure();
        for (S = 0; S < X; S += 1)
          U[S].a?.fix();
      }
      hn(e, U, W, f);
    }
  }
  u && $i(() => {
    if (D !== void 0)
      for (x of D)
        x.a?.apply();
  }), Z.first = e.first && e.first.e, Z.last = m && m.e;
}
function mn(t, e, r, i) {
  (i & lr) !== 0 && Jt(t.v, e), (i & dr) !== 0 ? Jt(
    /** @type {Value<number>} */
    t.i,
    r
  ) : t.i = r;
}
function xn(t, e, r, i, n, a, s, u, v, c) {
  var f = (v & lr) !== 0, _ = (v & Di) === 0, d = f ? _ ? /* @__PURE__ */ qr(n, !1, !1) : at(n) : n, p = (v & dr) === 0 ? s : at(s), m = {
    i: p,
    v: d,
    k: a,
    a: null,
    // @ts-expect-error
    e: null,
    prev: r,
    next: i
  };
  try {
    return m.e = ot(() => u(t, d, p, c), Bi), m.e.prev = r && r.e, m.e.next = i && i.e, r === null ? e.first = m : (r.next = m, r.e.next = m.e), i !== null && (i.prev = m, i.e.prev = m.e), m;
  } finally {
  }
}
function yr(t, e, r) {
  for (var i = t.next ? (
    /** @type {TemplateNode} */
    t.next.e.nodes_start
  ) : r, n = e ? (
    /** @type {TemplateNode} */
    e.e.nodes_start
  ) : r, a = (
    /** @type {TemplateNode} */
    t.e.nodes_start
  ); a !== i; ) {
    var s = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ Vt(a)
    );
    n.before(a), a = s;
  }
}
function Ne(t, e, r) {
  e === null ? t.first = r : (e.next = r, e.e.next = r && r.e), r !== null && (r.prev = e, r.e.prev = e && e.e);
}
function yn(t, e, r) {
  var i = t == null ? "" : "" + t;
  return i === "" ? null : i;
}
function se(t, e, r, i, n, a) {
  var s = t.__className;
  if (s !== r || s === void 0) {
    var u = yn(r);
    u == null ? t.removeAttribute("class") : t.className = u, t.__className = r;
  }
  return a;
}
const bn = Symbol("is custom element"), wn = Symbol("is html");
function Sn(t, e) {
  var r = ai(t);
  r.value === (r.value = // treat null and undefined the same for the initial value
  e ?? void 0) || // @ts-expect-error
  // `progress` elements always need their value set when it's `0`
  t.value === e && (e !== 0 || t.nodeName !== "PROGRESS") || (t.value = e ?? "");
}
function ni(t, e, r, i) {
  var n = ai(t);
  n[e] !== (n[e] = r) && (e === "loading" && (t[yi] = r), r == null ? t.removeAttribute(e) : typeof r != "string" && En(t).includes(e) ? t[e] = r : t.setAttribute(e, r));
}
function ai(t) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    // @ts-expect-error
    t.__attributes ?? (t.__attributes = {
      [bn]: t.nodeName.includes("-"),
      [wn]: t.namespaceURI === Vi
    })
  );
}
var br = /* @__PURE__ */ new Map();
function En(t) {
  var e = br.get(t.nodeName);
  if (e) return e;
  br.set(t.nodeName, e = []);
  for (var r, i = t, n = Element.prototype; n !== i; ) {
    r = kr(i);
    for (var a in r)
      r[a].set && e.push(a);
    i = rr(i);
  }
  return e;
}
function Cn(t = !1) {
  const e = (
    /** @type {ComponentContextLegacy} */
    ne
  ), r = e.l.u;
  if (!r) return;
  let i = () => dn(e.s);
  if (t) {
    let n = 0, a = (
      /** @type {Record<string, any>} */
      {}
    );
    const s = /* @__PURE__ */ Je(() => {
      let u = !1;
      const v = e.s;
      for (const c in v)
        v[c] !== a[c] && (a[c] = v[c], u = !0);
      return u && n++, n;
    });
    i = () => l(s);
  }
  r.b.length && Gi(() => {
    wr(e, i), Qt(r.b);
  }), xe(() => {
    const n = Nt(() => r.m.map(hi));
    return () => {
      for (const a of n)
        typeof a == "function" && a();
    };
  }), r.a.length && xe(() => {
    wr(e, i), Qt(r.a);
  });
}
function wr(t, e) {
  if (t.l.s)
    for (const r of t.l.s) l(r);
  e();
}
let kt = !1;
function kn(t) {
  var e = kt;
  try {
    return kt = !1, [t(), kt];
  } finally {
    kt = e;
  }
}
function Sr(t) {
  return t.ctx?.d ?? !1;
}
function oe(t, e, r, i) {
  var n = (r & Ri) !== 0, a = !Xe || (r & Ai) !== 0, s = (r & Li) !== 0, u = (r & qi) !== 0, v = !1, c;
  s ? [c, v] = kn(() => (
    /** @type {V} */
    t[e]
  )) : c = /** @type {V} */
  t[e];
  var f = Ye in t || xi in t, _ = s && (He(t, e)?.set ?? (f && e in t && ((k) => t[e] = k))) || void 0, d = (
    /** @type {V} */
    i
  ), p = !0, m = !1, D = () => (m = !0, p && (p = !1, u ? d = Nt(
    /** @type {() => V} */
    i
  ) : d = /** @type {V} */
  i), d);
  c === void 0 && i !== void 0 && (_ && a && ki(), c = D(), _ && _(c));
  var R;
  if (a)
    R = () => {
      var k = (
        /** @type {V} */
        t[e]
      );
      return k === void 0 ? D() : (p = !0, m = !1, k);
    };
  else {
    var A = (n ? Je : Rr)(
      () => (
        /** @type {V} */
        t[e]
      )
    );
    A.f |= pi, R = () => {
      var k = l(A);
      return k !== void 0 && (d = /** @type {V} */
      void 0), k === void 0 ? d : k;
    };
  }
  if ((r & Ni) === 0 && a)
    return R;
  if (_) {
    var T = t.$$legacy;
    return function(k, N) {
      return arguments.length > 0 ? ((!a || !N || T || v) && _(N ? R() : k), k) : R();
    };
  }
  var y = !1, x = /* @__PURE__ */ qr(c), S = /* @__PURE__ */ Je(() => {
    var k = R(), N = l(x);
    return y ? (y = !1, N) : x.v = k;
  });
  return s && l(S), n || (S.equals = sr), function(k, N) {
    if (arguments.length > 0) {
      const L = N ? l(S) : a && s ? Se(k) : k;
      if (!S.equals(L)) {
        if (y = !0, B(x, L), m && d !== void 0 && (d = L), Sr(S))
          return k;
        Nt(() => l(S));
      }
      return k;
    }
    return Sr(S) ? S.v : l(S);
  };
}
function In(t) {
  ne === null && Dr(), Xe && ne.l !== null ? Tn(ne).m.push(t) : xe(() => {
    const e = Nt(t);
    if (typeof e == "function") return (
      /** @type {() => void} */
      e
    );
  });
}
function Pn(t, e, { bubbles: r = !1, cancelable: i = !1 } = {}) {
  return new CustomEvent(t, { detail: e, bubbles: r, cancelable: i });
}
function oi() {
  const t = ne;
  return t === null && Dr(), (e, r, i) => {
    const n = (
      /** @type {Record<string, Function | Function[]>} */
      t.s.$$events?.[
        /** @type {any} */
        e
      ]
    );
    if (n) {
      const a = Lt(n) ? n.slice() : [n], s = Pn(
        /** @type {string} */
        e,
        r,
        i
      );
      for (const u of a)
        u.call(t.x, s);
      return !s.defaultPrevented;
    }
    return !0;
  };
}
function Tn(t) {
  var e = (
    /** @type {ComponentContextLegacy} */
    t.l
  );
  return e.u ?? (e.u = { a: [], b: [], m: [] });
}
const Mn = "5";
var Cr;
typeof window < "u" && ((Cr = window.__svelte ?? (window.__svelte = {})).v ?? (Cr.v = /* @__PURE__ */ new Set())).add(Mn);
class On {
  constructor(e, r = {}) {
    this.baseUrl = e || "http://localhost:8080/api/v1", this.modelId = r.modelId, this.authToken = r.authToken, this.timeout = r.timeout || 1e4;
  }
  async request(e, r = {}) {
    const i = `${this.baseUrl}${e}`, n = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...this.authToken && { Authorization: `Bearer ${this.authToken}` },
        ...r.headers
      },
      ...r
    };
    n.body && typeof n.body == "object" && (n.body = JSON.stringify(n.body));
    try {
      const a = new AbortController(), s = setTimeout(() => a.abort(), this.timeout), u = await fetch(i, {
        ...n,
        signal: a.signal
      });
      if (clearTimeout(s), !u.ok)
        throw new Error(`HTTP ${u.status}: ${u.statusText}`);
      return await u.json();
    } catch (a) {
      throw a.name === "AbortError" ? new Error("Request timeout") : a;
    }
  }
  // Model Management
  async getModel() {
    if (!this.modelId) throw new Error("Model ID required");
    return this.request(`/models/${this.modelId}`);
  }
  async getModelOptions() {
    if (!this.modelId) throw new Error("Model ID required");
    return this.request(`/models/${this.modelId}/options`);
  }
  // Configuration Management
  async createConfiguration(e = {}) {
    return this.request("/configurations", {
      method: "POST",
      body: {
        model_id: this.modelId,
        selections: Object.entries(e).map(([r, i]) => ({
          option_id: r,
          quantity: i
        }))
      }
    });
  }
  async updateConfiguration(e, r) {
    return this.request(`/configurations/${e}`, {
      method: "PUT",
      body: {
        model_id: this.modelId,
        selections: Object.entries(r).map(([i, n]) => ({
          option_id: i,
          quantity: n
        }))
      }
    });
  }
  async validateConfiguration(e) {
    return this.request("/configurations/validate-selection", {
      method: "POST",
      body: {
        model_id: this.modelId,
        selections: Object.entries(e).map(([r, i]) => ({
          option_id: r,
          quantity: i
        }))
      }
    });
  }
  // Pricing
  async calculatePricing(e, r = {}) {
    return this.request("/pricing/calculate", {
      method: "POST",
      body: {
        model_id: this.modelId,
        selections: Object.entries(e).map(([i, n]) => ({
          option_id: i,
          quantity: n
        })),
        context: r
      }
    });
  }
  async getVolumeTiers() {
    return this.request(`/pricing/volume-tiers/${this.modelId}`);
  }
}
var lt, dt, ut, vt, ct, ft, _t, gt, ht, pt, mt, xt, yt, bt, Qe, Ge, ke, Le, wt, Xt;
class Dn {
  constructor() {
    ae(this, wt);
    ae(this, lt, /* @__PURE__ */ K(""));
    ae(this, dt, /* @__PURE__ */ K(null));
    ae(this, ut, /* @__PURE__ */ K(Se({})));
    ae(this, vt, /* @__PURE__ */ K(Se([])));
    ae(this, ct, /* @__PURE__ */ K(null));
    ae(this, ft, /* @__PURE__ */ K(!1));
    ae(this, _t, /* @__PURE__ */ K(!1));
    ae(this, gt, /* @__PURE__ */ K(!1));
    ae(this, ht, /* @__PURE__ */ K(null));
    ae(this, pt, /* @__PURE__ */ K(0));
    ae(this, mt, /* @__PURE__ */ K(null));
    ae(this, xt, /* @__PURE__ */ K(null));
    ae(this, yt, /* @__PURE__ */ K(!1));
    ae(this, bt, /* @__PURE__ */ K(null));
    // Internal flags to prevent infinite loops
    ae(this, Qe, "");
    ae(this, Ge, "");
    ae(this, ke, /* @__PURE__ */ new Map());
    ae(this, Le, !1);
    this.initialized = !1;
  }
  get modelId() {
    return l(q(this, lt));
  }
  set modelId(e) {
    B(q(this, lt), e, !0);
  }
  get model() {
    return l(q(this, dt));
  }
  set model(e) {
    B(q(this, dt), e, !0);
  }
  get selections() {
    return l(q(this, ut));
  }
  set selections(e) {
    B(q(this, ut), e, !0);
  }
  get validationResults() {
    return l(q(this, vt));
  }
  set validationResults(e) {
    B(q(this, vt), e, !0);
  }
  get pricingData() {
    return l(q(this, ct));
  }
  set pricingData(e) {
    B(q(this, ct), e, !0);
  }
  get isLoading() {
    return l(q(this, ft));
  }
  set isLoading(e) {
    B(q(this, ft), e, !0);
  }
  get isValidating() {
    return l(q(this, _t));
  }
  set isValidating(e) {
    B(q(this, _t), e, !0);
  }
  get isPricing() {
    return l(q(this, gt));
  }
  set isPricing(e) {
    B(q(this, gt), e, !0);
  }
  get error() {
    return l(q(this, ht));
  }
  set error(e) {
    B(q(this, ht), e, !0);
  }
  get currentStep() {
    return l(q(this, pt));
  }
  set currentStep(e) {
    B(q(this, pt), e, !0);
  }
  get configurationId() {
    return l(q(this, mt));
  }
  set configurationId(e) {
    B(q(this, mt), e, !0);
  }
  get lastSaved() {
    return l(q(this, xt));
  }
  set lastSaved(e) {
    B(q(this, xt), e, !0);
  }
  get isDirty() {
    return l(q(this, yt));
  }
  set isDirty(e) {
    B(q(this, yt), e, !0);
  }
  get api() {
    return l(q(this, bt));
  }
  set api(e) {
    B(q(this, bt), e, !0);
  }
  // Initialize effects - call this from components
  initialize() {
    this.initialized || (this.initialized = !0, console.log("🔧 ConfigurationStore initialized"), xe(() => {
      this.modelId && !q(this, Le) && (console.log("🔄 ModelId changed, initializing API client:", this.modelId), this.api = new On("http://localhost:8080/api/v1", { modelId: this.modelId }), this.loadModel());
    }), xe(() => {
      const e = JSON.stringify(this.selections);
      if (this.api && Object.keys(this.selections).length > 0 && e !== q(this, Qe)) {
        Ht(this, wt, Xt).call(this, "validation");
        const r = setTimeout(
          () => {
            Ae(this, Qe, e), this.validateSelections();
          },
          300
        );
        q(this, ke).set("validation", r);
      }
    }), xe(() => {
      const e = JSON.stringify(this.selections);
      if (this.api && this.isValid && Object.keys(this.selections).length > 0 && e !== q(this, Ge)) {
        Ht(this, wt, Xt).call(this, "pricing");
        const r = setTimeout(
          () => {
            Ae(this, Ge, e), this.calculatePricing();
          },
          500
        );
        q(this, ke).set("pricing", r);
      }
    }), xe(() => {
      if (this.isDirty && this.configurationId) {
        const e = setInterval(
          () => {
            this.saveConfiguration();
          },
          3e4
        );
        return () => clearInterval(e);
      }
    }));
  }
  // Derived state (these work without effects)
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
    if (!this.model?.option_groups) return [];
    const e = [];
    for (const r of this.model.option_groups)
      for (const i of r.options)
        this.selections[i.id] > 0 && e.push({
          ...i,
          quantity: this.selections[i.id],
          group_name: r.name
        });
    return e;
  }
  get completionPercentage() {
    if (!this.model?.option_groups) return 0;
    const e = this.model.option_groups.filter((i) => i.required);
    if (e.length === 0) return 100;
    const r = e.filter((i) => i.options.some((n) => this.selections[n.id] > 0));
    return Math.round(r.length / e.length * 100);
  }
  get canProceedToNextStep() {
    return this.completionPercentage >= 100 && this.isValid;
  }
  // Core methods
  setModelId(e) {
    console.log("🆔 setModelId called:", { current: this.modelId, new: e }), this.modelId !== e && (console.log("🔄 ModelId changing from", this.modelId, "to", e), this.modelId = e, this.reset());
  }
  async loadModel() {
    if (!this.api || q(this, Le)) {
      console.log("⚠️ Skipping loadModel - no API or already loading");
      return;
    }
    Ae(this, Le, !0), this.isLoading = !0, this.error = null, console.log("📡 Loading model:", this.modelId);
    try {
      const e = await this.api.getModel();
      if (console.log("✅ Model loaded successfully:", e.name), this.model = e, Object.keys(this.selections).length === 0) {
        const r = {};
        if (e.option_groups)
          for (const i of e.option_groups)
            for (const n of i.options)
              n.default_selected && (r[n.id] = n.default_quantity || 1);
        Object.keys(r).length > 0 && (console.log("🎯 Setting initial selections:", r), this.selections = r, this.isDirty = !0);
      }
    } catch (e) {
      this.error = e.message, console.error("❌ Failed to load model:", e);
    } finally {
      this.isLoading = !1, Ae(this, Le, !1), console.log("🏁 loadModel completed");
    }
  }
  updateSelection(e, r) {
    (this.selections[e] || 0) !== r && (r > 0 ? this.selections[e] = r : delete this.selections[e], this.isDirty = !0, this.selections = { ...this.selections });
  }
  async validateSelections() {
    if (!(!this.api || this.isValidating)) {
      this.isValidating = !0;
      try {
        const e = await this.api.validateConfiguration(this.selections);
        this.validationResults = e.violations || [];
      } catch (e) {
        console.error("Validation failed:", e), this.validationResults = [
          {
            type: "error",
            message: "Failed to validate configuration. Please try again."
          }
        ];
      } finally {
        this.isValidating = !1;
      }
    }
  }
  async calculatePricing() {
    if (!(!this.api || this.isPricing)) {
      this.isPricing = !0;
      try {
        const e = await this.api.calculatePricing(this.selections);
        this.pricingData = e;
      } catch (e) {
        console.error("Pricing calculation failed:", e), this.pricingData = null;
      } finally {
        this.isPricing = !1;
      }
    }
  }
  async saveConfiguration() {
    if (!this.api || !this.isDirty) return null;
    try {
      let e;
      return this.configurationId ? e = await this.api.updateConfiguration(this.configurationId, {
        selections: this.selections,
        pricing: this.pricingData
      }) : (e = await this.api.createConfiguration({
        model_id: this.modelId,
        selections: this.selections,
        pricing: this.pricingData
      }), this.configurationId = e.id), this.lastSaved = /* @__PURE__ */ new Date(), this.isDirty = !1, e;
    } catch (e) {
      throw console.error("Failed to save configuration:", e), e;
    }
  }
  nextStep() {
    this.canProceedToNextStep && (this.currentStep = Math.min(this.currentStep + 1, 3));
  }
  previousStep() {
    this.currentStep = Math.max(this.currentStep - 1, 0);
  }
  goToStep(e) {
    this.currentStep = Math.max(0, Math.min(e, 3));
  }
  reset() {
    console.log("🔄 Resetting store state");
    for (const e of q(this, ke).values())
      clearTimeout(e);
    q(this, ke).clear(), this.model = null, this.selections = {}, this.validationResults = [], this.pricingData = null, this.currentStep = 0, this.configurationId = null, this.lastSaved = null, this.isDirty = !1, this.error = null, Ae(this, Qe, ""), Ae(this, Ge, ""), Ae(this, Le, !1);
  }
  // Sharing and export
  generateShareableUrl() {
    const e = {
      modelId: this.modelId,
      selections: this.selections,
      timestamp: Date.now()
    }, r = btoa(JSON.stringify(e));
    return `${window.location.origin}/configure/${this.modelId}?config=${r}`;
  }
  loadFromShareableUrl(e) {
    try {
      const r = JSON.parse(atob(e));
      r.modelId && r.selections && (this.setModelId(r.modelId), this.selections = r.selections, this.isDirty = !0);
    } catch (r) {
      console.warn("Failed to load shared configuration:", r);
    }
  }
  exportConfiguration() {
    return {
      model_id: this.modelId,
      model_name: this.model?.name,
      selections: this.selectedOptions.map((e) => ({
        option_id: e.id,
        option_name: e.name,
        quantity: this.selections[e.id],
        unit_price: e.base_price,
        total_price: e.base_price * this.selections[e.id]
      })),
      pricing: this.pricingData,
      validation: {
        is_valid: this.isValid,
        errors: this.validationResults
      },
      metadata: {
        created_at: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(),
        completion_percentage: this.completionPercentage
      }
    };
  }
}
lt = new WeakMap(), dt = new WeakMap(), ut = new WeakMap(), vt = new WeakMap(), ct = new WeakMap(), ft = new WeakMap(), _t = new WeakMap(), gt = new WeakMap(), ht = new WeakMap(), pt = new WeakMap(), mt = new WeakMap(), xt = new WeakMap(), yt = new WeakMap(), bt = new WeakMap(), Qe = new WeakMap(), Ge = new WeakMap(), ke = new WeakMap(), Le = new WeakMap(), wt = new WeakSet(), Xt = function(e) {
  const r = q(this, ke).get(e);
  r && (clearTimeout(r), q(this, ke).delete(e));
};
const h = new Dn();
Mi();
var Rn = /* @__PURE__ */ E('<div class="absolute inset-0 flex items-center" aria-hidden="true"><div></div></div>'), An = (t, e) => h.goToStep(l(e).id), Nn = /* @__PURE__ */ ii('<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>'), Ln = /* @__PURE__ */ E('<span class="text-sm font-medium"> </span>'), qn = /* @__PURE__ */ E('<li><!> <button><!></button> <div class="mt-2 text-center"><div> </div> <div> </div></div></li>'), jn = /* @__PURE__ */ E('<nav aria-label="Progress"><ol class="flex items-center"></ol></nav>');
function Fn(t, e) {
  Oe(e, !1);
  const r = [
    {
      id: 0,
      name: "Select",
      description: "Choose your product"
    },
    {
      id: 1,
      name: "Configure",
      description: "Customize options"
    },
    {
      id: 2,
      name: "Review",
      description: "Verify & price"
    },
    {
      id: 3,
      name: "Complete",
      description: "Finalize order"
    }
  ];
  Cn();
  var i = jn(), n = o(i);
  me(n, 5, () => r, pe, (a, s, u) => {
    var v = qn(), c = o(v);
    {
      var f = (x) => {
        var S = Rn(), k = o(S);
        O(() => se(k, 1, `h-0.5 w-full ${h.currentStep > l(s).id ? "bg-primary-600" : "bg-gray-200"}`)), w(x, S);
      };
      P(c, (x) => {
        u < r.length - 1 && x(f);
      });
    }
    var _ = g(c, 2);
    _.__click = [An, s];
    var d = o(_);
    {
      var p = (x) => {
        var S = Nn();
        w(x, S);
      }, m = (x) => {
        var S = Ln(), k = o(S);
        O(() => I(k, l(s).id + 1)), w(x, S);
      };
      P(d, (x) => {
        h.currentStep > l(s).id ? x(p) : x(m, !1);
      });
    }
    var D = g(_, 2), R = o(D), A = o(R), T = g(R, 2), y = o(T);
    O(() => {
      se(v, 1, `relative ${u < r.length - 1 ? "pr-8 sm:pr-20" : ""}`), se(_, 1, `relative w-8 h-8 flex items-center justify-center rounded-full transition-colors
                 ${h.currentStep > l(s).id ? "bg-primary-600 text-white" : h.currentStep === l(s).id ? "bg-primary-50 border-2 border-primary-600 text-primary-600" : "bg-white border-2 border-gray-300 text-gray-500"}`), ni(_, "aria-current", h.currentStep === l(s).id ? "step" : void 0), se(R, 1, `text-xs font-medium ${h.currentStep >= l(s).id ? "text-gray-900" : "text-gray-500"}`), I(A, l(s).name), se(T, 1, `text-xs ${h.currentStep >= l(s).id ? "text-gray-500" : "text-gray-400"}`), I(y, l(s).description);
    }), w(a, v);
  }), w(t, i), De();
}
tt(["click"]);
var Vn = /* @__PURE__ */ E('<p class="mt-4 text-sm text-gray-600"> </p>'), zn = /* @__PURE__ */ E('<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" aria-live="polite"><div class="bg-white rounded-lg p-6 text-center"><div></div> <!></div></div>'), Bn = /* @__PURE__ */ E('<span class="ml-3 text-sm text-gray-600"> </span>'), Un = /* @__PURE__ */ E('<div class="flex items-center justify-center" aria-live="polite"><div></div> <!></div>');
function Er(t, e) {
  let r = oe(e, "size", 3, "md"), i = oe(e, "color", 3, "primary"), n = oe(e, "message", 3, ""), a = oe(e, "overlay", 3, !1);
  const s = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16"
  }, u = {
    primary: "border-primary-600",
    gray: "border-gray-600",
    white: "border-white"
  };
  var v = rt(), c = je(v);
  {
    var f = (d) => {
      var p = zn(), m = o(p), D = o(m), R = g(D, 2);
      {
        var A = (T) => {
          var y = Vn(), x = o(y);
          O(() => I(x, n())), w(T, y);
        };
        P(R, (T) => {
          n() && T(A);
        });
      }
      O(() => se(D, 1, `animate-spin rounded-full ${s[r()] ?? ""} border-2 border-gray-200 ${u[i()] ?? ""} border-t-transparent mx-auto`)), w(d, p);
    }, _ = (d) => {
      var p = Un(), m = o(p), D = g(m, 2);
      {
        var R = (A) => {
          var T = Bn(), y = o(T);
          O(() => I(y, n())), w(A, T);
        };
        P(D, (A) => {
          n() && A(R);
        });
      }
      O(() => se(m, 1, `animate-spin rounded-full ${s[r()] ?? ""} border-2 border-gray-200 ${u[i()] ?? ""} border-t-transparent`)), w(d, p);
    };
    P(c, (d) => {
      a() ? d(f) : d(_, !1);
    });
  }
  w(t, v);
}
function Hn(t, e, r, i) {
  e() < r() && i("retry");
}
function Yn(t, e) {
  e(!e());
}
var Qn = /* @__PURE__ */ E('<div class="mt-3 text-xs text-red-600 bg-red-100 p-2 rounded border"><pre class="whitespace-pre-wrap"> </pre></div>'), Gn = /* @__PURE__ */ E('<button type="button" class="text-sm bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200 transition-colors"> </button>'), Jn = /* @__PURE__ */ E('<div class="rounded-md bg-red-50 p-4 border border-red-200"><div class="flex"><div class="flex-shrink-0"><svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg></div> <div class="ml-3 flex-1"><h3 class="text-sm font-medium text-red-800"> </h3> <div class="mt-2 text-sm text-red-700"><p> </p></div> <!> <div class="mt-4 flex space-x-3"><!> <button type="button" class="text-sm text-red-600 hover:text-red-500 underline"> </button></div></div></div></div>');
function Wn(t, e) {
  Oe(e, !0);
  let r = oe(e, "error", 3, null), i = oe(e, "context", 3, "Application"), n = oe(e, "showDetails", 7, !1), a = oe(e, "retryable", 3, !0), s = oe(e, "retryCount", 3, 0), u = oe(e, "maxRetries", 3, 3);
  const v = oi();
  let c = /* @__PURE__ */ he(() => a() && s() < u());
  var f = rt(), _ = je(f);
  {
    var d = (p) => {
      var m = Jn(), D = o(m), R = g(o(D), 2), A = o(R), T = o(A), y = g(A, 2), x = o(y), S = o(x), k = g(y, 2);
      {
        var N = (W) => {
          var M = Qn(), b = o(M), C = o(b);
          O((V) => I(C, V), [
            () => r().stack || JSON.stringify(r(), null, 2)
          ]), w(W, M);
        };
        P(k, (W) => {
          n() && W(N);
        });
      }
      var L = g(k, 2), J = o(L);
      {
        var Y = (W) => {
          var M = Gn();
          M.__click = [
            Hn,
            s,
            u,
            v
          ];
          var b = o(M);
          O(() => I(b, `Retry ${s() > 0 ? `(${s()}/${u()})` : ""}`)), w(W, M);
        };
        P(J, (W) => {
          l(c) && W(Y);
        });
      }
      var U = g(J, 2);
      U.__click = [Yn, n];
      var X = o(U);
      O(() => {
        I(T, `${i() ?? ""} Error`), I(S, `Something went wrong. ${r().message || "An unexpected error occurred."}`), I(X, `${n() ? "Hide" : "Show"} Details`);
      }), w(p, m);
    };
    P(_, (p) => {
      r() && p(d);
    });
  }
  w(t, f), De();
}
tt(["click"]);
function Kn(t, e, r) {
  e.group.max_selections && l(r) >= e.group.max_selections || ur(r);
}
function Zn(t, e) {
  l(e) > 0 && ur(e, -1);
}
function Xn(t, e, r) {
  l(e) ? B(r, 0) : B(r, 1);
}
var $n = /* @__PURE__ */ E('<div class="absolute -top-2 -right-2 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center"><svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg></div>'), ea = /* @__PURE__ */ E('<p class="mt-1 text-sm text-gray-500"> </p>'), ta = /* @__PURE__ */ E('<span class="text-xs text-gray-500"> </span>'), ra = /* @__PURE__ */ E('<div class="text-xs text-primary-600"> </div>'), ia = /* @__PURE__ */ E('<span class="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"> </span>'), na = /* @__PURE__ */ E('<span class="text-xs text-gray-500"> </span>'), aa = /* @__PURE__ */ E('<div class="mt-2 flex flex-wrap gap-1"><!> <!></div>'), oa = /* @__PURE__ */ E('<div class="w-2 h-2 bg-white rounded-full"></div>'), sa = /* @__PURE__ */ E('<button type="button"><div><!></div> <span> </span></button>'), la = /* @__PURE__ */ E('<div class="flex items-center space-x-3"><span class="text-sm text-gray-500">Quantity:</span> <div class="flex items-center space-x-2"><button type="button"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path></svg></button> <span class="w-8 text-center text-sm font-medium"> </span> <button type="button"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg></button></div></div>'), da = /* @__PURE__ */ E('<div class="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded"> </div>'), ua = /* @__PURE__ */ E('<div><!> <div class="p-4"><div class="flex items-start justify-between"><div class="flex-1"><h3 class="text-sm font-medium text-gray-900"> </h3> <!></div> <div class="ml-4 text-right"><div class="text-sm font-medium text-gray-900"> <!></div> <!></div></div> <!> <div class="mt-4 flex items-center justify-between"><!> <!></div></div></div>');
function va(t, e) {
  Oe(e, !0);
  let r = /* @__PURE__ */ K(Se(h.selections[e.option.id] || 0)), i = /* @__PURE__ */ he(() => l(r) > 0), n = /* @__PURE__ */ he(() => l(r) * e.option.base_price);
  xe(() => {
    h.updateSelection(e.option.id, l(r));
  }), xe(() => {
    if (e.group.selection_type === "single" && l(i))
      for (const M of e.group.options)
        M.id !== e.option.id && h.selections[M.id] > 0 && h.updateSelection(M.id, 0);
  });
  var a = ua(), s = o(a);
  {
    var u = (M) => {
      var b = $n();
      w(M, b);
    };
    P(s, (M) => {
      l(i) && M(u);
    });
  }
  var v = g(s, 2), c = o(v), f = o(c), _ = o(f), d = o(_), p = g(_, 2);
  {
    var m = (M) => {
      var b = ea(), C = o(b);
      O(() => I(C, e.option.description)), w(M, b);
    };
    P(p, (M) => {
      e.option.description && M(m);
    });
  }
  var D = g(f, 2), R = o(D), A = o(R), T = g(A);
  {
    var y = (M) => {
      var b = ta(), C = o(b);
      O(() => I(C, `/${e.option.price_unit ?? ""}`)), w(M, b);
    };
    P(T, (M) => {
      e.option.price_unit && e.option.price_unit !== "each" && M(y);
    });
  }
  var x = g(R, 2);
  {
    var S = (M) => {
      var b = ra(), C = o(b);
      O((V) => I(C, `Total: $${V ?? ""}`), [() => l(n).toFixed(2)]), w(M, b);
    };
    P(x, (M) => {
      l(n) > e.option.base_price && M(S);
    });
  }
  var k = g(c, 2);
  {
    var N = (M) => {
      var b = aa(), C = o(b);
      me(C, 17, () => e.option.constraints.slice(0, 3), pe, (z, j) => {
        var Q = ia(), $ = o(Q);
        O(() => I($, l(j))), w(z, Q);
      });
      var V = g(C, 2);
      {
        var te = (z) => {
          var j = na(), Q = o(j);
          O(() => I(Q, `+${e.option.constraints.length - 3} more`)), w(z, j);
        };
        P(V, (z) => {
          e.option.constraints.length > 3 && z(te);
        });
      }
      w(M, b);
    };
    P(k, (M) => {
      e.option.constraints && e.option.constraints.length > 0 && M(N);
    });
  }
  var L = g(k, 2), J = o(L);
  {
    var Y = (M) => {
      var b = sa();
      b.__click = [Xn, i, r];
      var C = o(b), V = o(C);
      {
        var te = (Q) => {
          var $ = oa();
          w(Q, $);
        };
        P(V, (Q) => {
          l(i) && Q(te);
        });
      }
      var z = g(C, 2), j = o(z);
      O(() => {
        se(b, 1, `flex items-center space-x-2 text-sm font-medium
                 ${l(i) ? "text-primary-600" : "text-gray-500 hover:text-gray-700"}`), se(C, 1, `w-4 h-4 rounded-full border-2 flex items-center justify-center
                      ${l(i) ? "border-primary-600 bg-primary-600" : "border-gray-300"}`), I(j, l(i) ? "Selected" : "Select");
      }), w(M, b);
    }, U = (M) => {
      var b = la(), C = g(o(b), 2), V = o(C);
      V.__click = [Zn, r];
      var te = g(V, 2), z = o(te), j = g(te, 2);
      j.__click = [Kn, e, r], O(() => {
        se(V, 1, `w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center
                     ${l(r) > 0 ? "hover:bg-gray-100 text-gray-700" : "text-gray-400 cursor-not-allowed"}`), V.disabled = l(r) <= 0, I(z, l(r)), se(j, 1, `w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center
                     hover:bg-gray-100 text-gray-700
                     ${e.group.max_selections && l(r) >= e.group.max_selections ? "opacity-50 cursor-not-allowed" : ""}`), j.disabled = e.group.max_selections && l(r) >= e.group.max_selections;
      }), w(M, b);
    };
    P(J, (M) => {
      e.group.selection_type === "single" ? M(Y) : M(U, !1);
    });
  }
  var X = g(J, 2);
  {
    var W = (M) => {
      var b = da(), C = o(b);
      O(() => I(C, e.option.availability_status)), w(M, b);
    };
    P(X, (M) => {
      e.option.availability_status && e.option.availability_status !== "available" && M(W);
    });
  }
  O(
    (M) => {
      se(a, 1, `relative rounded-lg border-2 transition-all duration-200 
            ${l(i) ? "border-primary-500 bg-primary-50" : "border-gray-200 bg-white hover:border-gray-300"}`), I(d, e.option.name), I(A, `$${M ?? ""} `);
    },
    [() => e.option.base_price.toFixed(2)]
  ), w(t, a), De();
}
tt(["click"]);
var ca = /* @__PURE__ */ E('<span class="ml-2 text-sm text-red-500">*</span>'), fa = /* @__PURE__ */ ii('<svg class="ml-2 w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>'), _a = /* @__PURE__ */ E('<p class="mt-1 text-sm text-gray-500"> </p>'), ga = /* @__PURE__ */ E('<div class="text-xs text-gray-400">Choose one</div>'), ha = /* @__PURE__ */ E('<div class="text-xs text-gray-400"><!></div>'), pa = /* @__PURE__ */ E("<div> </div>"), ma = /* @__PURE__ */ E('<div class="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2"></div>'), xa = /* @__PURE__ */ E('<div class="text-xs bg-gray-50 p-2 rounded"> </div>'), ya = /* @__PURE__ */ E('<div class="mt-4 text-sm text-gray-600"><details class="group"><summary class="cursor-pointer font-medium group-hover:text-gray-800"> </summary> <div class="mt-2 space-y-1"></div></details></div>'), ba = /* @__PURE__ */ E('<div class="mb-8"><div class="mb-4"><div class="flex items-center justify-between"><div><h2 class="text-lg font-medium text-gray-900 flex items-center"> <!> <!></h2> <!></div> <div class="text-right"><div class="text-sm text-gray-500"> <!> selected</div> <!></div></div> <!></div> <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"></div> <!></div>');
function wa(t, e) {
  Oe(e, !0);
  let r = /* @__PURE__ */ he(() => e.group.options.reduce(
    (b, C) => b + (h.selections[C.id] || 0),
    0
  )), i = /* @__PURE__ */ he(() => e.group.required), n = /* @__PURE__ */ he(() => !l(i) || l(r) >= (e.group.min_selections || 1)), a = /* @__PURE__ */ he(() => h.validationResults.some((b) => b.group_id === e.group.id || e.group.options.some((C) => b.option_id === C.id)));
  var s = ba(), u = o(s), v = o(u), c = o(v), f = o(c), _ = o(f), d = g(_);
  {
    var p = (b) => {
      var C = ca();
      w(b, C);
    };
    P(d, (b) => {
      l(i) && b(p);
    });
  }
  var m = g(d, 2);
  {
    var D = (b) => {
      var C = fa();
      w(b, C);
    };
    P(m, (b) => {
      l(n) && b(D);
    });
  }
  var R = g(f, 2);
  {
    var A = (b) => {
      var C = _a(), V = o(C);
      O(() => I(V, e.group.description)), w(b, C);
    };
    P(R, (b) => {
      e.group.description && b(A);
    });
  }
  var T = g(c, 2), y = o(T), x = o(y), S = g(x);
  {
    var k = (b) => {
      var C = Ct();
      O(() => I(C, `/ ${e.group.max_selections ?? ""}`)), w(b, C);
    };
    P(S, (b) => {
      e.group.max_selections && b(k);
    });
  }
  var N = g(y, 2);
  {
    var L = (b) => {
      var C = ga();
      w(b, C);
    }, J = (b, C) => {
      {
        var V = (te) => {
          var z = ha(), j = o(z);
          {
            var Q = (H) => {
              var F = Ct();
              O(() => I(F, `${e.group.min_selections ?? ""}-${e.group.max_selections ?? ""} required`)), w(H, F);
            }, $ = (H, F) => {
              {
                var ie = (re) => {
                  var le = Ct();
                  O(() => I(le, `Min ${e.group.min_selections ?? ""} required`)), w(re, le);
                }, G = (re, le) => {
                  {
                    var Ee = (Ce) => {
                      var St = Ct();
                      O(() => I(St, `Max ${e.group.max_selections ?? ""} allowed`)), w(Ce, St);
                    };
                    P(
                      re,
                      (Ce) => {
                        e.group.max_selections && Ce(Ee);
                      },
                      le
                    );
                  }
                };
                P(
                  H,
                  (re) => {
                    e.group.min_selections ? re(ie) : re(G, !1);
                  },
                  F
                );
              }
            };
            P(j, (H) => {
              e.group.min_selections && e.group.max_selections ? H(Q) : H($, !1);
            });
          }
          w(te, z);
        };
        P(
          b,
          (te) => {
            (e.group.min_selections || e.group.max_selections) && te(V);
          },
          C
        );
      }
    };
    P(N, (b) => {
      e.group.selection_type === "single" ? b(L) : b(J, !1);
    });
  }
  var Y = g(v, 2);
  {
    var U = (b) => {
      var C = ma();
      me(C, 21, () => h.validationResults, pe, (V, te) => {
        var z = rt(), j = je(z);
        {
          var Q = ($) => {
            var H = pa(), F = o(H);
            O(() => I(F, l(te).message)), w($, H);
          };
          P(j, ($) => {
            l(te).group_id === e.group.id && $(Q);
          });
        }
        w(V, z);
      }), w(b, C);
    };
    P(Y, (b) => {
      l(a) && b(U);
    });
  }
  var X = g(u, 2);
  me(X, 21, () => e.group.options, pe, (b, C) => {
    va(b, {
      get option() {
        return l(C);
      },
      get group() {
        return e.group;
      }
    });
  });
  var W = g(X, 2);
  {
    var M = (b) => {
      var C = ya(), V = o(C), te = o(V), z = o(te), j = g(te, 2);
      me(j, 21, () => e.group.constraints, pe, (Q, $) => {
        var H = xa(), F = o(H);
        O(() => I(F, l($))), w(Q, H);
      }), O(() => I(z, `View Constraints (${e.group.constraints.length ?? ""})`)), w(b, C);
    };
    P(W, (b) => {
      e.group.constraints && e.group.constraints.length > 0 && b(M);
    });
  }
  O(() => {
    I(_, `${e.group.name ?? ""} `), I(x, `${l(r) ?? ""} `);
  }), w(t, s), De();
}
var Sa = /* @__PURE__ */ E('<div class="text-sm text-gray-500 flex items-center"><div class="animate-spin w-4 h-4 border-2 border-gray-300 border-t-primary-600 rounded-full mr-2"></div> Calculating...</div>'), Ea = /* @__PURE__ */ E('<div class="text-sm text-green-600">Updated</div>'), Ca = /* @__PURE__ */ E('<span class="text-green-600 ml-2"> </span>'), ka = /* @__PURE__ */ E('<div class="text-sm text-gray-500"> <!></div>'), Ia = /* @__PURE__ */ E('<div class="text-gray-500 text-xs"> </div>'), Pa = /* @__PURE__ */ E('<div class="flex justify-between text-sm"><div class="flex-1"><div class="text-gray-900"> </div> <!></div> <div class="text-gray-900 font-medium"> </div></div>'), Ta = /* @__PURE__ */ E('<div class="flex justify-between text-sm"><span class="text-gray-600"> </span> <span> </span></div>'), Ma = /* @__PURE__ */ E('<div class="space-y-3"><h4 class="text-sm font-medium text-gray-700 border-b border-gray-200 pb-2">Price Breakdown</h4> <!> <div class="border-t border-gray-200 pt-3"><div class="flex justify-between text-sm"><span class="text-gray-500">Subtotal</span> <span class="text-gray-900"> </span></div></div> <!> <div class="border-t border-gray-200 pt-3"><div class="flex justify-between text-lg font-medium"><span class="text-gray-900">Total</span> <span class="text-gray-900"> </span></div></div></div>'), Oa = () => h.saveConfiguration(), Da = /* @__PURE__ */ E('<div class="mt-6 space-y-3"><button type="button" class="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors">Save Configuration</button> <button type="button" class="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors">Export Configuration</button></div>'), Ra = /* @__PURE__ */ E('<div class="bg-white rounded-lg border border-gray-200 p-6"><div class="flex items-center justify-between mb-4"><h3 class="text-lg font-medium text-gray-900">Pricing</h3> <!></div> <div class="text-center mb-6"><div class="text-3xl font-bold text-gray-900"> </div> <!></div> <!> <!></div>');
function $t(t, e) {
  Oe(e, !0);
  let r = oe(e, "detailed", 3, !1), i = oe(e, "showBreakdown", 3, !0), n = /* @__PURE__ */ he(() => h.adjustments.reduce(
    (y, x) => x.amount < 0 ? y + Math.abs(x.amount) : y,
    0
  ));
  var a = Ra(), s = o(a), u = g(o(s), 2);
  {
    var v = (y) => {
      var x = Sa();
      w(y, x);
    }, c = (y, x) => {
      {
        var S = (k) => {
          var N = Ea();
          w(k, N);
        };
        P(
          y,
          (k) => {
            h.pricingData && k(S);
          },
          x
        );
      }
    };
    P(u, (y) => {
      h.isPricing ? y(v) : y(c, !1);
    });
  }
  var f = g(s, 2), _ = o(f), d = o(_), p = g(_, 2);
  {
    var m = (y) => {
      var x = ka(), S = o(x), k = g(S);
      {
        var N = (L) => {
          var J = Ca(), Y = o(J);
          O((U) => I(Y, `Save $${U ?? ""}`), [() => l(n).toFixed(2)]), w(L, J);
        };
        P(k, (L) => {
          l(n) > 0 && L(N);
        });
      }
      O((L) => I(S, `Base: $${L ?? ""} `), [() => h.basePrice.toFixed(2)]), w(y, x);
    };
    P(p, (y) => {
      h.basePrice !== h.totalPrice && y(m);
    });
  }
  var D = g(f, 2);
  {
    var R = (y) => {
      var x = Ma(), S = g(o(x), 2);
      me(S, 17, () => h.selectedOptions, pe, (C, V) => {
        var te = Pa(), z = o(te), j = o(z), Q = o(j), $ = g(j, 2);
        {
          var H = (G) => {
            var re = Ia(), le = o(re);
            O((Ee) => I(le, `$${Ee ?? ""} × ${h.selections[l(V).id] ?? ""}`), [
              () => l(V).base_price.toFixed(2)
            ]), w(G, re);
          };
          P($, (G) => {
            h.selections[l(V).id] > 1 && G(H);
          });
        }
        var F = g(z, 2), ie = o(F);
        O(
          (G) => {
            I(Q, l(V).name), I(ie, `$${G ?? ""}`);
          },
          [
            () => (l(V).base_price * h.selections[l(V).id]).toFixed(2)
          ]
        ), w(C, te);
      });
      var k = g(S, 2), N = o(k), L = g(o(N), 2), J = o(L), Y = g(k, 2);
      {
        var U = (C) => {
          var V = rt(), te = je(V);
          me(te, 17, () => h.adjustments, pe, (z, j) => {
            var Q = Ta(), $ = o(Q), H = o($), F = g($, 2), ie = o(F);
            O(
              (G) => {
                I(H, l(j).rule_name || l(j).name), se(F, 1, l(j).amount < 0 ? "text-green-600" : "text-red-600"), I(ie, `${l(j).amount < 0 ? "-" : "+"}$${G ?? ""}`);
              },
              [
                () => Math.abs(l(j).amount).toFixed(2)
              ]
            ), w(z, Q);
          }), w(C, V);
        };
        P(Y, (C) => {
          h.adjustments.length > 0 && C(U);
        });
      }
      var X = g(Y, 2), W = o(X), M = g(o(W), 2), b = o(M);
      O(
        (C, V) => {
          I(J, `$${C ?? ""}`), I(b, `$${V ?? ""}`);
        },
        [
          () => h.basePrice.toFixed(2),
          () => h.totalPrice.toFixed(2)
        ]
      ), w(y, x);
    };
    P(D, (y) => {
      i() && h.pricingData && h.selectedOptions.length > 0 && y(R);
    });
  }
  var A = g(D, 2);
  {
    var T = (y) => {
      var x = Da(), S = o(x);
      S.__click = [Oa];
      var k = g(S, 2);
      k.__click = () => {
        const N = h.exportConfiguration(), L = new Blob([JSON.stringify(N, null, 2)], { type: "application/json" }), J = URL.createObjectURL(L), Y = document.createElement("a");
        Y.href = J, Y.download = `configuration-${Date.now()}.json`, Y.click();
      }, w(y, x);
    };
    P(A, (y) => {
      r() && y(T);
    });
  }
  O((y) => I(d, `$${y ?? ""}`), [() => h.totalPrice.toFixed(2)]), w(t, a), De();
}
tt(["click"]);
var Aa = /* @__PURE__ */ E("<li> </li>"), Na = /* @__PURE__ */ E('<div class="rounded-md bg-red-50 p-4 border border-red-200"><div class="flex"><div class="flex-shrink-0"><svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg></div> <div class="ml-3"><h3 class="text-sm font-medium text-red-800"> </h3> <div class="mt-2 text-sm text-red-700"><ul class="space-y-1"></ul></div></div></div></div>'), La = /* @__PURE__ */ E("<li> </li>"), qa = /* @__PURE__ */ E('<div class="rounded-md bg-yellow-50 p-4 border border-yellow-200"><div class="flex"><div class="flex-shrink-0"><svg class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg></div> <div class="ml-3"><h3 class="text-sm font-medium text-yellow-800"> </h3> <div class="mt-2 text-sm text-yellow-700"><ul class="space-y-1"></ul></div></div></div></div>'), ja = /* @__PURE__ */ E("<li> </li>"), Fa = /* @__PURE__ */ E('<div class="rounded-md bg-blue-50 p-4 border border-blue-200"><div class="flex"><div class="flex-shrink-0"><svg class="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg></div> <div class="ml-3"><h3 class="text-sm font-medium text-blue-800"> </h3> <div class="mt-2 text-sm text-blue-700"><ul class="space-y-1"></ul></div></div></div></div>'), Va = /* @__PURE__ */ E('<div class="space-y-3"><!> <!> <!></div>'), za = /* @__PURE__ */ E('<div class="text-center py-4"><div class="animate-spin w-6 h-6 border-2 border-gray-300 border-t-primary-600 rounded-full mx-auto"></div> <p class="mt-2 text-sm text-gray-500">Validating configuration...</p></div>'), Ba = /* @__PURE__ */ E('<div class="rounded-md bg-green-50 p-4 border border-green-200"><div class="flex"><div class="flex-shrink-0"><svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg></div> <div class="ml-3"><h3 class="text-sm font-medium text-green-800">Configuration Valid</h3> <div class="mt-2 text-sm text-green-700"><p>Your configuration meets all requirements and constraints.</p></div></div></div></div>');
function er(t, e) {
  Oe(e, !0);
  let r = oe(e, "showSuggestions", 3, !0), i = /* @__PURE__ */ he(() => h.validationResults.filter((f) => f.severity === "error" || f.level === "error")), n = /* @__PURE__ */ he(() => h.validationResults.filter((f) => f.severity === "warning" || f.level === "warning")), a = /* @__PURE__ */ he(() => h.validationResults.filter((f) => f.severity === "info" || f.level === "suggestion"));
  var s = rt(), u = je(s);
  {
    var v = (f) => {
      var _ = Va(), d = o(_);
      {
        var p = (T) => {
          var y = Na(), x = o(y), S = g(o(x), 2), k = o(S), N = o(k), L = g(k, 2), J = o(L);
          me(J, 21, () => l(i), pe, (Y, U) => {
            var X = Aa(), W = o(X);
            O(() => I(W, `• ${l(U).message ?? ""}`)), w(Y, X);
          }), O(() => I(N, `Configuration Errors (${l(i).length ?? ""})`)), w(T, y);
        };
        P(d, (T) => {
          l(i).length > 0 && T(p);
        });
      }
      var m = g(d, 2);
      {
        var D = (T) => {
          var y = qa(), x = o(y), S = g(o(x), 2), k = o(S), N = o(k), L = g(k, 2), J = o(L);
          me(J, 21, () => l(n), pe, (Y, U) => {
            var X = La(), W = o(X);
            O(() => I(W, `• ${l(U).message ?? ""}`)), w(Y, X);
          }), O(() => I(N, `Warnings (${l(n).length ?? ""})`)), w(T, y);
        };
        P(m, (T) => {
          l(n).length > 0 && T(D);
        });
      }
      var R = g(m, 2);
      {
        var A = (T) => {
          var y = Fa(), x = o(y), S = g(o(x), 2), k = o(S), N = o(k), L = g(k, 2), J = o(L);
          me(J, 21, () => l(a), pe, (Y, U) => {
            var X = ja(), W = o(X);
            O(() => I(W, `• ${l(U).message ?? ""}`)), w(Y, X);
          }), O(() => I(N, `Suggestions (${l(a).length ?? ""})`)), w(T, y);
        };
        P(R, (T) => {
          r() && l(a).length > 0 && T(A);
        });
      }
      w(f, _);
    }, c = (f, _) => {
      {
        var d = (m) => {
          var D = za();
          w(m, D);
        }, p = (m) => {
          var D = Ba();
          w(m, D);
        };
        P(
          f,
          (m) => {
            h.isValidating ? m(d) : m(p, !1);
          },
          _
        );
      }
    };
    P(u, (f) => {
      h.validationResults.length > 0 ? f(v) : f(c, !1);
    });
  }
  w(t, s), De();
}
var Ua = /* @__PURE__ */ E('<div class="text-sm text-gray-500 mt-1"> </div>'), Ha = /* @__PURE__ */ E('<div class="text-sm text-gray-600 mt-1"> </div>'), Ya = /* @__PURE__ */ E('<div class="text-sm text-gray-500"> </div>'), Qa = /* @__PURE__ */ E('<div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg"><div class="flex-1"><div class="font-medium text-gray-900"> </div> <!> <!></div> <div class="text-right"><div class="font-medium text-gray-900"> </div> <!></div></div>'), Ga = /* @__PURE__ */ E('<div class="bg-white rounded-lg border border-gray-200 p-6"><h3 class="text-lg font-medium text-gray-900 mb-4">Selected Options</h3> <div class="space-y-4"></div></div>'), Ja = (t, e) => B(e, !0), Wa = () => h.saveConfiguration(), Ka = (t, e) => B(e, !1), Za = (t) => t.stopPropagation(), Xa = (t, e, r) => e(l(r)), $a = (t, e) => B(e, !1), eo = /* @__PURE__ */ E('<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div class="bg-white rounded-lg p-6 max-w-md w-full mx-4"><h3 class="text-lg font-medium text-gray-900 mb-4">Share Configuration</h3> <div class="space-y-4"><div><label class="block text-sm font-medium text-gray-700 mb-2">Shareable Link</label> <div class="flex"><input type="text" readonly="" class="flex-1 px-3 py-2 border border-gray-300 rounded-l-md text-sm bg-gray-50"/> <button type="button" class="px-4 py-2 bg-primary-600 text-white rounded-r-md hover:bg-primary-700 transition-colors text-sm"> </button></div></div> <div class="flex justify-end space-x-3"><button type="button" class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Close</button></div></div></div></div>'), to = /* @__PURE__ */ E('<div class="space-y-6"><div class="bg-white rounded-lg border border-gray-200 p-6"><h2 class="text-xl font-semibold text-gray-900 mb-4">Configuration Summary</h2> <div class="grid grid-cols-1 md:grid-cols-3 gap-4"><div class="text-center p-4 bg-gray-50 rounded-lg"><div class="text-2xl font-bold text-primary-600"> </div> <div class="text-sm text-gray-500">Options Selected</div></div> <div class="text-center p-4 bg-gray-50 rounded-lg"><div class="text-2xl font-bold text-primary-600"> </div> <div class="text-sm text-gray-500">Complete</div></div> <div class="text-center p-4 bg-gray-50 rounded-lg"><div> </div> <div class="text-sm text-gray-500"> </div></div></div></div> <!> <div class="bg-white rounded-lg border border-gray-200 p-6"><h3 class="text-lg font-medium text-gray-900 mb-4">Validation Status</h3> <!></div> <!> <div class="bg-white rounded-lg border border-gray-200 p-6"><h3 class="text-lg font-medium text-gray-900 mb-4">Actions</h3> <div class="grid grid-cols-1 md:grid-cols-2 gap-4"><button type="button" class="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"><svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path></svg> Share Configuration</button> <button type="button" class="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"><svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg> Export Configuration</button> <button type="button" class="flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 transition-colors"><svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg> Save Configuration</button> <button type="button" class="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors"><svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 3H3m4 10v6a1 1 0 001 1h6a1 1 0 001-1v-6m-8 0V9a1 1 0 011-1h6a1 1 0 011 1v4.01"></path></svg> Request Quote</button></div></div></div> <!>', 1);
function ro(t, e) {
  Oe(e, !0);
  let r = /* @__PURE__ */ he(() => h.generateShareableUrl()), i = /* @__PURE__ */ K(!1), n = /* @__PURE__ */ K(!1);
  async function a(z) {
    try {
      await navigator.clipboard.writeText(z), B(n, !0), setTimeout(() => B(n, !1), 2e3);
    } catch (j) {
      console.warn("Failed to copy to clipboard:", j);
    }
  }
  function s() {
    const z = h.exportConfiguration(), j = new Blob([JSON.stringify(z, null, 2)], { type: "application/json" }), Q = URL.createObjectURL(j), $ = document.createElement("a");
    $.href = Q, $.download = `configuration-${Date.now()}.json`, $.click(), URL.revokeObjectURL(Q);
  }
  var u = to(), v = je(u), c = o(v), f = g(o(c), 2), _ = o(f), d = o(_), p = o(d), m = g(_, 2), D = o(m), R = o(D), A = g(m, 2), T = o(A), y = o(T), x = g(T, 2), S = o(x), k = g(c, 2);
  {
    var N = (z) => {
      var j = Ga(), Q = g(o(j), 2);
      me(Q, 21, () => h.selectedOptions, pe, ($, H) => {
        var F = Qa(), ie = o(F), G = o(ie), re = o(G), le = g(G, 2);
        {
          var Ee = (ve) => {
            var Re = Ua(), it = o(Re);
            O(() => I(it, l(H).description)), w(ve, Re);
          };
          P(le, (ve) => {
            l(H).description && ve(Ee);
          });
        }
        var Ce = g(le, 2);
        {
          var St = (ve) => {
            var Re = Ha(), it = o(Re);
            O(() => I(it, `Quantity: ${h.selections[l(H).id] ?? ""}`)), w(ve, Re);
          };
          P(Ce, (ve) => {
            h.selections[l(H).id] > 1 && ve(St);
          });
        }
        var si = g(ie, 2), _r = o(si), li = o(_r), di = g(_r, 2);
        {
          var ui = (ve) => {
            var Re = Ya(), it = o(Re);
            O((vi) => I(it, `$${vi ?? ""} each`), [
              () => l(H).base_price.toFixed(2)
            ]), w(ve, Re);
          };
          P(di, (ve) => {
            h.selections[l(H).id] > 1 && ve(ui);
          });
        }
        O(
          (ve) => {
            I(re, l(H).name), I(li, `$${ve ?? ""}`);
          },
          [
            () => (l(H).base_price * h.selections[l(H).id]).toFixed(2)
          ]
        ), w($, F);
      }), w(z, j);
    };
    P(k, (z) => {
      h.selectedOptions.length > 0 && z(N);
    });
  }
  var L = g(k, 2), J = g(o(L), 2);
  er(J, {});
  var Y = g(L, 2);
  $t(Y, { detailed: !0 });
  var U = g(Y, 2), X = g(o(U), 2), W = o(X);
  W.__click = [Ja, i];
  var M = g(W, 2);
  M.__click = s;
  var b = g(M, 2);
  b.__click = [Wa];
  var C = g(b, 2), V = g(v, 2);
  {
    var te = (z) => {
      var j = eo();
      j.__click = [Ka, i];
      var Q = o(j);
      Q.__click = [Za];
      var $ = g(o(Q), 2), H = o($), F = g(o(H), 2), ie = o(F), G = g(ie, 2);
      G.__click = [Xa, a, r];
      var re = o(G), le = g(H, 2), Ee = o(le);
      Ee.__click = [$a, i], O(() => {
        Sn(ie, l(r)), I(re, l(n) ? "Copied!" : "Copy");
      }), w(z, j);
    };
    P(V, (z) => {
      l(i) && z(te);
    });
  }
  O(() => {
    I(p, h.selectedOptions.length), I(R, `${h.completionPercentage ?? ""}%`), se(T, 1, `text-2xl font-bold ${h.isValid ? "text-green-600" : "text-red-600"}`), I(y, h.isValid ? "✓" : "✗"), I(S, h.isValid ? "Valid" : "Has Errors"), b.disabled = !h.isValid, C.disabled = !h.isValid;
  }), w(t, u), De();
}
tt(["click"]);
var io = /* @__PURE__ */ E('<div class="space-y-6"><!> <!> <!></div>'), no = /* @__PURE__ */ E('<div class="mt-4"><!> <!></div>'), ao = () => h.previousStep(), oo = (t, e) => h.canProceedToNextStep ? e() : h.nextStep(), so = /* @__PURE__ */ E('<div class="mt-8 flex justify-between items-center"><button type="button">Previous</button> <button type="button"> </button></div>'), lo = /* @__PURE__ */ E("<!> <div><div><!></div> <!></div> <!>", 1), uo = /* @__PURE__ */ E("<div><!></div>");
function vo(t, e) {
  Oe(e, !0);
  let r = oe(e, "theme", 7, "light"), i = oe(e, "apiUrl", 3, "http://localhost:8080/api/v1"), n = oe(e, "embedMode", 3, !1), a = oe(e, "onComplete", 3, null), s = oe(e, "onConfigurationChange", 3, null);
  oe(e, "onError", 3, null), oi();
  let u = /* @__PURE__ */ K(0), v = Se(n()), c = /* @__PURE__ */ K(!1);
  typeof window < "u" && (window.__API_BASE_URL__ = i()), In(() => {
    console.log("🚀 ConfiguratorApp mounting with modelId:", e.modelId), h.initialize(), l(c) || (h.setModelId(e.modelId), B(c, !0)), document.documentElement.setAttribute("data-theme", r()), n() && f();
  }), xe(() => {
    l(c) && e.modelId !== h.modelId && (console.log("📝 ModelId prop changed, updating store:", e.modelId), h.setModelId(e.modelId));
  });
  function f() {
    window.addEventListener("message", _), window.parent !== window && window.parent.postMessage(
      {
        type: "cpq-configurator-ready",
        modelId: e.modelId
      },
      "*"
    ), new ResizeObserver(() => {
      window.parent !== window && window.parent.postMessage(
        {
          type: "cpq-configurator-resize",
          height: document.body.scrollHeight
        },
        "*"
      );
    }).observe(document.body);
  }
  function _(y) {
    const { type: x, data: S } = y.data;
    switch (x) {
      case "cpq-set-theme":
        r(S.theme), document.documentElement.setAttribute("data-theme", r());
        break;
      case "cpq-load-configuration":
        S.config && h.loadFromShareableUrl(S.config);
        break;
      case "cpq-get-configuration":
        window.parent.postMessage(
          {
            type: "cpq-configuration-response",
            configuration: h.exportConfiguration()
          },
          "*"
        );
        break;
    }
  }
  function d() {
    ur(u), h.loadModel();
  }
  function p() {
    s() && s()(h.exportConfiguration()), n() && window.parent !== window && window.parent.postMessage(
      {
        type: "cpq-configuration-change",
        configuration: h.exportConfiguration()
      },
      "*"
    );
  }
  function m() {
    const y = h.exportConfiguration();
    a() && a()(y), n() && window.parent !== window && window.parent.postMessage(
      {
        type: "cpq-configuration-complete",
        configuration: y
      },
      "*"
    );
  }
  xe(() => {
    l(c) && Object.keys(h.selections).length > 0 && p();
  });
  var D = uo(), R = o(D);
  {
    var A = (y) => {
      Wn(y, {
        get error() {
          return h.error;
        },
        onRetry: d,
        get retryCount() {
          return l(u);
        }
      });
    }, T = (y, x) => {
      {
        var S = (N) => {
          Er(N, {
            message: "Loading product configuration...",
            size: "large"
          });
        }, k = (N, L) => {
          {
            var J = (U) => {
              var X = lo(), W = je(X);
              {
                var M = (F) => {
                  Fn(F, {
                    get currentStep() {
                      return h.currentStep;
                    },
                    totalSteps: 4,
                    get completionPercentage() {
                      return h.completionPercentage;
                    }
                  });
                };
                P(W, (F) => {
                  n() || F(M);
                });
              }
              var b = g(W, 2), C = o(b), V = o(C);
              {
                var te = (F) => {
                  var ie = rt(), G = je(ie);
                  me(G, 17, () => h.model.option_groups, pe, (re, le) => {
                    wa(re, {
                      get group() {
                        return l(le);
                      }
                    });
                  }), w(F, ie);
                };
                P(V, (F) => {
                  h.model.option_groups && F(te);
                });
              }
              var z = g(C, 2);
              {
                var j = (F) => {
                  var ie = io(), G = o(ie);
                  er(G, {});
                  var re = g(G, 2);
                  $t(re, { detailed: !0 });
                  var le = g(re, 2);
                  {
                    var Ee = (Ce) => {
                      ro(Ce, {});
                    };
                    P(le, (Ce) => {
                      h.completionPercentage >= 100 && Ce(Ee);
                    });
                  }
                  w(F, ie);
                }, Q = (F) => {
                  var ie = no(), G = o(ie);
                  $t(G, { detailed: !1 });
                  var re = g(G, 2);
                  er(re, {}), w(F, ie);
                };
                P(z, (F) => {
                  n() ? F(Q, !1) : F(j);
                });
              }
              var $ = g(b, 2);
              {
                var H = (F) => {
                  var ie = so(), G = o(ie);
                  G.__click = [ao];
                  var re = g(G, 2);
                  re.__click = [oo, m];
                  var le = o(re);
                  O(() => {
                    se(G, 1, `flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors
                 ${h.currentStep === 0 ? "opacity-50 cursor-not-allowed" : ""}`), G.disabled = h.currentStep === 0, se(re, 1, `flex items-center px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 transition-colors
                 ${!h.canProceedToNextStep && h.currentStep === 3 ? "opacity-50 cursor-not-allowed" : ""}`), re.disabled = !h.canProceedToNextStep && h.currentStep === 3, I(le, h.currentStep === 3 ? "Complete Configuration" : "Next");
                  }), w(F, ie);
                };
                P($, (F) => {
                  n() || F(H);
                });
              }
              O(() => {
                se(b, 1, `grid grid-cols-1 ${n() ? "lg:grid-cols-1" : "lg:grid-cols-3"} gap-6`), se(C, 1, `${n() ? "col-span-1" : "col-span-2"} space-y-6`);
              }), w(U, X);
            }, Y = (U) => {
              Er(U, {
                message: "Initializing configurator...",
                size: "large"
              });
            };
            P(
              N,
              (U) => {
                h.model ? U(J) : U(Y, !1);
              },
              L
            );
          }
        };
        P(
          y,
          (N) => {
            h.isLoading ? N(S) : N(k, !1);
          },
          x
        );
      }
    };
    P(R, (y) => {
      h.error ? y(A) : y(T, !1);
    });
  }
  O(() => {
    se(D, 1, `cpq-configurator ${n() ? "cpq-embed-mode" : ""} ${v ? "cpq-compact" : ""}`), ni(D, "data-theme", r());
  }), w(t, D), De();
}
tt(["click"]);
window.CPQConfigurator = {
  // Main embed function
  embed: function(t) {
    const {
      container: e,
      modelId: r,
      theme: i = "light",
      apiUrl: n = "http://localhost:8080/api/v1",
      onComplete: a = null,
      onConfigurationChange: s = null,
      onError: u = null,
      ...v
    } = t;
    if (!e || !r)
      throw new Error("CPQConfigurator.embed() requires container and modelId options");
    const c = typeof e == "string" ? document.querySelector(e) : e;
    if (!c)
      throw new Error(`Container element not found: ${e}`);
    const f = fn(vo, {
      target: c,
      props: {
        modelId: r,
        theme: i,
        apiUrl: n,
        embedMode: !1,
        // Widget mode, not iframe embed
        onComplete: a,
        onConfigurationChange: s,
        onError: u,
        ...v
      }
    });
    return {
      // Return control methods
      destroy: () => {
        f && typeof f.destroy == "function" && f.destroy();
      },
      // Update props
      update: (_) => {
        f && typeof f.$set == "function" && f.$set(_);
      }
    };
  },
  // Version info
  version: "1.0.0"
};
document.addEventListener("DOMContentLoaded", function() {
  document.querySelectorAll("[data-cpq-configurator]").forEach((e) => {
    const r = e.getAttribute("data-cpq-model-id"), i = e.getAttribute("data-cpq-theme") || "light", n = e.getAttribute("data-cpq-api-url") || "http://localhost:8080/api/v1";
    r && window.CPQConfigurator.embed({
      container: e,
      modelId: r,
      theme: i,
      apiUrl: n,
      onComplete: (a) => {
        const s = new CustomEvent("cpq-configuration-complete", {
          detail: { configuration: a },
          bubbles: !0
        });
        e.dispatchEvent(s);
      },
      onConfigurationChange: (a) => {
        const s = new CustomEvent("cpq-configuration-change", {
          detail: { configuration: a },
          bubbles: !0
        });
        e.dispatchEvent(s);
      },
      onError: (a) => {
        const s = new CustomEvent("cpq-error", {
          detail: { error: a },
          bubbles: !0
        });
        e.dispatchEvent(s);
      }
    });
  });
});
const fo = window.CPQConfigurator;
export {
  fo as default
};
