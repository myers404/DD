var ur = (e) => {
  throw TypeError(e);
};
var ri = (e, t, r) => t.has(e) || ur("Cannot " + r);
var J = (e, t, r) => (ri(e, t, "read from private field"), r ? r.call(e) : t.get(e)), pt = (e, t, r) => t.has(e) ? ur("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r);
const ii = "5";
var br;
typeof window < "u" && ((br = window.__svelte ?? (window.__svelte = {})).v ?? (br.v = /* @__PURE__ */ new Set())).add(ii);
const We = 1, Ze = 2, yr = 4, ai = 8, ni = 16, si = 1, oi = 2, li = 4, di = 8, vi = 16, ui = 1, ci = 2, xt = Symbol(), fi = "http://www.w3.org/1999/xhtml", cr = !1;
var Xe = Array.isArray, _i = Array.prototype.indexOf, wr = Array.from, Ee = Object.getOwnPropertyDescriptor, Sr = Object.getOwnPropertyDescriptors, gi = Object.prototype, hi = Array.prototype, $e = Object.getPrototypeOf;
function pi(e) {
  return e();
}
function He(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function mi(e, t) {
  if (Array.isArray(e))
    return e;
  if (!(Symbol.iterator in e))
    return Array.from(e);
  const r = [];
  for (const i of e)
    if (r.push(i), r.length === t) break;
  return r;
}
const Rt = 2, kr = 4, Ne = 8, tr = 16, Ft = 32, we = 64, er = 128, wt = 256, Me = 512, Ct = 1024, Lt = 2048, Qt = 4096, Nt = 8192, rr = 16384, Cr = 32768, ir = 65536, xi = 1 << 17, bi = 1 << 19, Er = 1 << 20, Ye = 1 << 21, Kt = Symbol("$state"), yi = Symbol("legacy props"), wi = Symbol("");
function Ir(e) {
  return e === this.v;
}
function Si(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function ar(e) {
  return !Si(e, this.v);
}
function ki(e) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function Ci() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function Ei(e) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function Ii() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function Mi(e) {
  throw new Error("https://svelte.dev/e/props_invalid_value");
}
function Pi() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function Ti() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function Ri() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
let $t = !1, Oi = !1;
function Di() {
  $t = !0;
}
function Mr(e) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
let ot = null;
function fr(e) {
  ot = e;
}
function Ut(e, t = !1, r) {
  var i = ot = {
    p: ot,
    c: null,
    d: !1,
    e: null,
    m: !1,
    s: e,
    x: null,
    l: null
  };
  $t && !t && (ot.l = {
    s: null,
    u: null,
    r1: [],
    r2: se(!1)
  }), zi(() => {
    i.d = !0;
  });
}
function Ht(e) {
  const t = ot;
  if (t !== null) {
    const l = t.e;
    if (l !== null) {
      var r = et, i = at;
      t.e = null;
      try {
        for (var a = 0; a < l.length; a++) {
          var s = l[a];
          De(s.effect), Xt(s.reaction), Lr(s.fn);
        }
      } finally {
        De(r), Xt(i);
      }
    }
    ot = t.p, t.m = !0;
  }
  return (
    /** @type {T} */
    {}
  );
}
function qe() {
  return !$t || ot !== null && ot.l === null;
}
function jt(e) {
  if (typeof e != "object" || e === null || Kt in e)
    return e;
  const t = $e(e);
  if (t !== gi && t !== hi)
    return e;
  var r = /* @__PURE__ */ new Map(), i = Xe(e), a = /* @__PURE__ */ tt(0), s = at, l = (v) => {
    var c = at;
    Xt(s);
    var _ = v();
    return Xt(c), _;
  };
  return i && r.set("length", /* @__PURE__ */ tt(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(v, c, _) {
        return (!("value" in _) || _.configurable === !1 || _.enumerable === !1 || _.writable === !1) && Pi(), l(() => {
          var g = r.get(c);
          g === void 0 ? (g = /* @__PURE__ */ tt(_.value), r.set(c, g)) : Y(g, _.value, !0);
        }), !0;
      },
      deleteProperty(v, c) {
        var _ = r.get(c);
        if (_ === void 0) {
          if (c in v) {
            const f = l(() => /* @__PURE__ */ tt(xt));
            r.set(c, f), Ue(a);
          }
        } else {
          if (i && typeof c == "string") {
            var g = (
              /** @type {Source<number>} */
              r.get("length")
            ), x = Number(c);
            Number.isInteger(x) && x < g.v && Y(g, x);
          }
          Y(_, xt), Ue(a);
        }
        return !0;
      },
      get(v, c, _) {
        if (c === Kt)
          return e;
        var g = r.get(c), x = c in v;
        if (g === void 0 && (!x || Ee(v, c)?.writable) && (g = l(() => {
          var w = jt(x ? v[c] : xt), m = /* @__PURE__ */ tt(w);
          return m;
        }), r.set(c, g)), g !== void 0) {
          var f = o(g);
          return f === xt ? void 0 : f;
        }
        return Reflect.get(v, c, _);
      },
      getOwnPropertyDescriptor(v, c) {
        var _ = Reflect.getOwnPropertyDescriptor(v, c);
        if (_ && "value" in _) {
          var g = r.get(c);
          g && (_.value = o(g));
        } else if (_ === void 0) {
          var x = r.get(c), f = x?.v;
          if (x !== void 0 && f !== xt)
            return {
              enumerable: !0,
              configurable: !0,
              value: f,
              writable: !0
            };
        }
        return _;
      },
      has(v, c) {
        if (c === Kt)
          return !0;
        var _ = r.get(c), g = _ !== void 0 && _.v !== xt || Reflect.has(v, c);
        if (_ !== void 0 || et !== null && (!g || Ee(v, c)?.writable)) {
          _ === void 0 && (_ = l(() => {
            var f = g ? jt(v[c]) : xt, w = /* @__PURE__ */ tt(f);
            return w;
          }), r.set(c, _));
          var x = o(_);
          if (x === xt)
            return !1;
        }
        return g;
      },
      set(v, c, _, g) {
        var x = r.get(c), f = c in v;
        if (i && c === "length")
          for (var w = _; w < /** @type {Source<number>} */
          x.v; w += 1) {
            var m = r.get(w + "");
            m !== void 0 ? Y(m, xt) : w in v && (m = l(() => /* @__PURE__ */ tt(xt)), r.set(w + "", m));
          }
        if (x === void 0)
          (!f || Ee(v, c)?.writable) && (x = l(() => {
            var S = /* @__PURE__ */ tt(void 0);
            return Y(S, jt(_)), S;
          }), r.set(c, x));
        else {
          f = x.v !== xt;
          var q = l(() => jt(_));
          Y(x, q);
        }
        var O = Reflect.getOwnPropertyDescriptor(v, c);
        if (O?.set && O.set.call(g, _), !f) {
          if (i && typeof c == "string") {
            var j = (
              /** @type {Source<number>} */
              r.get("length")
            ), P = Number(c);
            Number.isInteger(P) && P >= j.v && Y(j, P + 1);
          }
          Ue(a);
        }
        return !0;
      },
      ownKeys(v) {
        o(a);
        var c = Reflect.ownKeys(v).filter((x) => {
          var f = r.get(x);
          return f === void 0 || f.v !== xt;
        });
        for (var [_, g] of r)
          g.v !== xt && !(_ in v) && c.push(_);
        return c;
      },
      setPrototypeOf() {
        Ti();
      }
    }
  );
}
function Ue(e, t = 1) {
  Y(e, e.v + t);
}
// @__NO_SIDE_EFFECTS__
function Wt(e) {
  var t = Rt | Lt, r = at !== null && (at.f & Rt) !== 0 ? (
    /** @type {Derived} */
    at
  ) : null;
  return et === null || r !== null && (r.f & wt) !== 0 ? t |= wt : et.f |= Er, {
    ctx: ot,
    deps: null,
    effects: null,
    equals: Ir,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      null
    ),
    wv: 0,
    parent: r ?? et
  };
}
// @__NO_SIDE_EFFECTS__
function yt(e) {
  const t = /* @__PURE__ */ Wt(e);
  return Ur(t), t;
}
// @__NO_SIDE_EFFECTS__
function Pr(e) {
  const t = /* @__PURE__ */ Wt(e);
  return t.equals = ar, t;
}
function Tr(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var r = 0; r < t.length; r += 1)
      te(
        /** @type {Effect} */
        t[r]
      );
  }
}
function Ai(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & Rt) === 0)
      return (
        /** @type {Effect} */
        t
      );
    t = t.parent;
  }
  return null;
}
function Rr(e) {
  var t, r = et;
  De(Ai(e));
  try {
    Tr(e), t = Qr(e);
  } finally {
    De(r);
  }
  return t;
}
function Or(e) {
  var t = Rr(e);
  if (e.equals(t) || (e.v = t, e.wv = Yr()), !ee) {
    var r = (zt || (e.f & wt) !== 0) && e.deps !== null ? Qt : Ct;
    Ot(e, r);
  }
}
const ne = /* @__PURE__ */ new Map();
function se(e, t) {
  var r = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: Ir,
    rv: 0,
    wv: 0
  };
  return r;
}
// @__NO_SIDE_EFFECTS__
function tt(e, t) {
  const r = se(e);
  return Ur(r), r;
}
// @__NO_SIDE_EFFECTS__
function Dr(e, t = !1, r = !0) {
  var a;
  const i = se(e);
  return t || (i.equals = ar), $t && r && ot !== null && ot.l !== null && ((a = ot.l).s ?? (a.s = [])).push(i), i;
}
function Y(e, t, r = !1) {
  at !== null && !At && qe() && (at.f & (Rt | tr)) !== 0 && !qt?.includes(e) && Ri();
  let i = r ? jt(t) : t;
  return Ge(e, i);
}
function Ge(e, t) {
  if (!e.equals(t)) {
    var r = e.v;
    ee ? ne.set(e, t) : ne.set(e, r), e.v = t, (e.f & Rt) !== 0 && ((e.f & Lt) !== 0 && Rr(
      /** @type {Derived} */
      e
    ), Ot(e, (e.f & wt) === 0 ? Ct : Qt)), e.wv = Yr(), Ar(e, Lt), qe() && et !== null && (et.f & Ct) !== 0 && (et.f & (Ft | we)) === 0 && (Mt === null ? Ki([e]) : Mt.push(e));
  }
  return t;
}
function nr(e, t = 1) {
  var r = o(e), i = t === 1 ? r++ : r--;
  return Y(e, r), i;
}
function Ar(e, t) {
  var r = e.reactions;
  if (r !== null)
    for (var i = qe(), a = r.length, s = 0; s < a; s++) {
      var l = r[s], v = l.f;
      (v & Lt) === 0 && (!i && l === et || (Ot(l, t), (v & (Ct | wt)) !== 0 && ((v & Rt) !== 0 ? Ar(
        /** @type {Derived} */
        l,
        Qt
      ) : ze(
        /** @type {Effect} */
        l
      ))));
    }
}
let ji = !1;
var Li, Ni, qi;
function sr(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function Zt(e) {
  return Ni.call(e);
}
// @__NO_SIDE_EFFECTS__
function Fe(e) {
  return qi.call(e);
}
function n(e, t) {
  return /* @__PURE__ */ Zt(e);
}
function Bt(e, t) {
  {
    var r = (
      /** @type {DocumentFragment} */
      /* @__PURE__ */ Zt(
        /** @type {Node} */
        e
      )
    );
    return r instanceof Comment && r.data === "" ? /* @__PURE__ */ Fe(r) : r;
  }
}
function u(e, t = 1, r = !1) {
  let i = e;
  for (; t--; )
    i = /** @type {TemplateNode} */
    /* @__PURE__ */ Fe(i);
  return i;
}
function Fi(e) {
  e.textContent = "";
}
function jr(e) {
  et === null && at === null && Ei(), at !== null && (at.f & wt) !== 0 && et === null && Ci(), ee && ki();
}
function Vi(e, t) {
  var r = t.last;
  r === null ? t.last = t.first = e : (r.next = e, e.prev = r, t.last = e);
}
function Se(e, t, r, i = !0) {
  var a = et, s = {
    ctx: ot,
    deps: null,
    nodes_start: null,
    nodes_end: null,
    f: e | Lt,
    first: null,
    fn: t,
    last: null,
    next: null,
    parent: a,
    prev: null,
    teardown: null,
    transitions: null,
    wv: 0
  };
  if (r)
    try {
      dr(s), s.f |= Cr;
    } catch (c) {
      throw te(s), c;
    }
  else t !== null && ze(s);
  var l = r && s.deps === null && s.first === null && s.nodes_start === null && s.teardown === null && (s.f & (Er | er)) === 0;
  if (!l && i && (a !== null && Vi(s, a), at !== null && (at.f & Rt) !== 0)) {
    var v = (
      /** @type {Derived} */
      at
    );
    (v.effects ?? (v.effects = [])).push(s);
  }
  return s;
}
function zi(e) {
  const t = Se(Ne, null, !1);
  return Ot(t, Ct), t.teardown = e, t;
}
function Tt(e) {
  jr();
  var t = et !== null && (et.f & Ft) !== 0 && ot !== null && !ot.m;
  if (t) {
    var r = (
      /** @type {ComponentContext} */
      ot
    );
    (r.e ?? (r.e = [])).push({
      fn: e,
      effect: et,
      reaction: at
    });
  } else {
    var i = Lr(e);
    return i;
  }
}
function Bi(e) {
  return jr(), Ui(e);
}
function Lr(e) {
  return Se(kr, e, !1);
}
function Ui(e) {
  return Se(Ne, e, !0);
}
function T(e, t = [], r = Wt) {
  const i = t.map(r);
  return or(() => e(...i.map(o)));
}
function or(e, t = 0) {
  return Se(Ne | tr | t, e, !0);
}
function Pe(e, t = !0) {
  return Se(Ne | Ft, e, !0, t);
}
function Nr(e) {
  var t = e.teardown;
  if (t !== null) {
    const r = ee, i = at;
    _r(!0), Xt(null);
    try {
      t.call(null);
    } finally {
      _r(r), Xt(i);
    }
  }
}
function qr(e, t = !1) {
  var r = e.first;
  for (e.first = e.last = null; r !== null; ) {
    var i = r.next;
    (r.f & we) !== 0 ? r.parent = null : te(r, t), r = i;
  }
}
function Hi(e) {
  for (var t = e.first; t !== null; ) {
    var r = t.next;
    (t.f & Ft) === 0 && te(t), t = r;
  }
}
function te(e, t = !0) {
  var r = !1;
  (t || (e.f & bi) !== 0) && e.nodes_start !== null && e.nodes_end !== null && (Yi(
    e.nodes_start,
    /** @type {TemplateNode} */
    e.nodes_end
  ), r = !0), qr(e, t && !r), je(e, 0), Ot(e, rr);
  var i = e.transitions;
  if (i !== null)
    for (const s of i)
      s.stop();
  Nr(e);
  var a = e.parent;
  a !== null && a.first !== null && Fr(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes_start = e.nodes_end = null;
}
function Yi(e, t) {
  for (; e !== null; ) {
    var r = e === t ? null : (
      /** @type {TemplateNode} */
      /* @__PURE__ */ Fe(e)
    );
    e.remove(), e = r;
  }
}
function Fr(e) {
  var t = e.parent, r = e.prev, i = e.next;
  r !== null && (r.next = i), i !== null && (i.prev = r), t !== null && (t.first === e && (t.first = i), t.last === e && (t.last = r));
}
function Qe(e, t) {
  var r = [];
  lr(e, r, !0), Vr(r, () => {
    te(e), t && t();
  });
}
function Vr(e, t) {
  var r = e.length;
  if (r > 0) {
    var i = () => --r || t();
    for (var a of e)
      a.out(i);
  } else
    t();
}
function lr(e, t, r) {
  if ((e.f & Nt) === 0) {
    if (e.f ^= Nt, e.transitions !== null)
      for (const l of e.transitions)
        (l.is_global || r) && t.push(l);
    for (var i = e.first; i !== null; ) {
      var a = i.next, s = (i.f & ir) !== 0 || (i.f & Ft) !== 0;
      lr(i, t, s ? r : !1), i = a;
    }
  }
}
function Te(e) {
  zr(e, !0);
}
function zr(e, t) {
  if ((e.f & Nt) !== 0) {
    e.f ^= Nt, (e.f & Ct) !== 0 && (Ot(e, Lt), ze(e));
    for (var r = e.first; r !== null; ) {
      var i = r.next, a = (r.f & ir) !== 0 || (r.f & Ft) !== 0;
      zr(r, a ? t : !1), r = i;
    }
    if (e.transitions !== null)
      for (const s of e.transitions)
        (s.is_global || t) && s.in();
  }
}
let Re = [];
function Gi() {
  var e = Re;
  Re = [], He(e);
}
function Qi(e) {
  Re.length === 0 && queueMicrotask(Gi), Re.push(e);
}
function Ji(e) {
  var t = (
    /** @type {Effect} */
    et
  );
  if ((t.f & Cr) === 0) {
    if ((t.f & er) === 0)
      throw e;
    t.fn(e);
  } else
    Br(e, t);
}
function Br(e, t) {
  for (; t !== null; ) {
    if ((t.f & er) !== 0)
      try {
        t.fn(e);
        return;
      } catch {
      }
    t = t.parent;
  }
  throw e;
}
let Je = !1, Oe = null, Gt = !1, ee = !1;
function _r(e) {
  ee = e;
}
let Ie = [];
let at = null, At = !1;
function Xt(e) {
  at = e;
}
let et = null;
function De(e) {
  et = e;
}
let qt = null;
function Ur(e) {
  at !== null && at.f & Ye && (qt === null ? qt = [e] : qt.push(e));
}
let mt = null, bt = 0, Mt = null;
function Ki(e) {
  Mt = e;
}
let Hr = 1, Ae = 0, zt = !1;
function Yr() {
  return ++Hr;
}
function Ve(e) {
  var t = e.f;
  if ((t & Lt) !== 0)
    return !0;
  if ((t & Qt) !== 0) {
    var r = e.deps, i = (t & wt) !== 0;
    if (r !== null) {
      var a, s, l = (t & Me) !== 0, v = i && et !== null && !zt, c = r.length;
      if (l || v) {
        var _ = (
          /** @type {Derived} */
          e
        ), g = _.parent;
        for (a = 0; a < c; a++)
          s = r[a], (l || !s?.reactions?.includes(_)) && (s.reactions ?? (s.reactions = [])).push(_);
        l && (_.f ^= Me), v && g !== null && (g.f & wt) === 0 && (_.f ^= wt);
      }
      for (a = 0; a < c; a++)
        if (s = r[a], Ve(
          /** @type {Derived} */
          s
        ) && Or(
          /** @type {Derived} */
          s
        ), s.wv > e.wv)
          return !0;
    }
    (!i || et !== null && !zt) && Ot(e, Ct);
  }
  return !1;
}
function Gr(e, t, r = !0) {
  var i = e.reactions;
  if (i !== null)
    for (var a = 0; a < i.length; a++) {
      var s = i[a];
      qt?.includes(e) || ((s.f & Rt) !== 0 ? Gr(
        /** @type {Derived} */
        s,
        t,
        !1
      ) : t === s && (r ? Ot(s, Lt) : (s.f & Ct) !== 0 && Ot(s, Qt), ze(
        /** @type {Effect} */
        s
      )));
    }
}
function Qr(e) {
  var w;
  var t = mt, r = bt, i = Mt, a = at, s = zt, l = qt, v = ot, c = At, _ = e.f;
  mt = /** @type {null | Value[]} */
  null, bt = 0, Mt = null, zt = (_ & wt) !== 0 && (At || !Gt || at === null), at = (_ & (Ft | we)) === 0 ? e : null, qt = null, fr(e.ctx), At = !1, Ae++, e.f |= Ye;
  try {
    var g = (
      /** @type {Function} */
      (0, e.fn)()
    ), x = e.deps;
    if (mt !== null) {
      var f;
      if (je(e, bt), x !== null && bt > 0)
        for (x.length = bt + mt.length, f = 0; f < mt.length; f++)
          x[bt + f] = mt[f];
      else
        e.deps = x = mt;
      if (!zt)
        for (f = bt; f < x.length; f++)
          ((w = x[f]).reactions ?? (w.reactions = [])).push(e);
    } else x !== null && bt < x.length && (je(e, bt), x.length = bt);
    if (qe() && Mt !== null && !At && x !== null && (e.f & (Rt | Qt | Lt)) === 0)
      for (f = 0; f < /** @type {Source[]} */
      Mt.length; f++)
        Gr(
          Mt[f],
          /** @type {Effect} */
          e
        );
    return a !== null && a !== e && (Ae++, Mt !== null && (i === null ? i = Mt : i.push(.../** @type {Source[]} */
    Mt))), g;
  } catch (m) {
    Ji(m);
  } finally {
    mt = t, bt = r, Mt = i, at = a, zt = s, qt = l, fr(v), At = c, e.f ^= Ye;
  }
}
function Wi(e, t) {
  let r = t.reactions;
  if (r !== null) {
    var i = _i.call(r, e);
    if (i !== -1) {
      var a = r.length - 1;
      a === 0 ? r = t.reactions = null : (r[i] = r[a], r.pop());
    }
  }
  r === null && (t.f & Rt) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (mt === null || !mt.includes(t)) && (Ot(t, Qt), (t.f & (wt | Me)) === 0 && (t.f ^= Me), Tr(
    /** @type {Derived} **/
    t
  ), je(
    /** @type {Derived} **/
    t,
    0
  ));
}
function je(e, t) {
  var r = e.deps;
  if (r !== null)
    for (var i = t; i < r.length; i++)
      Wi(e, r[i]);
}
function dr(e) {
  var t = e.f;
  if ((t & rr) === 0) {
    Ot(e, Ct);
    var r = et, i = Gt;
    et = e, Gt = !0;
    try {
      (t & tr) !== 0 ? Hi(e) : qr(e), Nr(e);
      var a = Qr(e);
      e.teardown = typeof a == "function" ? a : null, e.wv = Hr;
      var s;
      cr && Oi && (e.f & Lt) !== 0 && e.deps;
    } finally {
      Gt = i, et = r;
    }
  }
}
function Zi() {
  try {
    Ii();
  } catch (e) {
    if (Oe !== null)
      Br(e, Oe);
    else
      throw e;
  }
}
function Xi() {
  var e = Gt;
  try {
    var t = 0;
    for (Gt = !0; Ie.length > 0; ) {
      t++ > 1e3 && Zi();
      var r = Ie, i = r.length;
      Ie = [];
      for (var a = 0; a < i; a++) {
        var s = ta(r[a]);
        $i(s);
      }
      ne.clear();
    }
  } finally {
    Je = !1, Gt = e, Oe = null;
  }
}
function $i(e) {
  var t = e.length;
  if (t !== 0)
    for (var r = 0; r < t; r++) {
      var i = e[r];
      (i.f & (rr | Nt)) === 0 && Ve(i) && (dr(i), i.deps === null && i.first === null && i.nodes_start === null && (i.teardown === null ? Fr(i) : i.fn = null));
    }
}
function ze(e) {
  Je || (Je = !0, queueMicrotask(Xi));
  for (var t = Oe = e; t.parent !== null; ) {
    t = t.parent;
    var r = t.f;
    if ((r & (we | Ft)) !== 0) {
      if ((r & Ct) === 0) return;
      t.f ^= Ct;
    }
  }
  Ie.push(t);
}
function ta(e) {
  for (var t = [], r = e; r !== null; ) {
    var i = r.f, a = (i & (Ft | we)) !== 0, s = a && (i & Ct) !== 0;
    if (!s && (i & Nt) === 0) {
      (i & kr) !== 0 ? t.push(r) : a ? r.f ^= Ct : Ve(r) && dr(r);
      var l = r.first;
      if (l !== null) {
        r = l;
        continue;
      }
    }
    var v = r.parent;
    for (r = r.next; r === null && v !== null; )
      r = v.next, v = v.parent;
  }
  return t;
}
function o(e) {
  var t = e.f, r = (t & Rt) !== 0;
  if (at !== null && !At) {
    if (!qt?.includes(e)) {
      var i = at.deps;
      e.rv < Ae && (e.rv = Ae, mt === null && i !== null && i[bt] === e ? bt++ : mt === null ? mt = [e] : (!zt || !mt.includes(e)) && mt.push(e));
    }
  } else if (r && /** @type {Derived} */
  e.deps === null && /** @type {Derived} */
  e.effects === null) {
    var a = (
      /** @type {Derived} */
      e
    ), s = a.parent;
    s !== null && (s.f & wt) === 0 && (a.f ^= wt);
  }
  return r && (a = /** @type {Derived} */
  e, Ve(a) && Or(a)), ee && ne.has(e) ? ne.get(e) : e.v;
}
function Le(e) {
  var t = At;
  try {
    return At = !0, e();
  } finally {
    At = t;
  }
}
const ea = -7169;
function Ot(e, t) {
  e.f = e.f & ea | t;
}
function ra(e) {
  if (!(typeof e != "object" || !e || e instanceof EventTarget)) {
    if (Kt in e)
      Ke(e);
    else if (!Array.isArray(e))
      for (let t in e) {
        const r = e[t];
        typeof r == "object" && r && Kt in r && Ke(r);
      }
  }
}
function Ke(e, t = /* @__PURE__ */ new Set()) {
  if (typeof e == "object" && e !== null && // We don't want to traverse DOM elements
  !(e instanceof EventTarget) && !t.has(e)) {
    t.add(e), e instanceof Date && e.getTime();
    for (let i in e)
      try {
        Ke(e[i], t);
      } catch {
      }
    const r = $e(e);
    if (r !== Object.prototype && r !== Array.prototype && r !== Map.prototype && r !== Set.prototype && r !== Date.prototype) {
      const i = Sr(r);
      for (let a in i) {
        const s = i[a].get;
        if (s)
          try {
            s.call(e);
          } catch {
          }
      }
    }
  }
}
const ia = /* @__PURE__ */ new Set(), aa = /* @__PURE__ */ new Set();
function re(e) {
  for (var t = 0; t < e.length; t++)
    ia.add(e[t]);
  for (var r of aa)
    r(e);
}
function Jr(e) {
  var t = document.createElement("template");
  return t.innerHTML = e.replaceAll("<!>", "<!---->"), t.content;
}
function oe(e, t) {
  var r = (
    /** @type {Effect} */
    et
  );
  r.nodes_start === null && (r.nodes_start = e, r.nodes_end = t);
}
// @__NO_SIDE_EFFECTS__
function y(e, t) {
  var r = (t & ui) !== 0, i = (t & ci) !== 0, a, s = !e.startsWith("<!>");
  return () => {
    a === void 0 && (a = Jr(s ? e : "<!>" + e), r || (a = /** @type {Node} */
    /* @__PURE__ */ Zt(a)));
    var l = (
      /** @type {TemplateNode} */
      i || Li ? document.importNode(a, !0) : a.cloneNode(!0)
    );
    if (r) {
      var v = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Zt(l)
      ), c = (
        /** @type {TemplateNode} */
        l.lastChild
      );
      oe(v, c);
    } else
      oe(l, l);
    return l;
  };
}
// @__NO_SIDE_EFFECTS__
function na(e, t, r = "svg") {
  var i = !e.startsWith("<!>"), a = `<${r}>${i ? e : "<!>" + e}</${r}>`, s;
  return () => {
    if (!s) {
      var l = (
        /** @type {DocumentFragment} */
        Jr(a)
      ), v = (
        /** @type {Element} */
        /* @__PURE__ */ Zt(l)
      );
      s = /** @type {Element} */
      /* @__PURE__ */ Zt(v);
    }
    var c = (
      /** @type {TemplateNode} */
      s.cloneNode(!0)
    );
    return oe(c, c), c;
  };
}
// @__NO_SIDE_EFFECTS__
function Kr(e, t) {
  return /* @__PURE__ */ na(e, t, "svg");
}
function ke(e = "") {
  {
    var t = sr(e + "");
    return oe(t, t), t;
  }
}
function ie() {
  var e = document.createDocumentFragment(), t = document.createComment(""), r = sr();
  return e.append(t, r), oe(t, r), e;
}
function h(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function C(e, t) {
  var r = t == null ? "" : typeof t == "object" ? t + "" : t;
  r !== (e.__t ?? (e.__t = e.nodeValue)) && (e.__t = r, e.nodeValue = r + "");
}
function sa(e) {
  ot === null && Mr(), $t && ot.l !== null ? la(ot).m.push(e) : Tt(() => {
    const t = Le(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
function oa(e, t, { bubbles: r = !1, cancelable: i = !1 } = {}) {
  return new CustomEvent(e, { detail: t, bubbles: r, cancelable: i });
}
function Wr() {
  const e = ot;
  return e === null && Mr(), (t, r, i) => {
    const a = (
      /** @type {Record<string, Function | Function[]>} */
      e.s.$$events?.[
        /** @type {any} */
        t
      ]
    );
    if (a) {
      const s = Xe(a) ? a.slice() : [a], l = oa(
        /** @type {string} */
        t,
        r,
        i
      );
      for (const v of s)
        v.call(e.x, l);
      return !l.defaultPrevented;
    }
    return !0;
  };
}
function la(e) {
  var t = (
    /** @type {ComponentContextLegacy} */
    e.l
  );
  return t.u ?? (t.u = { a: [], b: [], m: [] });
}
function E(e, t, [r, i] = [0, 0]) {
  var a = e, s = null, l = null, v = xt, c = r > 0 ? ir : 0, _ = !1;
  const g = (f, w = !0) => {
    _ = !0, x(w, f);
  }, x = (f, w) => {
    v !== (v = f) && (v ? (s ? Te(s) : w && (s = Pe(() => w(a))), l && Qe(l, () => {
      l = null;
    })) : (l ? Te(l) : w && (l = Pe(() => w(a, [r + 1, i]))), s && Qe(s, () => {
      s = null;
    })));
  };
  or(() => {
    _ = !1, t(g), _ || x(null, null);
  }, c);
}
function St(e, t) {
  return t;
}
function da(e, t, r, i) {
  for (var a = [], s = t.length, l = 0; l < s; l++)
    lr(t[l].e, a, !0);
  var v = s > 0 && a.length === 0 && r !== null;
  if (v) {
    var c = (
      /** @type {Element} */
      /** @type {Element} */
      r.parentNode
    );
    Fi(c), c.append(
      /** @type {Element} */
      r
    ), i.clear(), Vt(e, t[0].prev, t[s - 1].next);
  }
  Vr(a, () => {
    for (var _ = 0; _ < s; _++) {
      var g = t[_];
      v || (i.delete(g.k), Vt(e, g.prev, g.next)), te(g.e, !v);
    }
  });
}
function kt(e, t, r, i, a, s = null) {
  var l = e, v = { flags: t, items: /* @__PURE__ */ new Map(), first: null }, c = (t & yr) !== 0;
  if (c) {
    var _ = (
      /** @type {Element} */
      e
    );
    l = _.appendChild(sr());
  }
  var g = null, x = !1, f = /* @__PURE__ */ Pr(() => {
    var w = r();
    return Xe(w) ? w : w == null ? [] : wr(w);
  });
  or(() => {
    var w = o(f), m = w.length;
    x && m === 0 || (x = m === 0, va(w, v, l, a, t, i, r), s !== null && (m === 0 ? g ? Te(g) : g = Pe(() => s(l)) : g !== null && Qe(g, () => {
      g = null;
    })), o(f));
  });
}
function va(e, t, r, i, a, s, l) {
  var v = (a & ai) !== 0, c = (a & (We | Ze)) !== 0, _ = e.length, g = t.items, x = t.first, f = x, w, m = null, q, O = [], j = [], P, S, p, k;
  if (v)
    for (k = 0; k < _; k += 1)
      P = e[k], S = s(P, k), p = g.get(S), p !== void 0 && (p.a?.measure(), (q ?? (q = /* @__PURE__ */ new Set())).add(p));
  for (k = 0; k < _; k += 1) {
    if (P = e[k], S = s(P, k), p = g.get(S), p === void 0) {
      var I = f ? (
        /** @type {TemplateNode} */
        f.e.nodes_start
      ) : r;
      m = ca(
        I,
        t,
        m,
        m === null ? t.first : m.next,
        P,
        S,
        k,
        i,
        a,
        l
      ), g.set(S, m), O = [], j = [], f = m.next;
      continue;
    }
    if (c && ua(p, P, k, a), (p.e.f & Nt) !== 0 && (Te(p.e), v && (p.a?.unfix(), (q ?? (q = /* @__PURE__ */ new Set())).delete(p))), p !== f) {
      if (w !== void 0 && w.has(p)) {
        if (O.length < j.length) {
          var F = j[0], A;
          m = F.prev;
          var K = O[0], z = O[O.length - 1];
          for (A = 0; A < O.length; A += 1)
            gr(O[A], F, r);
          for (A = 0; A < j.length; A += 1)
            w.delete(j[A]);
          Vt(t, K.prev, z.next), Vt(t, m, K), Vt(t, z, F), f = F, m = z, k -= 1, O = [], j = [];
        } else
          w.delete(p), gr(p, f, r), Vt(t, p.prev, p.next), Vt(t, p, m === null ? t.first : m.next), Vt(t, m, p), m = p;
        continue;
      }
      for (O = [], j = []; f !== null && f.k !== S; )
        (f.e.f & Nt) === 0 && (w ?? (w = /* @__PURE__ */ new Set())).add(f), j.push(f), f = f.next;
      if (f === null)
        continue;
      p = f;
    }
    O.push(p), m = p, f = p.next;
  }
  if (f !== null || w !== void 0) {
    for (var G = w === void 0 ? [] : wr(w); f !== null; )
      (f.e.f & Nt) === 0 && G.push(f), f = f.next;
    var Z = G.length;
    if (Z > 0) {
      var X = (a & yr) !== 0 && _ === 0 ? r : null;
      if (v) {
        for (k = 0; k < Z; k += 1)
          G[k].a?.measure();
        for (k = 0; k < Z; k += 1)
          G[k].a?.fix();
      }
      da(t, G, X, g);
    }
  }
  v && Qi(() => {
    if (q !== void 0)
      for (p of q)
        p.a?.apply();
  }), et.first = t.first && t.first.e, et.last = m && m.e;
}
function ua(e, t, r, i) {
  (i & We) !== 0 && Ge(e.v, t), (i & Ze) !== 0 ? Ge(
    /** @type {Value<number>} */
    e.i,
    r
  ) : e.i = r;
}
function ca(e, t, r, i, a, s, l, v, c, _) {
  var g = (c & We) !== 0, x = (c & ni) === 0, f = g ? x ? /* @__PURE__ */ Dr(a, !1, !1) : se(a) : a, w = (c & Ze) === 0 ? l : se(l), m = {
    i: w,
    v: f,
    k: s,
    a: null,
    // @ts-expect-error
    e: null,
    prev: r,
    next: i
  };
  try {
    return m.e = Pe(() => v(e, f, w, _), ji), m.e.prev = r && r.e, m.e.next = i && i.e, r === null ? t.first = m : (r.next = m, r.e.next = m.e), i !== null && (i.prev = m, i.e.prev = m.e), m;
  } finally {
  }
}
function gr(e, t, r) {
  for (var i = e.next ? (
    /** @type {TemplateNode} */
    e.next.e.nodes_start
  ) : r, a = t ? (
    /** @type {TemplateNode} */
    t.e.nodes_start
  ) : r, s = (
    /** @type {TemplateNode} */
    e.e.nodes_start
  ); s !== i; ) {
    var l = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ Fe(s)
    );
    a.before(s), s = l;
  }
}
function Vt(e, t, r) {
  t === null ? e.first = r : (t.next = r, t.e.next = r && r.e), r !== null && (r.prev = t, r.e.prev = t && t.e);
}
function fa(e, t, r) {
  var i = e == null ? "" : "" + e;
  return t && (i = i ? i + " " + t : t), i === "" ? null : i;
}
function _a(e, t) {
  return e == null ? null : String(e);
}
function _t(e, t, r, i, a, s) {
  var l = e.__className;
  if (l !== r || l === void 0) {
    var v = fa(r, i);
    v == null ? e.removeAttribute("class") : e.className = v, e.__className = r;
  }
  return s;
}
function ga(e, t, r, i) {
  var a = e.__style;
  if (a !== t) {
    var s = _a(t);
    s == null ? e.removeAttribute("style") : e.style.cssText = s, e.__style = t;
  }
  return i;
}
const ha = Symbol("is custom element"), pa = Symbol("is html");
function ma(e, t) {
  var r = Xr(e);
  r.value === (r.value = // treat null and undefined the same for the initial value
  t ?? void 0) || // @ts-expect-error
  // `progress` elements always need their value set when it's `0`
  e.value === t && (t !== 0 || e.nodeName !== "PROGRESS") || (e.value = t ?? "");
}
function Zr(e, t, r, i) {
  var a = Xr(e);
  a[t] !== (a[t] = r) && (t === "loading" && (e[wi] = r), r == null ? e.removeAttribute(t) : typeof r != "string" && xa(e).includes(t) ? e[t] = r : e.setAttribute(t, r));
}
function Xr(e) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    // @ts-expect-error
    e.__attributes ?? (e.__attributes = {
      [ha]: e.nodeName.includes("-"),
      [pa]: e.namespaceURI === fi
    })
  );
}
var hr = /* @__PURE__ */ new Map();
function xa(e) {
  var t = hr.get(e.nodeName);
  if (t) return t;
  hr.set(e.nodeName, t = []);
  for (var r, i = e, a = Element.prototype; a !== i; ) {
    r = Sr(i);
    for (var s in r)
      r[s].set && t.push(s);
    i = $e(i);
  }
  return t;
}
function ba(e = !1) {
  const t = (
    /** @type {ComponentContextLegacy} */
    ot
  ), r = t.l.u;
  if (!r) return;
  let i = () => ra(t.s);
  if (e) {
    let a = 0, s = (
      /** @type {Record<string, any>} */
      {}
    );
    const l = /* @__PURE__ */ Wt(() => {
      let v = !1;
      const c = t.s;
      for (const _ in c)
        c[_] !== s[_] && (s[_] = c[_], v = !0);
      return v && a++, a;
    });
    i = () => o(l);
  }
  r.b.length && Bi(() => {
    pr(t, i), He(r.b);
  }), Tt(() => {
    const a = Le(() => r.m.map(pi));
    return () => {
      for (const s of a)
        typeof s == "function" && s();
    };
  }), r.a.length && Tt(() => {
    pr(t, i), He(r.a);
  });
}
function pr(e, t) {
  if (e.l.s)
    for (const r of e.l.s) o(r);
  t();
}
let Ce = !1;
function ya(e) {
  var t = Ce;
  try {
    return Ce = !1, [e(), Ce];
  } finally {
    Ce = t;
  }
}
function mr(e) {
  return e.ctx?.d ?? !1;
}
function vt(e, t, r, i) {
  var a = (r & si) !== 0, s = !$t || (r & oi) !== 0, l = (r & di) !== 0, v = (r & vi) !== 0, c = !1, _;
  l ? [_, c] = ya(() => (
    /** @type {V} */
    e[t]
  )) : _ = /** @type {V} */
  e[t];
  var g = Kt in e || yi in e, x = l && (Ee(e, t)?.set ?? (g && t in e && ((I) => e[t] = I))) || void 0, f = (
    /** @type {V} */
    i
  ), w = !0, m = !1, q = () => (m = !0, w && (w = !1, v ? f = Le(
    /** @type {() => V} */
    i
  ) : f = /** @type {V} */
  i), f);
  _ === void 0 && i !== void 0 && (x && s && Mi(), _ = q(), x && x(_));
  var O;
  if (s)
    O = () => {
      var I = (
        /** @type {V} */
        e[t]
      );
      return I === void 0 ? q() : (w = !0, m = !1, I);
    };
  else {
    var j = (a ? Wt : Pr)(
      () => (
        /** @type {V} */
        e[t]
      )
    );
    j.f |= xi, O = () => {
      var I = o(j);
      return I !== void 0 && (f = /** @type {V} */
      void 0), I === void 0 ? f : I;
    };
  }
  if ((r & li) === 0 && s)
    return O;
  if (x) {
    var P = e.$$legacy;
    return function(I, F) {
      return arguments.length > 0 ? ((!s || !F || P || c) && x(F ? O() : I), I) : O();
    };
  }
  var S = !1, p = /* @__PURE__ */ Dr(_), k = /* @__PURE__ */ Wt(() => {
    var I = O(), F = o(p);
    return S ? (S = !1, F) : p.v = I;
  });
  return l && o(k), a || (k.equals = ar), function(I, F) {
    if (arguments.length > 0) {
      const A = F ? o(k) : s && l ? jt(I) : I;
      if (!k.equals(A)) {
        if (S = !0, Y(p, A), m && f !== void 0 && (f = A), mr(k))
          return I;
        Le(() => o(k));
      }
      return I;
    }
    return mr(k) ? k.v : o(k);
  };
}
class xr {
  constructor(t, r = {}) {
    this.baseUrl = t || "http://localhost:8080/api/v1", this.modelId = r.modelId, this.authToken = r.authToken, this.timeout = r.timeout || 1e4;
  }
  async request(t, r = {}) {
    const i = `${this.baseUrl}${t}`, a = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...this.authToken && { Authorization: `Bearer ${this.authToken}` },
        ...r.headers
      },
      ...r
    };
    a.body && typeof a.body == "object" && (a.body = JSON.stringify(a.body));
    try {
      const s = new AbortController(), l = setTimeout(() => s.abort(), this.timeout), v = await fetch(i, {
        ...a,
        signal: s.signal
      });
      if (clearTimeout(l), !v.ok)
        throw new Error(`HTTP ${v.status}: ${v.statusText}`);
      return await v.json();
    } catch (s) {
      throw s.name === "AbortError" ? new Error("Request timeout") : s;
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
  async createConfiguration(t = {}) {
    return this.request("/configurations", {
      method: "POST",
      body: {
        model_id: this.modelId,
        selections: Object.entries(t).map(([r, i]) => ({
          option_id: r,
          quantity: i
        }))
      }
    });
  }
  async updateConfiguration(t, r) {
    return this.request(`/configurations/${t}`, {
      method: "PUT",
      body: {
        model_id: this.modelId,
        selections: Object.entries(r).map(([i, a]) => ({
          option_id: i,
          quantity: a
        }))
      }
    });
  }
  async validateConfiguration(t) {
    return this.request("/configurations/validate-selection", {
      method: "POST",
      body: {
        model_id: this.modelId,
        selections: Object.entries(t).map(([r, i]) => ({
          option_id: r,
          quantity: i
        }))
      }
    });
  }
  // Pricing
  async calculatePricing(t, r = {}) {
    return this.request("/pricing/calculate", {
      method: "POST",
      body: {
        model_id: this.modelId,
        selections: Object.entries(t).map(([i, a]) => ({
          option_id: i,
          quantity: a
        })),
        context: r
      }
    });
  }
  async getVolumeTiers() {
    return this.request(`/pricing/volume-tiers/${this.modelId}`);
  }
}
var le, de, ve, ue, ce, fe, _e, ge, he, pe, me, xe, be, ye;
class wa {
  constructor() {
    pt(this, le, /* @__PURE__ */ tt(""));
    pt(this, de, /* @__PURE__ */ tt(null));
    pt(this, ve, /* @__PURE__ */ tt(jt({})));
    pt(this, ue, /* @__PURE__ */ tt(jt([])));
    pt(this, ce, /* @__PURE__ */ tt(null));
    pt(this, fe, /* @__PURE__ */ tt(!1));
    pt(this, _e, /* @__PURE__ */ tt(!1));
    pt(this, ge, /* @__PURE__ */ tt(!1));
    pt(this, he, /* @__PURE__ */ tt(null));
    pt(this, pe, /* @__PURE__ */ tt(0));
    pt(this, me, /* @__PURE__ */ tt(null));
    pt(this, xe, /* @__PURE__ */ tt(null));
    pt(this, be, /* @__PURE__ */ tt(!1));
    pt(this, ye, /* @__PURE__ */ tt(null));
    this.initialized = !1;
  }
  get modelId() {
    return o(J(this, le));
  }
  set modelId(t) {
    Y(J(this, le), t, !0);
  }
  get model() {
    return o(J(this, de));
  }
  set model(t) {
    Y(J(this, de), t, !0);
  }
  get selections() {
    return o(J(this, ve));
  }
  set selections(t) {
    Y(J(this, ve), t, !0);
  }
  get validationResults() {
    return o(J(this, ue));
  }
  set validationResults(t) {
    Y(J(this, ue), t, !0);
  }
  get pricingData() {
    return o(J(this, ce));
  }
  set pricingData(t) {
    Y(J(this, ce), t, !0);
  }
  get isLoading() {
    return o(J(this, fe));
  }
  set isLoading(t) {
    Y(J(this, fe), t, !0);
  }
  get isValidating() {
    return o(J(this, _e));
  }
  set isValidating(t) {
    Y(J(this, _e), t, !0);
  }
  get isPricing() {
    return o(J(this, ge));
  }
  set isPricing(t) {
    Y(J(this, ge), t, !0);
  }
  get error() {
    return o(J(this, he));
  }
  set error(t) {
    Y(J(this, he), t, !0);
  }
  get currentStep() {
    return o(J(this, pe));
  }
  set currentStep(t) {
    Y(J(this, pe), t, !0);
  }
  get configurationId() {
    return o(J(this, me));
  }
  set configurationId(t) {
    Y(J(this, me), t, !0);
  }
  get lastSaved() {
    return o(J(this, xe));
  }
  set lastSaved(t) {
    Y(J(this, xe), t, !0);
  }
  get isDirty() {
    return o(J(this, be));
  }
  set isDirty(t) {
    Y(J(this, be), t, !0);
  }
  get api() {
    return o(J(this, ye));
  }
  set api(t) {
    Y(J(this, ye), t, !0);
  }
  // Initialize effects - call this from components
  initialize() {
    this.initialized || (this.initialized = !0, Tt(() => {
      this.modelId && (this.api = new xr("http://localhost:8080/api/v1", { modelId: this.modelId }), this.loadModel());
    }), Tt(() => {
      this.api && Object.keys(this.selections).length > 0 && this.validateSelections();
    }), Tt(() => {
      this.api && this.isValid && Object.keys(this.selections).length > 0 && this.calculatePricing();
    }), Tt(() => {
      if (this.isDirty && this.configurationId) {
        const t = setInterval(
          () => {
            this.saveConfiguration();
          },
          3e4
        );
        return () => clearInterval(t);
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
  get completionPercentage() {
    if (!this.model?.option_groups) return 0;
    const t = this.model.option_groups.filter((i) => i.required);
    if (t.length === 0) return 100;
    const r = t.filter((i) => i.options.some((a) => this.selections[a.id] > 0));
    return Math.round(r.length / t.length * 100);
  }
  get canProceedToNextStep() {
    switch (this.currentStep) {
      case 0:
        return this.model !== null;
      case 1:
        return this.isValid && Object.keys(this.selections).length > 0;
      case 2:
        return this.isValid && this.pricingData !== null;
      default:
        return !1;
    }
  }
  get selectedOptions() {
    return this.model?.options ? this.model.options.filter((t) => this.selections[t.id] > 0) : [];
  }
  // Actions
  async loadModel() {
    if (this.api) {
      this.isLoading = !0, this.error = null;
      try {
        const t = await this.api.getModel();
        if (t.success)
          this.model = t.data;
        else
          throw new Error(t.message || "Failed to load model");
      } catch (t) {
        this.error = t.message;
      } finally {
        this.isLoading = !1;
      }
    }
  }
  async validateSelections() {
    if (!(!this.api || this.isValidating)) {
      this.isValidating = !0;
      try {
        const t = await this.api.validateConfiguration(this.selections);
        t.success && (this.validationResults = t.data?.validation_result?.errors || []);
      } catch (t) {
        console.warn("Validation failed:", t), this.validationResults = [{ message: "Validation service unavailable" }];
      } finally {
        this.isValidating = !1;
      }
    }
  }
  async calculatePricing() {
    if (!(!this.api || this.isPricing)) {
      this.isPricing = !0;
      try {
        const t = await this.api.calculatePricing(this.selections);
        t.success && (this.pricingData = t.data);
      } catch (t) {
        console.warn("Pricing calculation failed:", t), this.pricingData = null;
      } finally {
        this.isPricing = !1;
      }
    }
  }
  async saveConfiguration() {
    if (this.api)
      try {
        if (this.configurationId)
          await this.api.updateConfiguration(this.configurationId, this.selections);
        else {
          const t = await this.api.createConfiguration(this.selections);
          t.success && (this.configurationId = t.data.id);
        }
        this.lastSaved = /* @__PURE__ */ new Date(), this.isDirty = !1;
      } catch (t) {
        console.warn("Failed to save configuration:", t);
      }
  }
  setModelId(t) {
    this.modelId = t, this.reset(), typeof window < "u" && window.__API_BASE_URL__ && (this.api = new xr(window.__API_BASE_URL__, { modelId: t }), this.loadModel());
  }
  updateSelection(t, r) {
    r <= 0 ? (delete this.selections[t], this.selections = { ...this.selections }) : (this.selections[t] = r, this.selections = { ...this.selections }), this.isDirty = !0, this.api && !this.initialized && this.validateSelections();
  }
  removeSelection(t) {
    delete this.selections[t], this.selections = { ...this.selections }, this.isDirty = !0;
  }
  clearSelections() {
    this.selections = {}, this.validationResults = [], this.pricingData = null, this.isDirty = !0;
  }
  nextStep() {
    this.canProceedToNextStep && (this.currentStep = Math.min(this.currentStep + 1, 3));
  }
  previousStep() {
    this.currentStep = Math.max(this.currentStep - 1, 0);
  }
  goToStep(t) {
    this.currentStep = Math.max(0, Math.min(t, 3));
  }
  reset() {
    this.model = null, this.selections = {}, this.validationResults = [], this.pricingData = null, this.currentStep = 0, this.configurationId = null, this.lastSaved = null, this.isDirty = !1, this.error = null;
  }
  // Sharing and export
  generateShareableUrl() {
    const t = {
      modelId: this.modelId,
      selections: this.selections,
      timestamp: Date.now()
    }, r = btoa(JSON.stringify(t));
    return `${window.location.origin}/configure/${this.modelId}?config=${r}`;
  }
  loadFromShareableUrl(t) {
    try {
      const r = JSON.parse(atob(t));
      r.modelId && r.selections && (this.setModelId(r.modelId), this.selections = r.selections, this.isDirty = !0);
    } catch (r) {
      console.warn("Failed to load shared configuration:", r);
    }
  }
  exportConfiguration() {
    return {
      model_id: this.modelId,
      model_name: this.model?.name,
      selections: this.selectedOptions.map((t) => ({
        option_id: t.id,
        option_name: t.name,
        quantity: this.selections[t.id],
        unit_price: t.base_price,
        total_price: t.base_price * this.selections[t.id]
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
le = new WeakMap(), de = new WeakMap(), ve = new WeakMap(), ue = new WeakMap(), ce = new WeakMap(), fe = new WeakMap(), _e = new WeakMap(), ge = new WeakMap(), he = new WeakMap(), pe = new WeakMap(), me = new WeakMap(), xe = new WeakMap(), be = new WeakMap(), ye = new WeakMap();
const d = new wa();
Di();
var Sa = /* @__PURE__ */ y('<div class="absolute inset-0 flex items-center" aria-hidden="true"><div></div></div>'), ka = (e, t) => d.goToStep(o(t).id), Ca = /* @__PURE__ */ Kr('<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>'), Ea = /* @__PURE__ */ y('<span class="text-sm font-medium"> </span>'), Ia = /* @__PURE__ */ y('<li><!> <button><!></button> <div class="mt-2 text-center"><div> </div> <div> </div></div></li>'), Ma = /* @__PURE__ */ y('<nav aria-label="Progress"><ol class="flex items-center"></ol></nav>');
function Pa(e, t) {
  Ut(t, !1);
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
  ba();
  var i = Ma(), a = n(i);
  kt(a, 5, () => r, St, (s, l, v) => {
    var c = Ia(), _ = n(c);
    {
      var g = (p) => {
        var k = Sa(), I = n(k);
        T(() => _t(I, 1, `h-0.5 w-full ${d.currentStep > o(l).id ? "bg-primary-600" : "bg-gray-200"}`)), h(p, k);
      };
      E(_, (p) => {
        v < r.length - 1 && p(g);
      });
    }
    var x = u(_, 2);
    x.__click = [ka, l];
    var f = n(x);
    {
      var w = (p) => {
        var k = Ca();
        h(p, k);
      }, m = (p) => {
        var k = Ea(), I = n(k);
        T(() => C(I, o(l).id + 1)), h(p, k);
      };
      E(f, (p) => {
        d.currentStep > o(l).id ? p(w) : p(m, !1);
      });
    }
    var q = u(x, 2), O = n(q), j = n(O), P = u(O, 2), S = n(P);
    T(() => {
      _t(c, 1, `relative ${v < r.length - 1 ? "pr-8 sm:pr-20" : ""}`), _t(x, 1, `relative w-8 h-8 flex items-center justify-center rounded-full transition-colors
                 ${d.currentStep > o(l).id ? "bg-primary-600 text-white" : d.currentStep === o(l).id ? "bg-primary-50 border-2 border-primary-600 text-primary-600" : "bg-white border-2 border-gray-300 text-gray-500"}`), Zr(x, "aria-current", d.currentStep === o(l).id ? "step" : void 0), _t(O, 1, `text-xs font-medium ${d.currentStep >= o(l).id ? "text-gray-900" : "text-gray-500"}`), C(j, o(l).name), _t(P, 1, `text-xs ${d.currentStep >= o(l).id ? "text-gray-500" : "text-gray-400"}`), C(S, o(l).description);
    }), h(s, c);
  }), h(e, i), Ht();
}
re(["click"]);
var Ta = /* @__PURE__ */ y('<p class="mt-4 text-sm text-gray-600"> </p>'), Ra = /* @__PURE__ */ y('<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" aria-live="polite"><div class="bg-white rounded-lg p-6 text-center"><div></div> <!></div></div>'), Oa = /* @__PURE__ */ y('<span class="ml-3 text-sm text-gray-600"> </span>'), Da = /* @__PURE__ */ y('<div class="flex items-center justify-center" aria-live="polite"><div></div> <!></div>');
function Aa(e, t) {
  let r = vt(t, "size", 3, "md"), i = vt(t, "color", 3, "primary"), a = vt(t, "message", 3, ""), s = vt(t, "overlay", 3, !1);
  const l = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16"
  }, v = {
    primary: "border-primary-600",
    gray: "border-gray-600",
    white: "border-white"
  };
  var c = ie(), _ = Bt(c);
  {
    var g = (f) => {
      var w = Ra(), m = n(w), q = n(m), O = u(q, 2);
      {
        var j = (P) => {
          var S = Ta(), p = n(S);
          T(() => C(p, a())), h(P, S);
        };
        E(O, (P) => {
          a() && P(j);
        });
      }
      T(() => _t(q, 1, `animate-spin rounded-full ${l[r()] ?? ""} border-2 border-gray-200 ${v[i()] ?? ""} border-t-transparent mx-auto`)), h(f, w);
    }, x = (f) => {
      var w = Da(), m = n(w), q = u(m, 2);
      {
        var O = (j) => {
          var P = Oa(), S = n(P);
          T(() => C(S, a())), h(j, P);
        };
        E(q, (j) => {
          a() && j(O);
        });
      }
      T(() => _t(m, 1, `animate-spin rounded-full ${l[r()] ?? ""} border-2 border-gray-200 ${v[i()] ?? ""} border-t-transparent`)), h(f, w);
    };
    E(_, (f) => {
      s() ? f(g) : f(x, !1);
    });
  }
  h(e, c);
}
function ja(e, t, r, i) {
  t() < r() && i("retry");
}
function La(e, t) {
  t(!t());
}
var Na = /* @__PURE__ */ y('<div class="mt-3 text-xs text-red-600 bg-red-100 p-2 rounded border"><pre class="whitespace-pre-wrap"> </pre></div>'), qa = /* @__PURE__ */ y('<button type="button" class="text-sm bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200 transition-colors"> </button>'), Fa = /* @__PURE__ */ y('<div class="rounded-md bg-red-50 p-4 border border-red-200"><div class="flex"><div class="flex-shrink-0"><svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg></div> <div class="ml-3 flex-1"><h3 class="text-sm font-medium text-red-800"> </h3> <div class="mt-2 text-sm text-red-700"><p> </p></div> <!> <div class="mt-4 flex space-x-3"><!> <button type="button" class="text-sm text-red-600 hover:text-red-500 underline"> </button></div></div></div></div>');
function Va(e, t) {
  Ut(t, !0);
  let r = vt(t, "error", 3, null), i = vt(t, "context", 3, "Application"), a = vt(t, "showDetails", 7, !1), s = vt(t, "retryable", 3, !0), l = vt(t, "retryCount", 3, 0), v = vt(t, "maxRetries", 3, 3);
  const c = Wr();
  let _ = /* @__PURE__ */ yt(() => s() && l() < v());
  var g = ie(), x = Bt(g);
  {
    var f = (w) => {
      var m = Fa(), q = n(m), O = u(n(q), 2), j = n(O), P = n(j), S = u(j, 2), p = n(S), k = n(p), I = u(S, 2);
      {
        var F = (X) => {
          var R = Na(), b = n(R), M = n(b);
          T((L) => C(M, L), [
            () => r().stack || JSON.stringify(r(), null, 2)
          ]), h(X, R);
        };
        E(I, (X) => {
          a() && X(F);
        });
      }
      var A = u(I, 2), K = n(A);
      {
        var z = (X) => {
          var R = qa();
          R.__click = [
            ja,
            l,
            v,
            c
          ];
          var b = n(R);
          T(() => C(b, `Retry ${l() > 0 ? `(${l()}/${v()})` : ""}`)), h(X, R);
        };
        E(K, (X) => {
          o(_) && X(z);
        });
      }
      var G = u(K, 2);
      G.__click = [La, a];
      var Z = n(G);
      T(() => {
        C(P, `${i() ?? ""} Error`), C(k, `Something went wrong. ${r().message || "An unexpected error occurred."}`), C(Z, `${a() ? "Hide" : "Show"} Details`);
      }), h(w, m);
    };
    E(x, (w) => {
      r() && w(f);
    });
  }
  h(e, g), Ht();
}
re(["click"]);
function za(e, t, r) {
  t.group.max_selections && o(r) >= t.group.max_selections || nr(r);
}
function Ba(e, t) {
  o(t) > 0 && nr(t, -1);
}
function Ua(e, t, r) {
  o(t) ? Y(r, 0) : Y(r, 1);
}
var Ha = /* @__PURE__ */ y('<div class="absolute -top-2 -right-2 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center"><svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg></div>'), Ya = /* @__PURE__ */ y('<p class="mt-1 text-sm text-gray-500"> </p>'), Ga = /* @__PURE__ */ y('<span class="text-xs text-gray-500"> </span>'), Qa = /* @__PURE__ */ y('<div class="text-xs text-primary-600"> </div>'), Ja = /* @__PURE__ */ y('<span class="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"> </span>'), Ka = /* @__PURE__ */ y('<span class="text-xs text-gray-500"> </span>'), Wa = /* @__PURE__ */ y('<div class="mt-2 flex flex-wrap gap-1"><!> <!></div>'), Za = /* @__PURE__ */ y('<div class="w-2 h-2 bg-white rounded-full"></div>'), Xa = /* @__PURE__ */ y('<button type="button"><div><!></div> <span> </span></button>'), $a = /* @__PURE__ */ y('<div class="flex items-center space-x-3"><span class="text-sm text-gray-500">Quantity:</span> <div class="flex items-center space-x-2"><button type="button"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path></svg></button> <span class="w-8 text-center text-sm font-medium"> </span> <button type="button"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg></button></div></div>'), tn = /* @__PURE__ */ y('<div class="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded"> </div>'), en = /* @__PURE__ */ y('<div><!> <div class="p-4"><div class="flex items-start justify-between"><div class="flex-1"><h3 class="text-sm font-medium text-gray-900"> </h3> <!></div> <div class="ml-4 text-right"><div class="text-sm font-medium text-gray-900"> <!></div> <!></div></div> <!> <div class="mt-4 flex items-center justify-between"><!> <!></div></div></div>');
function rn(e, t) {
  Ut(t, !0);
  let r = /* @__PURE__ */ tt(jt(d.selections[t.option.id] || 0)), i = /* @__PURE__ */ yt(() => o(r) > 0), a = /* @__PURE__ */ yt(() => o(r) * t.option.base_price);
  Tt(() => {
    d.updateSelection(t.option.id, o(r));
  }), Tt(() => {
    if (t.group.selection_type === "single" && o(i))
      for (const R of t.group.options)
        R.id !== t.option.id && d.selections[R.id] > 0 && d.updateSelection(R.id, 0);
  });
  var s = en(), l = n(s);
  {
    var v = (R) => {
      var b = Ha();
      h(R, b);
    };
    E(l, (R) => {
      o(i) && R(v);
    });
  }
  var c = u(l, 2), _ = n(c), g = n(_), x = n(g), f = n(x), w = u(x, 2);
  {
    var m = (R) => {
      var b = Ya(), M = n(b);
      T(() => C(M, t.option.description)), h(R, b);
    };
    E(w, (R) => {
      t.option.description && R(m);
    });
  }
  var q = u(g, 2), O = n(q), j = n(O), P = u(j);
  {
    var S = (R) => {
      var b = Ga(), M = n(b);
      T(() => C(M, `/${t.option.price_unit ?? ""}`)), h(R, b);
    };
    E(P, (R) => {
      t.option.price_unit && t.option.price_unit !== "each" && R(S);
    });
  }
  var p = u(O, 2);
  {
    var k = (R) => {
      var b = Qa(), M = n(b);
      T((L) => C(M, `Total: $${L ?? ""}`), [() => o(a).toFixed(2)]), h(R, b);
    };
    E(p, (R) => {
      o(a) > t.option.base_price && R(k);
    });
  }
  var I = u(_, 2);
  {
    var F = (R) => {
      var b = Wa(), M = n(b);
      kt(M, 17, () => t.option.constraints.slice(0, 3), St, (N, D) => {
        var Q = Ja(), $ = n(Q);
        T(() => C($, o(D))), h(N, Q);
      });
      var L = u(M, 2);
      {
        var rt = (N) => {
          var D = Ka(), Q = n(D);
          T(() => C(Q, `+${t.option.constraints.length - 3} more`)), h(N, D);
        };
        E(L, (N) => {
          t.option.constraints.length > 3 && N(rt);
        });
      }
      h(R, b);
    };
    E(I, (R) => {
      t.option.constraints && t.option.constraints.length > 0 && R(F);
    });
  }
  var A = u(I, 2), K = n(A);
  {
    var z = (R) => {
      var b = Xa();
      b.__click = [Ua, i, r];
      var M = n(b), L = n(M);
      {
        var rt = (Q) => {
          var $ = Za();
          h(Q, $);
        };
        E(L, (Q) => {
          o(i) && Q(rt);
        });
      }
      var N = u(M, 2), D = n(N);
      T(() => {
        _t(b, 1, `flex items-center space-x-2 text-sm font-medium
                 ${o(i) ? "text-primary-600" : "text-gray-500 hover:text-gray-700"}`), _t(M, 1, `w-4 h-4 rounded-full border-2 flex items-center justify-center
                      ${o(i) ? "border-primary-600 bg-primary-600" : "border-gray-300"}`), C(D, o(i) ? "Selected" : "Select");
      }), h(R, b);
    }, G = (R) => {
      var b = $a(), M = u(n(b), 2), L = n(M);
      L.__click = [Ba, r];
      var rt = u(L, 2), N = n(rt), D = u(rt, 2);
      D.__click = [za, t, r], T(() => {
        _t(L, 1, `w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center
                     ${o(r) > 0 ? "hover:bg-gray-100 text-gray-700" : "text-gray-400 cursor-not-allowed"}`), L.disabled = o(r) <= 0, C(N, o(r)), _t(D, 1, `w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center
                     hover:bg-gray-100 text-gray-700
                     ${t.group.max_selections && o(r) >= t.group.max_selections ? "opacity-50 cursor-not-allowed" : ""}`), D.disabled = t.group.max_selections && o(r) >= t.group.max_selections;
      }), h(R, b);
    };
    E(K, (R) => {
      t.group.selection_type === "single" ? R(z) : R(G, !1);
    });
  }
  var Z = u(K, 2);
  {
    var X = (R) => {
      var b = tn(), M = n(b);
      T(() => C(M, t.option.availability_status)), h(R, b);
    };
    E(Z, (R) => {
      t.option.availability_status && t.option.availability_status !== "available" && R(X);
    });
  }
  T(
    (R) => {
      _t(s, 1, `relative rounded-lg border-2 transition-all duration-200 
            ${o(i) ? "border-primary-500 bg-primary-50" : "border-gray-200 bg-white hover:border-gray-300"}`), C(f, t.option.name), C(j, `$${R ?? ""} `);
    },
    [() => t.option.base_price.toFixed(2)]
  ), h(e, s), Ht();
}
re(["click"]);
var an = /* @__PURE__ */ y('<span class="ml-2 text-sm text-red-500">*</span>'), nn = /* @__PURE__ */ Kr('<svg class="ml-2 w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>'), sn = /* @__PURE__ */ y('<p class="mt-1 text-sm text-gray-500"> </p>'), on = /* @__PURE__ */ y('<div class="text-xs text-gray-400">Choose one</div>'), ln = /* @__PURE__ */ y('<div class="text-xs text-gray-400"><!></div>'), dn = /* @__PURE__ */ y("<div> </div>"), vn = /* @__PURE__ */ y('<div class="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2"></div>'), un = /* @__PURE__ */ y('<div class="text-xs bg-gray-50 p-2 rounded"> </div>'), cn = /* @__PURE__ */ y('<div class="mt-4 text-sm text-gray-600"><details class="group"><summary class="cursor-pointer font-medium group-hover:text-gray-800"> </summary> <div class="mt-2 space-y-1"></div></details></div>'), fn = /* @__PURE__ */ y('<div class="mb-8"><div class="mb-4"><div class="flex items-center justify-between"><div><h2 class="text-lg font-medium text-gray-900 flex items-center"> <!> <!></h2> <!></div> <div class="text-right"><div class="text-sm text-gray-500"> <!> selected</div> <!></div></div> <!></div> <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"></div> <!></div>');
function _n(e, t) {
  Ut(t, !0);
  let r = /* @__PURE__ */ yt(() => t.group.options.reduce(
    (b, M) => b + (d.selections[M.id] || 0),
    0
  )), i = /* @__PURE__ */ yt(() => t.group.required), a = /* @__PURE__ */ yt(() => !o(i) || o(r) >= (t.group.min_selections || 1)), s = /* @__PURE__ */ yt(() => d.validationResults.some((b) => b.group_id === t.group.id || t.group.options.some((M) => b.option_id === M.id)));
  var l = fn(), v = n(l), c = n(v), _ = n(c), g = n(_), x = n(g), f = u(x);
  {
    var w = (b) => {
      var M = an();
      h(b, M);
    };
    E(f, (b) => {
      o(i) && b(w);
    });
  }
  var m = u(f, 2);
  {
    var q = (b) => {
      var M = nn();
      h(b, M);
    };
    E(m, (b) => {
      o(a) && b(q);
    });
  }
  var O = u(g, 2);
  {
    var j = (b) => {
      var M = sn(), L = n(M);
      T(() => C(L, t.group.description)), h(b, M);
    };
    E(O, (b) => {
      t.group.description && b(j);
    });
  }
  var P = u(_, 2), S = n(P), p = n(S), k = u(p);
  {
    var I = (b) => {
      var M = ke();
      T(() => C(M, `/ ${t.group.max_selections ?? ""}`)), h(b, M);
    };
    E(k, (b) => {
      t.group.max_selections && b(I);
    });
  }
  var F = u(S, 2);
  {
    var A = (b) => {
      var M = on();
      h(b, M);
    }, K = (b, M) => {
      {
        var L = (rt) => {
          var N = ln(), D = n(N);
          {
            var Q = (H) => {
              var dt = ke();
              T(() => C(dt, `${t.group.min_selections ?? ""}-${t.group.max_selections ?? ""} required`)), h(H, dt);
            }, $ = (H, dt) => {
              {
                var B = (W) => {
                  var it = ke();
                  T(() => C(it, `Min ${t.group.min_selections ?? ""} required`)), h(W, it);
                }, V = (W, it) => {
                  {
                    var nt = (ut) => {
                      var ct = ke();
                      T(() => C(ct, `Max ${t.group.max_selections ?? ""} allowed`)), h(ut, ct);
                    };
                    E(
                      W,
                      (ut) => {
                        t.group.max_selections && ut(nt);
                      },
                      it
                    );
                  }
                };
                E(
                  H,
                  (W) => {
                    t.group.min_selections ? W(B) : W(V, !1);
                  },
                  dt
                );
              }
            };
            E(D, (H) => {
              t.group.min_selections && t.group.max_selections ? H(Q) : H($, !1);
            });
          }
          h(rt, N);
        };
        E(
          b,
          (rt) => {
            (t.group.min_selections || t.group.max_selections) && rt(L);
          },
          M
        );
      }
    };
    E(F, (b) => {
      t.group.selection_type === "single" ? b(A) : b(K, !1);
    });
  }
  var z = u(c, 2);
  {
    var G = (b) => {
      var M = vn();
      kt(M, 21, () => d.validationResults, St, (L, rt) => {
        var N = ie(), D = Bt(N);
        {
          var Q = ($) => {
            var H = dn(), dt = n(H);
            T(() => C(dt, o(rt).message)), h($, H);
          };
          E(D, ($) => {
            o(rt).group_id === t.group.id && $(Q);
          });
        }
        h(L, N);
      }), h(b, M);
    };
    E(z, (b) => {
      o(s) && b(G);
    });
  }
  var Z = u(v, 2);
  kt(Z, 21, () => t.group.options, St, (b, M) => {
    rn(b, {
      get option() {
        return o(M);
      },
      get group() {
        return t.group;
      }
    });
  });
  var X = u(Z, 2);
  {
    var R = (b) => {
      var M = cn(), L = n(M), rt = n(L), N = n(rt), D = u(rt, 2);
      kt(D, 21, () => t.group.constraints, St, (Q, $) => {
        var H = un(), dt = n(H);
        T(() => C(dt, o($))), h(Q, H);
      }), T(() => C(N, `View Constraints (${t.group.constraints.length ?? ""})`)), h(b, M);
    };
    E(X, (b) => {
      t.group.constraints && t.group.constraints.length > 0 && b(R);
    });
  }
  T(() => {
    C(x, `${t.group.name ?? ""} `), C(p, `${o(r) ?? ""} `);
  }), h(e, l), Ht();
}
var gn = /* @__PURE__ */ y('<div class="text-sm text-gray-500 flex items-center"><div class="animate-spin w-4 h-4 border-2 border-gray-300 border-t-primary-600 rounded-full mr-2"></div> Calculating...</div>'), hn = /* @__PURE__ */ y('<div class="text-sm text-green-600">Updated</div>'), pn = /* @__PURE__ */ y('<span class="text-green-600 ml-2"> </span>'), mn = /* @__PURE__ */ y('<div class="text-sm text-gray-500"> <!></div>'), xn = /* @__PURE__ */ y('<div class="text-gray-500 text-xs"> </div>'), bn = /* @__PURE__ */ y('<div class="flex justify-between text-sm"><div class="flex-1"><div class="text-gray-900"> </div> <!></div> <div class="text-gray-900 font-medium"> </div></div>'), yn = /* @__PURE__ */ y('<div class="flex justify-between text-sm"><span class="text-gray-600"> </span> <span> </span></div>'), wn = /* @__PURE__ */ y('<div class="space-y-3"><h4 class="text-sm font-medium text-gray-700 border-b border-gray-200 pb-2">Price Breakdown</h4> <!> <div class="border-t border-gray-200 pt-3"><div class="flex justify-between text-sm"><span class="text-gray-500">Subtotal</span> <span class="text-gray-900"> </span></div></div> <!> <div class="border-t border-gray-200 pt-3"><div class="flex justify-between text-lg font-medium"><span class="text-gray-900">Total</span> <span class="text-gray-900"> </span></div></div></div>'), Sn = () => d.saveConfiguration(), kn = /* @__PURE__ */ y('<div class="mt-6 space-y-3"><button type="button" class="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors">Save Configuration</button> <button type="button" class="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors">Export Configuration</button></div>'), Cn = /* @__PURE__ */ y('<div class="bg-white rounded-lg border border-gray-200 p-6"><div class="flex items-center justify-between mb-4"><h3 class="text-lg font-medium text-gray-900">Pricing</h3> <!></div> <div class="text-center mb-6"><div class="text-3xl font-bold text-gray-900"> </div> <!></div> <!> <!></div>');
function $r(e, t) {
  Ut(t, !0);
  let r = vt(t, "detailed", 3, !1), i = vt(t, "showBreakdown", 3, !0), a = /* @__PURE__ */ yt(() => d.adjustments.reduce(
    (S, p) => p.amount < 0 ? S + Math.abs(p.amount) : S,
    0
  ));
  var s = Cn(), l = n(s), v = u(n(l), 2);
  {
    var c = (S) => {
      var p = gn();
      h(S, p);
    }, _ = (S, p) => {
      {
        var k = (I) => {
          var F = hn();
          h(I, F);
        };
        E(
          S,
          (I) => {
            d.pricingData && I(k);
          },
          p
        );
      }
    };
    E(v, (S) => {
      d.isPricing ? S(c) : S(_, !1);
    });
  }
  var g = u(l, 2), x = n(g), f = n(x), w = u(x, 2);
  {
    var m = (S) => {
      var p = mn(), k = n(p), I = u(k);
      {
        var F = (A) => {
          var K = pn(), z = n(K);
          T((G) => C(z, `Save $${G ?? ""}`), [() => o(a).toFixed(2)]), h(A, K);
        };
        E(I, (A) => {
          o(a) > 0 && A(F);
        });
      }
      T((A) => C(k, `Base: $${A ?? ""} `), [() => d.basePrice.toFixed(2)]), h(S, p);
    };
    E(w, (S) => {
      d.basePrice !== d.totalPrice && S(m);
    });
  }
  var q = u(g, 2);
  {
    var O = (S) => {
      var p = wn(), k = u(n(p), 2);
      kt(k, 17, () => d.selectedOptions, St, (M, L) => {
        var rt = bn(), N = n(rt), D = n(N), Q = n(D), $ = u(D, 2);
        {
          var H = (V) => {
            var W = xn(), it = n(W);
            T((nt) => C(it, `$${nt ?? ""} × ${d.selections[o(L).id] ?? ""}`), [
              () => o(L).base_price.toFixed(2)
            ]), h(V, W);
          };
          E($, (V) => {
            d.selections[o(L).id] > 1 && V(H);
          });
        }
        var dt = u(N, 2), B = n(dt);
        T(
          (V) => {
            C(Q, o(L).name), C(B, `$${V ?? ""}`);
          },
          [
            () => (o(L).base_price * d.selections[o(L).id]).toFixed(2)
          ]
        ), h(M, rt);
      });
      var I = u(k, 2), F = n(I), A = u(n(F), 2), K = n(A), z = u(I, 2);
      {
        var G = (M) => {
          var L = ie(), rt = Bt(L);
          kt(rt, 17, () => d.adjustments, St, (N, D) => {
            var Q = yn(), $ = n(Q), H = n($), dt = u($, 2), B = n(dt);
            T(
              (V) => {
                C(H, o(D).rule_name || o(D).name), _t(dt, 1, o(D).amount < 0 ? "text-green-600" : "text-red-600"), C(B, `${o(D).amount < 0 ? "-" : "+"}$${V ?? ""}`);
              },
              [
                () => Math.abs(o(D).amount).toFixed(2)
              ]
            ), h(N, Q);
          }), h(M, L);
        };
        E(z, (M) => {
          d.adjustments.length > 0 && M(G);
        });
      }
      var Z = u(z, 2), X = n(Z), R = u(n(X), 2), b = n(R);
      T(
        (M, L) => {
          C(K, `$${M ?? ""}`), C(b, `$${L ?? ""}`);
        },
        [
          () => d.basePrice.toFixed(2),
          () => d.totalPrice.toFixed(2)
        ]
      ), h(S, p);
    };
    E(q, (S) => {
      i() && d.pricingData && d.selectedOptions.length > 0 && S(O);
    });
  }
  var j = u(q, 2);
  {
    var P = (S) => {
      var p = kn(), k = n(p);
      k.__click = [Sn];
      var I = u(k, 2);
      I.__click = () => {
        const F = d.exportConfiguration(), A = new Blob([JSON.stringify(F, null, 2)], { type: "application/json" }), K = URL.createObjectURL(A), z = document.createElement("a");
        z.href = K, z.download = `configuration-${Date.now()}.json`, z.click();
      }, h(S, p);
    };
    E(j, (S) => {
      r() && S(P);
    });
  }
  T((S) => C(f, `$${S ?? ""}`), [() => d.totalPrice.toFixed(2)]), h(e, s), Ht();
}
re(["click"]);
var En = /* @__PURE__ */ y("<li> </li>"), In = /* @__PURE__ */ y('<div class="rounded-md bg-red-50 p-4 border border-red-200"><div class="flex"><div class="flex-shrink-0"><svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg></div> <div class="ml-3"><h3 class="text-sm font-medium text-red-800"> </h3> <div class="mt-2 text-sm text-red-700"><ul class="space-y-1"></ul></div></div></div></div>'), Mn = /* @__PURE__ */ y("<li> </li>"), Pn = /* @__PURE__ */ y('<div class="rounded-md bg-yellow-50 p-4 border border-yellow-200"><div class="flex"><div class="flex-shrink-0"><svg class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg></div> <div class="ml-3"><h3 class="text-sm font-medium text-yellow-800"> </h3> <div class="mt-2 text-sm text-yellow-700"><ul class="space-y-1"></ul></div></div></div></div>'), Tn = /* @__PURE__ */ y("<li> </li>"), Rn = /* @__PURE__ */ y('<div class="rounded-md bg-blue-50 p-4 border border-blue-200"><div class="flex"><div class="flex-shrink-0"><svg class="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg></div> <div class="ml-3"><h3 class="text-sm font-medium text-blue-800"> </h3> <div class="mt-2 text-sm text-blue-700"><ul class="space-y-1"></ul></div></div></div></div>'), On = /* @__PURE__ */ y('<div class="space-y-3"><!> <!> <!></div>'), Dn = /* @__PURE__ */ y('<div class="text-center py-4"><div class="animate-spin w-6 h-6 border-2 border-gray-300 border-t-primary-600 rounded-full mx-auto"></div> <p class="mt-2 text-sm text-gray-500">Validating configuration...</p></div>'), An = /* @__PURE__ */ y('<div class="rounded-md bg-green-50 p-4 border border-green-200"><div class="flex"><div class="flex-shrink-0"><svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg></div> <div class="ml-3"><h3 class="text-sm font-medium text-green-800">Configuration Valid</h3> <div class="mt-2 text-sm text-green-700"><p>Your configuration meets all requirements and constraints.</p></div></div></div></div>');
function ti(e, t) {
  Ut(t, !0);
  let r = vt(t, "showSuggestions", 3, !0), i = /* @__PURE__ */ yt(() => d.validationResults.filter((g) => g.severity === "error" || g.level === "error")), a = /* @__PURE__ */ yt(() => d.validationResults.filter((g) => g.severity === "warning" || g.level === "warning")), s = /* @__PURE__ */ yt(() => d.validationResults.filter((g) => g.severity === "info" || g.level === "suggestion"));
  var l = ie(), v = Bt(l);
  {
    var c = (g) => {
      var x = On(), f = n(x);
      {
        var w = (P) => {
          var S = In(), p = n(S), k = u(n(p), 2), I = n(k), F = n(I), A = u(I, 2), K = n(A);
          kt(K, 21, () => o(i), St, (z, G) => {
            var Z = En(), X = n(Z);
            T(() => C(X, `• ${o(G).message ?? ""}`)), h(z, Z);
          }), T(() => C(F, `Configuration Errors (${o(i).length ?? ""})`)), h(P, S);
        };
        E(f, (P) => {
          o(i).length > 0 && P(w);
        });
      }
      var m = u(f, 2);
      {
        var q = (P) => {
          var S = Pn(), p = n(S), k = u(n(p), 2), I = n(k), F = n(I), A = u(I, 2), K = n(A);
          kt(K, 21, () => o(a), St, (z, G) => {
            var Z = Mn(), X = n(Z);
            T(() => C(X, `• ${o(G).message ?? ""}`)), h(z, Z);
          }), T(() => C(F, `Warnings (${o(a).length ?? ""})`)), h(P, S);
        };
        E(m, (P) => {
          o(a).length > 0 && P(q);
        });
      }
      var O = u(m, 2);
      {
        var j = (P) => {
          var S = Rn(), p = n(S), k = u(n(p), 2), I = n(k), F = n(I), A = u(I, 2), K = n(A);
          kt(K, 21, () => o(s), St, (z, G) => {
            var Z = Tn(), X = n(Z);
            T(() => C(X, `• ${o(G).message ?? ""}`)), h(z, Z);
          }), T(() => C(F, `Suggestions (${o(s).length ?? ""})`)), h(P, S);
        };
        E(O, (P) => {
          r() && o(s).length > 0 && P(j);
        });
      }
      h(g, x);
    }, _ = (g, x) => {
      {
        var f = (m) => {
          var q = Dn();
          h(m, q);
        }, w = (m) => {
          var q = An();
          h(m, q);
        };
        E(
          g,
          (m) => {
            d.isValidating ? m(f) : m(w, !1);
          },
          x
        );
      }
    };
    E(v, (g) => {
      d.validationResults.length > 0 ? g(c) : g(_, !1);
    });
  }
  h(e, l), Ht();
}
var jn = /* @__PURE__ */ y('<div class="text-sm text-gray-500 mt-1"> </div>'), Ln = /* @__PURE__ */ y('<div class="text-sm text-gray-600 mt-1"> </div>'), Nn = /* @__PURE__ */ y('<div class="text-sm text-gray-500"> </div>'), qn = /* @__PURE__ */ y('<div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg"><div class="flex-1"><div class="font-medium text-gray-900"> </div> <!> <!></div> <div class="text-right"><div class="font-medium text-gray-900"> </div> <!></div></div>'), Fn = /* @__PURE__ */ y('<div class="bg-white rounded-lg border border-gray-200 p-6"><h3 class="text-lg font-medium text-gray-900 mb-4">Selected Options</h3> <div class="space-y-4"></div></div>'), Vn = (e, t) => Y(t, !0), zn = () => d.saveConfiguration(), Bn = (e, t) => Y(t, !1), Un = (e) => e.stopPropagation(), Hn = (e, t, r) => t(o(r)), Yn = (e, t) => Y(t, !1), Gn = /* @__PURE__ */ y('<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div class="bg-white rounded-lg p-6 max-w-md w-full mx-4"><h3 class="text-lg font-medium text-gray-900 mb-4">Share Configuration</h3> <div class="space-y-4"><div><label class="block text-sm font-medium text-gray-700 mb-2">Shareable Link</label> <div class="flex"><input type="text" readonly="" class="flex-1 px-3 py-2 border border-gray-300 rounded-l-md text-sm bg-gray-50"/> <button type="button" class="px-4 py-2 bg-primary-600 text-white rounded-r-md hover:bg-primary-700 transition-colors text-sm"> </button></div></div> <div class="flex justify-end space-x-3"><button type="button" class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Close</button></div></div></div></div>'), Qn = /* @__PURE__ */ y('<div class="space-y-6"><div class="bg-white rounded-lg border border-gray-200 p-6"><h2 class="text-xl font-semibold text-gray-900 mb-4">Configuration Summary</h2> <div class="grid grid-cols-1 md:grid-cols-3 gap-4"><div class="text-center p-4 bg-gray-50 rounded-lg"><div class="text-2xl font-bold text-primary-600"> </div> <div class="text-sm text-gray-500">Options Selected</div></div> <div class="text-center p-4 bg-gray-50 rounded-lg"><div class="text-2xl font-bold text-primary-600"> </div> <div class="text-sm text-gray-500">Complete</div></div> <div class="text-center p-4 bg-gray-50 rounded-lg"><div> </div> <div class="text-sm text-gray-500"> </div></div></div></div> <!> <div class="bg-white rounded-lg border border-gray-200 p-6"><h3 class="text-lg font-medium text-gray-900 mb-4">Validation Status</h3> <!></div> <!> <div class="bg-white rounded-lg border border-gray-200 p-6"><h3 class="text-lg font-medium text-gray-900 mb-4">Actions</h3> <div class="grid grid-cols-1 md:grid-cols-2 gap-4"><button type="button" class="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"><svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path></svg> Share Configuration</button> <button type="button" class="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"><svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg> Export Configuration</button> <button type="button" class="flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 transition-colors"><svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg> Save Configuration</button> <button type="button" class="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors"><svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 3H3m4 10v6a1 1 0 001 1h6a1 1 0 001-1v-6m-8 0V9a1 1 0 011-1h6a1 1 0 011 1v4.01"></path></svg> Request Quote</button></div></div></div> <!>', 1);
function Jn(e, t) {
  Ut(t, !0);
  let r = /* @__PURE__ */ yt(() => d.generateShareableUrl()), i = /* @__PURE__ */ tt(!1), a = /* @__PURE__ */ tt(!1);
  async function s(N) {
    try {
      await navigator.clipboard.writeText(N), Y(a, !0), setTimeout(() => Y(a, !1), 2e3);
    } catch (D) {
      console.warn("Failed to copy to clipboard:", D);
    }
  }
  function l() {
    const N = d.exportConfiguration(), D = new Blob([JSON.stringify(N, null, 2)], { type: "application/json" }), Q = URL.createObjectURL(D), $ = document.createElement("a");
    $.href = Q, $.download = `configuration-${Date.now()}.json`, $.click(), URL.revokeObjectURL(Q);
  }
  var v = Qn(), c = Bt(v), _ = n(c), g = u(n(_), 2), x = n(g), f = n(x), w = n(f), m = u(x, 2), q = n(m), O = n(q), j = u(m, 2), P = n(j), S = n(P), p = u(P, 2), k = n(p), I = u(_, 2);
  {
    var F = (N) => {
      var D = Fn(), Q = u(n(D), 2);
      kt(Q, 21, () => d.selectedOptions, St, ($, H) => {
        var dt = qn(), B = n(dt), V = n(B), W = n(V), it = u(V, 2);
        {
          var nt = (U) => {
            var lt = jn(), gt = n(lt);
            T(() => C(gt, o(H).description)), h(U, lt);
          };
          E(it, (U) => {
            o(H).description && U(nt);
          });
        }
        var ut = u(it, 2);
        {
          var ct = (U) => {
            var lt = Ln(), gt = n(lt);
            T(() => C(gt, `Quantity: ${d.selections[o(H).id] ?? ""}`)), h(U, lt);
          };
          E(ut, (U) => {
            d.selections[o(H).id] > 1 && U(ct);
          });
        }
        var ht = u(B, 2), ft = n(ht), Et = n(ft), Pt = u(ft, 2);
        {
          var st = (U) => {
            var lt = Nn(), gt = n(lt);
            T((Dt) => C(gt, `$${Dt ?? ""} each`), [
              () => o(H).base_price.toFixed(2)
            ]), h(U, lt);
          };
          E(Pt, (U) => {
            d.selections[o(H).id] > 1 && U(st);
          });
        }
        T(
          (U) => {
            C(W, o(H).name), C(Et, `$${U ?? ""}`);
          },
          [
            () => (o(H).base_price * d.selections[o(H).id]).toFixed(2)
          ]
        ), h($, dt);
      }), h(N, D);
    };
    E(I, (N) => {
      d.selectedOptions.length > 0 && N(F);
    });
  }
  var A = u(I, 2), K = u(n(A), 2);
  ti(K, {});
  var z = u(A, 2);
  $r(z, { detailed: !0 });
  var G = u(z, 2), Z = u(n(G), 2), X = n(Z);
  X.__click = [Vn, i];
  var R = u(X, 2);
  R.__click = l;
  var b = u(R, 2);
  b.__click = [zn];
  var M = u(b, 2), L = u(c, 2);
  {
    var rt = (N) => {
      var D = Gn();
      D.__click = [Bn, i];
      var Q = n(D);
      Q.__click = [Un];
      var $ = u(n(Q), 2), H = n($), dt = u(n(H), 2), B = n(dt), V = u(B, 2);
      V.__click = [Hn, s, r];
      var W = n(V), it = u(H, 2), nt = n(it);
      nt.__click = [Yn, i], T(() => {
        ma(B, o(r)), C(W, o(a) ? "Copied!" : "Copy");
      }), h(N, D);
    };
    E(L, (N) => {
      o(i) && N(rt);
    });
  }
  T(() => {
    C(w, d.selectedOptions.length), C(O, `${d.completionPercentage ?? ""}%`), _t(P, 1, `text-2xl font-bold ${d.isValid ? "text-green-600" : "text-red-600"}`), C(S, d.isValid ? "✓" : "✗"), C(k, d.isValid ? "Valid" : "Has Errors"), b.disabled = !d.isValid, M.disabled = !d.isValid;
  }), h(e, v), Ht();
}
re(["click"]);
function Kn(e, t, r, i) {
  const a = d.exportConfiguration();
  t() && t()(a), r("complete", a), i() && window.parent !== window && window.parent.postMessage(
    {
      type: "cpq-configuration-complete",
      configuration: a
    },
    "*"
  );
}
var Wn = /* @__PURE__ */ y('<div class="text-sm text-red-500"> </div>'), Zn = /* @__PURE__ */ y('<div class="text-sm text-green-600">Valid</div>'), Xn = /* @__PURE__ */ y('<div class="cpq-embed-header bg-white border-b border-gray-200 p-4"><div class="flex items-center justify-between"><div><h1 class="text-lg font-semibold text-gray-900"> </h1> <div class="text-sm text-gray-500"> </div></div> <div class="text-right"><div class="text-lg font-bold text-primary-600"> </div> <!></div></div> <div class="mt-3"><div class="bg-gray-200 rounded-full h-2"><div class="bg-primary-600 h-2 rounded-full transition-all duration-300"></div></div></div></div>'), $n = /* @__PURE__ */ y('<p class="mt-1 text-gray-600"> </p>'), ts = /* @__PURE__ */ y('<div class="mb-8"><div class="flex items-center justify-between mb-6"><div><h1 class="text-2xl font-bold text-gray-900"> </h1> <!></div> <div class="text-right"><div class="text-sm text-gray-500">Progress</div> <div class="text-lg font-semibold text-primary-600"> </div></div></div> <!></div>'), es = /* @__PURE__ */ y('<div><span class="text-gray-500"> </span> <span class="ml-2 text-gray-900"> </span></div>'), rs = /* @__PURE__ */ y('<div><h3 class="text-sm font-medium text-gray-700 mb-2">Specifications</h3> <div class="grid grid-cols-2 gap-4 text-sm"></div></div>'), is = () => d.nextStep(), as = /* @__PURE__ */ y('<div class="bg-white rounded-lg border border-gray-200 p-6"><h2 class="text-xl font-semibold text-gray-900 mb-4">Product Overview</h2> <div class="space-y-4"><!> <div class="pt-4"><button type="button" class="bg-primary-600 text-white px-6 py-3 rounded-md font-medium hover:bg-primary-700 transition-colors">Start Configuring</button></div></div></div>'), ns = /* @__PURE__ */ y('<div class="bg-white rounded-lg border border-gray-200 p-6"><!></div>'), ss = /* @__PURE__ */ y('<div class="text-center py-8 text-gray-500">No configuration options available.</div>'), os = /* @__PURE__ */ y('<div class="bg-white rounded-lg border border-gray-200 p-6"><!></div>'), ls = /* @__PURE__ */ y('<div class="space-y-6"><!> <!></div>'), ds = () => d.goToStep(1), vs = /* @__PURE__ */ y('<div class="bg-white rounded-lg border border-gray-200 p-8 text-center"><div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><svg class="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg></div> <h2 class="text-2xl font-bold text-gray-900 mb-2">Configuration Complete!</h2> <p class="text-gray-600 mb-6">Your product configuration has been finalized.</p> <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto"><button type="button" class="bg-primary-600 text-white px-4 py-2 rounded-md font-medium hover:bg-primary-700 transition-colors">Get Quote</button> <button type="button" class="border border-gray-300 text-gray-700 px-4 py-2 rounded-md font-medium hover:bg-gray-50 transition-colors">Modify</button></div></div>'), us = () => d.previousStep(), cs = () => d.nextStep(), fs = /* @__PURE__ */ y('<button type="button"> <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg></button>'), _s = () => d.clearSelections(), gs = () => d.saveConfiguration(), hs = /* @__PURE__ */ y('<div class="cpq-sidebar"><div class="sticky top-8 space-y-6"><!> <div class="bg-white rounded-lg border border-gray-200 p-4"><h3 class="text-sm font-medium text-gray-900 mb-3">Quick Actions</h3> <div class="space-y-2"><button type="button" class="w-full text-left text-sm text-gray-600 hover:text-gray-900 p-2 rounded hover:bg-gray-50">Clear All</button> <button type="button" class="w-full text-left text-sm text-gray-600 hover:text-gray-900 p-2 rounded hover:bg-gray-50">Save Progress</button></div></div></div></div>'), ps = /* @__PURE__ */ y('<!> <div><!> <div class="mt-6 flex justify-between"><button type="button"><svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg> Previous</button> <!></div></div> <!>', 1), ms = /* @__PURE__ */ y('<div class="text-center py-12"><h2 class="text-xl font-semibold text-gray-900 mb-2">Model Not Found</h2> <p class="text-gray-600">The requested model could not be found.</p></div>'), xs = /* @__PURE__ */ y("<div><!></div>");
function bs(e, t) {
  Ut(t, !0);
  let r = vt(t, "theme", 7, "light"), i = vt(t, "apiUrl", 3, "http://localhost:8080/api/v1"), a = vt(t, "embedMode", 3, !1), s = vt(t, "onComplete", 3, null), l = vt(t, "onConfigurationChange", 3, null), v = vt(t, "onError", 3, null);
  const c = Wr();
  let _ = /* @__PURE__ */ tt(0), g = jt(a());
  typeof window < "u" && (window.__API_BASE_URL__ = i()), sa(() => {
    d.initialize(), d.setModelId(t.modelId), document.documentElement.setAttribute("data-theme", r()), a() && x();
  });
  function x() {
    window.addEventListener("message", f), window.parent !== window && window.parent.postMessage(
      {
        type: "cpq-configurator-ready",
        modelId: t.modelId
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
  function f(P) {
    const { type: S, data: p } = P.data;
    switch (S) {
      case "cpq-set-theme":
        r(p.theme), document.documentElement.setAttribute("data-theme", r());
        break;
      case "cpq-load-configuration":
        p.config && d.loadFromShareableUrl(p.config);
        break;
      case "cpq-get-configuration":
        window.parent.postMessage(
          {
            type: "cpq-configuration-data",
            configuration: d.exportConfiguration()
          },
          "*"
        );
        break;
    }
  }
  function w() {
    nr(_), d.reset(), d.setModelId(t.modelId);
  }
  Tt(() => {
    l() && l()(d.exportConfiguration()), a() && window.parent !== window && window.parent.postMessage(
      {
        type: "cpq-configuration-change",
        configuration: d.exportConfiguration()
      },
      "*"
    );
  }), Tt(() => {
    d.error && v() && v()(d.error);
  });
  var m = xs(), q = n(m);
  {
    var O = (P) => {
      Va(P, {
        get error() {
          return d.error;
        },
        context: "Configurator",
        get retryCount() {
          return o(_);
        },
        $$events: { retry: w }
      });
    }, j = (P, S) => {
      {
        var p = (I) => {
          Aa(I, {
            size: "lg",
            message: "Loading configurator..."
          });
        }, k = (I, F) => {
          {
            var A = (z) => {
              var G = ps(), Z = Bt(G);
              {
                var X = (B) => {
                  var V = Xn(), W = n(V), it = n(W), nt = n(it), ut = n(nt), ct = u(nt, 2), ht = n(ct), ft = u(it, 2), Et = n(ft), Pt = n(Et), st = u(Et, 2);
                  {
                    var U = (It) => {
                      var Jt = Wn(), ae = n(Jt);
                      T(() => C(ae, `${d.validationResults.length ?? ""} issues`)), h(It, Jt);
                    }, lt = (It, Jt) => {
                      {
                        var ae = (Be) => {
                          var ei = Zn();
                          h(Be, ei);
                        };
                        E(
                          It,
                          (Be) => {
                            d.selectedOptions.length > 0 && Be(ae);
                          },
                          Jt
                        );
                      }
                    };
                    E(st, (It) => {
                      d.validationResults.length > 0 ? It(U) : It(lt, !1);
                    });
                  }
                  var gt = u(W, 2), Dt = n(gt), Yt = n(Dt);
                  T(
                    (It) => {
                      C(ut, d.model.name), C(ht, `Step ${d.currentStep + 1} of 4 • ${d.completionPercentage ?? ""}% complete`), C(Pt, `$${It ?? ""}`), ga(Yt, `width: ${d.completionPercentage ?? ""}%`);
                    },
                    [() => d.totalPrice.toFixed(2)]
                  ), h(B, V);
                }, R = (B) => {
                  var V = ts(), W = n(V), it = n(W), nt = n(it), ut = n(nt), ct = u(nt, 2);
                  {
                    var ht = (U) => {
                      var lt = $n(), gt = n(lt);
                      T(() => C(gt, d.model.description)), h(U, lt);
                    };
                    E(ct, (U) => {
                      d.model.description && U(ht);
                    });
                  }
                  var ft = u(it, 2), Et = u(n(ft), 2), Pt = n(Et), st = u(W, 2);
                  Pa(st, {}), T(() => {
                    C(ut, d.model.name), C(Pt, `${d.completionPercentage ?? ""}%`);
                  }), h(B, V);
                };
                E(Z, (B) => {
                  a() ? B(X) : B(R, !1);
                });
              }
              var b = u(Z, 2), M = n(b);
              {
                var L = (B) => {
                  var V = as(), W = u(n(V), 2), it = n(W);
                  {
                    var nt = (ht) => {
                      var ft = rs(), Et = u(n(ft), 2);
                      kt(Et, 21, () => Object.entries(d.model.specifications), St, (Pt, st) => {
                        var U = /* @__PURE__ */ yt(() => mi(o(st), 2));
                        let lt = () => o(U)[0], gt = () => o(U)[1];
                        var Dt = es(), Yt = n(Dt), It = n(Yt), Jt = u(Yt, 2), ae = n(Jt);
                        T(() => {
                          C(It, `${lt() ?? ""}:`), C(ae, gt());
                        }), h(Pt, Dt);
                      }), h(ht, ft);
                    };
                    E(it, (ht) => {
                      d.model.specifications && ht(nt);
                    });
                  }
                  var ut = u(it, 2), ct = n(ut);
                  ct.__click = [is], h(B, V);
                }, rt = (B, V) => {
                  {
                    var W = (nt) => {
                      var ut = ls(), ct = n(ut);
                      {
                        var ht = (st) => {
                          var U = ie(), lt = Bt(U);
                          kt(lt, 17, () => d.model.option_groups, St, (gt, Dt) => {
                            var Yt = ns(), It = n(Yt);
                            _n(It, {
                              get group() {
                                return o(Dt);
                              }
                            }), h(gt, Yt);
                          }), h(st, U);
                        }, ft = (st) => {
                          var U = ss();
                          h(st, U);
                        };
                        E(ct, (st) => {
                          d.model.option_groups && d.model.option_groups.length > 0 ? st(ht) : st(ft, !1);
                        });
                      }
                      var Et = u(ct, 2);
                      {
                        var Pt = (st) => {
                          var U = os(), lt = n(U);
                          ti(lt, {}), h(st, U);
                        };
                        E(Et, (st) => {
                          (d.validationResults.length > 0 || d.isValidating) && st(Pt);
                        });
                      }
                      h(nt, ut);
                    }, it = (nt, ut) => {
                      {
                        var ct = (ft) => {
                          Jn(ft, {});
                        }, ht = (ft, Et) => {
                          {
                            var Pt = (st) => {
                              var U = vs(), lt = u(n(U), 6), gt = n(lt);
                              gt.__click = [
                                Kn,
                                s,
                                c,
                                a
                              ];
                              var Dt = u(gt, 2);
                              Dt.__click = [ds], h(st, U);
                            };
                            E(
                              ft,
                              (st) => {
                                d.currentStep === 3 && st(Pt);
                              },
                              Et
                            );
                          }
                        };
                        E(
                          nt,
                          (ft) => {
                            d.currentStep === 2 ? ft(ct) : ft(ht, !1);
                          },
                          ut
                        );
                      }
                    };
                    E(
                      B,
                      (nt) => {
                        d.currentStep === 1 ? nt(W) : nt(it, !1);
                      },
                      V
                    );
                  }
                };
                E(M, (B) => {
                  d.currentStep === 0 ? B(L) : B(rt, !1);
                });
              }
              var N = u(M, 2), D = n(N);
              D.__click = [us];
              var Q = u(D, 2);
              {
                var $ = (B) => {
                  var V = fs();
                  V.__click = [cs];
                  var W = n(V);
                  T(() => {
                    _t(V, 1, `flex items-center px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 transition-colors
                   ${d.canProceedToNextStep ? "" : "opacity-50 cursor-not-allowed"}`), V.disabled = !d.canProceedToNextStep, C(W, `${d.currentStep === 2 ? "Complete" : "Next"} `);
                  }), h(B, V);
                };
                E(Q, (B) => {
                  d.currentStep < 3 && B($);
                });
              }
              var H = u(b, 2);
              {
                var dt = (B) => {
                  var V = hs(), W = n(V), it = n(W);
                  $r(it, {});
                  var nt = u(it, 2), ut = u(n(nt), 2), ct = n(ut);
                  ct.__click = [_s];
                  var ht = u(ct, 2);
                  ht.__click = [gs], h(B, V);
                };
                E(H, (B) => {
                  a() || B(dt);
                });
              }
              T(() => {
                _t(b, 1, a() ? "cpq-embed-content" : "cpq-full-content", "svelte-k7ary"), _t(D, 1, `flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors
                 ${d.currentStep === 0 ? "opacity-50 cursor-not-allowed" : ""}`), D.disabled = d.currentStep === 0;
              }), h(z, G);
            }, K = (z) => {
              var G = ms();
              h(z, G);
            };
            E(
              I,
              (z) => {
                d.model ? z(A) : z(K, !1);
              },
              F
            );
          }
        };
        E(
          P,
          (I) => {
            d.isLoading ? I(p) : I(k, !1);
          },
          S
        );
      }
    };
    E(q, (P) => {
      d.error ? P(O) : P(j, !1);
    });
  }
  T(() => {
    _t(m, 1, `cpq-configurator ${a() ? "cpq-embed-mode" : ""} ${g ? "cpq-compact" : ""}`, "svelte-k7ary"), Zr(m, "data-theme", r());
  }), h(e, m), Ht();
}
re(["click"]);
const vr = new URLSearchParams(window.location.search), ys = vr.get("model") || window.location.pathname.split("/").pop(), ws = vr.get("theme") || "light", Ss = vr.get("api") || "http://localhost:8080/api/v1", Cs = new bs({
  target: document.body,
  props: {
    modelId: ys,
    theme: ws,
    apiUrl: Ss,
    embedMode: !0,
    onComplete: (e) => {
      window.parent !== window && window.parent.postMessage({
        type: "cpq-configuration-complete",
        configuration: e
      }, "*");
    },
    onConfigurationChange: (e) => {
      window.parent !== window && window.parent.postMessage({
        type: "cpq-configuration-change",
        configuration: e
      }, "*");
    },
    onError: (e) => {
      window.parent !== window && window.parent.postMessage({
        type: "cpq-error",
        error: e.message
      }, "*");
    }
  }
});
export {
  Cs as default
};
