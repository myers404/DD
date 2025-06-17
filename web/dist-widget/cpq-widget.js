var Xi = (t) => {
  throw TypeError(t);
};
var $i = (t, e, i) => e.has(t) || Xi("Cannot " + i);
var N = (t, e, i) => ($i(t, e, "read from private field"), i ? i.call(t) : e.get(t)), Ce = (t, e, i) => e.has(t) ? Xi("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), Ie = (t, e, i, r) => ($i(t, e, "write to private field"), r ? r.call(t, i) : e.set(t, i), i);
var mi = Array.isArray, Jr = Array.prototype.indexOf, Ri = Array.from, Zr = Object.defineProperty, Et = Object.getOwnPropertyDescriptor, Xr = Object.getOwnPropertyDescriptors, $r = Object.prototype, en = Array.prototype, _r = Object.getPrototypeOf, er = Object.isExtensible;
const tn = () => {
};
function rn(t) {
  for (var e = 0; e < t.length; e++)
    t[e]();
}
function Mi(t, e) {
  if (Array.isArray(t))
    return t;
  if (!(Symbol.iterator in t))
    return Array.from(t);
  const i = [];
  for (const r of t)
    if (i.push(r), i.length === e) break;
  return i;
}
const Ke = 2, hr = 4, Vi = 8, Li = 16, vt = 32, St = 64, Ni = 128, Qe = 256, vi = 512, Ye = 1024, lt = 2048, xt = 4096, at = 8192, zi = 16384, pr = 32768, bi = 65536, nn = 1 << 19, gr = 1 << 20, Pi = 1 << 21, oi = Symbol("$state"), sn = Symbol("legacy props"), an = Symbol("");
function mr(t) {
  return t === this.v;
}
function on(t, e) {
  return t != t ? e == e : t !== e || t !== null && typeof t == "object" || typeof t == "function";
}
function Fi(t) {
  return !on(t, this.v);
}
function ln(t) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function vn() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function cn(t) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function un() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function dn(t) {
  throw new Error("https://svelte.dev/e/props_invalid_value");
}
function fn() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function _n() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function hn() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
const Ui = 1, Gi = 2, br = 4, pn = 8, gn = 16, mn = 1, bn = 4, yn = 8, wn = 16, Sn = 1, xn = 2, Ge = Symbol(), kn = "http://www.w3.org/1999/xhtml";
function ji(t) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
let Ue = null;
function tr(t) {
  Ue = t;
}
function Ze(t, e = !1, i) {
  var r = Ue = {
    p: Ue,
    c: null,
    d: !1,
    e: null,
    m: !1,
    s: t,
    x: null,
    l: null
  };
  qn(() => {
    r.d = !0;
  });
}
function Xe(t) {
  const e = Ue;
  if (e !== null) {
    t !== void 0 && (e.x = t);
    const l = e.e;
    if (l !== null) {
      var i = Ee, r = ke;
      e.e = null;
      try {
        for (var n = 0; n < l.length; n++) {
          var s = l[n];
          Xt(s.effect), ft(s.reaction), Tr(s.fn);
        }
      } finally {
        Xt(i), ft(r);
      }
    }
    Ue = e.p, e.m = !0;
  }
  return t || /** @type {T} */
  {};
}
function yr() {
  return !0;
}
function Me(t) {
  if (typeof t != "object" || t === null || oi in t)
    return t;
  const e = _r(t);
  if (e !== $r && e !== en)
    return t;
  var i = /* @__PURE__ */ new Map(), r = mi(t), n = /* @__PURE__ */ Q(0), s = ke, l = (v) => {
    var d = ke;
    ft(s);
    var _ = v();
    return ft(d), _;
  };
  return r && i.set("length", /* @__PURE__ */ Q(
    /** @type {any[]} */
    t.length
  )), new Proxy(
    /** @type {any} */
    t,
    {
      defineProperty(v, d, _) {
        return (!("value" in _) || _.configurable === !1 || _.enumerable === !1 || _.writable === !1) && fn(), l(() => {
          var S = i.get(d);
          S === void 0 ? (S = /* @__PURE__ */ Q(_.value), i.set(d, S)) : U(S, _.value, !0);
        }), !0;
      },
      deleteProperty(v, d) {
        var _ = i.get(d);
        if (_ === void 0) {
          if (d in v) {
            const c = l(() => /* @__PURE__ */ Q(Ge));
            i.set(d, c), Ii(n);
          }
        } else {
          if (r && typeof d == "string") {
            var S = (
              /** @type {Source<number>} */
              i.get("length")
            ), b = Number(d);
            Number.isInteger(b) && b < S.v && U(S, b);
          }
          U(_, Ge), Ii(n);
        }
        return !0;
      },
      get(v, d, _) {
        if (d === oi)
          return t;
        var S = i.get(d), b = d in v;
        if (S === void 0 && (!b || Et(v, d)?.writable) && (S = l(() => {
          var p = Me(b ? v[d] : Ge), w = /* @__PURE__ */ Q(p);
          return w;
        }), i.set(d, S)), S !== void 0) {
          var c = o(S);
          return c === Ge ? void 0 : c;
        }
        return Reflect.get(v, d, _);
      },
      getOwnPropertyDescriptor(v, d) {
        var _ = Reflect.getOwnPropertyDescriptor(v, d);
        if (_ && "value" in _) {
          var S = i.get(d);
          S && (_.value = o(S));
        } else if (_ === void 0) {
          var b = i.get(d), c = b?.v;
          if (b !== void 0 && c !== Ge)
            return {
              enumerable: !0,
              configurable: !0,
              value: c,
              writable: !0
            };
        }
        return _;
      },
      has(v, d) {
        if (d === oi)
          return !0;
        var _ = i.get(d), S = _ !== void 0 && _.v !== Ge || Reflect.has(v, d);
        if (_ !== void 0 || Ee !== null && (!S || Et(v, d)?.writable)) {
          _ === void 0 && (_ = l(() => {
            var c = S ? Me(v[d]) : Ge, p = /* @__PURE__ */ Q(c);
            return p;
          }), i.set(d, _));
          var b = o(_);
          if (b === Ge)
            return !1;
        }
        return S;
      },
      set(v, d, _, S) {
        var b = i.get(d), c = d in v;
        if (r && d === "length")
          for (var p = _; p < /** @type {Source<number>} */
          b.v; p += 1) {
            var w = i.get(p + "");
            w !== void 0 ? U(w, Ge) : p in v && (w = l(() => /* @__PURE__ */ Q(Ge)), i.set(p + "", w));
          }
        if (b === void 0)
          (!c || Et(v, d)?.writable) && (b = l(() => {
            var T = /* @__PURE__ */ Q(void 0);
            return U(T, Me(_)), T;
          }), i.set(d, b));
        else {
          c = b.v !== Ge;
          var q = l(() => Me(_));
          U(b, q);
        }
        var M = Reflect.getOwnPropertyDescriptor(v, d);
        if (M?.set && M.set.call(S, _), !c) {
          if (r && typeof d == "string") {
            var A = (
              /** @type {Source<number>} */
              i.get("length")
            ), x = Number(d);
            Number.isInteger(x) && x >= A.v && U(A, x + 1);
          }
          Ii(n);
        }
        return !0;
      },
      ownKeys(v) {
        o(n);
        var d = Reflect.ownKeys(v).filter((b) => {
          var c = i.get(b);
          return c === void 0 || c.v !== Ge;
        });
        for (var [_, S] of i)
          S.v !== Ge && !(_ in v) && d.push(_);
        return d;
      },
      setPrototypeOf() {
        _n();
      }
    }
  );
}
function Ii(t, e = 1) {
  U(t, t.v + e);
}
// @__NO_SIDE_EFFECTS__
function yi(t) {
  var e = Ke | lt, i = ke !== null && (ke.f & Ke) !== 0 ? (
    /** @type {Derived} */
    ke
  ) : null;
  return Ee === null || i !== null && (i.f & Qe) !== 0 ? e |= Qe : Ee.f |= gr, {
    ctx: Ue,
    deps: null,
    effects: null,
    equals: mr,
    f: e,
    fn: t,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      null
    ),
    wv: 0,
    parent: i ?? Ee
  };
}
// @__NO_SIDE_EFFECTS__
function ye(t) {
  const e = /* @__PURE__ */ yi(t);
  return Vr(e), e;
}
// @__NO_SIDE_EFFECTS__
function En(t) {
  const e = /* @__PURE__ */ yi(t);
  return e.equals = Fi, e;
}
function wr(t) {
  var e = t.effects;
  if (e !== null) {
    t.effects = null;
    for (var i = 0; i < e.length; i += 1)
      tt(
        /** @type {Effect} */
        e[i]
      );
  }
}
function An(t) {
  for (var e = t.parent; e !== null; ) {
    if ((e.f & Ke) === 0)
      return (
        /** @type {Effect} */
        e
      );
    e = e.parent;
  }
  return null;
}
function Sr(t) {
  var e, i = Ee;
  Xt(An(t));
  try {
    wr(t), e = Fr(t);
  } finally {
    Xt(i);
  }
  return e;
}
function xr(t) {
  var e = Sr(t);
  if (t.equals(e) || (t.v = e, t.wv = Nr()), !ei) {
    var i = (dt || (t.f & Qe) !== 0) && t.deps !== null ? xt : Ye;
    Je(t, i);
  }
}
const ri = /* @__PURE__ */ new Map();
function ci(t, e) {
  var i = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: t,
    reactions: null,
    equals: mr,
    rv: 0,
    wv: 0
  };
  return i;
}
// @__NO_SIDE_EFFECTS__
function Q(t, e) {
  const i = ci(t);
  return Vr(i), i;
}
// @__NO_SIDE_EFFECTS__
function kr(t, e = !1, i = !0) {
  const r = ci(t);
  return e || (r.equals = Fi), r;
}
function U(t, e, i = !1) {
  ke !== null && !et && yr() && (ke.f & (Ke | Li)) !== 0 && !ot?.includes(t) && hn();
  let r = i ? Me(e) : e;
  return Di(t, r);
}
function Di(t, e) {
  if (!t.equals(e)) {
    var i = t.v;
    ei ? ri.set(t, e) : ri.set(t, i), t.v = e, (t.f & Ke) !== 0 && ((t.f & lt) !== 0 && Sr(
      /** @type {Derived} */
      t
    ), Je(t, (t.f & Qe) === 0 ? Ye : xt)), t.wv = Nr(), Er(t, lt), Ee !== null && (Ee.f & Ye) !== 0 && (Ee.f & (vt | St)) === 0 && (We === null ? Fn([t]) : We.push(t));
  }
  return e;
}
function Er(t, e) {
  var i = t.reactions;
  if (i !== null)
    for (var r = i.length, n = 0; n < r; n++) {
      var s = i[n], l = s.f;
      (l & lt) === 0 && (Je(s, e), (l & (Ye | Qe)) !== 0 && ((l & Ke) !== 0 ? Er(
        /** @type {Derived} */
        s,
        xt
      ) : Ei(
        /** @type {Effect} */
        s
      )));
    }
}
let Cn = !1;
var ir, Ar, Cr, Ir;
function In() {
  if (ir === void 0) {
    ir = window, Ar = /Firefox/.test(navigator.userAgent);
    var t = Element.prototype, e = Node.prototype, i = Text.prototype;
    Cr = Et(e, "firstChild").get, Ir = Et(e, "nextSibling").get, er(t) && (t.__click = void 0, t.__className = void 0, t.__attributes = null, t.__style = void 0, t.__e = void 0), er(i) && (i.__t = void 0);
  }
}
function wi(t = "") {
  return document.createTextNode(t);
}
// @__NO_SIDE_EFFECTS__
function Jt(t) {
  return Cr.call(t);
}
// @__NO_SIDE_EFFECTS__
function Si(t) {
  return Ir.call(t);
}
function a(t, e) {
  return /* @__PURE__ */ Jt(t);
}
function He(t, e) {
  {
    var i = (
      /** @type {DocumentFragment} */
      /* @__PURE__ */ Jt(
        /** @type {Node} */
        t
      )
    );
    return i instanceof Comment && i.data === "" ? /* @__PURE__ */ Si(i) : i;
  }
}
function u(t, e = 1, i = !1) {
  let r = t;
  for (; e--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ Si(r);
  return r;
}
function Tn(t) {
  t.textContent = "";
}
function Pn(t) {
  Ee === null && ke === null && cn(), ke !== null && (ke.f & Qe) !== 0 && Ee === null && vn(), ei && ln();
}
function Dn(t, e) {
  var i = e.last;
  i === null ? e.last = e.first = t : (i.next = t, t.prev = i, e.last = t);
}
function $t(t, e, i, r = !0) {
  var n = Ee, s = {
    ctx: Ue,
    deps: null,
    nodes_start: null,
    nodes_end: null,
    f: t | lt,
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
  if (i)
    try {
      Hi(s), s.f |= pr;
    } catch (d) {
      throw tt(s), d;
    }
  else e !== null && Ei(s);
  var l = i && s.deps === null && s.first === null && s.nodes_start === null && s.teardown === null && (s.f & (gr | Ni)) === 0;
  if (!l && r && (n !== null && Dn(s, n), ke !== null && (ke.f & Ke) !== 0)) {
    var v = (
      /** @type {Derived} */
      ke
    );
    (v.effects ?? (v.effects = [])).push(s);
  }
  return s;
}
function qn(t) {
  const e = $t(Vi, null, !1);
  return Je(e, Ye), e.teardown = t, e;
}
function bt(t) {
  Pn();
  var e = Ee !== null && (Ee.f & vt) !== 0 && Ue !== null && !Ue.m;
  if (e) {
    var i = (
      /** @type {ComponentContext} */
      Ue
    );
    (i.e ?? (i.e = [])).push({
      fn: t,
      effect: Ee,
      reaction: ke
    });
  } else {
    var r = Tr(t);
    return r;
  }
}
function On(t) {
  const e = $t(St, t, !0);
  return () => {
    tt(e);
  };
}
function Rn(t) {
  const e = $t(St, t, !0);
  return (i = {}) => new Promise((r) => {
    i.outro ? ui(e, () => {
      tt(e), r(void 0);
    }) : (tt(e), r(void 0));
  });
}
function Tr(t) {
  return $t(hr, t, !1);
}
function k(t, e = [], i = yi) {
  const r = e.map(i);
  return xi(() => t(...r.map(o)));
}
function xi(t, e = 0) {
  return $t(Vi | Li | e, t, !0);
}
function Zt(t, e = !0) {
  return $t(Vi | vt, t, !0, e);
}
function Pr(t) {
  var e = t.teardown;
  if (e !== null) {
    const i = ei, r = ke;
    rr(!0), ft(null);
    try {
      e.call(null);
    } finally {
      rr(i), ft(r);
    }
  }
}
function Dr(t, e = !1) {
  var i = t.first;
  for (t.first = t.last = null; i !== null; ) {
    var r = i.next;
    (i.f & St) !== 0 ? i.parent = null : tt(i, e), i = r;
  }
}
function Mn(t) {
  for (var e = t.first; e !== null; ) {
    var i = e.next;
    (e.f & vt) === 0 && tt(e), e = i;
  }
}
function tt(t, e = !0) {
  var i = !1;
  (e || (t.f & nn) !== 0) && t.nodes_start !== null && t.nodes_end !== null && (Vn(
    t.nodes_start,
    /** @type {TemplateNode} */
    t.nodes_end
  ), i = !0), Dr(t, e && !i), pi(t, 0), Je(t, zi);
  var r = t.transitions;
  if (r !== null)
    for (const s of r)
      s.stop();
  Pr(t);
  var n = t.parent;
  n !== null && n.first !== null && qr(t), t.next = t.prev = t.teardown = t.ctx = t.deps = t.fn = t.nodes_start = t.nodes_end = null;
}
function Vn(t, e) {
  for (; t !== null; ) {
    var i = t === e ? null : (
      /** @type {TemplateNode} */
      /* @__PURE__ */ Si(t)
    );
    t.remove(), t = i;
  }
}
function qr(t) {
  var e = t.parent, i = t.prev, r = t.next;
  i !== null && (i.next = r), r !== null && (r.prev = i), e !== null && (e.first === t && (e.first = r), e.last === t && (e.last = i));
}
function ui(t, e) {
  var i = [];
  Bi(t, i, !0), Or(i, () => {
    tt(t), e && e();
  });
}
function Or(t, e) {
  var i = t.length;
  if (i > 0) {
    var r = () => --i || e();
    for (var n of t)
      n.out(r);
  } else
    e();
}
function Bi(t, e, i) {
  if ((t.f & at) === 0) {
    if (t.f ^= at, t.transitions !== null)
      for (const l of t.transitions)
        (l.is_global || i) && e.push(l);
    for (var r = t.first; r !== null; ) {
      var n = r.next, s = (r.f & bi) !== 0 || (r.f & vt) !== 0;
      Bi(r, e, s ? i : !1), r = n;
    }
  }
}
function di(t) {
  Rr(t, !0);
}
function Rr(t, e) {
  if ((t.f & at) !== 0) {
    t.f ^= at, (t.f & Ye) !== 0 && (Je(t, lt), Ei(t));
    for (var i = t.first; i !== null; ) {
      var r = i.next, n = (i.f & bi) !== 0 || (i.f & vt) !== 0;
      Rr(i, n ? e : !1), i = r;
    }
    if (t.transitions !== null)
      for (const s of t.transitions)
        (s.is_global || e) && s.in();
  }
}
let fi = [];
function Ln() {
  var t = fi;
  fi = [], rn(t);
}
function Nn(t) {
  fi.length === 0 && queueMicrotask(Ln), fi.push(t);
}
function zn(t) {
  var e = (
    /** @type {Effect} */
    Ee
  );
  if ((e.f & pr) === 0) {
    if ((e.f & Ni) === 0)
      throw t;
    e.fn(t);
  } else
    Mr(t, e);
}
function Mr(t, e) {
  for (; e !== null; ) {
    if ((e.f & Ni) !== 0)
      try {
        e.fn(t);
        return;
      } catch {
      }
    e = e.parent;
  }
  throw t;
}
let qi = !1, _i = null, wt = !1, ei = !1;
function rr(t) {
  ei = t;
}
let li = [];
let ke = null, et = !1;
function ft(t) {
  ke = t;
}
let Ee = null;
function Xt(t) {
  Ee = t;
}
let ot = null;
function Vr(t) {
  ke !== null && ke.f & Pi && (ot === null ? ot = [t] : ot.push(t));
}
let Fe = null, Be = 0, We = null;
function Fn(t) {
  We = t;
}
let Lr = 1, hi = 0, dt = !1;
function Nr() {
  return ++Lr;
}
function ki(t) {
  var e = t.f;
  if ((e & lt) !== 0)
    return !0;
  if ((e & xt) !== 0) {
    var i = t.deps, r = (e & Qe) !== 0;
    if (i !== null) {
      var n, s, l = (e & vi) !== 0, v = r && Ee !== null && !dt, d = i.length;
      if (l || v) {
        var _ = (
          /** @type {Derived} */
          t
        ), S = _.parent;
        for (n = 0; n < d; n++)
          s = i[n], (l || !s?.reactions?.includes(_)) && (s.reactions ?? (s.reactions = [])).push(_);
        l && (_.f ^= vi), v && S !== null && (S.f & Qe) === 0 && (_.f ^= Qe);
      }
      for (n = 0; n < d; n++)
        if (s = i[n], ki(
          /** @type {Derived} */
          s
        ) && xr(
          /** @type {Derived} */
          s
        ), s.wv > t.wv)
          return !0;
    }
    (!r || Ee !== null && !dt) && Je(t, Ye);
  }
  return !1;
}
function zr(t, e, i = !0) {
  var r = t.reactions;
  if (r !== null)
    for (var n = 0; n < r.length; n++) {
      var s = r[n];
      ot?.includes(t) || ((s.f & Ke) !== 0 ? zr(
        /** @type {Derived} */
        s,
        e,
        !1
      ) : e === s && (i ? Je(s, lt) : (s.f & Ye) !== 0 && Je(s, xt), Ei(
        /** @type {Effect} */
        s
      )));
    }
}
function Fr(t) {
  var p;
  var e = Fe, i = Be, r = We, n = ke, s = dt, l = ot, v = Ue, d = et, _ = t.f;
  Fe = /** @type {null | Value[]} */
  null, Be = 0, We = null, dt = (_ & Qe) !== 0 && (et || !wt || ke === null), ke = (_ & (vt | St)) === 0 ? t : null, ot = null, tr(t.ctx), et = !1, hi++, t.f |= Pi;
  try {
    var S = (
      /** @type {Function} */
      (0, t.fn)()
    ), b = t.deps;
    if (Fe !== null) {
      var c;
      if (pi(t, Be), b !== null && Be > 0)
        for (b.length = Be + Fe.length, c = 0; c < Fe.length; c++)
          b[Be + c] = Fe[c];
      else
        t.deps = b = Fe;
      if (!dt)
        for (c = Be; c < b.length; c++)
          ((p = b[c]).reactions ?? (p.reactions = [])).push(t);
    } else b !== null && Be < b.length && (pi(t, Be), b.length = Be);
    if (yr() && We !== null && !et && b !== null && (t.f & (Ke | xt | lt)) === 0)
      for (c = 0; c < /** @type {Source[]} */
      We.length; c++)
        zr(
          We[c],
          /** @type {Effect} */
          t
        );
    return n !== null && n !== t && (hi++, We !== null && (r === null ? r = We : r.push(.../** @type {Source[]} */
    We))), S;
  } catch (w) {
    zn(w);
  } finally {
    Fe = e, Be = i, We = r, ke = n, dt = s, ot = l, tr(v), et = d, t.f ^= Pi;
  }
}
function Un(t, e) {
  let i = e.reactions;
  if (i !== null) {
    var r = Jr.call(i, t);
    if (r !== -1) {
      var n = i.length - 1;
      n === 0 ? i = e.reactions = null : (i[r] = i[n], i.pop());
    }
  }
  i === null && (e.f & Ke) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (Fe === null || !Fe.includes(e)) && (Je(e, xt), (e.f & (Qe | vi)) === 0 && (e.f ^= vi), wr(
    /** @type {Derived} **/
    e
  ), pi(
    /** @type {Derived} **/
    e,
    0
  ));
}
function pi(t, e) {
  var i = t.deps;
  if (i !== null)
    for (var r = e; r < i.length; r++)
      Un(t, i[r]);
}
function Hi(t) {
  var e = t.f;
  if ((e & zi) === 0) {
    Je(t, Ye);
    var i = Ee, r = wt;
    Ee = t, wt = !0;
    try {
      (e & Li) !== 0 ? Mn(t) : Dr(t), Pr(t);
      var n = Fr(t);
      t.teardown = typeof n == "function" ? n : null, t.wv = Lr;
      var s;
    } finally {
      wt = r, Ee = i;
    }
  }
}
function Gn() {
  try {
    un();
  } catch (t) {
    if (_i !== null)
      Mr(t, _i);
    else
      throw t;
  }
}
function jn() {
  var t = wt;
  try {
    var e = 0;
    for (wt = !0; li.length > 0; ) {
      e++ > 1e3 && Gn();
      var i = li, r = i.length;
      li = [];
      for (var n = 0; n < r; n++) {
        var s = Hn(i[n]);
        Bn(s);
      }
      ri.clear();
    }
  } finally {
    qi = !1, wt = t, _i = null;
  }
}
function Bn(t) {
  var e = t.length;
  if (e !== 0)
    for (var i = 0; i < e; i++) {
      var r = t[i];
      (r.f & (zi | at)) === 0 && ki(r) && (Hi(r), r.deps === null && r.first === null && r.nodes_start === null && (r.teardown === null ? qr(r) : r.fn = null));
    }
}
function Ei(t) {
  qi || (qi = !0, queueMicrotask(jn));
  for (var e = _i = t; e.parent !== null; ) {
    e = e.parent;
    var i = e.f;
    if ((i & (St | vt)) !== 0) {
      if ((i & Ye) === 0) return;
      e.f ^= Ye;
    }
  }
  li.push(e);
}
function Hn(t) {
  for (var e = [], i = t; i !== null; ) {
    var r = i.f, n = (r & (vt | St)) !== 0, s = n && (r & Ye) !== 0;
    if (!s && (r & at) === 0) {
      (r & hr) !== 0 ? e.push(i) : n ? i.f ^= Ye : ki(i) && Hi(i);
      var l = i.first;
      if (l !== null) {
        i = l;
        continue;
      }
    }
    var v = i.parent;
    for (i = i.next; i === null && v !== null; )
      i = v.next, v = v.parent;
  }
  return e;
}
function o(t) {
  var e = t.f, i = (e & Ke) !== 0;
  if (ke !== null && !et) {
    if (!ot?.includes(t)) {
      var r = ke.deps;
      t.rv < hi && (t.rv = hi, Fe === null && r !== null && r[Be] === t ? Be++ : Fe === null ? Fe = [t] : (!dt || !Fe.includes(t)) && Fe.push(t));
    }
  } else if (i && /** @type {Derived} */
  t.deps === null && /** @type {Derived} */
  t.effects === null) {
    var n = (
      /** @type {Derived} */
      t
    ), s = n.parent;
    s !== null && (s.f & Qe) === 0 && (n.f ^= Qe);
  }
  return i && (n = /** @type {Derived} */
  t, ki(n) && xr(n)), ei && ri.has(t) ? ri.get(t) : t.v;
}
function gi(t) {
  var e = et;
  try {
    return et = !0, t();
  } finally {
    et = e;
  }
}
const Qn = -7169;
function Je(t, e) {
  t.f = t.f & Qn | e;
}
const Yn = ["touchstart", "touchmove"];
function Wn(t) {
  return Yn.includes(t);
}
const Ur = /* @__PURE__ */ new Set(), Oi = /* @__PURE__ */ new Set();
function ht(t) {
  for (var e = 0; e < t.length; e++)
    Ur.add(t[e]);
  for (var i of Oi)
    i(t);
}
function si(t) {
  var e = this, i = (
    /** @type {Node} */
    e.ownerDocument
  ), r = t.type, n = t.composedPath?.() || [], s = (
    /** @type {null | Element} */
    n[0] || t.target
  ), l = 0, v = t.__root;
  if (v) {
    var d = n.indexOf(v);
    if (d !== -1 && (e === document || e === /** @type {any} */
    window)) {
      t.__root = e;
      return;
    }
    var _ = n.indexOf(e);
    if (_ === -1)
      return;
    d <= _ && (l = d);
  }
  if (s = /** @type {Element} */
  n[l] || t.target, s !== e) {
    Zr(t, "currentTarget", {
      configurable: !0,
      get() {
        return s || i;
      }
    });
    var S = ke, b = Ee;
    ft(null), Xt(null);
    try {
      for (var c, p = []; s !== null; ) {
        var w = s.assignedSlot || s.parentNode || /** @type {any} */
        s.host || null;
        try {
          var q = s["__" + r];
          if (q != null && (!/** @type {any} */
          s.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          t.target === s))
            if (mi(q)) {
              var [M, ...A] = q;
              M.apply(s, [t, ...A]);
            } else
              q.call(s, t);
        } catch (x) {
          c ? p.push(x) : c = x;
        }
        if (t.cancelBubble || w === e || w === null)
          break;
        s = w;
      }
      if (c) {
        for (let x of p)
          queueMicrotask(() => {
            throw x;
          });
        throw c;
      }
    } finally {
      t.__root = e, delete t.currentTarget, ft(S), Xt(b);
    }
  }
}
function Gr(t) {
  var e = document.createElement("template");
  return e.innerHTML = t.replaceAll("<!>", "<!---->"), e.content;
}
function ni(t, e) {
  var i = (
    /** @type {Effect} */
    Ee
  );
  i.nodes_start === null && (i.nodes_start = t, i.nodes_end = e);
}
// @__NO_SIDE_EFFECTS__
function h(t, e) {
  var i = (e & Sn) !== 0, r = (e & xn) !== 0, n, s = !t.startsWith("<!>");
  return () => {
    n === void 0 && (n = Gr(s ? t : "<!>" + t), i || (n = /** @type {Node} */
    /* @__PURE__ */ Jt(n)));
    var l = (
      /** @type {TemplateNode} */
      r || Ar ? document.importNode(n, !0) : n.cloneNode(!0)
    );
    if (i) {
      var v = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Jt(l)
      ), d = (
        /** @type {TemplateNode} */
        l.lastChild
      );
      ni(v, d);
    } else
      ni(l, l);
    return l;
  };
}
// @__NO_SIDE_EFFECTS__
function Kn(t, e, i = "svg") {
  var r = !t.startsWith("<!>"), n = `<${i}>${r ? t : "<!>" + t}</${i}>`, s;
  return () => {
    if (!s) {
      var l = (
        /** @type {DocumentFragment} */
        Gr(n)
      ), v = (
        /** @type {Element} */
        /* @__PURE__ */ Jt(l)
      );
      s = /** @type {Element} */
      /* @__PURE__ */ Jt(v);
    }
    var d = (
      /** @type {TemplateNode} */
      s.cloneNode(!0)
    );
    return ni(d, d), d;
  };
}
// @__NO_SIDE_EFFECTS__
function Jn(t, e) {
  return /* @__PURE__ */ Kn(t, e, "svg");
}
function yt(t = "") {
  {
    var e = wi(t + "");
    return ni(e, e), e;
  }
}
function st() {
  var t = document.createDocumentFragment(), e = document.createComment(""), i = wi();
  return t.append(e, i), ni(e, i), t;
}
function f(t, e) {
  t !== null && t.before(
    /** @type {Node} */
    e
  );
}
function y(t, e) {
  var i = e == null ? "" : typeof e == "object" ? e + "" : e;
  i !== (t.__t ?? (t.__t = t.nodeValue)) && (t.__t = i, t.nodeValue = i + "");
}
function Zn(t, e) {
  return Xn(t, e);
}
const kt = /* @__PURE__ */ new Map();
function Xn(t, { target: e, anchor: i, props: r = {}, events: n, context: s, intro: l = !0 }) {
  In();
  var v = /* @__PURE__ */ new Set(), d = (b) => {
    for (var c = 0; c < b.length; c++) {
      var p = b[c];
      if (!v.has(p)) {
        v.add(p);
        var w = Wn(p);
        e.addEventListener(p, si, { passive: w });
        var q = kt.get(p);
        q === void 0 ? (document.addEventListener(p, si, { passive: w }), kt.set(p, 1)) : kt.set(p, q + 1);
      }
    }
  };
  d(Ri(Ur)), Oi.add(d);
  var _ = void 0, S = Rn(() => {
    var b = i ?? e.appendChild(wi());
    return Zt(() => {
      if (s) {
        Ze({});
        var c = (
          /** @type {ComponentContext} */
          Ue
        );
        c.c = s;
      }
      n && (r.$$events = n), _ = t(b, r) || {}, s && Xe();
    }), () => {
      for (var c of v) {
        e.removeEventListener(c, si);
        var p = (
          /** @type {number} */
          kt.get(c)
        );
        --p === 0 ? (document.removeEventListener(c, si), kt.delete(c)) : kt.set(c, p);
      }
      Oi.delete(d), b !== i && b.parentNode?.removeChild(b);
    };
  });
  return $n.set(_, S), _;
}
let $n = /* @__PURE__ */ new WeakMap();
function m(t, e, [i, r] = [0, 0]) {
  var n = t, s = null, l = null, v = Ge, d = i > 0 ? bi : 0, _ = !1;
  const S = (c, p = !0) => {
    _ = !0, b(p, c);
  }, b = (c, p) => {
    v !== (v = c) && (v ? (s ? di(s) : p && (s = Zt(() => p(n))), l && ui(l, () => {
      l = null;
    })) : (l ? di(l) : p && (l = Zt(() => p(n, [i + 1, r]))), s && ui(s, () => {
      s = null;
    })));
  };
  xi(() => {
    _ = !1, e(S), _ || b(null, null);
  }, d);
}
function je(t, e) {
  return e;
}
function es(t, e, i, r) {
  for (var n = [], s = e.length, l = 0; l < s; l++)
    Bi(e[l].e, n, !0);
  var v = s > 0 && n.length === 0 && i !== null;
  if (v) {
    var d = (
      /** @type {Element} */
      /** @type {Element} */
      i.parentNode
    );
    Tn(d), d.append(
      /** @type {Element} */
      i
    ), r.clear(), ut(t, e[0].prev, e[s - 1].next);
  }
  Or(n, () => {
    for (var _ = 0; _ < s; _++) {
      var S = e[_];
      v || (r.delete(S.k), ut(t, S.prev, S.next)), tt(S.e, !v);
    }
  });
}
function ze(t, e, i, r, n, s = null) {
  var l = t, v = { flags: e, items: /* @__PURE__ */ new Map(), first: null }, d = (e & br) !== 0;
  if (d) {
    var _ = (
      /** @type {Element} */
      t
    );
    l = _.appendChild(wi());
  }
  var S = null, b = !1, c = /* @__PURE__ */ En(() => {
    var p = i();
    return mi(p) ? p : p == null ? [] : Ri(p);
  });
  xi(() => {
    var p = o(c), w = p.length;
    b && w === 0 || (b = w === 0, ts(p, v, l, n, e, r, i), s !== null && (w === 0 ? S ? di(S) : S = Zt(() => s(l)) : S !== null && ui(S, () => {
      S = null;
    })), o(c));
  });
}
function ts(t, e, i, r, n, s, l) {
  var v = (n & pn) !== 0, d = (n & (Ui | Gi)) !== 0, _ = t.length, S = e.items, b = e.first, c = b, p, w = null, q, M = [], A = [], x, T, I, C;
  if (v)
    for (C = 0; C < _; C += 1)
      x = t[C], T = s(x, C), I = S.get(T), I !== void 0 && (I.a?.measure(), (q ?? (q = /* @__PURE__ */ new Set())).add(I));
  for (C = 0; C < _; C += 1) {
    if (x = t[C], T = s(x, C), I = S.get(T), I === void 0) {
      var se = c ? (
        /** @type {TemplateNode} */
        c.e.nodes_start
      ) : i;
      w = rs(
        se,
        e,
        w,
        w === null ? e.first : w.next,
        x,
        T,
        C,
        r,
        n,
        l
      ), S.set(T, w), M = [], A = [], c = w.next;
      continue;
    }
    if (d && is(I, x, C, n), (I.e.f & at) !== 0 && (di(I.e), v && (I.a?.unfix(), (q ?? (q = /* @__PURE__ */ new Set())).delete(I))), I !== c) {
      if (p !== void 0 && p.has(I)) {
        if (M.length < A.length) {
          var re = A[0], ne;
          w = re.prev;
          var Te = M[0], Ae = M[M.length - 1];
          for (ne = 0; ne < M.length; ne += 1)
            nr(M[ne], re, i);
          for (ne = 0; ne < A.length; ne += 1)
            p.delete(A[ne]);
          ut(e, Te.prev, Ae.next), ut(e, w, Te), ut(e, Ae, re), c = re, w = Ae, C -= 1, M = [], A = [];
        } else
          p.delete(I), nr(I, c, i), ut(e, I.prev, I.next), ut(e, I, w === null ? e.first : w.next), ut(e, w, I), w = I;
        continue;
      }
      for (M = [], A = []; c !== null && c.k !== T; )
        (c.e.f & at) === 0 && (p ?? (p = /* @__PURE__ */ new Set())).add(c), A.push(c), c = c.next;
      if (c === null)
        continue;
      I = c;
    }
    M.push(I), w = I, c = I.next;
  }
  if (c !== null || p !== void 0) {
    for (var V = p === void 0 ? [] : Ri(p); c !== null; )
      (c.e.f & at) === 0 && V.push(c), c = c.next;
    var G = V.length;
    if (G > 0) {
      var _e = (n & br) !== 0 && _ === 0 ? i : null;
      if (v) {
        for (C = 0; C < G; C += 1)
          V[C].a?.measure();
        for (C = 0; C < G; C += 1)
          V[C].a?.fix();
      }
      es(e, V, _e, S);
    }
  }
  v && Nn(() => {
    if (q !== void 0)
      for (I of q)
        I.a?.apply();
  }), Ee.first = e.first && e.first.e, Ee.last = w && w.e;
}
function is(t, e, i, r) {
  (r & Ui) !== 0 && Di(t.v, e), (r & Gi) !== 0 ? Di(
    /** @type {Value<number>} */
    t.i,
    i
  ) : t.i = i;
}
function rs(t, e, i, r, n, s, l, v, d, _) {
  var S = (d & Ui) !== 0, b = (d & gn) === 0, c = S ? b ? /* @__PURE__ */ kr(n, !1, !1) : ci(n) : n, p = (d & Gi) === 0 ? l : ci(l), w = {
    i: p,
    v: c,
    k: s,
    a: null,
    // @ts-expect-error
    e: null,
    prev: i,
    next: r
  };
  try {
    return w.e = Zt(() => v(t, c, p, _), Cn), w.e.prev = i && i.e, w.e.next = r && r.e, i === null ? e.first = w : (i.next = w, i.e.next = w.e), r !== null && (r.prev = w, r.e.prev = w.e), w;
  } finally {
  }
}
function nr(t, e, i) {
  for (var r = t.next ? (
    /** @type {TemplateNode} */
    t.next.e.nodes_start
  ) : i, n = e ? (
    /** @type {TemplateNode} */
    e.e.nodes_start
  ) : i, s = (
    /** @type {TemplateNode} */
    t.e.nodes_start
  ); s !== r; ) {
    var l = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ Si(s)
    );
    n.before(s), s = l;
  }
}
function ut(t, e, i) {
  e === null ? t.first = i : (e.next = i, e.e.next = i && i.e), i !== null && (i.prev = e, i.e.prev = e && e.e);
}
function sr(t, e, ...i) {
  var r = t, n = tn, s;
  xi(() => {
    n !== (n = e()) && (s && (tt(s), s = null), s = Zt(() => (
      /** @type {SnippetFn} */
      n(r, ...i)
    )));
  }, bi);
}
function jr(t) {
  var e, i, r = "";
  if (typeof t == "string" || typeof t == "number") r += t;
  else if (typeof t == "object") if (Array.isArray(t)) {
    var n = t.length;
    for (e = 0; e < n; e++) t[e] && (i = jr(t[e])) && (r && (r += " "), r += i);
  } else for (i in t) t[i] && (r && (r += " "), r += i);
  return r;
}
function ns() {
  for (var t, e, i = 0, r = "", n = arguments.length; i < n; i++) (t = arguments[i]) && (e = jr(t)) && (r && (r += " "), r += e);
  return r;
}
function mt(t) {
  return typeof t == "object" ? ns(t) : t ?? "";
}
const ar = [...` 	
\r\f \v\uFEFF`];
function ss(t, e, i) {
  var r = t == null ? "" : "" + t;
  if (e && (r = r ? r + " " + e : e), i) {
    for (var n in i)
      if (i[n])
        r = r ? r + " " + n : n;
      else if (r.length)
        for (var s = n.length, l = 0; (l = r.indexOf(n, l)) >= 0; ) {
          var v = l + s;
          (l === 0 || ar.includes(r[l - 1])) && (v === r.length || ar.includes(r[v])) ? r = (l === 0 ? "" : r.substring(0, l)) + r.substring(v + 1) : l = v;
        }
  }
  return r === "" ? null : r;
}
function as(t, e) {
  return t == null ? null : String(t);
}
function xe(t, e, i, r, n, s) {
  var l = t.__className;
  if (l !== i || l === void 0) {
    var v = ss(i, r, s);
    v == null ? t.removeAttribute("class") : e ? t.className = v : t.setAttribute("class", v), t.__className = i;
  } else if (s && n !== s)
    for (var d in s) {
      var _ = !!s[d];
      (n == null || _ !== !!n[d]) && t.classList.toggle(d, _);
    }
  return s;
}
function os(t, e, i, r) {
  var n = t.__style;
  if (n !== e) {
    var s = as(e);
    s == null ? t.removeAttribute("style") : t.style.cssText = s, t.__style = e;
  }
  return r;
}
const ls = Symbol("is custom element"), vs = Symbol("is html");
function cs(t, e) {
  var i = Qi(t);
  i.value === (i.value = // treat null and undefined the same for the initial value
  e ?? void 0) || // @ts-expect-error
  // `progress` elements always need their value set when it's `0`
  t.value === e && (e !== 0 || t.nodeName !== "PROGRESS") || (t.value = e ?? "");
}
function or(t, e) {
  var i = Qi(t);
  i.checked !== (i.checked = // treat null and undefined the same for the initial value
  e ?? void 0) && (t.checked = e);
}
function _t(t, e, i, r) {
  var n = Qi(t);
  n[e] !== (n[e] = i) && (e === "loading" && (t[an] = i), i == null ? t.removeAttribute(e) : typeof i != "string" && us(t).includes(e) ? t[e] = i : t.setAttribute(e, i));
}
function Qi(t) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    // @ts-expect-error
    t.__attributes ?? (t.__attributes = {
      [ls]: t.nodeName.includes("-"),
      [vs]: t.namespaceURI === kn
    })
  );
}
var lr = /* @__PURE__ */ new Map();
function us(t) {
  var e = lr.get(t.nodeName);
  if (e) return e;
  lr.set(t.nodeName, e = []);
  for (var i, r = t, n = Element.prototype; n !== r; ) {
    i = Xr(r);
    for (var s in i)
      i[s].set && e.push(s);
    r = _r(r);
  }
  return e;
}
let ai = !1;
function ds(t) {
  var e = ai;
  try {
    return ai = !1, [t(), ai];
  } finally {
    ai = e;
  }
}
function vr(t) {
  return t.ctx?.d ?? !1;
}
function te(t, e, i, r) {
  var n = (i & mn) !== 0, s = !0, l = (i & yn) !== 0, v = (i & wn) !== 0, d = !1, _;
  l ? [_, d] = ds(() => (
    /** @type {V} */
    t[e]
  )) : _ = /** @type {V} */
  t[e];
  var S = oi in t || sn in t, b = l && (Et(t, e)?.set ?? (S && e in t && ((C) => t[e] = C))) || void 0, c = (
    /** @type {V} */
    r
  ), p = !0, w = !1, q = () => (w = !0, p && (p = !1, v ? c = gi(
    /** @type {() => V} */
    r
  ) : c = /** @type {V} */
  r), c);
  _ === void 0 && r !== void 0 && (b && s && dn(), _ = q(), b && b(_));
  var M;
  if (M = () => {
    var C = (
      /** @type {V} */
      t[e]
    );
    return C === void 0 ? q() : (p = !0, w = !1, C);
  }, (i & bn) === 0 && s)
    return M;
  if (b) {
    var A = t.$$legacy;
    return function(C, se) {
      return arguments.length > 0 ? ((!se || A || d) && b(se ? M() : C), C) : M();
    };
  }
  var x = !1, T = /* @__PURE__ */ kr(_), I = /* @__PURE__ */ yi(() => {
    var C = M(), se = o(T);
    return x ? (x = !1, se) : T.v = C;
  });
  return l && o(I), n || (I.equals = Fi), function(C, se) {
    if (arguments.length > 0) {
      const re = se ? o(I) : l ? Me(C) : C;
      if (!I.equals(re)) {
        if (x = !0, U(T, re), w && c !== void 0 && (c = re), vr(I))
          return C;
        gi(() => o(I));
      }
      return C;
    }
    return vr(I) ? I.v : o(I);
  };
}
function Ai(t) {
  Ue === null && ji(), bt(() => {
    const e = gi(t);
    if (typeof e == "function") return (
      /** @type {() => void} */
      e
    );
  });
}
function fs(t) {
  Ue === null && ji(), Ai(() => () => gi(t));
}
function _s(t, e, { bubbles: i = !1, cancelable: r = !1 } = {}) {
  return new CustomEvent(t, { detail: e, bubbles: i, cancelable: r });
}
function hs() {
  const t = Ue;
  return t === null && ji(), (e, i, r) => {
    const n = (
      /** @type {Record<string, Function | Function[]>} */
      t.s.$$events?.[
        /** @type {any} */
        e
      ]
    );
    if (n) {
      const s = mi(n) ? n.slice() : [n], l = _s(
        /** @type {string} */
        e,
        i,
        r
      );
      for (const v of s)
        v.call(t.x, l);
      return !l.defaultPrevented;
    }
    return !0;
  };
}
const ps = "5";
var fr;
typeof window < "u" && ((fr = window.__svelte ?? (window.__svelte = {})).v ?? (fr.v = /* @__PURE__ */ new Set())).add(ps);
class gs {
  constructor(e, i = {}) {
    this.baseUrl = e || window.__API_BASE_URL__ || "http://localhost:8080/api/v1", this.modelId = i.modelId, this.authToken = i.authToken || localStorage.getItem("auth_token"), this.timeout = i.timeout || 3e4, console.log("API Client initialized:", {
      baseUrl: this.baseUrl,
      modelId: this.modelId,
      hasAuth: !!this.authToken
    });
  }
  async request(e, i = {}) {
    const r = `${this.baseUrl}${e}`;
    console.log(`API Request: ${i.method || "GET"} ${r}`);
    const n = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...this.authToken && { Authorization: `Bearer ${this.authToken}` },
        ...i.headers
      },
      ...i
    };
    n.body && typeof n.body == "object" && (n.body = JSON.stringify(n.body));
    try {
      const s = new AbortController(), l = setTimeout(() => s.abort(), this.timeout), v = await fetch(r, {
        ...n,
        signal: s.signal
      });
      if (clearTimeout(l), !v.ok) {
        const _ = await v.json().catch(() => ({ message: v.statusText }));
        throw new Error(_.message || _.error || `HTTP ${v.status}`);
      }
      const d = await v.json();
      return (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") && console.log(`API Response from ${e}:`, d), d && typeof d == "object" && d.success !== void 0 && d.data !== void 0 ? d.data : d ?? (e.includes("/groups") || e.includes("/options") || e.includes("/rules") ? [] : {});
    } catch (s) {
      throw s.name === "AbortError" ? new Error("Request timeout") : (console.error(`API Error for ${e}:`, s), s);
    }
  }
  // Model Management
  async getModel() {
    if (!this.modelId) throw new Error("Model ID required");
    const e = await this.request(`/models/${this.modelId}`);
    return !e.option_groups && e.groups && (e.option_groups = e.groups), console.log("Model structure:", {
      hasGroups: !!e.groups,
      hasOptionGroups: !!e.option_groups,
      hasOptions: !!e.options,
      groupsCount: e.groups?.length || e.option_groups?.length || 0,
      optionsCount: e.options?.length || 0
    }), e;
  }
  async getModelGroups() {
    if (!this.modelId) throw new Error("Model ID required");
    const e = await this.request(`/models/${this.modelId}/groups`);
    return Array.isArray(e) ? e : [];
  }
  async getModelOptions() {
    if (!this.modelId) throw new Error("Model ID required");
    const e = await this.request(`/models/${this.modelId}/options`);
    return Array.isArray(e) ? e : [];
  }
  async getModelRules() {
    if (!this.modelId) throw new Error("Model ID required");
    const e = await this.request(`/models/${this.modelId}/rules`);
    return Array.isArray(e) ? e : [];
  }
  async getModelPricingRules() {
    if (!this.modelId) throw new Error("Model ID required");
    const e = await this.request(`/models/${this.modelId}/pricing-rules`);
    return Array.isArray(e) ? e : [];
  }
  async getModelStatistics() {
    if (!this.modelId) throw new Error("Model ID required");
    return this.request(`/models/${this.modelId}/statistics`);
  }
  // Configuration Management
  async createConfiguration(e = []) {
    return this.request("/configurations", {
      method: "POST",
      body: {
        model_id: "sample-laptop",
        name: `Configuration ${(/* @__PURE__ */ new Date()).toISOString()}`,
        selections: this.formatSelections(e)
      }
    });
  }
  async getConfiguration(e) {
    return this.request(`/configurations/${e}`);
  }
  async updateConfiguration(e, i) {
    return this.request(`/configurations/${e}`, {
      method: "PUT",
      body: {
        model_id: this.modelId,
        ...i,
        selections: i.selections ? this.formatSelections(i.selections) : void 0
      }
    });
  }
  async deleteConfiguration(e) {
    return this.request(`/configurations/${e}`, {
      method: "DELETE"
    });
  }
  async addSelections(e, i) {
    return this.request(`/configurations/${e}/selections`, {
      method: "POST",
      body: {
        selections: this.formatSelections(i)
      }
    });
  }
  async removeSelection(e, i) {
    return this.request(`/configurations/${e}/selections/${i}`, {
      method: "DELETE"
    });
  }
  async validateConfiguration(e) {
    return this.request(`/configurations/${e}/validate`, {
      method: "POST"
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
    return this.request(`/configurations/${e}/available-options`);
  }
  async getConstraints(e) {
    return this.request(`/configurations/${e}/constraints`);
  }
  async getConfigurationSummary(e) {
    return this.request(`/configurations/${e}/summary`);
  }
  async cloneConfiguration(e) {
    return this.request(`/configurations/${e}/clone`, {
      method: "POST"
    });
  }
  // Pricing Operations
  async calculatePrice(e, i = {}) {
    return this.request("/pricing/calculate", {
      method: "POST",
      body: {
        model_id: this.modelId,
        selections: this.formatSelections(e),
        context: i
      }
    });
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
  async validatePricing(e, i) {
    return this.request("/pricing/validate", {
      method: "POST",
      body: {
        model_id: this.modelId,
        selections: this.formatSelections(e),
        expected_price: i
      }
    });
  }
  async getPricingRules() {
    if (!this.modelId) throw new Error("Model ID required");
    return this.request(`/pricing/rules/${this.modelId}`);
  }
  async getVolumeTiers() {
    if (!this.modelId) throw new Error("Model ID required");
    return this.request(`/pricing/volume-tiers/${this.modelId}`);
  }
  // Model Builder Operations
  async validateModel() {
    if (!this.modelId) throw new Error("Model ID required");
    return this.request(`/models/${this.modelId}/validate`, {
      method: "POST"
    });
  }
  async detectConflicts(e = []) {
    if (!this.modelId) throw new Error("Model ID required");
    return this.request(`/models/${this.modelId}/conflicts`, {
      method: "POST",
      body: { rule_ids: e }
    });
  }
  async analyzeImpact(e) {
    if (!this.modelId) throw new Error("Model ID required");
    return this.request(`/models/${this.modelId}/impact`, {
      method: "POST",
      body: e
    });
  }
  async getModelQuality() {
    if (!this.modelId) throw new Error("Model ID required");
    return this.request(`/models/${this.modelId}/quality`, {
      method: "POST"
    });
  }
  async getOptimizationRecommendations() {
    if (!this.modelId) throw new Error("Model ID required");
    return this.request(`/models/${this.modelId}/optimize`, {
      method: "POST"
    });
  }
  // Utility Methods
  formatSelections(e) {
    return Array.isArray(e) ? e : Object.entries(e).filter(([i, r]) => r > 0).map(([i, r]) => ({
      option_id: i,
      quantity: parseInt(r) || 1
    }));
  }
  // Batch Operations
  async batchValidate(e) {
    return this.request("/configurations/validate", {
      method: "POST",
      body: { configurations: e }
    });
  }
  async bulkCalculatePricing(e) {
    return this.request("/pricing/bulk-calculate", {
      method: "POST",
      body: { configurations: e }
    });
  }
  // Health Check
  async checkHealth() {
    return this.request("/health");
  }
  async getStatus() {
    return this.request("/status");
  }
}
function cr(t) {
  return typeof t != "string" ? !1 : [
    "=>",
    // Arrow functions
    "function",
    // Function keyword
    "$props",
    // Svelte internals
    "$",
    // Any Svelte internal
    "$.strict_equals",
    // Svelte runtime
    "return ",
    // Return statements
    "${",
    // Template literals
    "() =>",
    // Arrow function pattern
    "} else",
    // Control flow
    "if (",
    // Conditionals
    ".selection_type",
    // Property access that looks like code
    "strict_equals",
    // Function names
    "min_selections",
    // When preceded by dots
    "max_selections"
    // When preceded by dots
  ].some((i) => t.includes(i));
}
function Br(t, e = "") {
  if (t == null) return e;
  const i = String(t);
  return typeof t == "string" && !cr(i) ? i : cr(i) ? (console.warn("[Sanitizer] Code pattern detected and removed:", {
    original: i.substring(0, 100) + (i.length > 100 ? "..." : ""),
    fallback: e
  }), e) : i;
}
var At, Ct, It, Tt, Pt, Dt, qt, Ot, Rt, Mt, Vt, Lt, Nt, zt, Ft, Ut, Gt, jt, Bt, Ht, Qt, Yt, Wt, Kt;
class ms {
  constructor() {
    Ce(this, At);
    Ce(this, Ct);
    Ce(this, It);
    Ce(this, Tt);
    Ce(this, Pt);
    Ce(this, Dt);
    Ce(this, qt);
    Ce(this, Ot);
    Ce(this, Rt);
    Ce(this, Mt);
    Ce(this, Vt);
    Ce(this, Lt);
    Ce(this, Nt);
    Ce(this, zt);
    Ce(this, Ft);
    Ce(this, Ut);
    Ce(this, Gt);
    Ce(this, jt);
    Ce(this, Bt);
    Ce(this, Ht);
    Ce(this, Qt);
    Ce(this, Yt);
    Ce(this, Wt);
    Ce(this, Kt);
    Ie(this, At, /* @__PURE__ */ Q("")), Ie(this, Ct, /* @__PURE__ */ Q(null)), Ie(this, It, /* @__PURE__ */ Q(null)), Ie(this, Tt, /* @__PURE__ */ Q(Me({}))), Ie(this, Pt, /* @__PURE__ */ Q(null)), Ie(this, Dt, /* @__PURE__ */ Q(null)), Ie(this, qt, /* @__PURE__ */ Q(Me([]))), Ie(this, Ot, /* @__PURE__ */ Q(Me([]))), Ie(this, Rt, /* @__PURE__ */ Q(Me([]))), Ie(this, Mt, /* @__PURE__ */ Q(Me([]))), Ie(this, Vt, /* @__PURE__ */ Q(Me([]))), Ie(this, Lt, /* @__PURE__ */ Q(Me([]))), Ie(this, Nt, /* @__PURE__ */ Q(Me([]))), Ie(this, zt, /* @__PURE__ */ Q(!1)), Ie(this, Ft, /* @__PURE__ */ Q(!1)), Ie(this, Ut, /* @__PURE__ */ Q(!1)), Ie(this, Gt, /* @__PURE__ */ Q(!1)), Ie(this, jt, /* @__PURE__ */ Q(null)), Ie(this, Bt, /* @__PURE__ */ Q(Me([]))), Ie(this, Ht, /* @__PURE__ */ Q(null)), Ie(this, Qt, /* @__PURE__ */ Q(null)), Ie(this, Yt, /* @__PURE__ */ Q(!1)), Ie(this, Wt, /* @__PURE__ */ Q(0)), Ie(this, Kt, /* @__PURE__ */ Q(Me(/* @__PURE__ */ new Set()))), this.api = null, this._initialized = !1, this._debounceTimers = /* @__PURE__ */ new Map(), this._modelLoaded = !1;
  }
  get modelId() {
    return o(N(this, At));
  }
  set modelId(e) {
    U(N(this, At), e, !0);
  }
  get model() {
    return o(N(this, Ct));
  }
  set model(e) {
    U(N(this, Ct), e, !0);
  }
  get configuration() {
    return o(N(this, It));
  }
  set configuration(e) {
    U(N(this, It), e, !0);
  }
  get selections() {
    return o(N(this, Tt));
  }
  set selections(e) {
    U(N(this, Tt), e, !0);
  }
  get validationResults() {
    return o(N(this, Pt));
  }
  set validationResults(e) {
    U(N(this, Pt), e, !0);
  }
  get pricingData() {
    return o(N(this, Dt));
  }
  set pricingData(e) {
    U(N(this, Dt), e, !0);
  }
  get availableOptions() {
    return o(N(this, qt));
  }
  set availableOptions(e) {
    U(N(this, qt), e, !0);
  }
  get constraints() {
    return o(N(this, Ot));
  }
  set constraints(e) {
    U(N(this, Ot), e, !0);
  }
  get groups() {
    return o(N(this, Rt));
  }
  set groups(e) {
    U(N(this, Rt), e, !0);
  }
  get options() {
    return o(N(this, Mt));
  }
  set options(e) {
    U(N(this, Mt), e, !0);
  }
  get rules() {
    return o(N(this, Vt));
  }
  set rules(e) {
    U(N(this, Vt), e, !0);
  }
  get pricingRules() {
    return o(N(this, Lt));
  }
  set pricingRules(e) {
    U(N(this, Lt), e, !0);
  }
  get volumeTiers() {
    return o(N(this, Nt));
  }
  set volumeTiers(e) {
    U(N(this, Nt), e, !0);
  }
  get isLoading() {
    return o(N(this, zt));
  }
  set isLoading(e) {
    U(N(this, zt), e, !0);
  }
  get isValidating() {
    return o(N(this, Ft));
  }
  set isValidating(e) {
    U(N(this, Ft), e, !0);
  }
  get isPricing() {
    return o(N(this, Ut));
  }
  set isPricing(e) {
    U(N(this, Ut), e, !0);
  }
  get isSaving() {
    return o(N(this, Gt));
  }
  set isSaving(e) {
    U(N(this, Gt), e, !0);
  }
  get error() {
    return o(N(this, jt));
  }
  set error(e) {
    U(N(this, jt), e, !0);
  }
  get validationErrors() {
    return o(N(this, Bt));
  }
  set validationErrors(e) {
    U(N(this, Bt), e, !0);
  }
  get configurationId() {
    return o(N(this, Ht));
  }
  set configurationId(e) {
    U(N(this, Ht), e, !0);
  }
  get lastSaved() {
    return o(N(this, Qt));
  }
  set lastSaved(e) {
    U(N(this, Qt), e, !0);
  }
  get isDirty() {
    return o(N(this, Yt));
  }
  set isDirty(e) {
    U(N(this, Yt), e, !0);
  }
  get currentStep() {
    return o(N(this, Wt));
  }
  set currentStep(e) {
    U(N(this, Wt), e, !0);
  }
  get expandedGroups() {
    return o(N(this, Kt));
  }
  set expandedGroups(e) {
    U(N(this, Kt), e, !0);
  }
  // Initialize store
  async initialize() {
    this._initialized || (this._initialized = !0, console.log("🚀 ConfigurationStore initialized"), Array.isArray(this.groups) || (this.groups = []), Array.isArray(this.options) || (this.options = []), Array.isArray(this.rules) || (this.rules = []), Array.isArray(this.pricingRules) || (this.pricingRules = []), Array.isArray(this.volumeTiers) || (this.volumeTiers = []), Array.isArray(this.availableOptions) || (this.availableOptions = []), Array.isArray(this.validationErrors) || (this.validationErrors = []), bt(() => {
      this.modelId && !this.api && (this.api = new gs(window.__API_BASE_URL__, { modelId: this.modelId }), this.loadModel());
    }), bt(() => {
      this.api && Object.keys(this.selections).length > 0 && this._debounce("validate", () => this.validateSelections(), 500);
    }), bt(() => {
      this.api && this.isValid && Object.keys(this.selections).length > 0 && this._debounce("pricing", () => this.calculatePricing(), 300);
    }), bt(() => {
      this.configuration && Object.keys(this.selections).length > 0 && (this.isDirty = !0);
    }));
  }
  // Computed values
  get isValid() {
    return !this.validationResults || this.validationResults.is_valid;
  }
  get hasViolations() {
    return this.validationResults?.violations?.length > 0;
  }
  get totalPrice() {
    return this.pricingData?.total_price || 0;
  }
  get basePrice() {
    return this.pricingData?.base_price || 0;
  }
  get discounts() {
    return this.pricingData?.discounts || [];
  }
  get selectedCount() {
    return Object.values(this.selections).reduce((e, i) => e + i, 0);
  }
  // Safe getters for arrays
  get safeGroups() {
    return Array.isArray(this.groups) ? this.groups : [];
  }
  get safeOptions() {
    return Array.isArray(this.options) ? this.options : [];
  }
  get safeRules() {
    return Array.isArray(this.rules) ? this.rules : [];
  }
  get safePricingRules() {
    return Array.isArray(this.pricingRules) ? this.pricingRules : [];
  }
  get safeVolumeTiers() {
    return Array.isArray(this.volumeTiers) ? this.volumeTiers : [];
  }
  get progress() {
    if (!this.model || !this._modelLoaded) return 0;
    const e = this.safeGroups;
    if (e.length === 0) return 0;
    const i = e.filter((n) => n && n.required).length;
    if (i === 0) return 100;
    const r = e.filter((n) => n && n.id && this.hasGroupSelection(n.id)).length;
    return Math.round(r / i * 100);
  }
  // Model Management
  async loadModel() {
    if (this.api) {
      this.isLoading = !0, this.error = null;
      try {
        const [
          e,
          i,
          r,
          n,
          s
        ] = await Promise.all([
          this.api.getModel(),
          this.api.getModelGroups(),
          this.api.getModelOptions(),
          this.api.getModelRules().catch(() => ({ data: [] })),
          this.api.getModelPricingRules().catch(() => ({ data: [] }))
        ]);
        if (this.model = e, this.groups = Array.isArray(i) ? i : i && typeof i == "object" && i.data ? i.data : i && typeof i == "object" && i.groups ? i.groups : e && e.option_groups && Array.isArray(e.option_groups) ? e.option_groups : e && e.groups && Array.isArray(e.groups) ? e.groups : [], this.options = Array.isArray(r) ? r : r && typeof r == "object" && r.data ? r.data : r && typeof r == "object" && r.options ? r.options : e && e.options && Array.isArray(e.options) ? e.options : [], this.rules = Array.isArray(n) ? n : n && typeof n == "object" && n.data ? n.data : n && typeof n == "object" && n.rules ? n.rules : [], this.pricingRules = Array.isArray(s) ? s : s && typeof s == "object" && s.data ? s.data : s && typeof s == "object" && s.pricing_rules ? s.pricing_rules : [], this.groups = this.groups.map((l) => ({
          ...l,
          description: typeof l.description == "string" && (l.description.includes("=>") || l.description.includes("function") || l.description.includes("$props")) ? "" : l.description
        })), this.options = this.options.map((l) => ({
          ...l,
          description: typeof l.description == "string" && (l.description.includes("=>") || l.description.includes("function") || l.description.includes("$props")) ? "" : l.description
        })), Array.isArray(this.groups) || (this.groups = []), Array.isArray(this.options) || (this.options = []), Array.isArray(this.rules) || (this.rules = []), Array.isArray(this.pricingRules) || (this.pricingRules = []), this.groups.length === 0 && e.option_groups && (console.log("Using groups from model.option_groups"), this.groups = Array.isArray(e.option_groups) ? e.option_groups : []), this.groups.length === 0 && e.groups && (console.log("Using groups from model.groups"), this.groups = Array.isArray(e.groups) ? e.groups : []), this.options.length === 0 && e.options && (console.log("Using options from model.options"), this.options = Array.isArray(e.options) ? e.options : []), this.options.length === 0 && this.groups.length > 0) {
          const l = [];
          this.groups.forEach((v) => {
            Array.isArray(v.options) && v.options.forEach((d) => {
              l.push({ ...d, group_id: v.id });
            });
          }), l.length > 0 && (console.log("Extracted options from groups:", l.length), this.options = l);
        }
        console.log("Model loaded:", {
          model: e,
          groups: this.groups,
          options: this.options,
          groupsCount: this.groups.length,
          optionsCount: this.options.length
        }), this.groups.forEach((l, v) => {
          l.description && typeof l.description == "string" && (l.description.includes("=>") || l.description.includes("function")) && console.warn(`Group ${v} (${l.name}) has function code in description:`, l.description), l.name && typeof l.name == "string" && (l.name.includes("=>") || l.name.includes("function")) && console.warn(`Group ${v} has function code in name:`, l.name);
        }), this.options.forEach((l, v) => {
          l.description && typeof l.description == "string" && (l.description.includes("=>") || l.description.includes("function")) && console.warn(`Option ${v} (${l.name}) has function code in description:`, l.description), l.name && typeof l.name == "string" && (l.name.includes("=>") || l.name.includes("function")) && console.warn(`Option ${v} has function code in name:`, l.name);
        });
        try {
          const l = await this.api.getVolumeTiers();
          this.volumeTiers = Array.isArray(l) ? l : l && typeof l == "object" && l.data ? l.data : l && typeof l == "object" && l.tiers ? l.tiers : [];
        } catch {
          console.warn("Volume tiers not available"), this.volumeTiers = [];
        }
        Array.isArray(this.volumeTiers) || (this.volumeTiers = []), this.groups.length > 0 || this.options.length > 0 ? (this._modelLoaded = !0, await this.createConfiguration()) : console.warn("No groups or options loaded - skipping configuration creation");
      } catch (e) {
        this.error = e.message, console.error("Failed to load model:", e);
      } finally {
        this.isLoading = !1;
      }
    }
  }
  // Configuration Management
  async createConfiguration() {
    if (!(!this.api || this.configuration))
      try {
        const e = await this.api.createConfiguration([]);
        this.configuration = e, this.configurationId = e.id, console.log("Configuration created:", e.id);
      } catch (e) {
        this.error = e.message, console.error("Failed to create configuration:", e);
      }
  }
  async loadConfiguration(e) {
    if (this.api) {
      this.isLoading = !0;
      try {
        const i = await this.api.getConfiguration(e);
        this.configuration = i, this.configurationId = i.id;
        const r = {};
        i.selections?.forEach((n) => {
          r[n.option_id] = n.quantity;
        }), this.selections = r, await Promise.all([
          this.validateConfiguration(),
          this.calculatePricing()
        ]);
      } catch (i) {
        this.error = i.message;
      } finally {
        this.isLoading = !1;
      }
    }
  }
  async saveConfiguration() {
    if (!(!this.api || !this.configurationId || !this.isDirty)) {
      this.isSaving = !0;
      try {
        await this.api.updateConfiguration(this.configurationId, {
          selections: this.selections,
          name: `Configuration ${/* @__PURE__ */ (/* @__PURE__ */ new Date()).toLocaleDateString()}`
        }), this.lastSaved = /* @__PURE__ */ new Date(), this.isDirty = !1;
      } catch (e) {
        console.error("Failed to save configuration:", e);
      } finally {
        this.isSaving = !1;
      }
    }
  }
  // Selection Management
  async updateSelection(e, i) {
    const r = this.safeOptions, n = this.safeGroups;
    if (r.length === 0) {
      console.warn("Cannot update selection - options not loaded");
      return;
    }
    const s = { ...this.selections };
    i > 0 ? s[e] = i : delete s[e];
    const l = r.find((v) => v.id === e);
    if (l) {
      const v = n.find((d) => d.id === l.group_id);
      if (v?.selection_type === "single" && r.filter((d) => d.group_id === v.id && d.id !== e).forEach((d) => delete s[d.id]), v?.max_selections && r.filter((_) => _.group_id === v.id && s[_.id]).length > v.max_selections) {
        this.error = `Maximum ${v.max_selections} selections allowed in ${v.name}`;
        return;
      }
    }
    if (this.selections = s, this.configurationId)
      try {
        i > 0 ? await this.api.addSelections(this.configurationId, s) : await this.api.removeSelection(this.configurationId, e);
      } catch (v) {
        this.error = v.message;
      }
  }
  toggleOption(e) {
    const i = this.selections[e] || 0;
    return this.updateSelection(e, i > 0 ? 0 : 1);
  }
  // Validation
  async validateSelections() {
    if (!(!this.api || this.isValidating)) {
      this.isValidating = !0, this.validationErrors = [];
      try {
        const e = await this.api.validateSelections(this.selections);
        this.validationResults = e, e.available_options && (this.availableOptions = e.available_options), e.violations && (this.validationErrors = e.violations);
      } catch (e) {
        console.error("Validation failed:", e);
      } finally {
        this.isValidating = !1;
      }
    }
  }
  async validateConfiguration() {
    if (!(!this.api || !this.configurationId)) {
      this.isValidating = !0;
      try {
        const e = await this.api.validateConfiguration(this.configurationId);
        this.validationResults = e, e.available_options && (this.availableOptions = e.available_options);
      } catch (e) {
        console.error("Configuration validation failed:", e);
      } finally {
        this.isValidating = !1;
      }
    }
  }
  // Pricing
  async calculatePricing(e = {}) {
    if (!(!this.api || this.isPricing)) {
      this.isPricing = !0;
      try {
        const i = await this.api.calculatePrice(this.selections, e);
        this.pricingData = i;
      } catch (i) {
        console.error("Pricing calculation failed:", i);
      } finally {
        this.isPricing = !1;
      }
    }
  }
  // Helper Methods
  hasGroupSelection(e) {
    return this.safeOptions.filter((r) => r.group_id === e).some((r) => this.selections[r.id] > 0);
  }
  getGroupSelections(e) {
    return this.safeOptions.filter((r) => r.group_id === e && this.selections[r.id] > 0).map((r) => ({ ...r, quantity: this.selections[r.id] }));
  }
  isOptionAvailable(e) {
    return this.availableOptions.length ? this.availableOptions.includes(e) : !0;
  }
  isOptionSelected(e) {
    return this.selections[e] > 0;
  }
  getOptionQuantity(e) {
    return this.selections[e] || 0;
  }
  // Group UI Management
  toggleGroup(e) {
    const i = new Set(this.expandedGroups);
    i.has(e) ? i.delete(e) : i.add(e), this.expandedGroups = i;
  }
  isGroupExpanded(e) {
    return this.expandedGroups.has(e);
  }
  // Export configuration
  exportConfiguration() {
    const e = this.safeOptions, i = Object.entries(this.selections).filter(([r, n]) => n > 0).map(([r, n]) => {
      const s = e.find((l) => l.id === r);
      return {
        option_id: r,
        option_name: s?.name,
        quantity: n,
        unit_price: s?.price || 0,
        total_price: (s?.price || 0) * n
      };
    });
    return {
      id: this.configurationId,
      model_id: this.modelId,
      model_name: this.model?.name,
      selections: i,
      validation: {
        is_valid: this.isValid,
        violations: this.validationResults?.violations || []
      },
      pricing: {
        base_price: this.basePrice,
        total_price: this.totalPrice,
        discounts: this.discounts,
        breakdown: this.pricingData?.breakdown || []
      },
      metadata: {
        created: this.configuration?.created_at,
        updated: this.configuration?.updated_at,
        saved: this.lastSaved
      }
    };
  }
  // Reset store
  reset() {
    this.selections = {}, this.validationResults = null, this.pricingData = null, this.configuration = null, this.configurationId = null, this.currentStep = 0, this.isDirty = !1, this.error = null, this.validationErrors = [];
  }
  // Utility method for debouncing
  _debounce(e, i, r) {
    clearTimeout(this._debounceTimers.get(e)), this._debounceTimers.set(e, setTimeout(i, r));
  }
  // Step navigation
  canProceedToStep(e) {
    switch (e) {
      case 1:
        return this.selectedCount > 0;
      case 2:
        return this.isValid;
      case 3:
        return this.isValid && this.pricingData;
      default:
        return !0;
    }
  }
  nextStep() {
    this.currentStep < 3 && this.canProceedToStep(this.currentStep + 1) && this.currentStep++;
  }
  previousStep() {
    this.currentStep > 0 && this.currentStep--;
  }
  goToStep(e) {
    e >= 0 && e <= 3 && this.canProceedToStep(e) && (this.currentStep = e);
  }
  // Model setter
  setModelId(e) {
    this.modelId !== e && (this.reset(), this.modelId = e);
  }
}
At = new WeakMap(), Ct = new WeakMap(), It = new WeakMap(), Tt = new WeakMap(), Pt = new WeakMap(), Dt = new WeakMap(), qt = new WeakMap(), Ot = new WeakMap(), Rt = new WeakMap(), Mt = new WeakMap(), Vt = new WeakMap(), Lt = new WeakMap(), Nt = new WeakMap(), zt = new WeakMap(), Ft = new WeakMap(), Ut = new WeakMap(), Gt = new WeakMap(), jt = new WeakMap(), Bt = new WeakMap(), Ht = new WeakMap(), Qt = new WeakMap(), Yt = new WeakMap(), Wt = new WeakMap(), Kt = new WeakMap();
const g = new ms();
var bs = /* @__PURE__ */ Jn('<svg class="checkmark svelte-19ib3n" width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M13.854 3.646a.5.5 0 010 .708l-7 7a.5.5 0 01-.708 0l-3.5-3.5a.5.5 0 11.708-.708L6.5 10.293l6.646-6.647a.5.5 0 01.708 0z"></path></svg>'), ys = /* @__PURE__ */ h('<span class="step-number svelte-19ib3n"></span>'), ws = /* @__PURE__ */ h('<div><div class="step-marker svelte-19ib3n"><!></div> <div class="step-content svelte-19ib3n"><span class="step-icon svelte-19ib3n"> </span> <span class="step-label svelte-19ib3n"> </span></div></div>'), Ss = /* @__PURE__ */ h('<div class="progress-indicator svelte-19ib3n"><div class="progress-bar svelte-19ib3n"><div class="progress-fill svelte-19ib3n"></div></div> <div class="steps svelte-19ib3n"></div></div>');
function xs(t, e) {
  Ze(e, !0);
  let i = te(e, "steps", 19, () => []), r = te(e, "currentStep", 3, 0), n = te(e, "onStepClick", 3, null), s = te(e, "canNavigate", 3, !1);
  function l(c) {
    s() && n() && c <= r() && n()(c);
  }
  function v(c) {
    return c < r() ? "completed" : c === r() ? "active" : "pending";
  }
  var d = Ss(), _ = a(d), S = a(_), b = u(_, 2);
  ze(b, 21, i, je, (c, p, w) => {
    var q = ws();
    const M = /* @__PURE__ */ ye(() => v(w)), A = /* @__PURE__ */ ye(() => s() && w <= r());
    let x;
    q.__click = () => l(w), q.__keydown = (G) => {
      o(A) && (G.key === "Enter" || G.key === " ") && (G.preventDefault(), l(w));
    };
    var T = a(q), I = a(T);
    {
      var C = (G) => {
        var _e = bs();
        f(G, _e);
      }, se = (G) => {
        var _e = ys();
        _e.textContent = w + 1, f(G, _e);
      };
      m(I, (G) => {
        o(M) === "completed" ? G(C) : G(se, !1);
      });
    }
    var re = u(T, 2), ne = a(re), Te = a(ne), Ae = u(ne, 2), V = a(Ae);
    k(
      (G) => {
        x = xe(q, 1, `step ${o(M) ?? ""}`, "svelte-19ib3n", x, G), _t(q, "role", o(A) ? "button" : "presentation"), _t(q, "tabindex", o(A) ? 0 : -1), y(Te, o(p).icon), y(V, o(p).label);
      },
      [() => ({ clickable: o(A) })]
    ), f(c, q);
  }), k(() => os(S, `width: ${r() === 0 ? 0 : r() / (i().length - 1) * 100}%`)), f(t, d), Xe();
}
ht(["click", "keydown"]);
var ks = /* @__PURE__ */ h('<p class="loading-message svelte-121gmln"> </p>'), Es = /* @__PURE__ */ h('<div class="loading-overlay svelte-121gmln"><div class="loading-content svelte-121gmln"><div></div> <!></div></div>'), As = /* @__PURE__ */ h('<p class="loading-message svelte-121gmln"> </p>'), Cs = /* @__PURE__ */ h('<div class="loading-container svelte-121gmln"><div></div> <!></div>');
function ii(t, e) {
  Ze(e, !0);
  let i = te(e, "size", 3, "medium"), r = te(e, "message", 3, ""), n = te(e, "overlay", 3, !1), s = te(e, "color", 3, "primary"), l = /* @__PURE__ */ ye(() => ({
    small: "w-4 h-4 border-2",
    medium: "w-8 h-8 border-3",
    large: "w-12 h-12 border-4"
  })[i()] || "w-8 h-8 border-3"), v = /* @__PURE__ */ ye(() => ({
    primary: "border-blue-600 border-t-transparent",
    white: "border-white border-t-transparent",
    gray: "border-gray-600 border-t-transparent"
  })[s()] || "border-blue-600 border-t-transparent");
  var d = st(), _ = He(d);
  {
    var S = (c) => {
      var p = Es(), w = a(p), q = a(w), M = u(q, 2);
      {
        var A = (x) => {
          var T = ks(), I = a(T);
          k(() => y(I, r())), f(x, T);
        };
        m(M, (x) => {
          r() && x(A);
        });
      }
      k(() => xe(q, 1, `spinner ${o(l) ?? ""} ${o(v) ?? ""}`, "svelte-121gmln")), f(c, p);
    }, b = (c) => {
      var p = Cs(), w = a(p), q = u(w, 2);
      {
        var M = (A) => {
          var x = As(), T = a(x);
          k(() => y(T, r())), f(A, x);
        };
        m(q, (A) => {
          r() && A(M);
        });
      }
      k(() => xe(w, 1, `spinner ${o(l) ?? ""} ${o(v) ?? ""}`, "svelte-121gmln")), f(c, p);
    };
    m(_, (c) => {
      n() ? c(S) : c(b, !1);
    });
  }
  f(t, d), Xe();
}
var Is = () => location.reload(), Ts = /* @__PURE__ */ h('<div class="error-boundary svelte-szpq5s"><div class="error-content svelte-szpq5s"><div class="error-icon svelte-szpq5s">⚠️</div> <h2 class="error-title svelte-szpq5s">Something went wrong</h2> <p class="error-message svelte-szpq5s"> </p> <!> <div class="error-actions svelte-szpq5s"><button class="btn btn-primary svelte-szpq5s">Try Again</button> <button class="btn btn-secondary svelte-szpq5s">Reload Page</button></div></div></div>');
function Ps(t, e) {
  Ze(e, !0);
  let i = te(e, "fallback", 3, null), r = te(e, "onError", 3, null), n = /* @__PURE__ */ Q(null), s = /* @__PURE__ */ Q(!1);
  function l(c) {
    console.error("ErrorBoundary caught:", c.error), U(n, c.error, !0), U(s, !0), r() && r()(c.error), c.preventDefault(), c.stopPropagation();
  }
  function v() {
    U(n, null), U(s, !1);
  }
  Ai(() => (window.addEventListener("error", l), window.addEventListener("unhandledrejection", (c) => {
    l({ error: c.reason });
  }), () => {
    window.removeEventListener("error", l), window.removeEventListener("unhandledrejection", l);
  }));
  var d = st(), _ = He(d);
  {
    var S = (c) => {
      var p = st(), w = He(p);
      {
        var q = (A) => {
          var x = st(), T = He(x);
          sr(T, i, () => o(n), () => v), f(A, x);
        }, M = (A) => {
          var x = Ts(), T = a(x), I = u(a(T), 4), C = a(I), se = u(I, 2);
          m(se, (Ae) => {
          });
          var re = u(se, 2), ne = a(re);
          ne.__click = v;
          var Te = u(ne, 2);
          Te.__click = [Is], k(() => y(C, o(n)?.message || "An unexpected error occurred")), f(A, x);
        };
        m(w, (A) => {
          i() ? A(q) : A(M, !1);
        });
      }
      f(c, p);
    }, b = (c) => {
      var p = st(), w = He(p);
      sr(w, () => e.children), f(c, p);
    };
    m(_, (c) => {
      o(s) ? c(S) : c(b, !1);
    });
  }
  f(t, d), Xe();
}
ht(["click"]);
var Ds = /* @__PURE__ */ h("<p> </p>"), qs = /* @__PURE__ */ h("<h1> </h1>"), Os = /* @__PURE__ */ h("<h2> </h2>"), Rs = /* @__PURE__ */ h("<h3> </h3>"), Ms = /* @__PURE__ */ h("<h4> </h4>"), Vs = /* @__PURE__ */ h("<div> </div>"), Ls = /* @__PURE__ */ h("<span> </span>");
function Ti(t, e) {
  Ze(e, !0);
  let i = te(e, "text", 3, ""), r = te(e, "fallback", 3, ""), n = te(e, "tag", 3, "span"), s = te(e, "class", 3, ""), l = /* @__PURE__ */ ye(() => Br(i(), r()));
  var v = st(), d = He(v);
  {
    var _ = (b) => {
      var c = Ds(), p = a(c);
      k(() => {
        xe(c, 1, mt(s())), y(p, o(l));
      }), f(b, c);
    }, S = (b, c) => {
      {
        var p = (q) => {
          var M = qs(), A = a(M);
          k(() => {
            xe(M, 1, mt(s())), y(A, o(l));
          }), f(q, M);
        }, w = (q, M) => {
          {
            var A = (T) => {
              var I = Os(), C = a(I);
              k(() => {
                xe(I, 1, mt(s())), y(C, o(l));
              }), f(T, I);
            }, x = (T, I) => {
              {
                var C = (re) => {
                  var ne = Rs(), Te = a(ne);
                  k(() => {
                    xe(ne, 1, mt(s())), y(Te, o(l));
                  }), f(re, ne);
                }, se = (re, ne) => {
                  {
                    var Te = (V) => {
                      var G = Ms(), _e = a(G);
                      k(() => {
                        xe(G, 1, mt(s())), y(_e, o(l));
                      }), f(V, G);
                    }, Ae = (V, G) => {
                      {
                        var _e = (ue) => {
                          var we = Vs(), De = a(we);
                          k(() => {
                            xe(we, 1, mt(s())), y(De, o(l));
                          }), f(ue, we);
                        }, Ve = (ue) => {
                          var we = Ls(), De = a(we);
                          k(() => {
                            xe(we, 1, mt(s())), y(De, o(l));
                          }), f(ue, we);
                        };
                        m(
                          V,
                          (ue) => {
                            n() === "div" ? ue(_e) : ue(Ve, !1);
                          },
                          G
                        );
                      }
                    };
                    m(
                      re,
                      (V) => {
                        n() === "h4" ? V(Te) : V(Ae, !1);
                      },
                      ne
                    );
                  }
                };
                m(
                  T,
                  (re) => {
                    n() === "h3" ? re(C) : re(se, !1);
                  },
                  I
                );
              }
            };
            m(
              q,
              (T) => {
                n() === "h2" ? T(A) : T(x, !1);
              },
              M
            );
          }
        };
        m(
          b,
          (q) => {
            n() === "h1" ? q(p) : q(w, !1);
          },
          c
        );
      }
    };
    m(d, (b) => {
      n() === "p" ? b(_) : b(S, !1);
    });
  }
  f(t, v), Xe();
}
function Ns(t, e, i) {
  e(i() + 1);
}
function zs(t, e, i) {
  e(i() - 1);
}
var Fs = (t, e) => {
  (t.key === "Enter" || t.key === " ") && (t.preventDefault(), e());
}, Us = (t) => t.stopPropagation(), Gs = /* @__PURE__ */ h('<input type="radio" class="radio-input svelte-1ll8uv2"/>'), js = (t) => t.stopPropagation(), Bs = /* @__PURE__ */ h('<input type="checkbox" class="checkbox-input svelte-1ll8uv2"/>'), Hs = /* @__PURE__ */ h('<span class="option-sku svelte-1ll8uv2"> </span>'), Qs = /* @__PURE__ */ h('<span class="total-price svelte-1ll8uv2"> </span>'), Ys = /* @__PURE__ */ h('<li class="svelte-1ll8uv2"><!></li>'), Ws = /* @__PURE__ */ h('<ul class="option-features svelte-1ll8uv2"></ul>'), Ks = (t) => t.stopPropagation(), Js = (t, e) => e(parseInt(t.target.value) || 0), Zs = (t) => t.stopPropagation(), Xs = /* @__PURE__ */ h('<div class="quantity-controls svelte-1ll8uv2"><label class="quantity-label svelte-1ll8uv2">Quantity:</label> <div class="quantity-input svelte-1ll8uv2"><button class="qty-btn svelte-1ll8uv2" aria-label="Decrease quantity">−</button> <input type="number" min="1" class="qty-value svelte-1ll8uv2"/> <button class="qty-btn svelte-1ll8uv2" aria-label="Increase quantity">+</button></div></div>'), $s = /* @__PURE__ */ h('<div class="unavailable-message svelte-1ll8uv2">Not available with current selections</div>'), ea = /* @__PURE__ */ h('<div class="disabled-message svelte-1ll8uv2">Maximum selections reached for this group</div>'), ta = /* @__PURE__ */ h('<div role="button"><div class="option-header svelte-1ll8uv2"><!> <div class="option-info svelte-1ll8uv2"><!> <!></div> <div class="option-price svelte-1ll8uv2"><span class="price svelte-1ll8uv2"> </span> <!></div></div> <!> <!> <!> <!> <!></div>');
function ia(t, e) {
  Ze(e, !0);
  let i = te(e, "selected", 3, !1), r = te(e, "quantity", 3, 0), n = te(e, "disabled", 3, !1), s = te(e, "available", 3, !0), l = te(e, "selectionType", 3, "multiple"), v = te(e, "maxQuantity", 3, 10);
  function d() {
    n() || (l(), e.onChange(i() ? 0 : 1));
  }
  function _(E) {
    if (n()) return;
    const R = Math.max(0, Math.min(E, v()));
    e.onChange(R);
  }
  let S = /* @__PURE__ */ ye(() => e.option.price ? `$${e.option.price.toFixed(2)}` : "Included"), b = /* @__PURE__ */ ye(() => r() > 1 && e.option.price ? `$${(e.option.price * r()).toFixed(2)} total` : "");
  var c = ta();
  let p;
  c.__click = function(...E) {
    (l() === "single" ? d : void 0)?.apply(this, E);
  }, c.__keydown = [Fs, d];
  var w = a(c), q = a(w);
  {
    var M = (E) => {
      var R = Gs();
      R.__change = d, R.__click = [Us], k(() => {
        or(R, i()), R.disabled = n();
      }), f(E, R);
    }, A = (E) => {
      var R = Bs();
      R.__change = d, R.__click = [js], k(() => {
        or(R, i()), R.disabled = n();
      }), f(E, R);
    };
    m(q, (E) => {
      l() === "single" ? E(M) : E(A, !1);
    });
  }
  var x = u(q, 2), T = a(x);
  Ti(T, {
    get text() {
      return e.option.name;
    },
    fallback: "Unnamed Option",
    tag: "h4",
    class: "option-name"
  });
  var I = u(T, 2);
  {
    var C = (E) => {
      var R = Hs(), ve = a(R);
      k(() => y(ve, `SKU: ${e.option.sku ?? ""}`)), f(E, R);
    };
    m(I, (E) => {
      e.option.sku && E(C);
    });
  }
  var se = u(x, 2), re = a(se), ne = a(re), Te = u(re, 2);
  {
    var Ae = (E) => {
      var R = Qs(), ve = a(R);
      k(() => y(ve, o(b))), f(E, R);
    };
    m(Te, (E) => {
      o(b) && E(Ae);
    });
  }
  var V = u(w, 2);
  {
    var G = (E) => {
      Ti(E, {
        get text() {
          return e.option.description;
        },
        tag: "p",
        class: "option-description"
      });
    };
    m(V, (E) => {
      e.option.description && E(G);
    });
  }
  var _e = u(V, 2);
  {
    var Ve = (E) => {
      var R = Ws();
      ze(R, 21, () => e.option.features, je, (ve, B) => {
        var Y = Ys(), me = a(Y);
        Ti(me, {
          get text() {
            return o(B);
          },
          tag: "span"
        }), f(ve, Y);
      }), f(E, R);
    };
    m(_e, (E) => {
      e.option.features && e.option.features.length > 0 && E(Ve);
    });
  }
  var ue = u(_e, 2);
  {
    var we = (E) => {
      var R = Xs();
      R.__click = [Ks];
      var ve = u(a(R), 2), B = a(ve);
      B.__click = [zs, _, r];
      var Y = u(B, 2);
      Y.__change = [Js, _], Y.__click = [Zs];
      var me = u(Y, 2);
      me.__click = [Ns, _, r], k(() => {
        B.disabled = n() || r() <= 1, cs(Y, r()), _t(Y, "max", v()), Y.disabled = n(), me.disabled = n() || r() >= v();
      }), f(E, R);
    };
    m(ue, (E) => {
      l() === "multiple" && i() && E(we);
    });
  }
  var De = u(ue, 2);
  {
    var P = (E) => {
      var R = $s();
      f(E, R);
    };
    m(De, (E) => {
      !s() && !n() && E(P);
    });
  }
  var Z = u(De, 2);
  {
    var L = (E) => {
      var R = ea();
      f(E, R);
    };
    m(Z, (E) => {
      n() && s() && E(L);
    });
  }
  k(
    (E) => {
      p = xe(c, 1, "option-card svelte-1ll8uv2", null, p, E), _t(c, "tabindex", n() ? -1 : 0), y(ne, o(S));
    },
    [
      () => ({
        selected: i(),
        disabled: n(),
        unavailable: !s()
      })
    ]
  ), f(t, c), Xe();
}
ht(["click", "keydown", "change"]);
var ra = /* @__PURE__ */ h('<span class="required svelte-99mz6y">*</span>'), na = /* @__PURE__ */ h('<p class="group-description svelte-99mz6y"> </p>'), sa = /* @__PURE__ */ h('<span class="selection-count svelte-99mz6y"> <!></span>'), aa = /* @__PURE__ */ h('<div class="options-grid svelte-99mz6y"></div>'), oa = /* @__PURE__ */ h('<div class="no-options svelte-99mz6y"><p>No options available in this group.</p></div>'), la = /* @__PURE__ */ h('<div class="group-content svelte-99mz6y"><!></div>'), va = /* @__PURE__ */ h('<div><div class="group-header svelte-99mz6y"><div class="group-info svelte-99mz6y"><h3 class="group-name svelte-99mz6y"> <!></h3> <!></div> <div class="group-meta svelte-99mz6y"><div class="selection-info svelte-99mz6y"><span class="selection-type svelte-99mz6y"> </span> <!></div> <button class="expand-toggle svelte-99mz6y"><svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg></button></div></div> <!></div>');
function ca(t, e) {
  Ze(e, !0);
  let i = te(e, "options", 19, () => []), r = te(e, "selections", 19, () => ({})), n = te(e, "availableOptions", 19, () => []), s = te(e, "expanded", 3, !0), l = /* @__PURE__ */ ye(() => Array.isArray(i()) ? i().filter((P) => r()[P.id] > 0).length : 0), v = /* @__PURE__ */ ye(() => Array.isArray(i()) ? i().reduce((P, Z) => P + (r()[Z.id] || 0), 0) : 0);
  function d() {
    return e.group.selection_type === "single" ? "Select one" : e.group.selection_type === "multiple" ? e.group.min_selections && e.group.max_selections ? e.group.min_selections === e.group.max_selections ? `Select exactly ${e.group.min_selections}` : `Select ${e.group.min_selections}-${e.group.max_selections}` : e.group.min_selections ? `Select at least ${e.group.min_selections}` : e.group.max_selections ? `Select up to ${e.group.max_selections}` : "Select multiple" : "";
  }
  let _ = Me(d());
  Ai(() => {
    const P = d();
    (P.includes("=>") || P.includes("function")) && console.error("[OptionGroup] Selection text contains code!", { text: P, group: e.group });
  });
  function S(P, Z) {
    e.group.selection_type === "single" && Z > 0 && Array.isArray(i()) && i().forEach((L) => {
      L.id !== P && r()[L.id] > 0 && e.onSelectionChange(L.id, 0);
    }), !(e.group.max_selections && Z > 0 && Array.isArray(i()) && i().filter((E) => E.id !== P && r()[E.id] > 0).length >= e.group.max_selections) && e.onSelectionChange(P, Z);
  }
  function b(P) {
    return !!(n().length > 0 && !n().includes(P.id) || e.group.max_selections && !r()[P.id] && i().filter((L) => r()[L.id] > 0).length >= e.group.max_selections);
  }
  function c(P) {
    const Z = r()[P.id] > 0, L = n().length === 0 || n().includes(P.id), E = b(P);
    return {
      selected: Z,
      available: L,
      disabled: E,
      quantity: r()[P.id] || 0
    };
  }
  var p = va();
  let w;
  var q = a(p);
  q.__click = function(...P) {
    e.onToggle?.apply(this, P);
  };
  var M = a(q), A = a(M), x = a(A), T = u(x);
  {
    var I = (P) => {
      var Z = ra();
      f(P, Z);
    };
    m(T, (P) => {
      e.group.required && P(I);
    });
  }
  var C = u(A, 2);
  {
    var se = (P) => {
      var Z = na(), L = a(Z);
      k(() => y(L, e.group.description)), f(P, Z);
    };
    m(C, (P) => {
      e.group.description && typeof e.group.description == "string" && !e.group.description.includes("=>") && !e.group.description.includes("function") && !e.group.description.includes("$props") && P(se);
    });
  }
  var re = u(M, 2), ne = a(re), Te = a(ne), Ae = a(Te), V = u(Te, 2);
  {
    var G = (P) => {
      var Z = sa(), L = a(Z), E = u(L);
      {
        var R = (ve) => {
          var B = yt();
          k(() => y(B, `(${o(v) ?? ""} total)`)), f(ve, B);
        };
        m(E, (ve) => {
          o(v) > o(l) && ve(R);
        });
      }
      k(() => y(L, `${o(l) ?? ""} selected `)), f(P, Z);
    };
    m(V, (P) => {
      o(l) > 0 && P(G);
    });
  }
  var _e = u(ne, 2), Ve = a(_e);
  let ue;
  var we = u(q, 2);
  {
    var De = (P) => {
      var Z = la(), L = a(Z);
      {
        var E = (ve) => {
          var B = aa();
          ze(B, 21, i, (Y) => Y.id, (Y, me) => {
            const Re = /* @__PURE__ */ ye(() => c(o(me))), Le = /* @__PURE__ */ ye(() => o(me).max_quantity || 10);
            ia(Y, {
              get option() {
                return o(me);
              },
              get selected() {
                return o(Re).selected;
              },
              get quantity() {
                return o(Re).quantity;
              },
              get disabled() {
                return o(Re).disabled;
              },
              get available() {
                return o(Re).available;
              },
              get selectionType() {
                return e.group.selection_type;
              },
              get maxQuantity() {
                return o(Le);
              },
              onChange: (it) => S(o(me).id, it)
            });
          }), k(() => _t(B, "data-selection-type", e.group.selection_type)), f(ve, B);
        }, R = (ve) => {
          var B = oa();
          f(ve, B);
        };
        m(L, (ve) => {
          Array.isArray(i()) && i().length > 0 ? ve(E) : ve(R, !1);
        });
      }
      f(P, Z);
    };
    m(we, (P) => {
      s() && P(De);
    });
  }
  k(
    (P, Z, L) => {
      w = xe(p, 1, "option-group svelte-99mz6y", null, w, P), y(x, `${e.group.name || "Unnamed Group"} `), y(Ae, Z), _t(_e, "aria-label", s() ? "Collapse" : "Expand"), ue = xe(Ve, 0, "icon svelte-99mz6y", null, ue, L);
    },
    [
      () => ({
        expanded: s(),
        required: e.group.required
      }),
      () => Br(_, e.group.selection_type === "single" ? "Select one" : "Select multiple"),
      () => ({ rotated: !s() })
    ]
  ), f(t, p), Xe();
}
ht(["click"]);
var ua = /* @__PURE__ */ h('<div class="pricing-empty svelte-hgfbko"><p>Add options to see pricing</p></div>'), da = /* @__PURE__ */ h('<div class="summary-row savings svelte-hgfbko"><span class="label">Total Savings</span> <span class="amount"> </span></div>'), fa = (t, e) => U(e, !o(e)), _a = /* @__PURE__ */ h('<button class="toggle-btn svelte-hgfbko"> <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M4.646 6.646a.5.5 0 01.708 0L8 9.293l2.646-2.647a.5.5 0 01.708.708l-3 3a.5.5 0 01-.708 0l-3-3a.5.5 0 010-.708z"></path></svg></button>'), ha = /* @__PURE__ */ h('<span class="item-quantity svelte-hgfbko"> </span>'), pa = /* @__PURE__ */ h('<div class="line-item svelte-hgfbko"><div class="item-details svelte-hgfbko"><span class="item-name svelte-hgfbko"> </span> <!></div> <span class="item-price svelte-hgfbko"> </span></div>'), ga = /* @__PURE__ */ h('<div class="option-group svelte-hgfbko"></div>'), ma = /* @__PURE__ */ h('<div class="pricing-section svelte-hgfbko"><h4 class="section-title svelte-hgfbko">Selected Options</h4> <!> <div class="line-item subtotal svelte-hgfbko"><span class="item-name svelte-hgfbko">Options Subtotal</span> <span class="item-price svelte-hgfbko"> </span></div></div>'), ba = (t, e) => U(e, !o(e)), ya = /* @__PURE__ */ h('<span class="item-description svelte-hgfbko"> </span>'), wa = /* @__PURE__ */ h('<div class="line-item discount svelte-hgfbko"><div class="item-details svelte-hgfbko"><span class="item-name svelte-hgfbko"> </span> <!></div> <span class="item-price discount-amount svelte-hgfbko"> </span></div>'), Sa = /* @__PURE__ */ h('<div class="pricing-section svelte-hgfbko"><h4 class="section-title svelte-hgfbko">Discounts Applied <button class="toggle-discounts svelte-hgfbko"> </button></h4> <!></div>'), xa = /* @__PURE__ */ h('<span class="active-badge svelte-hgfbko">Active</span>'), ka = /* @__PURE__ */ h('<div><div class="tier-range svelte-hgfbko"> <!> units</div> <div class="tier-discount svelte-hgfbko"> <!></div></div>'), Ea = /* @__PURE__ */ h('<div class="pricing-section svelte-hgfbko"><h4 class="section-title svelte-hgfbko">Volume Pricing Tiers</h4> <div class="volume-tiers svelte-hgfbko"></div></div>'), Aa = /* @__PURE__ */ h('<div class="line-item small svelte-hgfbko"><span class="item-name svelte-hgfbko"> </span> <span class="item-price svelte-hgfbko"> </span></div>'), Ca = /* @__PURE__ */ h('<div class="pricing-section svelte-hgfbko"><h4 class="section-title svelte-hgfbko">Detailed Breakdown</h4> <div class="breakdown-items svelte-hgfbko"></div></div>'), Ia = /* @__PURE__ */ h('<div class="pricing-section svelte-hgfbko"><h4 class="section-title svelte-hgfbko">Base Configuration</h4> <div class="line-item svelte-hgfbko"><span class="item-name svelte-hgfbko">Base Model Price</span> <span class="item-price svelte-hgfbko"> </span></div></div> <!> <!> <!> <!>', 1), Ta = /* @__PURE__ */ h('<div class="currency-note svelte-hgfbko"> </div>'), Pa = /* @__PURE__ */ h('<div class="pricing-summary svelte-hgfbko"><div class="summary-row total svelte-hgfbko"><span class="label">Total Price</span> <span class="amount"> </span></div> <!> <!></div> <!> <div class="pricing-footer svelte-hgfbko"><div class="final-total svelte-hgfbko"><span class="label">Total</span> <span class="amount"> </span></div> <!></div>', 1), Da = /* @__PURE__ */ h("<div><!></div>");
function qa(t, e) {
  Ze(e, !0);
  let i = te(e, "selections", 19, () => ({})), r = te(e, "options", 19, () => []), n = te(e, "volumeTiers", 19, () => []), s = te(e, "detailed", 3, !1), l = /* @__PURE__ */ Q(Me(s())), v = /* @__PURE__ */ Q(!0);
  function d(x) {
    return Array.isArray(r()) ? r().find((T) => T.id === x) : null;
  }
  function _(x) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(x || 0);
  }
  let S = /* @__PURE__ */ ye(() => () => e.pricingData?.discounts ? e.pricingData.discounts.reduce((x, T) => x + (T.amount || 0), 0) : 0), b = /* @__PURE__ */ ye(() => () => {
    if (!e.pricingData || !o(S)) return 0;
    const x = e.pricingData.base_price + (e.pricingData.options_total || 0);
    return x === 0 ? 0 : Math.round(o(S) / x * 100);
  }), c = /* @__PURE__ */ ye(() => () => {
    const x = /* @__PURE__ */ new Map();
    return Object.entries(i()).forEach(([T, I]) => {
      if (I <= 0) return;
      const C = d(T);
      if (!C) return;
      const se = C.group_id || "other";
      x.has(se) || x.set(se, []), x.get(se).push({
        option: C,
        quantity: I,
        lineTotal: (C.price || 0) * I
      });
    }), Array.from(x.entries());
  });
  var p = Da();
  let w;
  var q = a(p);
  {
    var M = (x) => {
      var T = ua();
      f(x, T);
    }, A = (x) => {
      var T = Pa(), I = He(T), C = a(I), se = u(a(C), 2), re = a(se), ne = u(C, 2);
      {
        var Te = (L) => {
          var E = da(), R = u(a(E), 2), ve = a(R);
          k((B) => y(ve, `-${B ?? ""} (${o(b) ?? ""}%)`), [() => _(o(S))]), f(L, E);
        };
        m(ne, (L) => {
          o(S) > 0 && L(Te);
        });
      }
      var Ae = u(ne, 2);
      {
        var V = (L) => {
          var E = _a();
          E.__click = [fa, l];
          var R = a(E), ve = u(R);
          let B;
          k(
            (Y) => {
              y(R, `${o(l) ? "Hide" : "Show"} Breakdown `), B = xe(ve, 0, "chevron svelte-hgfbko", null, B, Y);
            },
            [() => ({ rotated: o(l) })]
          ), f(L, E);
        };
        m(Ae, (L) => {
          s() && L(V);
        });
      }
      var G = u(I, 2);
      {
        var _e = (L) => {
          var E = Ia(), R = He(E), ve = u(a(R), 2), B = u(a(ve), 2), Y = a(B), me = u(R, 2);
          {
            var Re = (ae) => {
              var qe = ma(), D = u(a(qe), 2);
              ze(D, 17, () => o(c), je, (Pe, z) => {
                var W = /* @__PURE__ */ ye(() => Mi(o(z), 2));
                let F = () => o(W)[1];
                var H = ga();
                ze(H, 21, F, je, (X, oe) => {
                  let O = () => o(oe).option, K = () => o(oe).quantity, de = () => o(oe).lineTotal;
                  var Se = pa(), $ = a(Se), le = a($), he = a(le), J = u(le, 2);
                  {
                    var ie = (ee) => {
                      var fe = ha(), Ne = a(fe);
                      k(($e) => y(Ne, `×${K() ?? ""} @ ${$e ?? ""} each`), [() => _(O().price)]), f(ee, fe);
                    };
                    m(J, (ee) => {
                      K() > 1 && ee(ie);
                    });
                  }
                  var pe = u($, 2), ge = a(pe);
                  k(
                    (ee) => {
                      y(he, O().name), y(ge, ee);
                    },
                    [() => _(de())]
                  ), f(X, Se);
                }), f(Pe, H);
              });
              var j = u(D, 2), ce = u(a(j), 2), be = a(ce);
              k((Pe) => y(be, Pe), [
                () => _(e.pricingData.options_total || 0)
              ]), f(ae, qe);
            };
            m(me, (ae) => {
              o(c).length > 0 && ae(Re);
            });
          }
          var Le = u(me, 2);
          {
            var it = (ae) => {
              var qe = Sa(), D = a(qe), j = u(a(D));
              j.__click = [ba, v];
              var ce = a(j), be = u(D, 2);
              {
                var Pe = (z) => {
                  var W = st(), F = He(W);
                  ze(F, 17, () => e.pricingData.discounts, je, (H, X) => {
                    var oe = wa(), O = a(oe), K = a(O), de = a(K), Se = u(K, 2);
                    {
                      var $ = (J) => {
                        var ie = ya(), pe = a(ie);
                        k(() => y(pe, o(X).description)), f(J, ie);
                      };
                      m(Se, (J) => {
                        o(X).description && J($);
                      });
                    }
                    var le = u(O, 2), he = a(le);
                    k(
                      (J) => {
                        y(de, o(X).name), y(he, `-${J ?? ""}`);
                      },
                      [
                        () => _(o(X).amount)
                      ]
                    ), f(H, oe);
                  }), f(z, W);
                };
                m(be, (z) => {
                  o(v) && z(Pe);
                });
              }
              k(() => y(ce, o(v) ? "Hide" : "Show")), f(ae, qe);
            };
            m(Le, (ae) => {
              e.pricingData.discounts?.length > 0 && ae(it);
            });
          }
          var rt = u(Le, 2);
          {
            var pt = (ae) => {
              var qe = Ea(), D = u(a(qe), 2);
              ze(D, 21, n, je, (j, ce) => {
                var be = ka();
                const Pe = /* @__PURE__ */ ye(() => e.pricingData.active_tier?.id === o(ce).id);
                let z;
                var W = a(be), F = a(W), H = u(F);
                {
                  var X = ($) => {
                    var le = yt();
                    k(() => y(le, `- ${o(ce).max_quantity ?? ""}`)), f($, le);
                  }, oe = ($) => {
                    var le = yt("+");
                    f($, le);
                  };
                  m(H, ($) => {
                    o(ce).max_quantity ? $(X) : $(oe, !1);
                  });
                }
                var O = u(W, 2), K = a(O), de = u(K);
                {
                  var Se = ($) => {
                    var le = xa();
                    f($, le);
                  };
                  m(de, ($) => {
                    o(Pe) && $(Se);
                  });
                }
                k(
                  ($) => {
                    z = xe(be, 1, "tier-item svelte-hgfbko", null, z, $), y(F, `${o(ce).min_quantity ?? ""} `), y(K, `${o(ce).discount_percent ?? ""}% off `);
                  },
                  [() => ({ active: o(Pe) })]
                ), f(j, be);
              }), f(ae, qe);
            };
            m(rt, (ae) => {
              n().length > 0 && s() && ae(pt);
            });
          }
          var ct = u(rt, 2);
          {
            var Oe = (ae) => {
              var qe = Ca(), D = u(a(qe), 2);
              ze(D, 21, () => e.pricingData.breakdown, je, (j, ce) => {
                var be = Aa(), Pe = a(be), z = a(Pe), W = u(Pe, 2), F = a(W);
                k(
                  (H) => {
                    y(z, o(ce).name), y(F, H);
                  },
                  [() => _(o(ce).amount)]
                ), f(j, be);
              }), f(ae, qe);
            };
            m(ct, (ae) => {
              e.pricingData.breakdown && s() && ae(Oe);
            });
          }
          k((ae) => y(Y, ae), [
            () => _(e.pricingData.base_price)
          ]), f(L, E);
        };
        m(G, (L) => {
          o(l) && L(_e);
        });
      }
      var Ve = u(G, 2), ue = a(Ve), we = u(a(ue), 2), De = a(we), P = u(ue, 2);
      {
        var Z = (L) => {
          var E = Ta(), R = a(E);
          k(() => y(R, `Prices shown in ${e.pricingData.currency ?? ""}`)), f(L, E);
        };
        m(P, (L) => {
          e.pricingData.currency && e.pricingData.currency !== "USD" && L(Z);
        });
      }
      k(
        (L, E) => {
          y(re, L), y(De, E);
        },
        [
          () => _(e.pricingData.total_price),
          () => _(e.pricingData.total_price)
        ]
      ), f(x, T);
    };
    m(q, (x) => {
      e.pricingData ? x(A, !1) : x(M);
    });
  }
  k((x) => w = xe(p, 1, "pricing-display svelte-hgfbko", null, w, x), [() => ({ detailed: s() })]), f(t, p), Xe();
}
ht(["click"]);
var Oa = /* @__PURE__ */ h('<div class="validation-success svelte-5l87sd"><div class="success-icon svelte-5l87sd">✅</div> <div class="success-content svelte-5l87sd"><h3 class="svelte-5l87sd">Configuration Valid</h3> <p class="svelte-5l87sd">All constraints are satisfied. Your configuration is ready.</p></div></div>'), Ra = (t, e) => U(e, "all"), Ma = (t, e) => U(e, "critical"), Va = /* @__PURE__ */ h("<button> </button>"), La = (t, e) => U(e, "warning"), Na = /* @__PURE__ */ h("<button> </button>"), za = (t, e) => U(e, "info"), Fa = /* @__PURE__ */ h("<button> </button>"), Ua = /* @__PURE__ */ h('<div class="validation-header svelte-5l87sd"><h3 class="svelte-5l87sd"> </h3> <div class="severity-filters svelte-5l87sd"><button> </button> <!> <!> <!></div></div>'), Ga = /* @__PURE__ */ h('<div class="violation-rule svelte-5l87sd"> </div>'), ja = (t, e, i) => {
  t.stopPropagation(), e(o(i));
}, Ba = /* @__PURE__ */ h('<button class="fix-btn svelte-5l87sd" title="Apply suggested fix">Fix</button>'), Ha = /* @__PURE__ */ h('<div class="detail-section svelte-5l87sd"><h4 class="svelte-5l87sd">Details</h4> <p class="svelte-5l87sd"> </p></div>'), Qa = /* @__PURE__ */ h("<li> </li>"), Ya = /* @__PURE__ */ h('<div class="detail-section svelte-5l87sd"><h4 class="svelte-5l87sd">Affected Options</h4> <ul class="affected-list svelte-5l87sd"></ul></div>'), Wa = /* @__PURE__ */ h(" <!>", 1), Ka = (t, e, i) => e.onFix(o(i)), Ja = /* @__PURE__ */ h('<button class="apply-btn svelte-5l87sd">Apply</button>'), Za = /* @__PURE__ */ h('<div class="suggestion svelte-5l87sd"><span class="suggestion-text"><!></span> <!></div>'), Xa = /* @__PURE__ */ h('<div class="detail-section svelte-5l87sd"><h4 class="svelte-5l87sd">Suggested Actions</h4> <div class="suggestions svelte-5l87sd"></div></div>'), $a = /* @__PURE__ */ h('<div class="detail-section svelte-5l87sd"><h4 class="svelte-5l87sd">Rule Expression</h4> <code class="expression svelte-5l87sd"> </code></div>'), eo = /* @__PURE__ */ h('<div class="violation-details svelte-5l87sd"><!> <!> <!> <!></div>'), to = /* @__PURE__ */ h('<div><div class="violation-header svelte-5l87sd"><div class="violation-icon svelte-5l87sd"> </div> <div class="violation-content svelte-5l87sd"><div class="violation-message svelte-5l87sd"> </div> <!></div> <div class="violation-actions svelte-5l87sd"><!> <button class="expand-btn svelte-5l87sd"><svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M4.646 6.646a.5.5 0 01.708 0L8 9.293l2.646-2.647a.5.5 0 01.708.708l-3 3a.5.5 0 01-.708 0l-3-3a.5.5 0 010-.708z"></path></svg></button></div></div> <!></div>'), io = /* @__PURE__ */ h('<!> <div class="violations-list svelte-5l87sd"></div>', 1), ro = /* @__PURE__ */ h('<div class="validation-empty svelte-5l87sd"><p>Validating configuration...</p></div>'), no = /* @__PURE__ */ h("<div><!></div>");
function ur(t, e) {
  Ze(e, !0);
  let i = te(e, "compact", 3, !1), r = /* @__PURE__ */ Q(Me(/* @__PURE__ */ new Set())), n = /* @__PURE__ */ Q("all"), s = /* @__PURE__ */ ye(() => e.validationResults?.violations || []), l = /* @__PURE__ */ ye(() => () => o(n) === "all" ? o(s) : o(s).filter((A) => A.severity === o(n))), v = /* @__PURE__ */ ye(() => () => {
    const A = { critical: 0, warning: 0, info: 0 };
    return o(s).forEach((x) => {
      A[x.severity || "warning"]++;
    }), A;
  });
  function d(A) {
    const x = new Set(o(r));
    x.has(A) ? x.delete(A) : x.add(A), U(r, x, !0);
  }
  function _(A) {
    switch (A) {
      case "critical":
        return "🚫";
      case "warning":
        return "⚠️";
      case "info":
        return "ℹ️";
      default:
        return "⚠️";
    }
  }
  function S(A) {
    switch (A) {
      case "critical":
        return "error";
      case "warning":
        return "warning";
      case "info":
        return "info";
      default:
        return "warning";
    }
  }
  function b(A) {
    e.onFix && A.suggestions?.length > 0 && e.onFix(A.suggestions[0]);
  }
  var c = no();
  let p;
  var w = a(c);
  {
    var q = (A) => {
      var x = Oa();
      f(A, x);
    }, M = (A, x) => {
      {
        var T = (C) => {
          var se = io(), re = He(se);
          {
            var ne = (Ae) => {
              var V = Ua(), G = a(V), _e = a(G), Ve = u(G, 2), ue = a(Ve);
              let we;
              ue.__click = [Ra, n];
              var De = a(ue), P = u(ue, 2);
              {
                var Z = (B) => {
                  var Y = Va();
                  let me;
                  Y.__click = [Ma, n];
                  var Re = a(Y);
                  k(
                    (Le) => {
                      me = xe(Y, 1, "filter-btn critical svelte-5l87sd", null, me, Le), y(Re, `Critical (${o(v).critical ?? ""})`);
                    },
                    [
                      () => ({
                        active: o(n) === "critical"
                      })
                    ]
                  ), f(B, Y);
                };
                m(P, (B) => {
                  o(v).critical > 0 && B(Z);
                });
              }
              var L = u(P, 2);
              {
                var E = (B) => {
                  var Y = Na();
                  let me;
                  Y.__click = [La, n];
                  var Re = a(Y);
                  k(
                    (Le) => {
                      me = xe(Y, 1, "filter-btn warning svelte-5l87sd", null, me, Le), y(Re, `Warning (${o(v).warning ?? ""})`);
                    },
                    [
                      () => ({
                        active: o(n) === "warning"
                      })
                    ]
                  ), f(B, Y);
                };
                m(L, (B) => {
                  o(v).warning > 0 && B(E);
                });
              }
              var R = u(L, 2);
              {
                var ve = (B) => {
                  var Y = Fa();
                  let me;
                  Y.__click = [za, n];
                  var Re = a(Y);
                  k(
                    (Le) => {
                      me = xe(Y, 1, "filter-btn info svelte-5l87sd", null, me, Le), y(Re, `Info (${o(v).info ?? ""})`);
                    },
                    [
                      () => ({ active: o(n) === "info" })
                    ]
                  ), f(B, Y);
                };
                m(R, (B) => {
                  o(v).info > 0 && B(ve);
                });
              }
              k(
                (B) => {
                  y(_e, `Validation Issues (${o(s).length ?? ""})`), we = xe(ue, 1, "filter-btn svelte-5l87sd", null, we, B), y(De, `All (${o(s).length ?? ""})`);
                },
                [
                  () => ({ active: o(n) === "all" })
                ]
              ), f(Ae, V);
            };
            m(re, (Ae) => {
              i() || Ae(ne);
            });
          }
          var Te = u(re, 2);
          ze(Te, 21, () => o(l), je, (Ae, V, G) => {
            var _e = to();
            const Ve = /* @__PURE__ */ ye(() => o(r).has(o(V).rule_id || G)), ue = /* @__PURE__ */ ye(() => S(o(V).severity));
            let we;
            var De = a(_e);
            De.__click = () => d(o(V).rule_id || G);
            var P = a(De), Z = a(P), L = u(P, 2), E = a(L), R = a(E), ve = u(E, 2);
            {
              var B = (Oe) => {
                var ae = Ga(), qe = a(ae);
                k(() => y(qe, `Rule: ${o(V).rule_name ?? ""}`)), f(Oe, ae);
              };
              m(ve, (Oe) => {
                o(V).rule_name && !i() && Oe(B);
              });
            }
            var Y = u(L, 2), me = a(Y);
            {
              var Re = (Oe) => {
                var ae = Ba();
                ae.__click = [ja, b, V], f(Oe, ae);
              };
              m(me, (Oe) => {
                o(V).suggestions?.length > 0 && e.onFix && Oe(Re);
              });
            }
            var Le = u(me, 2), it = a(Le);
            let rt;
            var pt = u(De, 2);
            {
              var ct = (Oe) => {
                var ae = eo(), qe = a(ae);
                {
                  var D = (F) => {
                    var H = Ha(), X = u(a(H), 2), oe = a(X);
                    k(() => y(oe, o(V).details)), f(F, H);
                  };
                  m(qe, (F) => {
                    o(V).details && F(D);
                  });
                }
                var j = u(qe, 2);
                {
                  var ce = (F) => {
                    var H = Ya(), X = u(a(H), 2);
                    ze(X, 21, () => o(V).affected_options, je, (oe, O) => {
                      var K = Qa(), de = a(K);
                      k(() => y(de, o(O).name || o(O).id)), f(oe, K);
                    }), f(F, H);
                  };
                  m(j, (F) => {
                    o(V).affected_options?.length > 0 && F(ce);
                  });
                }
                var be = u(j, 2);
                {
                  var Pe = (F) => {
                    var H = Xa(), X = u(a(H), 2);
                    ze(X, 21, () => o(V).suggestions, je, (oe, O) => {
                      var K = Za(), de = a(K), Se = a(de);
                      {
                        var $ = (ie) => {
                          var pe = Wa(), ge = He(pe), ee = u(ge);
                          {
                            var fe = (Ne) => {
                              var $e = yt();
                              k(() => y($e, `(×${o(O).quantity ?? ""})`)), f(Ne, $e);
                            };
                            m(ee, (Ne) => {
                              o(O).quantity > 1 && Ne(fe);
                            });
                          }
                          k(() => y(ge, `Add: ${(o(O).option_name || o(O).option_id) ?? ""} `)), f(ie, pe);
                        }, le = (ie, pe) => {
                          {
                            var ge = (fe) => {
                              var Ne = yt();
                              k(() => y(Ne, `Remove: ${(o(O).option_name || o(O).option_id) ?? ""}`)), f(fe, Ne);
                            }, ee = (fe, Ne) => {
                              {
                                var $e = (nt) => {
                                  var gt = yt();
                                  k(() => y(gt, `Change: ${o(O).description ?? ""}`)), f(nt, gt);
                                }, Ci = (nt) => {
                                  var gt = yt();
                                  k(() => y(gt, o(O).description)), f(nt, gt);
                                };
                                m(
                                  fe,
                                  (nt) => {
                                    o(O).action === "change" ? nt($e) : nt(Ci, !1);
                                  },
                                  Ne
                                );
                              }
                            };
                            m(
                              ie,
                              (fe) => {
                                o(O).action === "remove" ? fe(ge) : fe(ee, !1);
                              },
                              pe
                            );
                          }
                        };
                        m(Se, (ie) => {
                          o(O).action === "add" ? ie($) : ie(le, !1);
                        });
                      }
                      var he = u(de, 2);
                      {
                        var J = (ie) => {
                          var pe = Ja();
                          pe.__click = [Ka, e, O], f(ie, pe);
                        };
                        m(he, (ie) => {
                          e.onFix && ie(J);
                        });
                      }
                      f(oe, K);
                    }), f(F, H);
                  };
                  m(be, (F) => {
                    o(V).suggestions?.length > 0 && F(Pe);
                  });
                }
                var z = u(be, 2);
                {
                  var W = (F) => {
                    var H = $a(), X = u(a(H), 2), oe = a(X);
                    k(() => y(oe, o(V).rule_expression)), f(F, H);
                  };
                  m(z, (F) => {
                    o(V).rule_expression && !i() && F(W);
                  });
                }
                f(Oe, ae);
              };
              m(pt, (Oe) => {
                o(Ve) && Oe(ct);
              });
            }
            k(
              (Oe, ae, qe) => {
                we = xe(_e, 1, `violation-item ${o(ue) ?? ""}`, "svelte-5l87sd", we, Oe), y(Z, ae), y(R, o(V).message), _t(Le, "aria-label", o(Ve) ? "Collapse" : "Expand"), rt = xe(it, 0, "chevron svelte-5l87sd", null, rt, qe);
              },
              [
                () => ({ expanded: o(Ve) }),
                () => _(o(V).severity),
                () => ({ rotated: o(Ve) })
              ]
            ), f(Ae, _e);
          }), f(C, se);
        }, I = (C) => {
          var se = ro();
          f(C, se);
        };
        m(
          A,
          (C) => {
            o(s).length > 0 ? C(T) : C(I, !1);
          },
          x
        );
      }
    };
    m(w, (A) => {
      e.validationResults?.is_valid ? A(q) : A(M, !1);
    });
  }
  k((A) => p = xe(c, 1, "validation-display svelte-5l87sd", null, p, A), [() => ({ compact: i() })]), f(t, c), Xe();
}
ht(["click"]);
var so = /* @__PURE__ */ h('<span class="status-badge valid svelte-onht75">✅ Valid</span>'), ao = /* @__PURE__ */ h('<span class="status-badge invalid svelte-onht75">⚠️ Issues</span>'), oo = (t, e) => e.onEdit(0), lo = /* @__PURE__ */ h('<button class="edit-btn svelte-onht75">Edit Selections</button>'), vo = /* @__PURE__ */ h('<span class="item-quantity svelte-onht75"> </span>'), co = /* @__PURE__ */ h('<div class="selection-item svelte-onht75"><div class="item-info svelte-onht75"><span class="item-name svelte-onht75"> </span> <!></div> <span class="item-price svelte-onht75"> </span></div>'), uo = /* @__PURE__ */ h('<div class="selection-group svelte-onht75"><h5 class="group-name svelte-onht75"> </h5> <div class="group-items svelte-onht75"></div></div>'), fo = /* @__PURE__ */ h('<div class="selections-list svelte-onht75"></div>'), _o = /* @__PURE__ */ h('<p class="empty-message svelte-onht75">No options selected</p>'), ho = (t, e) => e.onEdit(1), po = /* @__PURE__ */ h('<button class="edit-btn svelte-onht75">Review Issues</button>'), go = /* @__PURE__ */ h('<div class="violation-summary svelte-onht75"><span class="violation-icon svelte-onht75"> </span> <span class="violation-text svelte-onht75"> </span></div>'), mo = /* @__PURE__ */ h('<p class="more-violations svelte-onht75"> </p>'), bo = /* @__PURE__ */ h('<div class="summary-section svelte-onht75"><div class="section-header svelte-onht75"><h4 class="section-title validation-title svelte-onht75"> </h4> <!></div> <div class="violations-summary svelte-onht75"><!> <!></div></div>'), yo = (t, e) => e.onEdit(2), wo = /* @__PURE__ */ h('<button class="edit-btn svelte-onht75">View Details</button>'), So = /* @__PURE__ */ h('<div class="price-line discount svelte-onht75"><span class="label">Discounts Applied</span> <span class="value"> </span></div>'), xo = () => window.print(), ko = /* @__PURE__ */ h('<div class="configuration-summary svelte-onht75"><div class="summary-header svelte-onht75"><div class="header-info svelte-onht75"><h3 class="svelte-onht75">Configuration Summary</h3> <p class="config-id svelte-onht75"> </p></div> <div class="header-status"><!></div></div> <div class="summary-section svelte-onht75"><h4 class="section-title svelte-onht75">Product Model</h4> <div class="info-grid svelte-onht75"><div class="info-item svelte-onht75"><span class="label svelte-onht75">Model</span> <span class="value svelte-onht75"> </span></div> <div class="info-item svelte-onht75"><span class="label svelte-onht75">Created</span> <span class="value svelte-onht75"> </span></div> <div class="info-item svelte-onht75"><span class="label svelte-onht75">Last Updated</span> <span class="value svelte-onht75"> </span></div></div></div> <div class="summary-section svelte-onht75"><div class="section-header svelte-onht75"><h4 class="section-title svelte-onht75"> </h4> <!></div> <!></div> <!> <div class="summary-section svelte-onht75"><div class="section-header svelte-onht75"><h4 class="section-title svelte-onht75">Pricing Summary</h4> <!></div> <div class="pricing-summary svelte-onht75"><div class="price-line svelte-onht75"><span class="label">Base Price</span> <span class="value"> </span></div> <!> <div class="price-line total svelte-onht75"><span class="label">Total Price</span> <span class="value"> </span></div></div></div> <div class="summary-actions svelte-onht75"><button class="action-btn secondary svelte-onht75"><svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M5 3V1h6v2H5zM4 3H2.5A1.5 1.5 0 001 4.5V10h2V8h10v2h2V4.5A1.5 1.5 0 0013.5 3H12v2H4V3zm9 7h-2v4H5v-4H3v4.5A1.5 1.5 0 004.5 16h7a1.5 1.5 0 001.5-1.5V10z"></path></svg> Print Summary</button> <button class="action-btn secondary svelte-onht75"><svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V2zm10-1H4a1 1 0 00-1 1v12a1 1 0 001 1h8a1 1 0 001-1V2a1 1 0 00-1-1z"></path><path d="M8 3.5a.5.5 0 01.5.5v4.793l1.146-1.147a.5.5 0 01.708.708l-2 2a.5.5 0 01-.708 0l-2-2a.5.5 0 11.708-.708L7.5 8.793V4a.5.5 0 01.5-.5z"></path></svg> Export Configuration</button></div></div>');
function Eo(t, e) {
  Ze(e, !0);
  function i(D) {
    return D ? new Date(D).toLocaleString() : "N/A";
  }
  function r(D) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(D || 0);
  }
  let n = /* @__PURE__ */ ye(() => () => {
    const D = /* @__PURE__ */ new Map();
    return Array.isArray(e.configuration?.selections) && e.configuration.selections.forEach((j) => {
      const ce = j.group_name || "Other Options";
      D.has(ce) || D.set(ce, []), D.get(ce).push(j);
    }), Array.from(D.entries());
  });
  var s = ko(), l = a(s), v = a(l), d = u(a(v), 2), _ = a(d), S = u(v, 2), b = a(S);
  {
    var c = (D) => {
      var j = so();
      f(D, j);
    }, p = (D) => {
      var j = ao();
      f(D, j);
    };
    m(b, (D) => {
      e.configuration?.validation?.is_valid ? D(c) : D(p, !1);
    });
  }
  var w = u(l, 2), q = u(a(w), 2), M = a(q), A = u(a(M), 2), x = a(A), T = u(M, 2), I = u(a(T), 2), C = a(I), se = u(T, 2), re = u(a(se), 2), ne = a(re), Te = u(w, 2), Ae = a(Te), V = a(Ae), G = a(V), _e = u(V, 2);
  {
    var Ve = (D) => {
      var j = lo();
      j.__click = [oo, e], f(D, j);
    };
    m(_e, (D) => {
      e.onEdit && D(Ve);
    });
  }
  var ue = u(Ae, 2);
  {
    var we = (D) => {
      var j = fo();
      ze(j, 21, () => o(n), je, (ce, be) => {
        var Pe = /* @__PURE__ */ ye(() => Mi(o(be), 2));
        let z = () => o(Pe)[0], W = () => o(Pe)[1];
        var F = uo(), H = a(F), X = a(H), oe = u(H, 2);
        ze(oe, 21, W, je, (O, K) => {
          var de = co(), Se = a(de), $ = a(Se), le = a($), he = u($, 2);
          {
            var J = (ge) => {
              var ee = vo(), fe = a(ee);
              k(() => y(fe, `×${o(K).quantity ?? ""}`)), f(ge, ee);
            };
            m(he, (ge) => {
              o(K).quantity > 1 && ge(J);
            });
          }
          var ie = u(Se, 2), pe = a(ie);
          k(
            (ge) => {
              y(le, o(K).option_name), y(pe, ge);
            },
            [
              () => r(o(K).total_price)
            ]
          ), f(O, de);
        }), k(() => y(X, z())), f(ce, F);
      }), f(D, j);
    }, De = (D) => {
      var j = _o();
      f(D, j);
    };
    m(ue, (D) => {
      o(n).length > 0 ? D(we) : D(De, !1);
    });
  }
  var P = u(Te, 2);
  {
    var Z = (D) => {
      var j = bo(), ce = a(j), be = a(ce), Pe = a(be), z = u(be, 2);
      {
        var W = (O) => {
          var K = po();
          K.__click = [ho, e], f(O, K);
        };
        m(z, (O) => {
          e.onEdit && O(W);
        });
      }
      var F = u(ce, 2), H = a(F);
      ze(H, 17, () => e.configuration.validation.violations.slice(0, 3), je, (O, K) => {
        var de = go(), Se = a(de), $ = a(Se), le = u(Se, 2), he = a(le);
        k(() => {
          y($, o(K).severity === "critical" ? "🚫" : "⚠️"), y(he, o(K).message);
        }), f(O, de);
      });
      var X = u(H, 2);
      {
        var oe = (O) => {
          var K = mo(), de = a(K);
          k(() => y(de, `+${e.configuration.validation.violations.length - 3} more issues`)), f(O, K);
        };
        m(X, (O) => {
          e.configuration.validation.violations.length > 3 && O(oe);
        });
      }
      k(() => y(Pe, `Validation Issues (${e.configuration.validation.violations.length ?? ""})`)), f(D, j);
    };
    m(P, (D) => {
      e.configuration?.validation?.violations?.length > 0 && D(Z);
    });
  }
  var L = u(P, 2), E = a(L), R = u(a(E), 2);
  {
    var ve = (D) => {
      var j = wo();
      j.__click = [yo, e], f(D, j);
    };
    m(R, (D) => {
      e.onEdit && D(ve);
    });
  }
  var B = u(E, 2), Y = a(B), me = u(a(Y), 2), Re = a(me), Le = u(Y, 2);
  {
    var it = (D) => {
      var j = So(), ce = u(a(j), 2), be = a(ce);
      k((Pe) => y(be, `-${Pe ?? ""}`), [
        () => r(e.configuration.pricing.discounts.reduce((Pe, z) => Pe + z.amount, 0))
      ]), f(D, j);
    };
    m(Le, (D) => {
      e.configuration?.pricing?.discounts?.length > 0 && D(it);
    });
  }
  var rt = u(Le, 2), pt = u(a(rt), 2), ct = a(pt), Oe = u(L, 2), ae = a(Oe);
  ae.__click = [xo];
  var qe = u(ae, 2);
  qe.__click = () => {
    const D = JSON.stringify(e.configuration, null, 2), j = new Blob([D], { type: "application/json" }), ce = URL.createObjectURL(j), be = document.createElement("a");
    be.href = ce, be.download = `configuration-${e.configuration?.id || "draft"}.json`, be.click(), URL.revokeObjectURL(ce);
  }, k(
    (D, j, ce, be) => {
      y(_, `ID: ${e.configuration?.id || "Not saved"}`), y(x, e.configuration?.model_name || e.model?.name || "Unknown"), y(C, D), y(ne, j), y(G, `Selected Options (${(e.configuration?.selections?.length || 0) ?? ""})`), y(Re, ce), y(ct, be);
    },
    [
      () => i(e.configuration?.metadata?.created),
      () => i(e.configuration?.metadata?.updated),
      () => r(e.configuration?.pricing?.base_price),
      () => r(e.configuration?.pricing?.total_price)
    ]
  ), f(t, s), Xe();
}
ht(["click"]);
function Ao(t, e) {
  U(e, !o(e));
}
var Co = /* @__PURE__ */ h('<div class="loading-container svelte-7b7116"><!></div>'), Io = () => location.reload(), To = /* @__PURE__ */ h('<div class="error-container svelte-7b7116"><div class="error-content svelte-7b7116"><div class="error-icon svelte-7b7116">⚠️</div> <h2>Configuration Error</h2> <p> </p> <button class="btn btn-primary svelte-7b7116">Reload Page</button></div></div>'), Po = /* @__PURE__ */ h('<p class="model-description svelte-7b7116"> </p>'), Do = /* @__PURE__ */ h('<button class="validation-indicator warning svelte-7b7116" title="View validation issues"> </button>'), qo = /* @__PURE__ */ h('<span class="save-indicator svelte-7b7116"><!> Saving...</span>'), Oo = /* @__PURE__ */ h('<span class="save-indicator saved svelte-7b7116"> </span>'), Ro = /* @__PURE__ */ h('<div class="groups-container svelte-7b7116"></div>'), Mo = /* @__PURE__ */ h('<div class="loading-state svelte-7b7116"><!></div>'), Vo = /* @__PURE__ */ h('<div class="empty-state svelte-7b7116"><p>No option groups available for this model.</p></div>'), Lo = /* @__PURE__ */ h('<span class="progress-text svelte-7b7116"> </span>'), No = /* @__PURE__ */ h('<div class="configuration-step"><div class="step-header svelte-7b7116"><h2 class="svelte-7b7116">Select Your Options</h2> <p class="svelte-7b7116">Choose from the available options below. Required selections are marked with *</p></div> <!> <div class="step-actions svelte-7b7116"><div class="selection-summary svelte-7b7116"><span> </span> <!></div> <button class="btn btn-primary svelte-7b7116">Continue to Validation</button></div></div>'), zo = /* @__PURE__ */ h('<div class="validation-loading"><!></div>'), Fo = /* @__PURE__ */ h('<div class="validation-step"><div class="step-header svelte-7b7116"><h2 class="svelte-7b7116">Configuration Validation</h2> <p class="svelte-7b7116">Review and resolve any configuration issues</p></div> <!> <!> <div class="step-actions svelte-7b7116"><button class="btn btn-secondary svelte-7b7116">Back</button> <button class="btn btn-primary svelte-7b7116"> </button></div></div>'), Uo = /* @__PURE__ */ h('<div class="pricing-loading"><!></div>'), Go = /* @__PURE__ */ h('<div class="pricing-step"><div class="step-header svelte-7b7116"><h2 class="svelte-7b7116">Pricing Details</h2> <p class="svelte-7b7116">Review your configuration pricing</p></div> <!> <!> <div class="step-actions svelte-7b7116"><button class="btn btn-secondary svelte-7b7116">Back</button> <button class="btn btn-primary svelte-7b7116">Continue to Summary</button></div></div>'), jo = /* @__PURE__ */ h('<div class="summary-step"><div class="step-header svelte-7b7116"><h2 class="svelte-7b7116">Configuration Summary</h2> <p class="svelte-7b7116">Review your complete configuration</p></div> <!> <div class="step-actions svelte-7b7116"><button class="btn btn-secondary svelte-7b7116">Back</button> <button class="btn btn-success svelte-7b7116"> </button></div></div>'), Bo = (t, e) => U(e, !1), Ho = /* @__PURE__ */ h('<div><div class="panel-header svelte-7b7116"><h3 class="svelte-7b7116">Validation Issues</h3> <button class="close-btn svelte-7b7116">×</button></div> <!></div>'), Qo = /* @__PURE__ */ h('<div class="summary-item discount svelte-7b7116"><span>Discounts Applied</span> <strong class="svelte-7b7116"> </strong></div>'), Yo = /* @__PURE__ */ h('<div class="selected-item svelte-7b7116"><span class="item-name"> </span> <span class="item-quantity svelte-7b7116"> </span></div>'), Wo = /* @__PURE__ */ h('<div class="sidebar-section svelte-7b7116"><h3 class="svelte-7b7116">Selected Items</h3> <div class="selected-items svelte-7b7116"></div></div>'), Ko = /* @__PURE__ */ h('<aside class="configurator-sidebar svelte-7b7116"><div class="sidebar-section svelte-7b7116"><h3 class="svelte-7b7116">Quick Summary</h3> <div class="summary-item svelte-7b7116"><span>Selected Options</span> <strong class="svelte-7b7116"> </strong></div> <div class="summary-item svelte-7b7116"><span>Total Price</span> <strong class="price svelte-7b7116"> </strong></div> <!> <div class="summary-item status svelte-7b7116"><span>Status</span> <strong> </strong></div></div> <!></aside>'), Jo = /* @__PURE__ */ h('<div class="configurator-container svelte-7b7116"><header class="configurator-header svelte-7b7116"><div class="header-content svelte-7b7116"><h1 class="svelte-7b7116"> </h1> <!></div> <div class="header-actions svelte-7b7116"><!> <!></div></header> <!> <div class="configurator-content svelte-7b7116"><!></div> <!> <!></div>'), Zo = /* @__PURE__ */ h("<div><!></div>");
function Xo(t, e) {
  Ze(e, !0);
  let i = te(e, "theme", 3, "light"), r = te(e, "apiUrl", 3, "/api/v1"), n = te(e, "embedMode", 3, !1), s = te(e, "onComplete", 3, null), l = te(e, "onConfigurationChange", 3, null), v = te(e, "onError", 3, null), d = te(e, "configurationId", 3, null);
  const _ = hs();
  let S = /* @__PURE__ */ Q(!1), b = /* @__PURE__ */ Q(!1), c = null;
  const p = [
    {
      id: "configure",
      label: "Configure",
      icon: "⚙️"
    },
    { id: "validate", label: "Validate", icon: "✅" },
    { id: "price", label: "Price", icon: "💰" },
    { id: "summary", label: "Summary", icon: "📋" }
  ];
  typeof window < "u" && (window.__API_BASE_URL__ = r()), Ai(async () => {
    await g.initialize(), g.setModelId(e.modelId), d() && await g.loadConfiguration(d()), U(S, !0), document.documentElement.setAttribute("data-theme", i()), c = setInterval(
      () => {
        g.isDirty && g.saveConfiguration();
      },
      3e4
    );
    const C = On(() => {
      bt(() => {
        l() && g.selectedCount > 0 && l()(g.exportConfiguration());
      }), bt(() => {
        v() && g.error && (v()(new Error(g.error)), _("error", { message: g.error }));
      });
    });
    return () => {
      C(), c && clearInterval(c);
    };
  }), fs(() => {
    g.isDirty && g.saveConfiguration();
  });
  async function w() {
    if (await g.validateConfiguration(), !g.isValid) {
      g.error = "Please resolve all validation issues before completing";
      return;
    }
    await g.saveConfiguration();
    const C = g.exportConfiguration();
    _("complete", C), s()?.(C);
  }
  function q() {
    g.canProceedToStep(g.currentStep + 1) ? g.nextStep() : g.currentStep === 0 && g.selectedCount === 0 ? g.error = "Please select at least one option" : g.currentStep === 1 && !g.isValid && (g.error = "Please resolve validation issues");
  }
  function M() {
    g.previousStep();
  }
  function A(C) {
    g.goToStep(C);
  }
  const x = g;
  var T = Zo(), I = a(T);
  return Ps(I, {
    children: (C, se) => {
      var re = st(), ne = He(re);
      {
        var Te = (V) => {
          var G = Co(), _e = a(G);
          ii(_e, {
            size: "large",
            message: "Loading configuration model..."
          }), f(V, G);
        }, Ae = (V, G) => {
          {
            var _e = (ue) => {
              var we = To(), De = a(we), P = u(a(De), 4), Z = a(P), L = u(P, 2);
              L.__click = [Io], k(() => y(Z, g.error)), f(ue, we);
            }, Ve = (ue, we) => {
              {
                var De = (P) => {
                  var Z = Jo(), L = a(Z), E = a(L), R = a(E), ve = a(R), B = u(R, 2);
                  {
                    var Y = (z) => {
                      var W = Po(), F = a(W);
                      k(() => y(F, g.model.description)), f(z, W);
                    };
                    m(B, (z) => {
                      g.model.description && z(Y);
                    });
                  }
                  var me = u(E, 2), Re = a(me);
                  {
                    var Le = (z) => {
                      var W = Do();
                      W.__click = [Ao, b];
                      var F = a(W);
                      k(() => y(F, `⚠️ ${(g.validationResults?.violations?.length || 0) ?? ""} Issues`)), f(z, W);
                    };
                    m(Re, (z) => {
                      g.hasViolations && z(Le);
                    });
                  }
                  var it = u(Re, 2);
                  {
                    var rt = (z) => {
                      var W = qo(), F = a(W);
                      ii(F, { size: "small" }), f(z, W);
                    }, pt = (z, W) => {
                      {
                        var F = (H) => {
                          var X = Oo(), oe = a(X);
                          k((O) => y(oe, `✅ Saved ${O ?? ""}`), [
                            () => new Date(g.lastSaved).toLocaleTimeString()
                          ]), f(H, X);
                        };
                        m(
                          z,
                          (H) => {
                            g.lastSaved && H(F);
                          },
                          W
                        );
                      }
                    };
                    m(it, (z) => {
                      g.isSaving ? z(rt) : z(pt, !1);
                    });
                  }
                  var ct = u(L, 2);
                  xs(ct, {
                    get steps() {
                      return p;
                    },
                    get currentStep() {
                      return g.currentStep;
                    },
                    onStepClick: A,
                    canNavigate: !0
                  });
                  var Oe = u(ct, 2), ae = a(Oe);
                  {
                    var qe = (z) => {
                      var W = No(), F = u(a(W), 2);
                      {
                        var H = (he) => {
                          var J = Ro();
                          ze(J, 21, () => g.safeGroups, (ie) => ie.id, (ie, pe) => {
                            const ge = /* @__PURE__ */ ye(() => g.safeOptions.filter((fe) => fe.group_id === o(pe).id)), ee = /* @__PURE__ */ ye(() => g.isGroupExpanded(o(pe).id));
                            ca(ie, {
                              get group() {
                                return o(pe);
                              },
                              get options() {
                                return o(ge);
                              },
                              get selections() {
                                return g.selections;
                              },
                              get availableOptions() {
                                return g.availableOptions;
                              },
                              onSelectionChange: (fe, Ne) => g.updateSelection(fe, Ne),
                              get expanded() {
                                return o(ee);
                              },
                              onToggle: () => g.toggleGroup(o(pe).id)
                            });
                          }), f(he, J);
                        }, X = (he, J) => {
                          {
                            var ie = (ge) => {
                              var ee = Mo(), fe = a(ee);
                              ii(fe, { size: "medium", message: "Loading options..." }), f(ge, ee);
                            }, pe = (ge) => {
                              var ee = Vo();
                              f(ge, ee);
                            };
                            m(
                              he,
                              (ge) => {
                                g.isLoading ? ge(ie) : ge(pe, !1);
                              },
                              J
                            );
                          }
                        };
                        m(F, (he) => {
                          g.safeGroups.length > 0 ? he(H) : he(X, !1);
                        });
                      }
                      var oe = u(F, 2), O = a(oe), K = a(O), de = a(K), Se = u(K, 2);
                      {
                        var $ = (he) => {
                          var J = Lo(), ie = a(J);
                          k((pe) => y(ie, `${pe ?? ""}% complete`), [() => Math.round(g.progress)]), f(he, J);
                        };
                        m(Se, (he) => {
                          g.progress > 0 && he($);
                        });
                      }
                      var le = u(O, 2);
                      le.__click = q, k(() => {
                        y(de, `${g.selectedCount ?? ""} options selected`), le.disabled = g.selectedCount === 0;
                      }), f(z, W);
                    }, D = (z, W) => {
                      {
                        var F = (X) => {
                          var oe = Fo(), O = u(a(oe), 2);
                          ur(O, {
                            get validationResults() {
                              return g.validationResults;
                            },
                            onFix: (J) => {
                              J.action === "add" ? g.updateSelection(J.option_id, J.quantity || 1) : J.action === "remove" && g.updateSelection(J.option_id, 0);
                            }
                          });
                          var K = u(O, 2);
                          {
                            var de = (J) => {
                              var ie = zo(), pe = a(ie);
                              ii(pe, {
                                size: "small",
                                message: "Validating configuration..."
                              }), f(J, ie);
                            };
                            m(K, (J) => {
                              g.isValidating && J(de);
                            });
                          }
                          var Se = u(K, 2), $ = a(Se);
                          $.__click = M;
                          var le = u($, 2);
                          le.__click = q;
                          var he = a(le);
                          k(() => {
                            le.disabled = !g.isValid, y(he, g.isValid ? "Continue to Pricing" : "Resolve Issues First");
                          }), f(X, oe);
                        }, H = (X, oe) => {
                          {
                            var O = (de) => {
                              var Se = Go(), $ = u(a(Se), 2);
                              qa($, {
                                get pricingData() {
                                  return g.pricingData;
                                },
                                get selections() {
                                  return g.selections;
                                },
                                get options() {
                                  return g.options;
                                },
                                get volumeTiers() {
                                  return g.volumeTiers;
                                },
                                detailed: !0
                              });
                              var le = u($, 2);
                              {
                                var he = (ge) => {
                                  var ee = Uo(), fe = a(ee);
                                  ii(fe, {
                                    size: "small",
                                    message: "Calculating pricing..."
                                  }), f(ge, ee);
                                };
                                m(le, (ge) => {
                                  g.isPricing && ge(he);
                                });
                              }
                              var J = u(le, 2), ie = a(J);
                              ie.__click = M;
                              var pe = u(ie, 2);
                              pe.__click = q, f(de, Se);
                            }, K = (de, Se) => {
                              {
                                var $ = (le) => {
                                  var he = jo(), J = u(a(he), 2);
                                  const ie = /* @__PURE__ */ ye(() => g.exportConfiguration());
                                  Eo(J, {
                                    get configuration() {
                                      return o(ie);
                                    },
                                    get model() {
                                      return g.model;
                                    },
                                    onEdit: (Ne) => A(Ne)
                                  });
                                  var pe = u(J, 2), ge = a(pe);
                                  ge.__click = M;
                                  var ee = u(ge, 2);
                                  ee.__click = w;
                                  var fe = a(ee);
                                  k(() => {
                                    ee.disabled = g.isSaving, y(fe, g.isSaving ? "Saving..." : "Complete Configuration");
                                  }), f(le, he);
                                };
                                m(
                                  de,
                                  (le) => {
                                    g.currentStep === 3 && le($);
                                  },
                                  Se
                                );
                              }
                            };
                            m(
                              X,
                              (de) => {
                                g.currentStep === 2 ? de(O) : de(K, !1);
                              },
                              oe
                            );
                          }
                        };
                        m(
                          z,
                          (X) => {
                            g.currentStep === 1 ? X(F) : X(H, !1);
                          },
                          W
                        );
                      }
                    };
                    m(ae, (z) => {
                      g.currentStep === 0 ? z(qe) : z(D, !1);
                    });
                  }
                  var j = u(Oe, 2);
                  {
                    var ce = (z) => {
                      var W = Ho();
                      let F;
                      var H = a(W), X = u(a(H), 2);
                      X.__click = [Bo, b];
                      var oe = u(H, 2);
                      ur(oe, {
                        get validationResults() {
                          return g.validationResults;
                        },
                        compact: !0,
                        onFix: (O) => {
                          O.action === "add" ? g.updateSelection(O.option_id, O.quantity || 1) : O.action === "remove" && g.updateSelection(O.option_id, 0), U(b, !1);
                        }
                      }), k((O) => F = xe(W, 1, "validation-panel svelte-7b7116", null, F, O), [
                        () => ({ open: o(b) })
                      ]), f(z, W);
                    };
                    m(j, (z) => {
                      o(b) && g.hasViolations && z(ce);
                    });
                  }
                  var be = u(j, 2);
                  {
                    var Pe = (z) => {
                      var W = Ko(), F = a(W), H = u(a(F), 2), X = u(a(H), 2), oe = a(X), O = u(H, 2), K = u(a(O), 2), de = a(K), Se = u(O, 2);
                      {
                        var $ = (ee) => {
                          var fe = Qo(), Ne = u(a(fe), 2), $e = a(Ne);
                          k(() => y($e, g.discounts.length)), f(ee, fe);
                        };
                        m(Se, (ee) => {
                          g.discounts.length > 0 && ee($);
                        });
                      }
                      var le = u(Se, 2), he = u(a(le), 2);
                      let J;
                      var ie = a(he), pe = u(F, 2);
                      {
                        var ge = (ee) => {
                          var fe = Wo(), Ne = u(a(fe), 2);
                          ze(Ne, 21, () => Object.entries(g.selections), je, ($e, Ci) => {
                            var nt = /* @__PURE__ */ ye(() => Mi(o(Ci), 2));
                            let gt = () => o(nt)[0], Yi = () => o(nt)[1];
                            var Wi = st();
                            const Ki = /* @__PURE__ */ ye(() => g.safeOptions.find((ti) => ti.id === gt()));
                            var Hr = He(Wi);
                            {
                              var Qr = (ti) => {
                                var Ji = Yo(), Zi = a(Ji), Yr = a(Zi), Wr = u(Zi, 2), Kr = a(Wr);
                                k(() => {
                                  y(Yr, o(Ki).name), y(Kr, `×${Yi() ?? ""}`);
                                }), f(ti, Ji);
                              };
                              m(Hr, (ti) => {
                                o(Ki) && Yi() > 0 && ti(Qr);
                              });
                            }
                            f($e, Wi);
                          }), f(ee, fe);
                        };
                        m(pe, (ee) => {
                          g.selectedCount > 0 && ee(ge);
                        });
                      }
                      k(
                        (ee, fe) => {
                          y(oe, g.selectedCount), y(de, `$${ee ?? ""}`), J = xe(he, 1, "svelte-7b7116", null, J, fe), y(ie, g.isValid ? "✅ Valid" : "⚠️ Issues");
                        },
                        [
                          () => g.totalPrice.toFixed(2),
                          () => ({
                            valid: g.isValid,
                            invalid: !g.isValid
                          })
                        ]
                      ), f(z, W);
                    };
                    m(be, (z) => {
                      n() || z(Pe);
                    });
                  }
                  k(() => y(ve, g.model.name)), f(P, Z);
                };
                m(
                  ue,
                  (P) => {
                    o(S) && g.model && P(De);
                  },
                  we
                );
              }
            };
            m(
              V,
              (ue) => {
                g.error && !g.model ? ue(_e) : ue(Ve, !1);
              },
              G
            );
          }
        };
        m(ne, (V) => {
          g.isLoading && !o(S) ? V(Te) : V(Ae, !1);
        });
      }
      f(C, re);
    },
    $$slots: { default: !0 }
  }), k(() => {
    xe(T, 1, `configurator-app ${n() ? "embed-mode" : "standalone-mode"}`, "svelte-7b7116"), _t(T, "data-theme", i());
  }), f(t, T), Xe({ store: x });
}
ht(["click"]);
class dr {
  constructor(e, i = {}) {
    this.element = e, this.options = i, this.app = null, this.store = g;
  }
  mount() {
    return this.element.innerHTML = "", this.app = Zn(Xo, {
      target: this.element,
      props: {
        modelId: this.options.modelId,
        apiUrl: this.options.apiUrl || "/api/v1",
        theme: this.options.theme || "light",
        embedMode: this.options.embedMode !== !1,
        configurationId: this.options.configurationId,
        onComplete: this.options.onComplete,
        onConfigurationChange: this.options.onConfigurationChange,
        onError: this.options.onError
      }
    }), this;
  }
  destroy() {
    this.app && (this.app.$destroy(), this.app = null), this.store.reset();
  }
  updateModel(e) {
    this.app && this.store.setModelId(e);
  }
  updateTheme(e) {
    this.app && document.documentElement.setAttribute("data-theme", e);
  }
  getConfiguration() {
    return this.store.exportConfiguration();
  }
  async loadConfiguration(e) {
    return this.store.loadConfiguration(e);
  }
  reset() {
    this.store.reset();
  }
  // Navigation methods
  nextStep() {
    this.store.nextStep();
  }
  previousStep() {
    this.store.previousStep();
  }
  goToStep(e) {
    this.store.goToStep(e);
  }
  // Selection methods
  updateSelection(e, i) {
    this.store.updateSelection(e, i);
  }
  getSelections() {
    return this.store.selections;
  }
  // Validation methods
  async validate() {
    return this.store.validateSelections();
  }
  isValid() {
    return this.store.isValid;
  }
  getValidationResults() {
    return this.store.validationResults;
  }
  // Pricing methods
  async calculatePricing(e = {}) {
    return this.store.calculatePricing(e);
  }
  getPricingData() {
    return this.store.pricingData;
  }
  getTotalPrice() {
    return this.store.totalPrice;
  }
}
window.CPQConfigurator = {
  create: function(t, e = {}) {
    if (!t)
      throw new Error("Container element is required");
    if (!e.modelId)
      throw new Error("Model ID is required");
    const i = typeof t == "string" ? document.querySelector(t) : t;
    if (!i)
      throw new Error("Container element not found");
    const r = new dr(i, e);
    return r.mount(), r;
  },
  // Version info
  version: "1.0.0",
  // Export classes for advanced usage
  Widget: dr,
  Store: g
};
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-cpq-auto-init]").forEach((e) => {
    const i = e.getAttribute("data-model-id"), r = e.getAttribute("data-api-url"), n = e.getAttribute("data-theme"), s = e.getAttribute("data-config-id");
    if (i)
      try {
        const l = window.CPQConfigurator.create(e, {
          modelId: i,
          apiUrl: r,
          theme: n,
          configurationId: s,
          embedMode: !0,
          onComplete: (v) => {
            e.dispatchEvent(new CustomEvent("cpq:complete", {
              detail: v,
              bubbles: !0
            }));
          },
          onConfigurationChange: (v) => {
            e.dispatchEvent(new CustomEvent("cpq:change", {
              detail: v,
              bubbles: !0
            }));
          },
          onError: (v) => {
            e.dispatchEvent(new CustomEvent("cpq:error", {
              detail: v,
              bubbles: !0
            }));
          }
        });
        e.__cpqWidget = l;
      } catch (l) {
        console.error("Failed to auto-initialize CPQ widget:", l);
      }
  });
});
const el = window.CPQConfigurator;
export {
  dr as CPQWidget,
  g as configStore,
  el as default
};
