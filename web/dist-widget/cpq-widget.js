var vr = (e) => {
  throw TypeError(e);
};
var ei = (e, t, r) => t.has(e) || vr("Cannot " + r);
var J = (e, t, r) => (ei(e, t, "read from private field"), r ? r.call(e) : t.get(e)), mt = (e, t, r) => t.has(e) ? vr("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r);
const ri = "5";
var xr;
typeof window < "u" && ((xr = window.__svelte ?? (window.__svelte = {})).v ?? (xr.v = /* @__PURE__ */ new Set())).add(ri);
const We = 1, Ze = 2, br = 4, ii = 8, ni = 16, ai = 1, si = 2, oi = 4, li = 8, di = 16, vi = 1, ui = 2, xt = Symbol(), ci = "http://www.w3.org/1999/xhtml", ur = !1;
var Xe = Array.isArray, fi = Array.prototype.indexOf, yr = Array.from, Ee = Object.getOwnPropertyDescriptor, wr = Object.getOwnPropertyDescriptors, _i = Object.prototype, gi = Array.prototype, $e = Object.getPrototypeOf;
function hi(e) {
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
const Ot = 2, Sr = 4, Le = 8, tr = 16, Ft = 32, we = 64, er = 128, wt = 256, Pe = 512, Ct = 1024, qt = 2048, Qt = 4096, Lt = 8192, rr = 16384, kr = 32768, ir = 65536, pi = 1 << 17, xi = 1 << 19, Cr = 1 << 20, Ye = 1 << 21, Kt = Symbol("$state"), bi = Symbol("legacy props"), yi = Symbol("");
function Er(e) {
  return e === this.v;
}
function wi(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function nr(e) {
  return !wi(e, this.v);
}
function Si(e) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function ki() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function Ci(e) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function Ei() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function Ii(e) {
  throw new Error("https://svelte.dev/e/props_invalid_value");
}
function Pi() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function Mi() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function Ti() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
let $t = !1, Oi = !1;
function Ri() {
  $t = !0;
}
function Ir(e) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
let ot = null;
function cr(e) {
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
  }), Vi(() => {
    i.d = !0;
  });
}
function Ht(e) {
  const t = ot;
  if (t !== null) {
    const o = t.e;
    if (o !== null) {
      var r = et, i = nt;
      t.e = null;
      try {
        for (var n = 0; n < o.length; n++) {
          var s = o[n];
          Ae(s.effect), Xt(s.reaction), jr(s.fn);
        }
      } finally {
        Ae(r), Xt(i);
      }
    }
    ot = t.p, t.m = !0;
  }
  return (
    /** @type {T} */
    {}
  );
}
function Ne() {
  return !$t || ot !== null && ot.l === null;
}
function jt(e) {
  if (typeof e != "object" || e === null || Kt in e)
    return e;
  const t = $e(e);
  if (t !== _i && t !== gi)
    return e;
  var r = /* @__PURE__ */ new Map(), i = Xe(e), n = /* @__PURE__ */ tt(0), s = nt, o = (v) => {
    var c = nt;
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
        return (!("value" in _) || _.configurable === !1 || _.enumerable === !1 || _.writable === !1) && Pi(), o(() => {
          var g = r.get(c);
          g === void 0 ? (g = /* @__PURE__ */ tt(_.value), r.set(c, g)) : Y(g, _.value, !0);
        }), !0;
      },
      deleteProperty(v, c) {
        var _ = r.get(c);
        if (_ === void 0) {
          if (c in v) {
            const f = o(() => /* @__PURE__ */ tt(xt));
            r.set(c, f), Ue(n);
          }
        } else {
          if (i && typeof c == "string") {
            var g = (
              /** @type {Source<number>} */
              r.get("length")
            ), m = Number(c);
            Number.isInteger(m) && m < g.v && Y(g, m);
          }
          Y(_, xt), Ue(n);
        }
        return !0;
      },
      get(v, c, _) {
        if (c === Kt)
          return e;
        var g = r.get(c), m = c in v;
        if (g === void 0 && (!m || Ee(v, c)?.writable) && (g = o(() => {
          var w = jt(m ? v[c] : xt), x = /* @__PURE__ */ tt(w);
          return x;
        }), r.set(c, g)), g !== void 0) {
          var f = l(g);
          return f === xt ? void 0 : f;
        }
        return Reflect.get(v, c, _);
      },
      getOwnPropertyDescriptor(v, c) {
        var _ = Reflect.getOwnPropertyDescriptor(v, c);
        if (_ && "value" in _) {
          var g = r.get(c);
          g && (_.value = l(g));
        } else if (_ === void 0) {
          var m = r.get(c), f = m?.v;
          if (m !== void 0 && f !== xt)
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
          _ === void 0 && (_ = o(() => {
            var f = g ? jt(v[c]) : xt, w = /* @__PURE__ */ tt(f);
            return w;
          }), r.set(c, _));
          var m = l(_);
          if (m === xt)
            return !1;
        }
        return g;
      },
      set(v, c, _, g) {
        var m = r.get(c), f = c in v;
        if (i && c === "length")
          for (var w = _; w < /** @type {Source<number>} */
          m.v; w += 1) {
            var x = r.get(w + "");
            x !== void 0 ? Y(x, xt) : w in v && (x = o(() => /* @__PURE__ */ tt(xt)), r.set(w + "", x));
          }
        if (m === void 0)
          (!f || Ee(v, c)?.writable) && (m = o(() => {
            var S = /* @__PURE__ */ tt(void 0);
            return Y(S, jt(_)), S;
          }), r.set(c, m));
        else {
          f = m.v !== xt;
          var N = o(() => jt(_));
          Y(m, N);
        }
        var R = Reflect.getOwnPropertyDescriptor(v, c);
        if (R?.set && R.set.call(g, _), !f) {
          if (i && typeof c == "string") {
            var j = (
              /** @type {Source<number>} */
              r.get("length")
            ), M = Number(c);
            Number.isInteger(M) && M >= j.v && Y(j, M + 1);
          }
          Ue(n);
        }
        return !0;
      },
      ownKeys(v) {
        l(n);
        var c = Reflect.ownKeys(v).filter((m) => {
          var f = r.get(m);
          return f === void 0 || f.v !== xt;
        });
        for (var [_, g] of r)
          g.v !== xt && !(_ in v) && c.push(_);
        return c;
      },
      setPrototypeOf() {
        Mi();
      }
    }
  );
}
function Ue(e, t = 1) {
  Y(e, e.v + t);
}
// @__NO_SIDE_EFFECTS__
function Wt(e) {
  var t = Ot | qt, r = nt !== null && (nt.f & Ot) !== 0 ? (
    /** @type {Derived} */
    nt
  ) : null;
  return et === null || r !== null && (r.f & wt) !== 0 ? t |= wt : et.f |= Cr, {
    ctx: ot,
    deps: null,
    effects: null,
    equals: Er,
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
  return Br(t), t;
}
// @__NO_SIDE_EFFECTS__
function Pr(e) {
  const t = /* @__PURE__ */ Wt(e);
  return t.equals = nr, t;
}
function Mr(e) {
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
    if ((t.f & Ot) === 0)
      return (
        /** @type {Effect} */
        t
      );
    t = t.parent;
  }
  return null;
}
function Tr(e) {
  var t, r = et;
  Ae(Ai(e));
  try {
    Mr(e), t = Gr(e);
  } finally {
    Ae(r);
  }
  return t;
}
function Or(e) {
  var t = Tr(e);
  if (e.equals(t) || (e.v = t, e.wv = Hr()), !ee) {
    var r = (zt || (e.f & wt) !== 0) && e.deps !== null ? Qt : Ct;
    Rt(e, r);
  }
}
const ae = /* @__PURE__ */ new Map();
function se(e, t) {
  var r = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: Er,
    rv: 0,
    wv: 0
  };
  return r;
}
// @__NO_SIDE_EFFECTS__
function tt(e, t) {
  const r = se(e);
  return Br(r), r;
}
// @__NO_SIDE_EFFECTS__
function Rr(e, t = !1, r = !0) {
  var n;
  const i = se(e);
  return t || (i.equals = nr), $t && r && ot !== null && ot.l !== null && ((n = ot.l).s ?? (n.s = [])).push(i), i;
}
function Y(e, t, r = !1) {
  nt !== null && !Dt && Ne() && (nt.f & (Ot | tr)) !== 0 && !Nt?.includes(e) && Ti();
  let i = r ? jt(t) : t;
  return Ge(e, i);
}
function Ge(e, t) {
  if (!e.equals(t)) {
    var r = e.v;
    ee ? ae.set(e, t) : ae.set(e, r), e.v = t, (e.f & Ot) !== 0 && ((e.f & qt) !== 0 && Tr(
      /** @type {Derived} */
      e
    ), Rt(e, (e.f & wt) === 0 ? Ct : Qt)), e.wv = Hr(), Ar(e, qt), Ne() && et !== null && (et.f & Ct) !== 0 && (et.f & (Ft | we)) === 0 && (Pt === null ? Ji([e]) : Pt.push(e));
  }
  return t;
}
function ar(e, t = 1) {
  var r = l(e), i = t === 1 ? r++ : r--;
  return Y(e, r), i;
}
function Ar(e, t) {
  var r = e.reactions;
  if (r !== null)
    for (var i = Ne(), n = r.length, s = 0; s < n; s++) {
      var o = r[s], v = o.f;
      (v & qt) === 0 && (!i && o === et || (Rt(o, t), (v & (Ct | wt)) !== 0 && ((v & Ot) !== 0 ? Ar(
        /** @type {Derived} */
        o,
        Qt
      ) : ze(
        /** @type {Effect} */
        o
      ))));
    }
}
let Di = !1;
var ji, qi, Li;
function sr(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function Zt(e) {
  return qi.call(e);
}
// @__NO_SIDE_EFFECTS__
function Fe(e) {
  return Li.call(e);
}
function a(e, t) {
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
function Ni(e) {
  e.textContent = "";
}
function Dr(e) {
  et === null && nt === null && Ci(), nt !== null && (nt.f & wt) !== 0 && et === null && ki(), ee && Si();
}
function Fi(e, t) {
  var r = t.last;
  r === null ? t.last = t.first = e : (r.next = e, e.prev = r, t.last = e);
}
function Se(e, t, r, i = !0) {
  var n = et, s = {
    ctx: ot,
    deps: null,
    nodes_start: null,
    nodes_end: null,
    f: e | qt,
    first: null,
    fn: t,
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
      dr(s), s.f |= kr;
    } catch (c) {
      throw te(s), c;
    }
  else t !== null && ze(s);
  var o = r && s.deps === null && s.first === null && s.nodes_start === null && s.teardown === null && (s.f & (Cr | er)) === 0;
  if (!o && i && (n !== null && Fi(s, n), nt !== null && (nt.f & Ot) !== 0)) {
    var v = (
      /** @type {Derived} */
      nt
    );
    (v.effects ?? (v.effects = [])).push(s);
  }
  return s;
}
function Vi(e) {
  const t = Se(Le, null, !1);
  return Rt(t, Ct), t.teardown = e, t;
}
function Tt(e) {
  Dr();
  var t = et !== null && (et.f & Ft) !== 0 && ot !== null && !ot.m;
  if (t) {
    var r = (
      /** @type {ComponentContext} */
      ot
    );
    (r.e ?? (r.e = [])).push({
      fn: e,
      effect: et,
      reaction: nt
    });
  } else {
    var i = jr(e);
    return i;
  }
}
function zi(e) {
  return Dr(), Bi(e);
}
function jr(e) {
  return Se(Sr, e, !1);
}
function Bi(e) {
  return Se(Le, e, !0);
}
function T(e, t = [], r = Wt) {
  const i = t.map(r);
  return or(() => e(...i.map(l)));
}
function or(e, t = 0) {
  return Se(Le | tr | t, e, !0);
}
function Me(e, t = !0) {
  return Se(Le | Ft, e, !0, t);
}
function qr(e) {
  var t = e.teardown;
  if (t !== null) {
    const r = ee, i = nt;
    fr(!0), Xt(null);
    try {
      t.call(null);
    } finally {
      fr(r), Xt(i);
    }
  }
}
function Lr(e, t = !1) {
  var r = e.first;
  for (e.first = e.last = null; r !== null; ) {
    var i = r.next;
    (r.f & we) !== 0 ? r.parent = null : te(r, t), r = i;
  }
}
function Ui(e) {
  for (var t = e.first; t !== null; ) {
    var r = t.next;
    (t.f & Ft) === 0 && te(t), t = r;
  }
}
function te(e, t = !0) {
  var r = !1;
  (t || (e.f & xi) !== 0) && e.nodes_start !== null && e.nodes_end !== null && (Hi(
    e.nodes_start,
    /** @type {TemplateNode} */
    e.nodes_end
  ), r = !0), Lr(e, t && !r), je(e, 0), Rt(e, rr);
  var i = e.transitions;
  if (i !== null)
    for (const s of i)
      s.stop();
  qr(e);
  var n = e.parent;
  n !== null && n.first !== null && Nr(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes_start = e.nodes_end = null;
}
function Hi(e, t) {
  for (; e !== null; ) {
    var r = e === t ? null : (
      /** @type {TemplateNode} */
      /* @__PURE__ */ Fe(e)
    );
    e.remove(), e = r;
  }
}
function Nr(e) {
  var t = e.parent, r = e.prev, i = e.next;
  r !== null && (r.next = i), i !== null && (i.prev = r), t !== null && (t.first === e && (t.first = i), t.last === e && (t.last = r));
}
function Qe(e, t) {
  var r = [];
  lr(e, r, !0), Fr(r, () => {
    te(e), t && t();
  });
}
function Fr(e, t) {
  var r = e.length;
  if (r > 0) {
    var i = () => --r || t();
    for (var n of e)
      n.out(i);
  } else
    t();
}
function lr(e, t, r) {
  if ((e.f & Lt) === 0) {
    if (e.f ^= Lt, e.transitions !== null)
      for (const o of e.transitions)
        (o.is_global || r) && t.push(o);
    for (var i = e.first; i !== null; ) {
      var n = i.next, s = (i.f & ir) !== 0 || (i.f & Ft) !== 0;
      lr(i, t, s ? r : !1), i = n;
    }
  }
}
function Te(e) {
  Vr(e, !0);
}
function Vr(e, t) {
  if ((e.f & Lt) !== 0) {
    e.f ^= Lt, (e.f & Ct) !== 0 && (Rt(e, qt), ze(e));
    for (var r = e.first; r !== null; ) {
      var i = r.next, n = (r.f & ir) !== 0 || (r.f & Ft) !== 0;
      Vr(r, n ? t : !1), r = i;
    }
    if (e.transitions !== null)
      for (const s of e.transitions)
        (s.is_global || t) && s.in();
  }
}
let Oe = [];
function Yi() {
  var e = Oe;
  Oe = [], He(e);
}
function Gi(e) {
  Oe.length === 0 && queueMicrotask(Yi), Oe.push(e);
}
function Qi(e) {
  var t = (
    /** @type {Effect} */
    et
  );
  if ((t.f & kr) === 0) {
    if ((t.f & er) === 0)
      throw e;
    t.fn(e);
  } else
    zr(e, t);
}
function zr(e, t) {
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
let Je = !1, Re = null, Gt = !1, ee = !1;
function fr(e) {
  ee = e;
}
let Ie = [];
let nt = null, Dt = !1;
function Xt(e) {
  nt = e;
}
let et = null;
function Ae(e) {
  et = e;
}
let Nt = null;
function Br(e) {
  nt !== null && nt.f & Ye && (Nt === null ? Nt = [e] : Nt.push(e));
}
let pt = null, bt = 0, Pt = null;
function Ji(e) {
  Pt = e;
}
let Ur = 1, De = 0, zt = !1;
function Hr() {
  return ++Ur;
}
function Ve(e) {
  var t = e.f;
  if ((t & qt) !== 0)
    return !0;
  if ((t & Qt) !== 0) {
    var r = e.deps, i = (t & wt) !== 0;
    if (r !== null) {
      var n, s, o = (t & Pe) !== 0, v = i && et !== null && !zt, c = r.length;
      if (o || v) {
        var _ = (
          /** @type {Derived} */
          e
        ), g = _.parent;
        for (n = 0; n < c; n++)
          s = r[n], (o || !s?.reactions?.includes(_)) && (s.reactions ?? (s.reactions = [])).push(_);
        o && (_.f ^= Pe), v && g !== null && (g.f & wt) === 0 && (_.f ^= wt);
      }
      for (n = 0; n < c; n++)
        if (s = r[n], Ve(
          /** @type {Derived} */
          s
        ) && Or(
          /** @type {Derived} */
          s
        ), s.wv > e.wv)
          return !0;
    }
    (!i || et !== null && !zt) && Rt(e, Ct);
  }
  return !1;
}
function Yr(e, t, r = !0) {
  var i = e.reactions;
  if (i !== null)
    for (var n = 0; n < i.length; n++) {
      var s = i[n];
      Nt?.includes(e) || ((s.f & Ot) !== 0 ? Yr(
        /** @type {Derived} */
        s,
        t,
        !1
      ) : t === s && (r ? Rt(s, qt) : (s.f & Ct) !== 0 && Rt(s, Qt), ze(
        /** @type {Effect} */
        s
      )));
    }
}
function Gr(e) {
  var w;
  var t = pt, r = bt, i = Pt, n = nt, s = zt, o = Nt, v = ot, c = Dt, _ = e.f;
  pt = /** @type {null | Value[]} */
  null, bt = 0, Pt = null, zt = (_ & wt) !== 0 && (Dt || !Gt || nt === null), nt = (_ & (Ft | we)) === 0 ? e : null, Nt = null, cr(e.ctx), Dt = !1, De++, e.f |= Ye;
  try {
    var g = (
      /** @type {Function} */
      (0, e.fn)()
    ), m = e.deps;
    if (pt !== null) {
      var f;
      if (je(e, bt), m !== null && bt > 0)
        for (m.length = bt + pt.length, f = 0; f < pt.length; f++)
          m[bt + f] = pt[f];
      else
        e.deps = m = pt;
      if (!zt)
        for (f = bt; f < m.length; f++)
          ((w = m[f]).reactions ?? (w.reactions = [])).push(e);
    } else m !== null && bt < m.length && (je(e, bt), m.length = bt);
    if (Ne() && Pt !== null && !Dt && m !== null && (e.f & (Ot | Qt | qt)) === 0)
      for (f = 0; f < /** @type {Source[]} */
      Pt.length; f++)
        Yr(
          Pt[f],
          /** @type {Effect} */
          e
        );
    return n !== null && n !== e && (De++, Pt !== null && (i === null ? i = Pt : i.push(.../** @type {Source[]} */
    Pt))), g;
  } catch (x) {
    Qi(x);
  } finally {
    pt = t, bt = r, Pt = i, nt = n, zt = s, Nt = o, cr(v), Dt = c, e.f ^= Ye;
  }
}
function Ki(e, t) {
  let r = t.reactions;
  if (r !== null) {
    var i = fi.call(r, e);
    if (i !== -1) {
      var n = r.length - 1;
      n === 0 ? r = t.reactions = null : (r[i] = r[n], r.pop());
    }
  }
  r === null && (t.f & Ot) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (pt === null || !pt.includes(t)) && (Rt(t, Qt), (t.f & (wt | Pe)) === 0 && (t.f ^= Pe), Mr(
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
      Ki(e, r[i]);
}
function dr(e) {
  var t = e.f;
  if ((t & rr) === 0) {
    Rt(e, Ct);
    var r = et, i = Gt;
    et = e, Gt = !0;
    try {
      (t & tr) !== 0 ? Ui(e) : Lr(e), qr(e);
      var n = Gr(e);
      e.teardown = typeof n == "function" ? n : null, e.wv = Ur;
      var s;
      ur && Oi && (e.f & qt) !== 0 && e.deps;
    } finally {
      Gt = i, et = r;
    }
  }
}
function Wi() {
  try {
    Ei();
  } catch (e) {
    if (Re !== null)
      zr(e, Re);
    else
      throw e;
  }
}
function Zi() {
  var e = Gt;
  try {
    var t = 0;
    for (Gt = !0; Ie.length > 0; ) {
      t++ > 1e3 && Wi();
      var r = Ie, i = r.length;
      Ie = [];
      for (var n = 0; n < i; n++) {
        var s = $i(r[n]);
        Xi(s);
      }
      ae.clear();
    }
  } finally {
    Je = !1, Gt = e, Re = null;
  }
}
function Xi(e) {
  var t = e.length;
  if (t !== 0)
    for (var r = 0; r < t; r++) {
      var i = e[r];
      (i.f & (rr | Lt)) === 0 && Ve(i) && (dr(i), i.deps === null && i.first === null && i.nodes_start === null && (i.teardown === null ? Nr(i) : i.fn = null));
    }
}
function ze(e) {
  Je || (Je = !0, queueMicrotask(Zi));
  for (var t = Re = e; t.parent !== null; ) {
    t = t.parent;
    var r = t.f;
    if ((r & (we | Ft)) !== 0) {
      if ((r & Ct) === 0) return;
      t.f ^= Ct;
    }
  }
  Ie.push(t);
}
function $i(e) {
  for (var t = [], r = e; r !== null; ) {
    var i = r.f, n = (i & (Ft | we)) !== 0, s = n && (i & Ct) !== 0;
    if (!s && (i & Lt) === 0) {
      (i & Sr) !== 0 ? t.push(r) : n ? r.f ^= Ct : Ve(r) && dr(r);
      var o = r.first;
      if (o !== null) {
        r = o;
        continue;
      }
    }
    var v = r.parent;
    for (r = r.next; r === null && v !== null; )
      r = v.next, v = v.parent;
  }
  return t;
}
function l(e) {
  var t = e.f, r = (t & Ot) !== 0;
  if (nt !== null && !Dt) {
    if (!Nt?.includes(e)) {
      var i = nt.deps;
      e.rv < De && (e.rv = De, pt === null && i !== null && i[bt] === e ? bt++ : pt === null ? pt = [e] : (!zt || !pt.includes(e)) && pt.push(e));
    }
  } else if (r && /** @type {Derived} */
  e.deps === null && /** @type {Derived} */
  e.effects === null) {
    var n = (
      /** @type {Derived} */
      e
    ), s = n.parent;
    s !== null && (s.f & wt) === 0 && (n.f ^= wt);
  }
  return r && (n = /** @type {Derived} */
  e, Ve(n) && Or(n)), ee && ae.has(e) ? ae.get(e) : e.v;
}
function qe(e) {
  var t = Dt;
  try {
    return Dt = !0, e();
  } finally {
    Dt = t;
  }
}
const tn = -7169;
function Rt(e, t) {
  e.f = e.f & tn | t;
}
function en(e) {
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
      const i = wr(r);
      for (let n in i) {
        const s = i[n].get;
        if (s)
          try {
            s.call(e);
          } catch {
          }
      }
    }
  }
}
const rn = /* @__PURE__ */ new Set(), nn = /* @__PURE__ */ new Set();
function re(e) {
  for (var t = 0; t < e.length; t++)
    rn.add(e[t]);
  for (var r of nn)
    r(e);
}
function Qr(e) {
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
  var r = (t & vi) !== 0, i = (t & ui) !== 0, n, s = !e.startsWith("<!>");
  return () => {
    n === void 0 && (n = Qr(s ? e : "<!>" + e), r || (n = /** @type {Node} */
    /* @__PURE__ */ Zt(n)));
    var o = (
      /** @type {TemplateNode} */
      i || ji ? document.importNode(n, !0) : n.cloneNode(!0)
    );
    if (r) {
      var v = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Zt(o)
      ), c = (
        /** @type {TemplateNode} */
        o.lastChild
      );
      oe(v, c);
    } else
      oe(o, o);
    return o;
  };
}
// @__NO_SIDE_EFFECTS__
function an(e, t, r = "svg") {
  var i = !e.startsWith("<!>"), n = `<${r}>${i ? e : "<!>" + e}</${r}>`, s;
  return () => {
    if (!s) {
      var o = (
        /** @type {DocumentFragment} */
        Qr(n)
      ), v = (
        /** @type {Element} */
        /* @__PURE__ */ Zt(o)
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
function Jr(e, t) {
  return /* @__PURE__ */ an(e, t, "svg");
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
function sn(e) {
  ot === null && Ir(), $t && ot.l !== null ? ln(ot).m.push(e) : Tt(() => {
    const t = qe(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
function on(e, t, { bubbles: r = !1, cancelable: i = !1 } = {}) {
  return new CustomEvent(e, { detail: t, bubbles: r, cancelable: i });
}
function Kr() {
  const e = ot;
  return e === null && Ir(), (t, r, i) => {
    const n = (
      /** @type {Record<string, Function | Function[]>} */
      e.s.$$events?.[
        /** @type {any} */
        t
      ]
    );
    if (n) {
      const s = Xe(n) ? n.slice() : [n], o = on(
        /** @type {string} */
        t,
        r,
        i
      );
      for (const v of s)
        v.call(e.x, o);
      return !o.defaultPrevented;
    }
    return !0;
  };
}
function ln(e) {
  var t = (
    /** @type {ComponentContextLegacy} */
    e.l
  );
  return t.u ?? (t.u = { a: [], b: [], m: [] });
}
function E(e, t, [r, i] = [0, 0]) {
  var n = e, s = null, o = null, v = xt, c = r > 0 ? ir : 0, _ = !1;
  const g = (f, w = !0) => {
    _ = !0, m(w, f);
  }, m = (f, w) => {
    v !== (v = f) && (v ? (s ? Te(s) : w && (s = Me(() => w(n))), o && Qe(o, () => {
      o = null;
    })) : (o ? Te(o) : w && (o = Me(() => w(n, [r + 1, i]))), s && Qe(s, () => {
      s = null;
    })));
  };
  or(() => {
    _ = !1, t(g), _ || m(null, null);
  }, c);
}
function St(e, t) {
  return t;
}
function dn(e, t, r, i) {
  for (var n = [], s = t.length, o = 0; o < s; o++)
    lr(t[o].e, n, !0);
  var v = s > 0 && n.length === 0 && r !== null;
  if (v) {
    var c = (
      /** @type {Element} */
      /** @type {Element} */
      r.parentNode
    );
    Ni(c), c.append(
      /** @type {Element} */
      r
    ), i.clear(), Vt(e, t[0].prev, t[s - 1].next);
  }
  Fr(n, () => {
    for (var _ = 0; _ < s; _++) {
      var g = t[_];
      v || (i.delete(g.k), Vt(e, g.prev, g.next)), te(g.e, !v);
    }
  });
}
function kt(e, t, r, i, n, s = null) {
  var o = e, v = { flags: t, items: /* @__PURE__ */ new Map(), first: null }, c = (t & br) !== 0;
  if (c) {
    var _ = (
      /** @type {Element} */
      e
    );
    o = _.appendChild(sr());
  }
  var g = null, m = !1, f = /* @__PURE__ */ Pr(() => {
    var w = r();
    return Xe(w) ? w : w == null ? [] : yr(w);
  });
  or(() => {
    var w = l(f), x = w.length;
    m && x === 0 || (m = x === 0, vn(w, v, o, n, t, i, r), s !== null && (x === 0 ? g ? Te(g) : g = Me(() => s(o)) : g !== null && Qe(g, () => {
      g = null;
    })), l(f));
  });
}
function vn(e, t, r, i, n, s, o) {
  var v = (n & ii) !== 0, c = (n & (We | Ze)) !== 0, _ = e.length, g = t.items, m = t.first, f = m, w, x = null, N, R = [], j = [], M, S, p, k;
  if (v)
    for (k = 0; k < _; k += 1)
      M = e[k], S = s(M, k), p = g.get(S), p !== void 0 && (p.a?.measure(), (N ?? (N = /* @__PURE__ */ new Set())).add(p));
  for (k = 0; k < _; k += 1) {
    if (M = e[k], S = s(M, k), p = g.get(S), p === void 0) {
      var I = f ? (
        /** @type {TemplateNode} */
        f.e.nodes_start
      ) : r;
      x = cn(
        I,
        t,
        x,
        x === null ? t.first : x.next,
        M,
        S,
        k,
        i,
        n,
        o
      ), g.set(S, x), R = [], j = [], f = x.next;
      continue;
    }
    if (c && un(p, M, k, n), (p.e.f & Lt) !== 0 && (Te(p.e), v && (p.a?.unfix(), (N ?? (N = /* @__PURE__ */ new Set())).delete(p))), p !== f) {
      if (w !== void 0 && w.has(p)) {
        if (R.length < j.length) {
          var F = j[0], D;
          x = F.prev;
          var K = R[0], z = R[R.length - 1];
          for (D = 0; D < R.length; D += 1)
            _r(R[D], F, r);
          for (D = 0; D < j.length; D += 1)
            w.delete(j[D]);
          Vt(t, K.prev, z.next), Vt(t, x, K), Vt(t, z, F), f = F, x = z, k -= 1, R = [], j = [];
        } else
          w.delete(p), _r(p, f, r), Vt(t, p.prev, p.next), Vt(t, p, x === null ? t.first : x.next), Vt(t, x, p), x = p;
        continue;
      }
      for (R = [], j = []; f !== null && f.k !== S; )
        (f.e.f & Lt) === 0 && (w ?? (w = /* @__PURE__ */ new Set())).add(f), j.push(f), f = f.next;
      if (f === null)
        continue;
      p = f;
    }
    R.push(p), x = p, f = p.next;
  }
  if (f !== null || w !== void 0) {
    for (var G = w === void 0 ? [] : yr(w); f !== null; )
      (f.e.f & Lt) === 0 && G.push(f), f = f.next;
    var Z = G.length;
    if (Z > 0) {
      var X = (n & br) !== 0 && _ === 0 ? r : null;
      if (v) {
        for (k = 0; k < Z; k += 1)
          G[k].a?.measure();
        for (k = 0; k < Z; k += 1)
          G[k].a?.fix();
      }
      dn(t, G, X, g);
    }
  }
  v && Gi(() => {
    if (N !== void 0)
      for (p of N)
        p.a?.apply();
  }), et.first = t.first && t.first.e, et.last = x && x.e;
}
function un(e, t, r, i) {
  (i & We) !== 0 && Ge(e.v, t), (i & Ze) !== 0 ? Ge(
    /** @type {Value<number>} */
    e.i,
    r
  ) : e.i = r;
}
function cn(e, t, r, i, n, s, o, v, c, _) {
  var g = (c & We) !== 0, m = (c & ni) === 0, f = g ? m ? /* @__PURE__ */ Rr(n, !1, !1) : se(n) : n, w = (c & Ze) === 0 ? o : se(o), x = {
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
    return x.e = Me(() => v(e, f, w, _), Di), x.e.prev = r && r.e, x.e.next = i && i.e, r === null ? t.first = x : (r.next = x, r.e.next = x.e), i !== null && (i.prev = x, i.e.prev = x.e), x;
  } finally {
  }
}
function _r(e, t, r) {
  for (var i = e.next ? (
    /** @type {TemplateNode} */
    e.next.e.nodes_start
  ) : r, n = t ? (
    /** @type {TemplateNode} */
    t.e.nodes_start
  ) : r, s = (
    /** @type {TemplateNode} */
    e.e.nodes_start
  ); s !== i; ) {
    var o = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ Fe(s)
    );
    n.before(s), s = o;
  }
}
function Vt(e, t, r) {
  t === null ? e.first = r : (t.next = r, t.e.next = r && r.e), r !== null && (r.prev = t, r.e.prev = t && t.e);
}
function fn(e, t, r) {
  var i = e == null ? "" : "" + e;
  return t && (i = i ? i + " " + t : t), i === "" ? null : i;
}
function _n(e, t) {
  return e == null ? null : String(e);
}
function _t(e, t, r, i, n, s) {
  var o = e.__className;
  if (o !== r || o === void 0) {
    var v = fn(r, i);
    v == null ? e.removeAttribute("class") : e.className = v, e.__className = r;
  }
  return s;
}
function gn(e, t, r, i) {
  var n = e.__style;
  if (n !== t) {
    var s = _n(t);
    s == null ? e.removeAttribute("style") : e.style.cssText = s, e.__style = t;
  }
  return i;
}
const hn = Symbol("is custom element"), mn = Symbol("is html");
function pn(e, t) {
  var r = Zr(e);
  r.value === (r.value = // treat null and undefined the same for the initial value
  t ?? void 0) || // @ts-expect-error
  // `progress` elements always need their value set when it's `0`
  e.value === t && (t !== 0 || e.nodeName !== "PROGRESS") || (e.value = t ?? "");
}
function Wr(e, t, r, i) {
  var n = Zr(e);
  n[t] !== (n[t] = r) && (t === "loading" && (e[yi] = r), r == null ? e.removeAttribute(t) : typeof r != "string" && xn(e).includes(t) ? e[t] = r : e.setAttribute(t, r));
}
function Zr(e) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    // @ts-expect-error
    e.__attributes ?? (e.__attributes = {
      [hn]: e.nodeName.includes("-"),
      [mn]: e.namespaceURI === ci
    })
  );
}
var gr = /* @__PURE__ */ new Map();
function xn(e) {
  var t = gr.get(e.nodeName);
  if (t) return t;
  gr.set(e.nodeName, t = []);
  for (var r, i = e, n = Element.prototype; n !== i; ) {
    r = wr(i);
    for (var s in r)
      r[s].set && t.push(s);
    i = $e(i);
  }
  return t;
}
function bn(e = !1) {
  const t = (
    /** @type {ComponentContextLegacy} */
    ot
  ), r = t.l.u;
  if (!r) return;
  let i = () => en(t.s);
  if (e) {
    let n = 0, s = (
      /** @type {Record<string, any>} */
      {}
    );
    const o = /* @__PURE__ */ Wt(() => {
      let v = !1;
      const c = t.s;
      for (const _ in c)
        c[_] !== s[_] && (s[_] = c[_], v = !0);
      return v && n++, n;
    });
    i = () => l(o);
  }
  r.b.length && zi(() => {
    hr(t, i), He(r.b);
  }), Tt(() => {
    const n = qe(() => r.m.map(hi));
    return () => {
      for (const s of n)
        typeof s == "function" && s();
    };
  }), r.a.length && Tt(() => {
    hr(t, i), He(r.a);
  });
}
function hr(e, t) {
  if (e.l.s)
    for (const r of e.l.s) l(r);
  t();
}
let Ce = !1;
function yn(e) {
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
  var n = (r & ai) !== 0, s = !$t || (r & si) !== 0, o = (r & li) !== 0, v = (r & di) !== 0, c = !1, _;
  o ? [_, c] = yn(() => (
    /** @type {V} */
    e[t]
  )) : _ = /** @type {V} */
  e[t];
  var g = Kt in e || bi in e, m = o && (Ee(e, t)?.set ?? (g && t in e && ((I) => e[t] = I))) || void 0, f = (
    /** @type {V} */
    i
  ), w = !0, x = !1, N = () => (x = !0, w && (w = !1, v ? f = qe(
    /** @type {() => V} */
    i
  ) : f = /** @type {V} */
  i), f);
  _ === void 0 && i !== void 0 && (m && s && Ii(), _ = N(), m && m(_));
  var R;
  if (s)
    R = () => {
      var I = (
        /** @type {V} */
        e[t]
      );
      return I === void 0 ? N() : (w = !0, x = !1, I);
    };
  else {
    var j = (n ? Wt : Pr)(
      () => (
        /** @type {V} */
        e[t]
      )
    );
    j.f |= pi, R = () => {
      var I = l(j);
      return I !== void 0 && (f = /** @type {V} */
      void 0), I === void 0 ? f : I;
    };
  }
  if ((r & oi) === 0 && s)
    return R;
  if (m) {
    var M = e.$$legacy;
    return function(I, F) {
      return arguments.length > 0 ? ((!s || !F || M || c) && m(F ? R() : I), I) : R();
    };
  }
  var S = !1, p = /* @__PURE__ */ Rr(_), k = /* @__PURE__ */ Wt(() => {
    var I = R(), F = l(p);
    return S ? (S = !1, F) : p.v = I;
  });
  return o && l(k), n || (k.equals = nr), function(I, F) {
    if (arguments.length > 0) {
      const D = F ? l(k) : s && o ? jt(I) : I;
      if (!k.equals(D)) {
        if (S = !0, Y(p, D), x && f !== void 0 && (f = D), mr(k))
          return I;
        qe(() => l(k));
      }
      return I;
    }
    return mr(k) ? k.v : l(k);
  };
}
class pr {
  constructor(t, r = {}) {
    this.baseUrl = t || "http://localhost:8080/api/v1", this.modelId = r.modelId, this.authToken = r.authToken, this.timeout = r.timeout || 1e4;
  }
  async request(t, r = {}) {
    const i = `${this.baseUrl}${t}`, n = {
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
      const s = new AbortController(), o = setTimeout(() => s.abort(), this.timeout), v = await fetch(i, {
        ...n,
        signal: s.signal
      });
      if (clearTimeout(o), !v.ok)
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
        selections: Object.entries(r).map(([i, n]) => ({
          option_id: i,
          quantity: n
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
        selections: Object.entries(t).map(([i, n]) => ({
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
var le, de, ve, ue, ce, fe, _e, ge, he, me, pe, xe, be, ye;
class wn {
  constructor() {
    mt(this, le, /* @__PURE__ */ tt(""));
    mt(this, de, /* @__PURE__ */ tt(null));
    mt(this, ve, /* @__PURE__ */ tt(jt({})));
    mt(this, ue, /* @__PURE__ */ tt(jt([])));
    mt(this, ce, /* @__PURE__ */ tt(null));
    mt(this, fe, /* @__PURE__ */ tt(!1));
    mt(this, _e, /* @__PURE__ */ tt(!1));
    mt(this, ge, /* @__PURE__ */ tt(!1));
    mt(this, he, /* @__PURE__ */ tt(null));
    mt(this, me, /* @__PURE__ */ tt(0));
    mt(this, pe, /* @__PURE__ */ tt(null));
    mt(this, xe, /* @__PURE__ */ tt(null));
    mt(this, be, /* @__PURE__ */ tt(!1));
    mt(this, ye, /* @__PURE__ */ tt(null));
    this.initialized = !1;
  }
  get modelId() {
    return l(J(this, le));
  }
  set modelId(t) {
    Y(J(this, le), t, !0);
  }
  get model() {
    return l(J(this, de));
  }
  set model(t) {
    Y(J(this, de), t, !0);
  }
  get selections() {
    return l(J(this, ve));
  }
  set selections(t) {
    Y(J(this, ve), t, !0);
  }
  get validationResults() {
    return l(J(this, ue));
  }
  set validationResults(t) {
    Y(J(this, ue), t, !0);
  }
  get pricingData() {
    return l(J(this, ce));
  }
  set pricingData(t) {
    Y(J(this, ce), t, !0);
  }
  get isLoading() {
    return l(J(this, fe));
  }
  set isLoading(t) {
    Y(J(this, fe), t, !0);
  }
  get isValidating() {
    return l(J(this, _e));
  }
  set isValidating(t) {
    Y(J(this, _e), t, !0);
  }
  get isPricing() {
    return l(J(this, ge));
  }
  set isPricing(t) {
    Y(J(this, ge), t, !0);
  }
  get error() {
    return l(J(this, he));
  }
  set error(t) {
    Y(J(this, he), t, !0);
  }
  get currentStep() {
    return l(J(this, me));
  }
  set currentStep(t) {
    Y(J(this, me), t, !0);
  }
  get configurationId() {
    return l(J(this, pe));
  }
  set configurationId(t) {
    Y(J(this, pe), t, !0);
  }
  get lastSaved() {
    return l(J(this, xe));
  }
  set lastSaved(t) {
    Y(J(this, xe), t, !0);
  }
  get isDirty() {
    return l(J(this, be));
  }
  set isDirty(t) {
    Y(J(this, be), t, !0);
  }
  get api() {
    return l(J(this, ye));
  }
  set api(t) {
    Y(J(this, ye), t, !0);
  }
  // Initialize effects - call this from components
  initialize() {
    this.initialized || (this.initialized = !0, Tt(() => {
      this.modelId && (this.api = new pr("http://localhost:8080/api/v1", { modelId: this.modelId }), this.loadModel());
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
    const r = t.filter((i) => i.options.some((n) => this.selections[n.id] > 0));
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
    this.modelId = t, this.reset(), typeof window < "u" && window.__API_BASE_URL__ && (this.api = new pr(window.__API_BASE_URL__, { modelId: t }), this.loadModel());
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
le = new WeakMap(), de = new WeakMap(), ve = new WeakMap(), ue = new WeakMap(), ce = new WeakMap(), fe = new WeakMap(), _e = new WeakMap(), ge = new WeakMap(), he = new WeakMap(), me = new WeakMap(), pe = new WeakMap(), xe = new WeakMap(), be = new WeakMap(), ye = new WeakMap();
const d = new wn();
Ri();
var Sn = /* @__PURE__ */ y('<div class="absolute inset-0 flex items-center" aria-hidden="true"><div></div></div>'), kn = (e, t) => d.goToStep(l(t).id), Cn = /* @__PURE__ */ Jr('<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>'), En = /* @__PURE__ */ y('<span class="text-sm font-medium"> </span>'), In = /* @__PURE__ */ y('<li><!> <button><!></button> <div class="mt-2 text-center"><div> </div> <div> </div></div></li>'), Pn = /* @__PURE__ */ y('<nav aria-label="Progress"><ol class="flex items-center"></ol></nav>');
function Mn(e, t) {
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
  bn();
  var i = Pn(), n = a(i);
  kt(n, 5, () => r, St, (s, o, v) => {
    var c = In(), _ = a(c);
    {
      var g = (p) => {
        var k = Sn(), I = a(k);
        T(() => _t(I, 1, `h-0.5 w-full ${d.currentStep > l(o).id ? "bg-primary-600" : "bg-gray-200"}`)), h(p, k);
      };
      E(_, (p) => {
        v < r.length - 1 && p(g);
      });
    }
    var m = u(_, 2);
    m.__click = [kn, o];
    var f = a(m);
    {
      var w = (p) => {
        var k = Cn();
        h(p, k);
      }, x = (p) => {
        var k = En(), I = a(k);
        T(() => C(I, l(o).id + 1)), h(p, k);
      };
      E(f, (p) => {
        d.currentStep > l(o).id ? p(w) : p(x, !1);
      });
    }
    var N = u(m, 2), R = a(N), j = a(R), M = u(R, 2), S = a(M);
    T(() => {
      _t(c, 1, `relative ${v < r.length - 1 ? "pr-8 sm:pr-20" : ""}`), _t(m, 1, `relative w-8 h-8 flex items-center justify-center rounded-full transition-colors
                 ${d.currentStep > l(o).id ? "bg-primary-600 text-white" : d.currentStep === l(o).id ? "bg-primary-50 border-2 border-primary-600 text-primary-600" : "bg-white border-2 border-gray-300 text-gray-500"}`), Wr(m, "aria-current", d.currentStep === l(o).id ? "step" : void 0), _t(R, 1, `text-xs font-medium ${d.currentStep >= l(o).id ? "text-gray-900" : "text-gray-500"}`), C(j, l(o).name), _t(M, 1, `text-xs ${d.currentStep >= l(o).id ? "text-gray-500" : "text-gray-400"}`), C(S, l(o).description);
    }), h(s, c);
  }), h(e, i), Ht();
}
re(["click"]);
var Tn = /* @__PURE__ */ y('<p class="mt-4 text-sm text-gray-600"> </p>'), On = /* @__PURE__ */ y('<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" aria-live="polite"><div class="bg-white rounded-lg p-6 text-center"><div></div> <!></div></div>'), Rn = /* @__PURE__ */ y('<span class="ml-3 text-sm text-gray-600"> </span>'), An = /* @__PURE__ */ y('<div class="flex items-center justify-center" aria-live="polite"><div></div> <!></div>');
function Dn(e, t) {
  let r = vt(t, "size", 3, "md"), i = vt(t, "color", 3, "primary"), n = vt(t, "message", 3, ""), s = vt(t, "overlay", 3, !1);
  const o = {
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
      var w = On(), x = a(w), N = a(x), R = u(N, 2);
      {
        var j = (M) => {
          var S = Tn(), p = a(S);
          T(() => C(p, n())), h(M, S);
        };
        E(R, (M) => {
          n() && M(j);
        });
      }
      T(() => _t(N, 1, `animate-spin rounded-full ${o[r()] ?? ""} border-2 border-gray-200 ${v[i()] ?? ""} border-t-transparent mx-auto`)), h(f, w);
    }, m = (f) => {
      var w = An(), x = a(w), N = u(x, 2);
      {
        var R = (j) => {
          var M = Rn(), S = a(M);
          T(() => C(S, n())), h(j, M);
        };
        E(N, (j) => {
          n() && j(R);
        });
      }
      T(() => _t(x, 1, `animate-spin rounded-full ${o[r()] ?? ""} border-2 border-gray-200 ${v[i()] ?? ""} border-t-transparent`)), h(f, w);
    };
    E(_, (f) => {
      s() ? f(g) : f(m, !1);
    });
  }
  h(e, c);
}
function jn(e, t, r, i) {
  t() < r() && i("retry");
}
function qn(e, t) {
  t(!t());
}
var Ln = /* @__PURE__ */ y('<div class="mt-3 text-xs text-red-600 bg-red-100 p-2 rounded border"><pre class="whitespace-pre-wrap"> </pre></div>'), Nn = /* @__PURE__ */ y('<button type="button" class="text-sm bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200 transition-colors"> </button>'), Fn = /* @__PURE__ */ y('<div class="rounded-md bg-red-50 p-4 border border-red-200"><div class="flex"><div class="flex-shrink-0"><svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg></div> <div class="ml-3 flex-1"><h3 class="text-sm font-medium text-red-800"> </h3> <div class="mt-2 text-sm text-red-700"><p> </p></div> <!> <div class="mt-4 flex space-x-3"><!> <button type="button" class="text-sm text-red-600 hover:text-red-500 underline"> </button></div></div></div></div>');
function Vn(e, t) {
  Ut(t, !0);
  let r = vt(t, "error", 3, null), i = vt(t, "context", 3, "Application"), n = vt(t, "showDetails", 7, !1), s = vt(t, "retryable", 3, !0), o = vt(t, "retryCount", 3, 0), v = vt(t, "maxRetries", 3, 3);
  const c = Kr();
  let _ = /* @__PURE__ */ yt(() => s() && o() < v());
  var g = ie(), m = Bt(g);
  {
    var f = (w) => {
      var x = Fn(), N = a(x), R = u(a(N), 2), j = a(R), M = a(j), S = u(j, 2), p = a(S), k = a(p), I = u(S, 2);
      {
        var F = (X) => {
          var O = Ln(), b = a(O), P = a(b);
          T((q) => C(P, q), [
            () => r().stack || JSON.stringify(r(), null, 2)
          ]), h(X, O);
        };
        E(I, (X) => {
          n() && X(F);
        });
      }
      var D = u(I, 2), K = a(D);
      {
        var z = (X) => {
          var O = Nn();
          O.__click = [
            jn,
            o,
            v,
            c
          ];
          var b = a(O);
          T(() => C(b, `Retry ${o() > 0 ? `(${o()}/${v()})` : ""}`)), h(X, O);
        };
        E(K, (X) => {
          l(_) && X(z);
        });
      }
      var G = u(K, 2);
      G.__click = [qn, n];
      var Z = a(G);
      T(() => {
        C(M, `${i() ?? ""} Error`), C(k, `Something went wrong. ${r().message || "An unexpected error occurred."}`), C(Z, `${n() ? "Hide" : "Show"} Details`);
      }), h(w, x);
    };
    E(m, (w) => {
      r() && w(f);
    });
  }
  h(e, g), Ht();
}
re(["click"]);
function zn(e, t, r) {
  t.group.max_selections && l(r) >= t.group.max_selections || ar(r);
}
function Bn(e, t) {
  l(t) > 0 && ar(t, -1);
}
function Un(e, t, r) {
  l(t) ? Y(r, 0) : Y(r, 1);
}
var Hn = /* @__PURE__ */ y('<div class="absolute -top-2 -right-2 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center"><svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg></div>'), Yn = /* @__PURE__ */ y('<p class="mt-1 text-sm text-gray-500"> </p>'), Gn = /* @__PURE__ */ y('<span class="text-xs text-gray-500"> </span>'), Qn = /* @__PURE__ */ y('<div class="text-xs text-primary-600"> </div>'), Jn = /* @__PURE__ */ y('<span class="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"> </span>'), Kn = /* @__PURE__ */ y('<span class="text-xs text-gray-500"> </span>'), Wn = /* @__PURE__ */ y('<div class="mt-2 flex flex-wrap gap-1"><!> <!></div>'), Zn = /* @__PURE__ */ y('<div class="w-2 h-2 bg-white rounded-full"></div>'), Xn = /* @__PURE__ */ y('<button type="button"><div><!></div> <span> </span></button>'), $n = /* @__PURE__ */ y('<div class="flex items-center space-x-3"><span class="text-sm text-gray-500">Quantity:</span> <div class="flex items-center space-x-2"><button type="button"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path></svg></button> <span class="w-8 text-center text-sm font-medium"> </span> <button type="button"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg></button></div></div>'), ta = /* @__PURE__ */ y('<div class="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded"> </div>'), ea = /* @__PURE__ */ y('<div><!> <div class="p-4"><div class="flex items-start justify-between"><div class="flex-1"><h3 class="text-sm font-medium text-gray-900"> </h3> <!></div> <div class="ml-4 text-right"><div class="text-sm font-medium text-gray-900"> <!></div> <!></div></div> <!> <div class="mt-4 flex items-center justify-between"><!> <!></div></div></div>');
function ra(e, t) {
  Ut(t, !0);
  let r = /* @__PURE__ */ tt(jt(d.selections[t.option.id] || 0)), i = /* @__PURE__ */ yt(() => l(r) > 0), n = /* @__PURE__ */ yt(() => l(r) * t.option.base_price);
  Tt(() => {
    d.updateSelection(t.option.id, l(r));
  }), Tt(() => {
    if (t.group.selection_type === "single" && l(i))
      for (const O of t.group.options)
        O.id !== t.option.id && d.selections[O.id] > 0 && d.updateSelection(O.id, 0);
  });
  var s = ea(), o = a(s);
  {
    var v = (O) => {
      var b = Hn();
      h(O, b);
    };
    E(o, (O) => {
      l(i) && O(v);
    });
  }
  var c = u(o, 2), _ = a(c), g = a(_), m = a(g), f = a(m), w = u(m, 2);
  {
    var x = (O) => {
      var b = Yn(), P = a(b);
      T(() => C(P, t.option.description)), h(O, b);
    };
    E(w, (O) => {
      t.option.description && O(x);
    });
  }
  var N = u(g, 2), R = a(N), j = a(R), M = u(j);
  {
    var S = (O) => {
      var b = Gn(), P = a(b);
      T(() => C(P, `/${t.option.price_unit ?? ""}`)), h(O, b);
    };
    E(M, (O) => {
      t.option.price_unit && t.option.price_unit !== "each" && O(S);
    });
  }
  var p = u(R, 2);
  {
    var k = (O) => {
      var b = Qn(), P = a(b);
      T((q) => C(P, `Total: $${q ?? ""}`), [() => l(n).toFixed(2)]), h(O, b);
    };
    E(p, (O) => {
      l(n) > t.option.base_price && O(k);
    });
  }
  var I = u(_, 2);
  {
    var F = (O) => {
      var b = Wn(), P = a(b);
      kt(P, 17, () => t.option.constraints.slice(0, 3), St, (L, A) => {
        var Q = Jn(), $ = a(Q);
        T(() => C($, l(A))), h(L, Q);
      });
      var q = u(P, 2);
      {
        var rt = (L) => {
          var A = Kn(), Q = a(A);
          T(() => C(Q, `+${t.option.constraints.length - 3} more`)), h(L, A);
        };
        E(q, (L) => {
          t.option.constraints.length > 3 && L(rt);
        });
      }
      h(O, b);
    };
    E(I, (O) => {
      t.option.constraints && t.option.constraints.length > 0 && O(F);
    });
  }
  var D = u(I, 2), K = a(D);
  {
    var z = (O) => {
      var b = Xn();
      b.__click = [Un, i, r];
      var P = a(b), q = a(P);
      {
        var rt = (Q) => {
          var $ = Zn();
          h(Q, $);
        };
        E(q, (Q) => {
          l(i) && Q(rt);
        });
      }
      var L = u(P, 2), A = a(L);
      T(() => {
        _t(b, 1, `flex items-center space-x-2 text-sm font-medium
                 ${l(i) ? "text-primary-600" : "text-gray-500 hover:text-gray-700"}`), _t(P, 1, `w-4 h-4 rounded-full border-2 flex items-center justify-center
                      ${l(i) ? "border-primary-600 bg-primary-600" : "border-gray-300"}`), C(A, l(i) ? "Selected" : "Select");
      }), h(O, b);
    }, G = (O) => {
      var b = $n(), P = u(a(b), 2), q = a(P);
      q.__click = [Bn, r];
      var rt = u(q, 2), L = a(rt), A = u(rt, 2);
      A.__click = [zn, t, r], T(() => {
        _t(q, 1, `w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center
                     ${l(r) > 0 ? "hover:bg-gray-100 text-gray-700" : "text-gray-400 cursor-not-allowed"}`), q.disabled = l(r) <= 0, C(L, l(r)), _t(A, 1, `w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center
                     hover:bg-gray-100 text-gray-700
                     ${t.group.max_selections && l(r) >= t.group.max_selections ? "opacity-50 cursor-not-allowed" : ""}`), A.disabled = t.group.max_selections && l(r) >= t.group.max_selections;
      }), h(O, b);
    };
    E(K, (O) => {
      t.group.selection_type === "single" ? O(z) : O(G, !1);
    });
  }
  var Z = u(K, 2);
  {
    var X = (O) => {
      var b = ta(), P = a(b);
      T(() => C(P, t.option.availability_status)), h(O, b);
    };
    E(Z, (O) => {
      t.option.availability_status && t.option.availability_status !== "available" && O(X);
    });
  }
  T(
    (O) => {
      _t(s, 1, `relative rounded-lg border-2 transition-all duration-200 
            ${l(i) ? "border-primary-500 bg-primary-50" : "border-gray-200 bg-white hover:border-gray-300"}`), C(f, t.option.name), C(j, `$${O ?? ""} `);
    },
    [() => t.option.base_price.toFixed(2)]
  ), h(e, s), Ht();
}
re(["click"]);
var ia = /* @__PURE__ */ y('<span class="ml-2 text-sm text-red-500">*</span>'), na = /* @__PURE__ */ Jr('<svg class="ml-2 w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>'), aa = /* @__PURE__ */ y('<p class="mt-1 text-sm text-gray-500"> </p>'), sa = /* @__PURE__ */ y('<div class="text-xs text-gray-400">Choose one</div>'), oa = /* @__PURE__ */ y('<div class="text-xs text-gray-400"><!></div>'), la = /* @__PURE__ */ y("<div> </div>"), da = /* @__PURE__ */ y('<div class="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2"></div>'), va = /* @__PURE__ */ y('<div class="text-xs bg-gray-50 p-2 rounded"> </div>'), ua = /* @__PURE__ */ y('<div class="mt-4 text-sm text-gray-600"><details class="group"><summary class="cursor-pointer font-medium group-hover:text-gray-800"> </summary> <div class="mt-2 space-y-1"></div></details></div>'), ca = /* @__PURE__ */ y('<div class="mb-8"><div class="mb-4"><div class="flex items-center justify-between"><div><h2 class="text-lg font-medium text-gray-900 flex items-center"> <!> <!></h2> <!></div> <div class="text-right"><div class="text-sm text-gray-500"> <!> selected</div> <!></div></div> <!></div> <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"></div> <!></div>');
function fa(e, t) {
  Ut(t, !0);
  let r = /* @__PURE__ */ yt(() => t.group.options.reduce(
    (b, P) => b + (d.selections[P.id] || 0),
    0
  )), i = /* @__PURE__ */ yt(() => t.group.required), n = /* @__PURE__ */ yt(() => !l(i) || l(r) >= (t.group.min_selections || 1)), s = /* @__PURE__ */ yt(() => d.validationResults.some((b) => b.group_id === t.group.id || t.group.options.some((P) => b.option_id === P.id)));
  var o = ca(), v = a(o), c = a(v), _ = a(c), g = a(_), m = a(g), f = u(m);
  {
    var w = (b) => {
      var P = ia();
      h(b, P);
    };
    E(f, (b) => {
      l(i) && b(w);
    });
  }
  var x = u(f, 2);
  {
    var N = (b) => {
      var P = na();
      h(b, P);
    };
    E(x, (b) => {
      l(n) && b(N);
    });
  }
  var R = u(g, 2);
  {
    var j = (b) => {
      var P = aa(), q = a(P);
      T(() => C(q, t.group.description)), h(b, P);
    };
    E(R, (b) => {
      t.group.description && b(j);
    });
  }
  var M = u(_, 2), S = a(M), p = a(S), k = u(p);
  {
    var I = (b) => {
      var P = ke();
      T(() => C(P, `/ ${t.group.max_selections ?? ""}`)), h(b, P);
    };
    E(k, (b) => {
      t.group.max_selections && b(I);
    });
  }
  var F = u(S, 2);
  {
    var D = (b) => {
      var P = sa();
      h(b, P);
    }, K = (b, P) => {
      {
        var q = (rt) => {
          var L = oa(), A = a(L);
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
                    var at = (ut) => {
                      var ct = ke();
                      T(() => C(ct, `Max ${t.group.max_selections ?? ""} allowed`)), h(ut, ct);
                    };
                    E(
                      W,
                      (ut) => {
                        t.group.max_selections && ut(at);
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
            E(A, (H) => {
              t.group.min_selections && t.group.max_selections ? H(Q) : H($, !1);
            });
          }
          h(rt, L);
        };
        E(
          b,
          (rt) => {
            (t.group.min_selections || t.group.max_selections) && rt(q);
          },
          P
        );
      }
    };
    E(F, (b) => {
      t.group.selection_type === "single" ? b(D) : b(K, !1);
    });
  }
  var z = u(c, 2);
  {
    var G = (b) => {
      var P = da();
      kt(P, 21, () => d.validationResults, St, (q, rt) => {
        var L = ie(), A = Bt(L);
        {
          var Q = ($) => {
            var H = la(), dt = a(H);
            T(() => C(dt, l(rt).message)), h($, H);
          };
          E(A, ($) => {
            l(rt).group_id === t.group.id && $(Q);
          });
        }
        h(q, L);
      }), h(b, P);
    };
    E(z, (b) => {
      l(s) && b(G);
    });
  }
  var Z = u(v, 2);
  kt(Z, 21, () => t.group.options, St, (b, P) => {
    ra(b, {
      get option() {
        return l(P);
      },
      get group() {
        return t.group;
      }
    });
  });
  var X = u(Z, 2);
  {
    var O = (b) => {
      var P = ua(), q = a(P), rt = a(q), L = a(rt), A = u(rt, 2);
      kt(A, 21, () => t.group.constraints, St, (Q, $) => {
        var H = va(), dt = a(H);
        T(() => C(dt, l($))), h(Q, H);
      }), T(() => C(L, `View Constraints (${t.group.constraints.length ?? ""})`)), h(b, P);
    };
    E(X, (b) => {
      t.group.constraints && t.group.constraints.length > 0 && b(O);
    });
  }
  T(() => {
    C(m, `${t.group.name ?? ""} `), C(p, `${l(r) ?? ""} `);
  }), h(e, o), Ht();
}
var _a = /* @__PURE__ */ y('<div class="text-sm text-gray-500 flex items-center"><div class="animate-spin w-4 h-4 border-2 border-gray-300 border-t-primary-600 rounded-full mr-2"></div> Calculating...</div>'), ga = /* @__PURE__ */ y('<div class="text-sm text-green-600">Updated</div>'), ha = /* @__PURE__ */ y('<span class="text-green-600 ml-2"> </span>'), ma = /* @__PURE__ */ y('<div class="text-sm text-gray-500"> <!></div>'), pa = /* @__PURE__ */ y('<div class="text-gray-500 text-xs"> </div>'), xa = /* @__PURE__ */ y('<div class="flex justify-between text-sm"><div class="flex-1"><div class="text-gray-900"> </div> <!></div> <div class="text-gray-900 font-medium"> </div></div>'), ba = /* @__PURE__ */ y('<div class="flex justify-between text-sm"><span class="text-gray-600"> </span> <span> </span></div>'), ya = /* @__PURE__ */ y('<div class="space-y-3"><h4 class="text-sm font-medium text-gray-700 border-b border-gray-200 pb-2">Price Breakdown</h4> <!> <div class="border-t border-gray-200 pt-3"><div class="flex justify-between text-sm"><span class="text-gray-500">Subtotal</span> <span class="text-gray-900"> </span></div></div> <!> <div class="border-t border-gray-200 pt-3"><div class="flex justify-between text-lg font-medium"><span class="text-gray-900">Total</span> <span class="text-gray-900"> </span></div></div></div>'), wa = () => d.saveConfiguration(), Sa = /* @__PURE__ */ y('<div class="mt-6 space-y-3"><button type="button" class="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors">Save Configuration</button> <button type="button" class="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors">Export Configuration</button></div>'), ka = /* @__PURE__ */ y('<div class="bg-white rounded-lg border border-gray-200 p-6"><div class="flex items-center justify-between mb-4"><h3 class="text-lg font-medium text-gray-900">Pricing</h3> <!></div> <div class="text-center mb-6"><div class="text-3xl font-bold text-gray-900"> </div> <!></div> <!> <!></div>');
function Xr(e, t) {
  Ut(t, !0);
  let r = vt(t, "detailed", 3, !1), i = vt(t, "showBreakdown", 3, !0), n = /* @__PURE__ */ yt(() => d.adjustments.reduce(
    (S, p) => p.amount < 0 ? S + Math.abs(p.amount) : S,
    0
  ));
  var s = ka(), o = a(s), v = u(a(o), 2);
  {
    var c = (S) => {
      var p = _a();
      h(S, p);
    }, _ = (S, p) => {
      {
        var k = (I) => {
          var F = ga();
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
  var g = u(o, 2), m = a(g), f = a(m), w = u(m, 2);
  {
    var x = (S) => {
      var p = ma(), k = a(p), I = u(k);
      {
        var F = (D) => {
          var K = ha(), z = a(K);
          T((G) => C(z, `Save $${G ?? ""}`), [() => l(n).toFixed(2)]), h(D, K);
        };
        E(I, (D) => {
          l(n) > 0 && D(F);
        });
      }
      T((D) => C(k, `Base: $${D ?? ""} `), [() => d.basePrice.toFixed(2)]), h(S, p);
    };
    E(w, (S) => {
      d.basePrice !== d.totalPrice && S(x);
    });
  }
  var N = u(g, 2);
  {
    var R = (S) => {
      var p = ya(), k = u(a(p), 2);
      kt(k, 17, () => d.selectedOptions, St, (P, q) => {
        var rt = xa(), L = a(rt), A = a(L), Q = a(A), $ = u(A, 2);
        {
          var H = (V) => {
            var W = pa(), it = a(W);
            T((at) => C(it, `$${at ?? ""} × ${d.selections[l(q).id] ?? ""}`), [
              () => l(q).base_price.toFixed(2)
            ]), h(V, W);
          };
          E($, (V) => {
            d.selections[l(q).id] > 1 && V(H);
          });
        }
        var dt = u(L, 2), B = a(dt);
        T(
          (V) => {
            C(Q, l(q).name), C(B, `$${V ?? ""}`);
          },
          [
            () => (l(q).base_price * d.selections[l(q).id]).toFixed(2)
          ]
        ), h(P, rt);
      });
      var I = u(k, 2), F = a(I), D = u(a(F), 2), K = a(D), z = u(I, 2);
      {
        var G = (P) => {
          var q = ie(), rt = Bt(q);
          kt(rt, 17, () => d.adjustments, St, (L, A) => {
            var Q = ba(), $ = a(Q), H = a($), dt = u($, 2), B = a(dt);
            T(
              (V) => {
                C(H, l(A).rule_name || l(A).name), _t(dt, 1, l(A).amount < 0 ? "text-green-600" : "text-red-600"), C(B, `${l(A).amount < 0 ? "-" : "+"}$${V ?? ""}`);
              },
              [
                () => Math.abs(l(A).amount).toFixed(2)
              ]
            ), h(L, Q);
          }), h(P, q);
        };
        E(z, (P) => {
          d.adjustments.length > 0 && P(G);
        });
      }
      var Z = u(z, 2), X = a(Z), O = u(a(X), 2), b = a(O);
      T(
        (P, q) => {
          C(K, `$${P ?? ""}`), C(b, `$${q ?? ""}`);
        },
        [
          () => d.basePrice.toFixed(2),
          () => d.totalPrice.toFixed(2)
        ]
      ), h(S, p);
    };
    E(N, (S) => {
      i() && d.pricingData && d.selectedOptions.length > 0 && S(R);
    });
  }
  var j = u(N, 2);
  {
    var M = (S) => {
      var p = Sa(), k = a(p);
      k.__click = [wa];
      var I = u(k, 2);
      I.__click = () => {
        const F = d.exportConfiguration(), D = new Blob([JSON.stringify(F, null, 2)], { type: "application/json" }), K = URL.createObjectURL(D), z = document.createElement("a");
        z.href = K, z.download = `configuration-${Date.now()}.json`, z.click();
      }, h(S, p);
    };
    E(j, (S) => {
      r() && S(M);
    });
  }
  T((S) => C(f, `$${S ?? ""}`), [() => d.totalPrice.toFixed(2)]), h(e, s), Ht();
}
re(["click"]);
var Ca = /* @__PURE__ */ y("<li> </li>"), Ea = /* @__PURE__ */ y('<div class="rounded-md bg-red-50 p-4 border border-red-200"><div class="flex"><div class="flex-shrink-0"><svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg></div> <div class="ml-3"><h3 class="text-sm font-medium text-red-800"> </h3> <div class="mt-2 text-sm text-red-700"><ul class="space-y-1"></ul></div></div></div></div>'), Ia = /* @__PURE__ */ y("<li> </li>"), Pa = /* @__PURE__ */ y('<div class="rounded-md bg-yellow-50 p-4 border border-yellow-200"><div class="flex"><div class="flex-shrink-0"><svg class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg></div> <div class="ml-3"><h3 class="text-sm font-medium text-yellow-800"> </h3> <div class="mt-2 text-sm text-yellow-700"><ul class="space-y-1"></ul></div></div></div></div>'), Ma = /* @__PURE__ */ y("<li> </li>"), Ta = /* @__PURE__ */ y('<div class="rounded-md bg-blue-50 p-4 border border-blue-200"><div class="flex"><div class="flex-shrink-0"><svg class="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg></div> <div class="ml-3"><h3 class="text-sm font-medium text-blue-800"> </h3> <div class="mt-2 text-sm text-blue-700"><ul class="space-y-1"></ul></div></div></div></div>'), Oa = /* @__PURE__ */ y('<div class="space-y-3"><!> <!> <!></div>'), Ra = /* @__PURE__ */ y('<div class="text-center py-4"><div class="animate-spin w-6 h-6 border-2 border-gray-300 border-t-primary-600 rounded-full mx-auto"></div> <p class="mt-2 text-sm text-gray-500">Validating configuration...</p></div>'), Aa = /* @__PURE__ */ y('<div class="rounded-md bg-green-50 p-4 border border-green-200"><div class="flex"><div class="flex-shrink-0"><svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg></div> <div class="ml-3"><h3 class="text-sm font-medium text-green-800">Configuration Valid</h3> <div class="mt-2 text-sm text-green-700"><p>Your configuration meets all requirements and constraints.</p></div></div></div></div>');
function $r(e, t) {
  Ut(t, !0);
  let r = vt(t, "showSuggestions", 3, !0), i = /* @__PURE__ */ yt(() => d.validationResults.filter((g) => g.severity === "error" || g.level === "error")), n = /* @__PURE__ */ yt(() => d.validationResults.filter((g) => g.severity === "warning" || g.level === "warning")), s = /* @__PURE__ */ yt(() => d.validationResults.filter((g) => g.severity === "info" || g.level === "suggestion"));
  var o = ie(), v = Bt(o);
  {
    var c = (g) => {
      var m = Oa(), f = a(m);
      {
        var w = (M) => {
          var S = Ea(), p = a(S), k = u(a(p), 2), I = a(k), F = a(I), D = u(I, 2), K = a(D);
          kt(K, 21, () => l(i), St, (z, G) => {
            var Z = Ca(), X = a(Z);
            T(() => C(X, `• ${l(G).message ?? ""}`)), h(z, Z);
          }), T(() => C(F, `Configuration Errors (${l(i).length ?? ""})`)), h(M, S);
        };
        E(f, (M) => {
          l(i).length > 0 && M(w);
        });
      }
      var x = u(f, 2);
      {
        var N = (M) => {
          var S = Pa(), p = a(S), k = u(a(p), 2), I = a(k), F = a(I), D = u(I, 2), K = a(D);
          kt(K, 21, () => l(n), St, (z, G) => {
            var Z = Ia(), X = a(Z);
            T(() => C(X, `• ${l(G).message ?? ""}`)), h(z, Z);
          }), T(() => C(F, `Warnings (${l(n).length ?? ""})`)), h(M, S);
        };
        E(x, (M) => {
          l(n).length > 0 && M(N);
        });
      }
      var R = u(x, 2);
      {
        var j = (M) => {
          var S = Ta(), p = a(S), k = u(a(p), 2), I = a(k), F = a(I), D = u(I, 2), K = a(D);
          kt(K, 21, () => l(s), St, (z, G) => {
            var Z = Ma(), X = a(Z);
            T(() => C(X, `• ${l(G).message ?? ""}`)), h(z, Z);
          }), T(() => C(F, `Suggestions (${l(s).length ?? ""})`)), h(M, S);
        };
        E(R, (M) => {
          r() && l(s).length > 0 && M(j);
        });
      }
      h(g, m);
    }, _ = (g, m) => {
      {
        var f = (x) => {
          var N = Ra();
          h(x, N);
        }, w = (x) => {
          var N = Aa();
          h(x, N);
        };
        E(
          g,
          (x) => {
            d.isValidating ? x(f) : x(w, !1);
          },
          m
        );
      }
    };
    E(v, (g) => {
      d.validationResults.length > 0 ? g(c) : g(_, !1);
    });
  }
  h(e, o), Ht();
}
var Da = /* @__PURE__ */ y('<div class="text-sm text-gray-500 mt-1"> </div>'), ja = /* @__PURE__ */ y('<div class="text-sm text-gray-600 mt-1"> </div>'), qa = /* @__PURE__ */ y('<div class="text-sm text-gray-500"> </div>'), La = /* @__PURE__ */ y('<div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg"><div class="flex-1"><div class="font-medium text-gray-900"> </div> <!> <!></div> <div class="text-right"><div class="font-medium text-gray-900"> </div> <!></div></div>'), Na = /* @__PURE__ */ y('<div class="bg-white rounded-lg border border-gray-200 p-6"><h3 class="text-lg font-medium text-gray-900 mb-4">Selected Options</h3> <div class="space-y-4"></div></div>'), Fa = (e, t) => Y(t, !0), Va = () => d.saveConfiguration(), za = (e, t) => Y(t, !1), Ba = (e) => e.stopPropagation(), Ua = (e, t, r) => t(l(r)), Ha = (e, t) => Y(t, !1), Ya = /* @__PURE__ */ y('<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div class="bg-white rounded-lg p-6 max-w-md w-full mx-4"><h3 class="text-lg font-medium text-gray-900 mb-4">Share Configuration</h3> <div class="space-y-4"><div><label class="block text-sm font-medium text-gray-700 mb-2">Shareable Link</label> <div class="flex"><input type="text" readonly="" class="flex-1 px-3 py-2 border border-gray-300 rounded-l-md text-sm bg-gray-50"/> <button type="button" class="px-4 py-2 bg-primary-600 text-white rounded-r-md hover:bg-primary-700 transition-colors text-sm"> </button></div></div> <div class="flex justify-end space-x-3"><button type="button" class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Close</button></div></div></div></div>'), Ga = /* @__PURE__ */ y('<div class="space-y-6"><div class="bg-white rounded-lg border border-gray-200 p-6"><h2 class="text-xl font-semibold text-gray-900 mb-4">Configuration Summary</h2> <div class="grid grid-cols-1 md:grid-cols-3 gap-4"><div class="text-center p-4 bg-gray-50 rounded-lg"><div class="text-2xl font-bold text-primary-600"> </div> <div class="text-sm text-gray-500">Options Selected</div></div> <div class="text-center p-4 bg-gray-50 rounded-lg"><div class="text-2xl font-bold text-primary-600"> </div> <div class="text-sm text-gray-500">Complete</div></div> <div class="text-center p-4 bg-gray-50 rounded-lg"><div> </div> <div class="text-sm text-gray-500"> </div></div></div></div> <!> <div class="bg-white rounded-lg border border-gray-200 p-6"><h3 class="text-lg font-medium text-gray-900 mb-4">Validation Status</h3> <!></div> <!> <div class="bg-white rounded-lg border border-gray-200 p-6"><h3 class="text-lg font-medium text-gray-900 mb-4">Actions</h3> <div class="grid grid-cols-1 md:grid-cols-2 gap-4"><button type="button" class="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"><svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path></svg> Share Configuration</button> <button type="button" class="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"><svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg> Export Configuration</button> <button type="button" class="flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 transition-colors"><svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg> Save Configuration</button> <button type="button" class="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors"><svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 3H3m4 10v6a1 1 0 001 1h6a1 1 0 001-1v-6m-8 0V9a1 1 0 011-1h6a1 1 0 011 1v4.01"></path></svg> Request Quote</button></div></div></div> <!>', 1);
function Qa(e, t) {
  Ut(t, !0);
  let r = /* @__PURE__ */ yt(() => d.generateShareableUrl()), i = /* @__PURE__ */ tt(!1), n = /* @__PURE__ */ tt(!1);
  async function s(L) {
    try {
      await navigator.clipboard.writeText(L), Y(n, !0), setTimeout(() => Y(n, !1), 2e3);
    } catch (A) {
      console.warn("Failed to copy to clipboard:", A);
    }
  }
  function o() {
    const L = d.exportConfiguration(), A = new Blob([JSON.stringify(L, null, 2)], { type: "application/json" }), Q = URL.createObjectURL(A), $ = document.createElement("a");
    $.href = Q, $.download = `configuration-${Date.now()}.json`, $.click(), URL.revokeObjectURL(Q);
  }
  var v = Ga(), c = Bt(v), _ = a(c), g = u(a(_), 2), m = a(g), f = a(m), w = a(f), x = u(m, 2), N = a(x), R = a(N), j = u(x, 2), M = a(j), S = a(M), p = u(M, 2), k = a(p), I = u(_, 2);
  {
    var F = (L) => {
      var A = Na(), Q = u(a(A), 2);
      kt(Q, 21, () => d.selectedOptions, St, ($, H) => {
        var dt = La(), B = a(dt), V = a(B), W = a(V), it = u(V, 2);
        {
          var at = (U) => {
            var lt = Da(), gt = a(lt);
            T(() => C(gt, l(H).description)), h(U, lt);
          };
          E(it, (U) => {
            l(H).description && U(at);
          });
        }
        var ut = u(it, 2);
        {
          var ct = (U) => {
            var lt = ja(), gt = a(lt);
            T(() => C(gt, `Quantity: ${d.selections[l(H).id] ?? ""}`)), h(U, lt);
          };
          E(ut, (U) => {
            d.selections[l(H).id] > 1 && U(ct);
          });
        }
        var ht = u(B, 2), ft = a(ht), Et = a(ft), Mt = u(ft, 2);
        {
          var st = (U) => {
            var lt = qa(), gt = a(lt);
            T((At) => C(gt, `$${At ?? ""} each`), [
              () => l(H).base_price.toFixed(2)
            ]), h(U, lt);
          };
          E(Mt, (U) => {
            d.selections[l(H).id] > 1 && U(st);
          });
        }
        T(
          (U) => {
            C(W, l(H).name), C(Et, `$${U ?? ""}`);
          },
          [
            () => (l(H).base_price * d.selections[l(H).id]).toFixed(2)
          ]
        ), h($, dt);
      }), h(L, A);
    };
    E(I, (L) => {
      d.selectedOptions.length > 0 && L(F);
    });
  }
  var D = u(I, 2), K = u(a(D), 2);
  $r(K, {});
  var z = u(D, 2);
  Xr(z, { detailed: !0 });
  var G = u(z, 2), Z = u(a(G), 2), X = a(Z);
  X.__click = [Fa, i];
  var O = u(X, 2);
  O.__click = o;
  var b = u(O, 2);
  b.__click = [Va];
  var P = u(b, 2), q = u(c, 2);
  {
    var rt = (L) => {
      var A = Ya();
      A.__click = [za, i];
      var Q = a(A);
      Q.__click = [Ba];
      var $ = u(a(Q), 2), H = a($), dt = u(a(H), 2), B = a(dt), V = u(B, 2);
      V.__click = [Ua, s, r];
      var W = a(V), it = u(H, 2), at = a(it);
      at.__click = [Ha, i], T(() => {
        pn(B, l(r)), C(W, l(n) ? "Copied!" : "Copy");
      }), h(L, A);
    };
    E(q, (L) => {
      l(i) && L(rt);
    });
  }
  T(() => {
    C(w, d.selectedOptions.length), C(R, `${d.completionPercentage ?? ""}%`), _t(M, 1, `text-2xl font-bold ${d.isValid ? "text-green-600" : "text-red-600"}`), C(S, d.isValid ? "✓" : "✗"), C(k, d.isValid ? "Valid" : "Has Errors"), b.disabled = !d.isValid, P.disabled = !d.isValid;
  }), h(e, v), Ht();
}
re(["click"]);
function Ja(e, t, r, i) {
  const n = d.exportConfiguration();
  t() && t()(n), r("complete", n), i() && window.parent !== window && window.parent.postMessage(
    {
      type: "cpq-configuration-complete",
      configuration: n
    },
    "*"
  );
}
var Ka = /* @__PURE__ */ y('<div class="text-sm text-red-500"> </div>'), Wa = /* @__PURE__ */ y('<div class="text-sm text-green-600">Valid</div>'), Za = /* @__PURE__ */ y('<div class="cpq-embed-header bg-white border-b border-gray-200 p-4"><div class="flex items-center justify-between"><div><h1 class="text-lg font-semibold text-gray-900"> </h1> <div class="text-sm text-gray-500"> </div></div> <div class="text-right"><div class="text-lg font-bold text-primary-600"> </div> <!></div></div> <div class="mt-3"><div class="bg-gray-200 rounded-full h-2"><div class="bg-primary-600 h-2 rounded-full transition-all duration-300"></div></div></div></div>'), Xa = /* @__PURE__ */ y('<p class="mt-1 text-gray-600"> </p>'), $a = /* @__PURE__ */ y('<div class="mb-8"><div class="flex items-center justify-between mb-6"><div><h1 class="text-2xl font-bold text-gray-900"> </h1> <!></div> <div class="text-right"><div class="text-sm text-gray-500">Progress</div> <div class="text-lg font-semibold text-primary-600"> </div></div></div> <!></div>'), ts = /* @__PURE__ */ y('<div><span class="text-gray-500"> </span> <span class="ml-2 text-gray-900"> </span></div>'), es = /* @__PURE__ */ y('<div><h3 class="text-sm font-medium text-gray-700 mb-2">Specifications</h3> <div class="grid grid-cols-2 gap-4 text-sm"></div></div>'), rs = () => d.nextStep(), is = /* @__PURE__ */ y('<div class="bg-white rounded-lg border border-gray-200 p-6"><h2 class="text-xl font-semibold text-gray-900 mb-4">Product Overview</h2> <div class="space-y-4"><!> <div class="pt-4"><button type="button" class="bg-primary-600 text-white px-6 py-3 rounded-md font-medium hover:bg-primary-700 transition-colors">Start Configuring</button></div></div></div>'), ns = /* @__PURE__ */ y('<div class="bg-white rounded-lg border border-gray-200 p-6"><!></div>'), as = /* @__PURE__ */ y('<div class="text-center py-8 text-gray-500">No configuration options available.</div>'), ss = /* @__PURE__ */ y('<div class="bg-white rounded-lg border border-gray-200 p-6"><!></div>'), os = /* @__PURE__ */ y('<div class="space-y-6"><!> <!></div>'), ls = () => d.goToStep(1), ds = /* @__PURE__ */ y('<div class="bg-white rounded-lg border border-gray-200 p-8 text-center"><div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><svg class="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg></div> <h2 class="text-2xl font-bold text-gray-900 mb-2">Configuration Complete!</h2> <p class="text-gray-600 mb-6">Your product configuration has been finalized.</p> <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto"><button type="button" class="bg-primary-600 text-white px-4 py-2 rounded-md font-medium hover:bg-primary-700 transition-colors">Get Quote</button> <button type="button" class="border border-gray-300 text-gray-700 px-4 py-2 rounded-md font-medium hover:bg-gray-50 transition-colors">Modify</button></div></div>'), vs = () => d.previousStep(), us = () => d.nextStep(), cs = /* @__PURE__ */ y('<button type="button"> <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg></button>'), fs = () => d.clearSelections(), _s = () => d.saveConfiguration(), gs = /* @__PURE__ */ y('<div class="cpq-sidebar"><div class="sticky top-8 space-y-6"><!> <div class="bg-white rounded-lg border border-gray-200 p-4"><h3 class="text-sm font-medium text-gray-900 mb-3">Quick Actions</h3> <div class="space-y-2"><button type="button" class="w-full text-left text-sm text-gray-600 hover:text-gray-900 p-2 rounded hover:bg-gray-50">Clear All</button> <button type="button" class="w-full text-left text-sm text-gray-600 hover:text-gray-900 p-2 rounded hover:bg-gray-50">Save Progress</button></div></div></div></div>'), hs = /* @__PURE__ */ y('<!> <div><!> <div class="mt-6 flex justify-between"><button type="button"><svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg> Previous</button> <!></div></div> <!>', 1), ms = /* @__PURE__ */ y('<div class="text-center py-12"><h2 class="text-xl font-semibold text-gray-900 mb-2">Model Not Found</h2> <p class="text-gray-600">The requested model could not be found.</p></div>'), ps = /* @__PURE__ */ y("<div><!></div>");
function xs(e, t) {
  Ut(t, !0);
  let r = vt(t, "theme", 7, "light"), i = vt(t, "apiUrl", 3, "http://localhost:8080/api/v1"), n = vt(t, "embedMode", 3, !1), s = vt(t, "onComplete", 3, null), o = vt(t, "onConfigurationChange", 3, null), v = vt(t, "onError", 3, null);
  const c = Kr();
  let _ = /* @__PURE__ */ tt(0), g = jt(n());
  typeof window < "u" && (window.__API_BASE_URL__ = i()), sn(() => {
    d.initialize(), d.setModelId(t.modelId), document.documentElement.setAttribute("data-theme", r()), n() && m();
  });
  function m() {
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
  function f(M) {
    const { type: S, data: p } = M.data;
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
    ar(_), d.reset(), d.setModelId(t.modelId);
  }
  Tt(() => {
    o() && o()(d.exportConfiguration()), n() && window.parent !== window && window.parent.postMessage(
      {
        type: "cpq-configuration-change",
        configuration: d.exportConfiguration()
      },
      "*"
    );
  }), Tt(() => {
    d.error && v() && v()(d.error);
  });
  var x = ps(), N = a(x);
  {
    var R = (M) => {
      Vn(M, {
        get error() {
          return d.error;
        },
        context: "Configurator",
        get retryCount() {
          return l(_);
        },
        $$events: { retry: w }
      });
    }, j = (M, S) => {
      {
        var p = (I) => {
          Dn(I, {
            size: "lg",
            message: "Loading configurator..."
          });
        }, k = (I, F) => {
          {
            var D = (z) => {
              var G = hs(), Z = Bt(G);
              {
                var X = (B) => {
                  var V = Za(), W = a(V), it = a(W), at = a(it), ut = a(at), ct = u(at, 2), ht = a(ct), ft = u(it, 2), Et = a(ft), Mt = a(Et), st = u(Et, 2);
                  {
                    var U = (It) => {
                      var Jt = Ka(), ne = a(Jt);
                      T(() => C(ne, `${d.validationResults.length ?? ""} issues`)), h(It, Jt);
                    }, lt = (It, Jt) => {
                      {
                        var ne = (Be) => {
                          var ti = Wa();
                          h(Be, ti);
                        };
                        E(
                          It,
                          (Be) => {
                            d.selectedOptions.length > 0 && Be(ne);
                          },
                          Jt
                        );
                      }
                    };
                    E(st, (It) => {
                      d.validationResults.length > 0 ? It(U) : It(lt, !1);
                    });
                  }
                  var gt = u(W, 2), At = a(gt), Yt = a(At);
                  T(
                    (It) => {
                      C(ut, d.model.name), C(ht, `Step ${d.currentStep + 1} of 4 • ${d.completionPercentage ?? ""}% complete`), C(Mt, `$${It ?? ""}`), gn(Yt, `width: ${d.completionPercentage ?? ""}%`);
                    },
                    [() => d.totalPrice.toFixed(2)]
                  ), h(B, V);
                }, O = (B) => {
                  var V = $a(), W = a(V), it = a(W), at = a(it), ut = a(at), ct = u(at, 2);
                  {
                    var ht = (U) => {
                      var lt = Xa(), gt = a(lt);
                      T(() => C(gt, d.model.description)), h(U, lt);
                    };
                    E(ct, (U) => {
                      d.model.description && U(ht);
                    });
                  }
                  var ft = u(it, 2), Et = u(a(ft), 2), Mt = a(Et), st = u(W, 2);
                  Mn(st, {}), T(() => {
                    C(ut, d.model.name), C(Mt, `${d.completionPercentage ?? ""}%`);
                  }), h(B, V);
                };
                E(Z, (B) => {
                  n() ? B(X) : B(O, !1);
                });
              }
              var b = u(Z, 2), P = a(b);
              {
                var q = (B) => {
                  var V = is(), W = u(a(V), 2), it = a(W);
                  {
                    var at = (ht) => {
                      var ft = es(), Et = u(a(ft), 2);
                      kt(Et, 21, () => Object.entries(d.model.specifications), St, (Mt, st) => {
                        var U = /* @__PURE__ */ yt(() => mi(l(st), 2));
                        let lt = () => l(U)[0], gt = () => l(U)[1];
                        var At = ts(), Yt = a(At), It = a(Yt), Jt = u(Yt, 2), ne = a(Jt);
                        T(() => {
                          C(It, `${lt() ?? ""}:`), C(ne, gt());
                        }), h(Mt, At);
                      }), h(ht, ft);
                    };
                    E(it, (ht) => {
                      d.model.specifications && ht(at);
                    });
                  }
                  var ut = u(it, 2), ct = a(ut);
                  ct.__click = [rs], h(B, V);
                }, rt = (B, V) => {
                  {
                    var W = (at) => {
                      var ut = os(), ct = a(ut);
                      {
                        var ht = (st) => {
                          var U = ie(), lt = Bt(U);
                          kt(lt, 17, () => d.model.option_groups, St, (gt, At) => {
                            var Yt = ns(), It = a(Yt);
                            fa(It, {
                              get group() {
                                return l(At);
                              }
                            }), h(gt, Yt);
                          }), h(st, U);
                        }, ft = (st) => {
                          var U = as();
                          h(st, U);
                        };
                        E(ct, (st) => {
                          d.model.option_groups && d.model.option_groups.length > 0 ? st(ht) : st(ft, !1);
                        });
                      }
                      var Et = u(ct, 2);
                      {
                        var Mt = (st) => {
                          var U = ss(), lt = a(U);
                          $r(lt, {}), h(st, U);
                        };
                        E(Et, (st) => {
                          (d.validationResults.length > 0 || d.isValidating) && st(Mt);
                        });
                      }
                      h(at, ut);
                    }, it = (at, ut) => {
                      {
                        var ct = (ft) => {
                          Qa(ft, {});
                        }, ht = (ft, Et) => {
                          {
                            var Mt = (st) => {
                              var U = ds(), lt = u(a(U), 6), gt = a(lt);
                              gt.__click = [
                                Ja,
                                s,
                                c,
                                n
                              ];
                              var At = u(gt, 2);
                              At.__click = [ls], h(st, U);
                            };
                            E(
                              ft,
                              (st) => {
                                d.currentStep === 3 && st(Mt);
                              },
                              Et
                            );
                          }
                        };
                        E(
                          at,
                          (ft) => {
                            d.currentStep === 2 ? ft(ct) : ft(ht, !1);
                          },
                          ut
                        );
                      }
                    };
                    E(
                      B,
                      (at) => {
                        d.currentStep === 1 ? at(W) : at(it, !1);
                      },
                      V
                    );
                  }
                };
                E(P, (B) => {
                  d.currentStep === 0 ? B(q) : B(rt, !1);
                });
              }
              var L = u(P, 2), A = a(L);
              A.__click = [vs];
              var Q = u(A, 2);
              {
                var $ = (B) => {
                  var V = cs();
                  V.__click = [us];
                  var W = a(V);
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
                  var V = gs(), W = a(V), it = a(W);
                  Xr(it, {});
                  var at = u(it, 2), ut = u(a(at), 2), ct = a(ut);
                  ct.__click = [fs];
                  var ht = u(ct, 2);
                  ht.__click = [_s], h(B, V);
                };
                E(H, (B) => {
                  n() || B(dt);
                });
              }
              T(() => {
                _t(b, 1, n() ? "cpq-embed-content" : "cpq-full-content", "svelte-k7ary"), _t(A, 1, `flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors
                 ${d.currentStep === 0 ? "opacity-50 cursor-not-allowed" : ""}`), A.disabled = d.currentStep === 0;
              }), h(z, G);
            }, K = (z) => {
              var G = ms();
              h(z, G);
            };
            E(
              I,
              (z) => {
                d.model ? z(D) : z(K, !1);
              },
              F
            );
          }
        };
        E(
          M,
          (I) => {
            d.isLoading ? I(p) : I(k, !1);
          },
          S
        );
      }
    };
    E(N, (M) => {
      d.error ? M(R) : M(j, !1);
    });
  }
  T(() => {
    _t(x, 1, `cpq-configurator ${n() ? "cpq-embed-mode" : ""} ${g ? "cpq-compact" : ""}`, "svelte-k7ary"), Wr(x, "data-theme", r());
  }), h(e, x), Ht();
}
re(["click"]);
class bs {
  constructor() {
    this.instances = /* @__PURE__ */ new Map();
  }
  embed(t) {
    const {
      container: r,
      modelId: i,
      theme: n = "light",
      apiUrl: s = "http://localhost:8080/api/v1",
      onComplete: o,
      onConfigurationChange: v,
      onError: c
    } = t;
    if (!r || !i)
      throw new Error("Container and modelId are required");
    const _ = typeof r == "string" ? document.querySelector(r) : r;
    if (!_)
      throw new Error("Target container not found");
    const g = new xs({
      target: _,
      props: {
        modelId: i,
        theme: n,
        apiUrl: s,
        embedMode: !0,
        onComplete: o,
        onConfigurationChange: v,
        onError: c
      }
    }), m = Math.random().toString(36).substr(2, 9);
    return this.instances.set(m, g), {
      id: m,
      destroy: () => this.destroy(m),
      updateProps: (f) => {
        Object.entries(f).forEach(([w, x]) => {
          g.$set({ [w]: x });
        });
      }
    };
  }
  destroy(t) {
    const r = this.instances.get(t);
    r && (r.$destroy(), this.instances.delete(t));
  }
  destroyAll() {
    this.instances.forEach((t) => t.$destroy()), this.instances.clear();
  }
}
window.CPQConfigurator = new bs();
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-cpq-configurator]").forEach((t) => {
    const r = t.dataset.cpqModelId, i = t.dataset.cpqTheme || "light", n = t.dataset.cpqApiUrl;
    r && window.CPQConfigurator.embed({
      container: t,
      modelId: r,
      theme: i,
      ...n && { apiUrl: n }
    });
  });
});
