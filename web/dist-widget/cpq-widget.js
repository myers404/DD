var tr = (t) => {
  throw TypeError(t);
};
var rr = (t, e, r) => e.has(t) || tr("Cannot " + r);
var G = (t, e, r) => (rr(t, e, "read from private field"), r ? r.call(t) : e.get(t)), ue = (t, e, r) => e.has(t) ? tr("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, r), ce = (t, e, r, i) => (rr(t, e, "write to private field"), i ? i.call(t, r) : e.set(t, r), r);
const Zr = "5";
var _r;
typeof window < "u" && ((_r = window.__svelte ?? (window.__svelte = {})).v ?? (_r.v = /* @__PURE__ */ new Set())).add(Zr);
const Bt = 1, Gt = 2, pr = 4, Xr = 8, $r = 16, ei = 1, ti = 4, ri = 8, ii = 16, si = 1, ni = 2, fe = Symbol(), oi = "http://www.w3.org/1999/xhtml", ir = !1;
var Ht = Array.isArray, ai = Array.prototype.indexOf, hr = Array.from, ht = Object.getOwnPropertyDescriptor, li = Object.getOwnPropertyDescriptors, ui = Object.prototype, ci = Array.prototype, gr = Object.getPrototypeOf;
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
const Se = 2, mr = 4, xt = 8, Yt = 16, Me = 32, ut = 64, Wt = 128, he = 256, mt = 512, me = 1024, Ie = 2048, Ge = 4096, Pe = 8192, Qt = 16384, br = 32768, Jt = 65536, fi = 1 << 19, yr = 1 << 20, Rt = 1 << 21, Ye = Symbol("$state"), _i = Symbol("legacy props"), pi = Symbol("");
function wr(t) {
  return t === this.v;
}
function hi(t, e) {
  return t != t ? e == e : t !== e || t !== null && typeof t == "object" || typeof t == "function";
}
function Kt(t) {
  return !hi(t, this.v);
}
function gi(t) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function mi() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function bi(t) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function yi() {
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
let Ei = !1;
function Ar(t) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
let ge = null;
function sr(t) {
  ge = t;
}
function Le(t, e = !1, r) {
  var i = ge = {
    p: ge,
    c: null,
    d: !1,
    e: null,
    m: !1,
    s: t,
    x: null,
    l: null
  };
  Pr(() => {
    i.d = !0;
  });
}
function Fe(t) {
  const e = ge;
  if (e !== null) {
    const o = e.e;
    if (o !== null) {
      var r = K, i = J;
      e.e = null;
      try {
        for (var s = 0; s < o.length; s++) {
          var n = o[s];
          lt(n.effect), ze(n.reaction), Or(n.fn);
        }
      } finally {
        lt(r), ze(i);
      }
    }
    ge = e.p, e.m = !0;
  }
  return (
    /** @type {T} */
    {}
  );
}
function kr() {
  return !0;
}
function xe(t) {
  if (typeof t != "object" || t === null || Ye in t)
    return t;
  const e = gr(t);
  if (e !== ui && e !== ci)
    return t;
  var r = /* @__PURE__ */ new Map(), i = Ht(t), s = /* @__PURE__ */ H(0), n = J, o = (l) => {
    var a = J;
    ze(n);
    var v = l();
    return ze(a), v;
  };
  return i && r.set("length", /* @__PURE__ */ H(
    /** @type {any[]} */
    t.length
  )), new Proxy(
    /** @type {any} */
    t,
    {
      defineProperty(l, a, v) {
        return (!("value" in v) || v.configurable === !1 || v.enumerable === !1 || v.writable === !1) && Ai(), o(() => {
          var p = r.get(a);
          p === void 0 ? (p = /* @__PURE__ */ H(v.value), r.set(a, p)) : O(p, v.value, !0);
        }), !0;
      },
      deleteProperty(l, a) {
        var v = r.get(a);
        if (v === void 0) {
          if (a in l) {
            const c = o(() => /* @__PURE__ */ H(fe));
            r.set(a, c), Dt(s);
          }
        } else {
          if (i && typeof a == "string") {
            var p = (
              /** @type {Source<number>} */
              r.get("length")
            ), f = Number(a);
            Number.isInteger(f) && f < p.v && O(p, f);
          }
          O(v, fe), Dt(s);
        }
        return !0;
      },
      get(l, a, v) {
        if (a === Ye)
          return t;
        var p = r.get(a), f = a in l;
        if (p === void 0 && (!f || ht(l, a)?.writable) && (p = o(() => {
          var h = xe(f ? l[a] : fe), w = /* @__PURE__ */ H(h);
          return w;
        }), r.set(a, p)), p !== void 0) {
          var c = d(p);
          return c === fe ? void 0 : c;
        }
        return Reflect.get(l, a, v);
      },
      getOwnPropertyDescriptor(l, a) {
        var v = Reflect.getOwnPropertyDescriptor(l, a);
        if (v && "value" in v) {
          var p = r.get(a);
          p && (v.value = d(p));
        } else if (v === void 0) {
          var f = r.get(a), c = f?.v;
          if (f !== void 0 && c !== fe)
            return {
              enumerable: !0,
              configurable: !0,
              value: c,
              writable: !0
            };
        }
        return v;
      },
      has(l, a) {
        if (a === Ye)
          return !0;
        var v = r.get(a), p = v !== void 0 && v.v !== fe || Reflect.has(l, a);
        if (v !== void 0 || K !== null && (!p || ht(l, a)?.writable)) {
          v === void 0 && (v = o(() => {
            var c = p ? xe(l[a]) : fe, h = /* @__PURE__ */ H(c);
            return h;
          }), r.set(a, v));
          var f = d(v);
          if (f === fe)
            return !1;
        }
        return p;
      },
      set(l, a, v, p) {
        var f = r.get(a), c = a in l;
        if (i && a === "length")
          for (var h = v; h < /** @type {Source<number>} */
          f.v; h += 1) {
            var w = r.get(h + "");
            w !== void 0 ? O(w, fe) : h in l && (w = o(() => /* @__PURE__ */ H(fe)), r.set(h + "", w));
          }
        if (f === void 0)
          (!c || ht(l, a)?.writable) && (f = o(() => {
            var C = /* @__PURE__ */ H(void 0);
            return O(C, xe(v)), C;
          }), r.set(a, f));
        else {
          c = f.v !== fe;
          var F = o(() => xe(v));
          O(f, F);
        }
        var S = Reflect.getOwnPropertyDescriptor(l, a);
        if (S?.set && S.set.call(p, v), !c) {
          if (i && typeof a == "string") {
            var V = (
              /** @type {Source<number>} */
              r.get("length")
            ), B = Number(a);
            Number.isInteger(B) && B >= V.v && O(V, B + 1);
          }
          Dt(s);
        }
        return !0;
      },
      ownKeys(l) {
        d(s);
        var a = Reflect.ownKeys(l).filter((f) => {
          var c = r.get(f);
          return c === void 0 || c.v !== fe;
        });
        for (var [v, p] of r)
          p.v !== fe && !(v in l) && a.push(v);
        return a;
      },
      setPrototypeOf() {
        ki();
      }
    }
  );
}
function Dt(t, e = 1) {
  O(t, t.v + e);
}
function nr(t) {
  try {
    if (t !== null && typeof t == "object" && Ye in t)
      return t[Ye];
  } catch {
  }
  return t;
}
function Ci(t, e) {
  return Object.is(nr(t), nr(e));
}
// @__NO_SIDE_EFFECTS__
function Pt(t) {
  var e = Se | Ie, r = J !== null && (J.f & Se) !== 0 ? (
    /** @type {Derived} */
    J
  ) : null;
  return K === null || r !== null && (r.f & he) !== 0 ? e |= he : K.f |= yr, {
    ctx: ge,
    deps: null,
    effects: null,
    equals: wr,
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
  const e = /* @__PURE__ */ Pt(t);
  return jr(e), e;
}
// @__NO_SIDE_EFFECTS__
function Ii(t) {
  const e = /* @__PURE__ */ Pt(t);
  return e.equals = Kt, e;
}
function Sr(t) {
  var e = t.effects;
  if (e !== null) {
    t.effects = null;
    for (var r = 0; r < e.length; r += 1)
      He(
        /** @type {Effect} */
        e[r]
      );
  }
}
function xi(t) {
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
function Er(t) {
  var e, r = K;
  lt(xi(t));
  try {
    Sr(t), e = Ur(t);
  } finally {
    lt(r);
  }
  return e;
}
function Cr(t) {
  var e = Er(t);
  if (t.equals(e) || (t.v = e, t.wv = Lr()), !vt) {
    var r = (je || (t.f & he) !== 0) && t.deps !== null ? Ge : me;
    Ee(t, r);
  }
}
const dt = /* @__PURE__ */ new Map();
function bt(t, e) {
  var r = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: t,
    reactions: null,
    equals: wr,
    rv: 0,
    wv: 0
  };
  return r;
}
// @__NO_SIDE_EFFECTS__
function H(t, e) {
  const r = bt(t);
  return jr(r), r;
}
// @__NO_SIDE_EFFECTS__
function Ir(t, e = !1, r = !0) {
  const i = bt(t);
  return e || (i.equals = Kt), i;
}
function O(t, e, r = !1) {
  J !== null && !Ce && kr() && (J.f & (Se | Yt)) !== 0 && !Oe?.includes(t) && Si();
  let i = r ? xe(e) : e;
  return Nt(t, i);
}
function Nt(t, e) {
  if (!t.equals(e)) {
    var r = t.v;
    vt ? dt.set(t, e) : dt.set(t, r), t.v = e, (t.f & Se) !== 0 && ((t.f & Ie) !== 0 && Er(
      /** @type {Derived} */
      t
    ), Ee(t, (t.f & he) === 0 ? me : Ge)), t.wv = Lr(), xr(t, Ie), K !== null && (K.f & me) !== 0 && (K.f & (Me | ut)) === 0 && (we === null ? Vi([t]) : we.push(t));
  }
  return e;
}
function xr(t, e) {
  var r = t.reactions;
  if (r !== null)
    for (var i = r.length, s = 0; s < i; s++) {
      var n = r[s], o = n.f;
      (o & Ie) === 0 && (Ee(n, e), (o & (me | he)) !== 0 && ((o & Se) !== 0 ? xr(
        /** @type {Derived} */
        n,
        Ge
      ) : qt(
        /** @type {Effect} */
        n
      )));
    }
}
let Pi = !1;
var Oi, Ti, qi;
function Zt(t = "") {
  return document.createTextNode(t);
}
// @__NO_SIDE_EFFECTS__
function yt(t) {
  return Ti.call(t);
}
// @__NO_SIDE_EFFECTS__
function Ot(t) {
  return qi.call(t);
}
function u(t, e) {
  return /* @__PURE__ */ yt(t);
}
function De(t, e) {
  {
    var r = (
      /** @type {DocumentFragment} */
      /* @__PURE__ */ yt(
        /** @type {Node} */
        t
      )
    );
    return r instanceof Comment && r.data === "" ? /* @__PURE__ */ Ot(r) : r;
  }
}
function _(t, e = 1, r = !1) {
  let i = t;
  for (; e--; )
    i = /** @type {TemplateNode} */
    /* @__PURE__ */ Ot(i);
  return i;
}
function Di(t) {
  t.textContent = "";
}
function Mi(t) {
  K === null && J === null && bi(), J !== null && (J.f & he) !== 0 && K === null && mi(), vt && gi();
}
function Ri(t, e) {
  var r = e.last;
  r === null ? e.last = e.first = t : (r.next = t, t.prev = r, e.last = t);
}
function ct(t, e, r, i = !0) {
  var s = K, n = {
    ctx: ge,
    deps: null,
    nodes_start: null,
    nodes_end: null,
    f: t | Ie,
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
      er(n), n.f |= br;
    } catch (a) {
      throw He(n), a;
    }
  else e !== null && qt(n);
  var o = r && n.deps === null && n.first === null && n.nodes_start === null && n.teardown === null && (n.f & (yr | Wt)) === 0;
  if (!o && i && (s !== null && Ri(n, s), J !== null && (J.f & Se) !== 0)) {
    var l = (
      /** @type {Derived} */
      J
    );
    (l.effects ?? (l.effects = [])).push(n);
  }
  return n;
}
function Pr(t) {
  const e = ct(xt, null, !1);
  return Ee(e, me), e.teardown = t, e;
}
function Ne(t) {
  Mi();
  var e = K !== null && (K.f & Me) !== 0 && ge !== null && !ge.m;
  if (e) {
    var r = (
      /** @type {ComponentContext} */
      ge
    );
    (r.e ?? (r.e = [])).push({
      fn: t,
      effect: K,
      reaction: J
    });
  } else {
    var i = Or(t);
    return i;
  }
}
function Ni(t) {
  const e = ct(ut, t, !0);
  return () => {
    He(e);
  };
}
function Or(t) {
  return ct(mr, t, !1);
}
function ji(t) {
  return ct(xt, t, !0);
}
function q(t, e = [], r = Pt) {
  const i = e.map(r);
  return Xt(() => t(...i.map(d)));
}
function Xt(t, e = 0) {
  return ct(xt | Yt | e, t, !0);
}
function wt(t, e = !0) {
  return ct(xt | Me, t, !0, e);
}
function Tr(t) {
  var e = t.teardown;
  if (e !== null) {
    const r = vt, i = J;
    or(!0), ze(null);
    try {
      e.call(null);
    } finally {
      or(r), ze(i);
    }
  }
}
function qr(t, e = !1) {
  var r = t.first;
  for (t.first = t.last = null; r !== null; ) {
    var i = r.next;
    (r.f & ut) !== 0 ? r.parent = null : He(r, e), r = i;
  }
}
function zi(t) {
  for (var e = t.first; e !== null; ) {
    var r = e.next;
    (e.f & Me) === 0 && He(e), e = r;
  }
}
function He(t, e = !0) {
  var r = !1;
  (e || (t.f & fi) !== 0) && t.nodes_start !== null && t.nodes_end !== null && (Li(
    t.nodes_start,
    /** @type {TemplateNode} */
    t.nodes_end
  ), r = !0), qr(t, e && !r), Ct(t, 0), Ee(t, Qt);
  var i = t.transitions;
  if (i !== null)
    for (const n of i)
      n.stop();
  Tr(t);
  var s = t.parent;
  s !== null && s.first !== null && Dr(t), t.next = t.prev = t.teardown = t.ctx = t.deps = t.fn = t.nodes_start = t.nodes_end = null;
}
function Li(t, e) {
  for (; t !== null; ) {
    var r = t === e ? null : (
      /** @type {TemplateNode} */
      /* @__PURE__ */ Ot(t)
    );
    t.remove(), t = r;
  }
}
function Dr(t) {
  var e = t.parent, r = t.prev, i = t.next;
  r !== null && (r.next = i), i !== null && (i.prev = r), e !== null && (e.first === t && (e.first = i), e.last === t && (e.last = r));
}
function jt(t, e) {
  var r = [];
  $t(t, r, !0), Mr(r, () => {
    He(t), e && e();
  });
}
function Mr(t, e) {
  var r = t.length;
  if (r > 0) {
    var i = () => --r || e();
    for (var s of t)
      s.out(i);
  } else
    e();
}
function $t(t, e, r) {
  if ((t.f & Pe) === 0) {
    if (t.f ^= Pe, t.transitions !== null)
      for (const o of t.transitions)
        (o.is_global || r) && e.push(o);
    for (var i = t.first; i !== null; ) {
      var s = i.next, n = (i.f & Jt) !== 0 || (i.f & Me) !== 0;
      $t(i, e, n ? r : !1), i = s;
    }
  }
}
function At(t) {
  Rr(t, !0);
}
function Rr(t, e) {
  if ((t.f & Pe) !== 0) {
    t.f ^= Pe, (t.f & me) !== 0 && (Ee(t, Ie), qt(t));
    for (var r = t.first; r !== null; ) {
      var i = r.next, s = (r.f & Jt) !== 0 || (r.f & Me) !== 0;
      Rr(r, s ? e : !1), r = i;
    }
    if (t.transitions !== null)
      for (const n of t.transitions)
        (n.is_global || e) && n.in();
  }
}
let kt = [];
function Fi() {
  var t = kt;
  kt = [], vi(t);
}
function zt(t) {
  kt.length === 0 && queueMicrotask(Fi), kt.push(t);
}
function Ui(t) {
  var e = (
    /** @type {Effect} */
    K
  );
  if ((e.f & br) === 0) {
    if ((e.f & Wt) === 0)
      throw t;
    e.fn(t);
  } else
    Nr(t, e);
}
function Nr(t, e) {
  for (; e !== null; ) {
    if ((e.f & Wt) !== 0)
      try {
        e.fn(t);
        return;
      } catch {
      }
    e = e.parent;
  }
  throw t;
}
let Lt = !1, St = null, Ve = !1, vt = !1;
function or(t) {
  vt = t;
}
let gt = [];
let J = null, Ce = !1;
function ze(t) {
  J = t;
}
let K = null;
function lt(t) {
  K = t;
}
let Oe = null;
function jr(t) {
  J !== null && J.f & Rt && (Oe === null ? Oe = [t] : Oe.push(t));
}
let ve = null, pe = 0, we = null;
function Vi(t) {
  we = t;
}
let zr = 1, Et = 0, je = !1;
function Lr() {
  return ++zr;
}
function Tt(t) {
  var e = t.f;
  if ((e & Ie) !== 0)
    return !0;
  if ((e & Ge) !== 0) {
    var r = t.deps, i = (e & he) !== 0;
    if (r !== null) {
      var s, n, o = (e & mt) !== 0, l = i && K !== null && !je, a = r.length;
      if (o || l) {
        var v = (
          /** @type {Derived} */
          t
        ), p = v.parent;
        for (s = 0; s < a; s++)
          n = r[s], (o || !n?.reactions?.includes(v)) && (n.reactions ?? (n.reactions = [])).push(v);
        o && (v.f ^= mt), l && p !== null && (p.f & he) === 0 && (v.f ^= he);
      }
      for (s = 0; s < a; s++)
        if (n = r[s], Tt(
          /** @type {Derived} */
          n
        ) && Cr(
          /** @type {Derived} */
          n
        ), n.wv > t.wv)
          return !0;
    }
    (!i || K !== null && !je) && Ee(t, me);
  }
  return !1;
}
function Fr(t, e, r = !0) {
  var i = t.reactions;
  if (i !== null)
    for (var s = 0; s < i.length; s++) {
      var n = i[s];
      Oe?.includes(t) || ((n.f & Se) !== 0 ? Fr(
        /** @type {Derived} */
        n,
        e,
        !1
      ) : e === n && (r ? Ee(n, Ie) : (n.f & me) !== 0 && Ee(n, Ge), qt(
        /** @type {Effect} */
        n
      )));
    }
}
function Ur(t) {
  var h;
  var e = ve, r = pe, i = we, s = J, n = je, o = Oe, l = ge, a = Ce, v = t.f;
  ve = /** @type {null | Value[]} */
  null, pe = 0, we = null, je = (v & he) !== 0 && (Ce || !Ve || J === null), J = (v & (Me | ut)) === 0 ? t : null, Oe = null, sr(t.ctx), Ce = !1, Et++, t.f |= Rt;
  try {
    var p = (
      /** @type {Function} */
      (0, t.fn)()
    ), f = t.deps;
    if (ve !== null) {
      var c;
      if (Ct(t, pe), f !== null && pe > 0)
        for (f.length = pe + ve.length, c = 0; c < ve.length; c++)
          f[pe + c] = ve[c];
      else
        t.deps = f = ve;
      if (!je)
        for (c = pe; c < f.length; c++)
          ((h = f[c]).reactions ?? (h.reactions = [])).push(t);
    } else f !== null && pe < f.length && (Ct(t, pe), f.length = pe);
    if (kr() && we !== null && !Ce && f !== null && (t.f & (Se | Ge | Ie)) === 0)
      for (c = 0; c < /** @type {Source[]} */
      we.length; c++)
        Fr(
          we[c],
          /** @type {Effect} */
          t
        );
    return s !== null && s !== t && (Et++, we !== null && (i === null ? i = we : i.push(.../** @type {Source[]} */
    we))), p;
  } catch (w) {
    Ui(w);
  } finally {
    ve = e, pe = r, we = i, J = s, je = n, Oe = o, sr(l), Ce = a, t.f ^= Rt;
  }
}
function Bi(t, e) {
  let r = e.reactions;
  if (r !== null) {
    var i = ai.call(r, t);
    if (i !== -1) {
      var s = r.length - 1;
      s === 0 ? r = e.reactions = null : (r[i] = r[s], r.pop());
    }
  }
  r === null && (e.f & Se) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (ve === null || !ve.includes(e)) && (Ee(e, Ge), (e.f & (he | mt)) === 0 && (e.f ^= mt), Sr(
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
      Bi(t, r[i]);
}
function er(t) {
  var e = t.f;
  if ((e & Qt) === 0) {
    Ee(t, me);
    var r = K, i = Ve;
    K = t, Ve = !0;
    try {
      (e & Yt) !== 0 ? zi(t) : qr(t), Tr(t);
      var s = Ur(t);
      t.teardown = typeof s == "function" ? s : null, t.wv = zr;
      var n;
      ir && Ei && (t.f & Ie) !== 0 && t.deps;
    } finally {
      Ve = i, K = r;
    }
  }
}
function Gi() {
  try {
    yi();
  } catch (t) {
    if (St !== null)
      Nr(t, St);
    else
      throw t;
  }
}
function Hi() {
  var t = Ve;
  try {
    var e = 0;
    for (Ve = !0; gt.length > 0; ) {
      e++ > 1e3 && Gi();
      var r = gt, i = r.length;
      gt = [];
      for (var s = 0; s < i; s++) {
        var n = Wi(r[s]);
        Yi(n);
      }
      dt.clear();
    }
  } finally {
    Lt = !1, Ve = t, St = null;
  }
}
function Yi(t) {
  var e = t.length;
  if (e !== 0)
    for (var r = 0; r < e; r++) {
      var i = t[r];
      (i.f & (Qt | Pe)) === 0 && Tt(i) && (er(i), i.deps === null && i.first === null && i.nodes_start === null && (i.teardown === null ? Dr(i) : i.fn = null));
    }
}
function qt(t) {
  Lt || (Lt = !0, queueMicrotask(Hi));
  for (var e = St = t; e.parent !== null; ) {
    e = e.parent;
    var r = e.f;
    if ((r & (ut | Me)) !== 0) {
      if ((r & me) === 0) return;
      e.f ^= me;
    }
  }
  gt.push(e);
}
function Wi(t) {
  for (var e = [], r = t; r !== null; ) {
    var i = r.f, s = (i & (Me | ut)) !== 0, n = s && (i & me) !== 0;
    if (!n && (i & Pe) === 0) {
      (i & mr) !== 0 ? e.push(r) : s ? r.f ^= me : Tt(r) && er(r);
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
function d(t) {
  var e = t.f, r = (e & Se) !== 0;
  if (J !== null && !Ce) {
    if (!Oe?.includes(t)) {
      var i = J.deps;
      t.rv < Et && (t.rv = Et, ve === null && i !== null && i[pe] === t ? pe++ : ve === null ? ve = [t] : (!je || !ve.includes(t)) && ve.push(t));
    }
  } else if (r && /** @type {Derived} */
  t.deps === null && /** @type {Derived} */
  t.effects === null) {
    var s = (
      /** @type {Derived} */
      t
    ), n = s.parent;
    n !== null && (n.f & he) === 0 && (s.f ^= he);
  }
  return r && (s = /** @type {Derived} */
  t, Tt(s) && Cr(s)), vt && dt.has(t) ? dt.get(t) : t.v;
}
function Ft(t) {
  var e = Ce;
  try {
    return Ce = !0, t();
  } finally {
    Ce = e;
  }
}
const Qi = -7169;
function Ee(t, e) {
  t.f = t.f & Qi | e;
}
let ar = !1;
function Ji() {
  ar || (ar = !0, document.addEventListener(
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
function Ki(t) {
  var e = J, r = K;
  ze(null), lt(null);
  try {
    return t();
  } finally {
    ze(e), lt(r);
  }
}
function Zi(t, e, r, i = r) {
  t.addEventListener(e, () => Ki(r));
  const s = t.__on_r;
  s ? t.__on_r = () => {
    s(), i(!0);
  } : t.__on_r = () => i(!0), Ji();
}
const Xi = /* @__PURE__ */ new Set(), $i = /* @__PURE__ */ new Set();
function ft(t) {
  for (var e = 0; e < t.length; e++)
    Xi.add(t[e]);
  for (var r of $i)
    r(t);
}
function es(t) {
  var e = document.createElement("template");
  return e.innerHTML = t.replaceAll("<!>", "<!---->"), e.content;
}
function It(t, e) {
  var r = (
    /** @type {Effect} */
    K
  );
  r.nodes_start === null && (r.nodes_start = t, r.nodes_end = e);
}
// @__NO_SIDE_EFFECTS__
function A(t, e) {
  var r = (e & si) !== 0, i = (e & ni) !== 0, s, n = !t.startsWith("<!>");
  return () => {
    s === void 0 && (s = es(n ? t : "<!>" + t), r || (s = /** @type {Node} */
    /* @__PURE__ */ yt(s)));
    var o = (
      /** @type {TemplateNode} */
      i || Oi ? document.importNode(s, !0) : s.cloneNode(!0)
    );
    if (r) {
      var l = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ yt(o)
      ), a = (
        /** @type {TemplateNode} */
        o.lastChild
      );
      It(l, a);
    } else
      It(o, o);
    return o;
  };
}
function lr(t = "") {
  {
    var e = Zt(t + "");
    return It(e, e), e;
  }
}
function Be() {
  var t = document.createDocumentFragment(), e = document.createComment(""), r = Zt();
  return t.append(e, r), It(e, r), t;
}
function g(t, e) {
  t !== null && t.before(
    /** @type {Node} */
    e
  );
}
function P(t, e) {
  var r = e == null ? "" : typeof e == "object" ? e + "" : e;
  r !== (t.__t ?? (t.__t = t.nodeValue)) && (t.__t = r, t.nodeValue = r + "");
}
function Vr(t) {
  ge === null && Ar(), Ne(() => {
    const e = Ft(t);
    if (typeof e == "function") return (
      /** @type {() => void} */
      e
    );
  });
}
function ts(t, e, { bubbles: r = !1, cancelable: i = !1 } = {}) {
  return new CustomEvent(t, { detail: e, bubbles: r, cancelable: i });
}
function rs() {
  const t = ge;
  return t === null && Ar(), (e, r, i) => {
    const s = (
      /** @type {Record<string, Function | Function[]>} */
      t.s.$$events?.[
        /** @type {any} */
        e
      ]
    );
    if (s) {
      const n = Ht(s) ? s.slice() : [s], o = ts(
        /** @type {string} */
        e,
        r,
        i
      );
      for (const l of n)
        l.call(t.x, o);
      return !o.defaultPrevented;
    }
    return !0;
  };
}
function I(t, e, [r, i] = [0, 0]) {
  var s = t, n = null, o = null, l = fe, a = r > 0 ? Jt : 0, v = !1;
  const p = (c, h = !0) => {
    v = !0, f(h, c);
  }, f = (c, h) => {
    l !== (l = c) && (l ? (n ? At(n) : h && (n = wt(() => h(s))), o && jt(o, () => {
      o = null;
    })) : (o ? At(o) : h && (o = wt(() => h(s, [r + 1, i]))), n && jt(n, () => {
      n = null;
    })));
  };
  Xt(() => {
    v = !1, e(p), v || f(null, null);
  }, a);
}
function Te(t, e) {
  return e;
}
function is(t, e, r, i) {
  for (var s = [], n = e.length, o = 0; o < n; o++)
    $t(e[o].e, s, !0);
  var l = n > 0 && s.length === 0 && r !== null;
  if (l) {
    var a = (
      /** @type {Element} */
      /** @type {Element} */
      r.parentNode
    );
    Di(a), a.append(
      /** @type {Element} */
      r
    ), i.clear(), Re(t, e[0].prev, e[n - 1].next);
  }
  Mr(s, () => {
    for (var v = 0; v < n; v++) {
      var p = e[v];
      l || (i.delete(p.k), Re(t, p.prev, p.next)), He(p.e, !l);
    }
  });
}
function qe(t, e, r, i, s, n = null) {
  var o = t, l = { flags: e, items: /* @__PURE__ */ new Map(), first: null }, a = (e & pr) !== 0;
  if (a) {
    var v = (
      /** @type {Element} */
      t
    );
    o = v.appendChild(Zt());
  }
  var p = null, f = !1, c = /* @__PURE__ */ Ii(() => {
    var h = r();
    return Ht(h) ? h : h == null ? [] : hr(h);
  });
  Xt(() => {
    var h = d(c), w = h.length;
    f && w === 0 || (f = w === 0, ss(h, l, o, s, e, i, r), n !== null && (w === 0 ? p ? At(p) : p = wt(() => n(o)) : p !== null && jt(p, () => {
      p = null;
    })), d(c));
  });
}
function ss(t, e, r, i, s, n, o) {
  var l = (s & Xr) !== 0, a = (s & (Bt | Gt)) !== 0, v = t.length, p = e.items, f = e.first, c = f, h, w = null, F, S = [], V = [], B, C, b, m;
  if (l)
    for (m = 0; m < v; m += 1)
      B = t[m], C = n(B, m), b = p.get(C), b !== void 0 && (b.a?.measure(), (F ?? (F = /* @__PURE__ */ new Set())).add(b));
  for (m = 0; m < v; m += 1) {
    if (B = t[m], C = n(B, m), b = p.get(C), b === void 0) {
      var M = c ? (
        /** @type {TemplateNode} */
        c.e.nodes_start
      ) : r;
      w = os(
        M,
        e,
        w,
        w === null ? e.first : w.next,
        B,
        C,
        m,
        i,
        s,
        o
      ), p.set(C, w), S = [], V = [], c = w.next;
      continue;
    }
    if (a && ns(b, B, m, s), (b.e.f & Pe) !== 0 && (At(b.e), l && (b.a?.unfix(), (F ?? (F = /* @__PURE__ */ new Set())).delete(b))), b !== c) {
      if (h !== void 0 && h.has(b)) {
        if (S.length < V.length) {
          var E = V[0], R;
          w = E.prev;
          var te = S[0], X = S[S.length - 1];
          for (R = 0; R < S.length; R += 1)
            ur(S[R], E, r);
          for (R = 0; R < V.length; R += 1)
            h.delete(V[R]);
          Re(e, te.prev, X.next), Re(e, w, te), Re(e, X, E), c = E, w = X, m -= 1, S = [], V = [];
        } else
          h.delete(b), ur(b, c, r), Re(e, b.prev, b.next), Re(e, b, w === null ? e.first : w.next), Re(e, w, b), w = b;
        continue;
      }
      for (S = [], V = []; c !== null && c.k !== C; )
        (c.e.f & Pe) === 0 && (h ?? (h = /* @__PURE__ */ new Set())).add(c), V.push(c), c = c.next;
      if (c === null)
        continue;
      b = c;
    }
    S.push(b), w = b, c = b.next;
  }
  if (c !== null || h !== void 0) {
    for (var re = h === void 0 ? [] : hr(h); c !== null; )
      (c.e.f & Pe) === 0 && re.push(c), c = c.next;
    var ie = re.length;
    if (ie > 0) {
      var Z = (s & pr) !== 0 && v === 0 ? r : null;
      if (l) {
        for (m = 0; m < ie; m += 1)
          re[m].a?.measure();
        for (m = 0; m < ie; m += 1)
          re[m].a?.fix();
      }
      is(e, re, Z, p);
    }
  }
  l && zt(() => {
    if (F !== void 0)
      for (b of F)
        b.a?.apply();
  }), K.first = e.first && e.first.e, K.last = w && w.e;
}
function ns(t, e, r, i) {
  (i & Bt) !== 0 && Nt(t.v, e), (i & Gt) !== 0 ? Nt(
    /** @type {Value<number>} */
    t.i,
    r
  ) : t.i = r;
}
function os(t, e, r, i, s, n, o, l, a, v) {
  var p = (a & Bt) !== 0, f = (a & $r) === 0, c = p ? f ? /* @__PURE__ */ Ir(s, !1, !1) : bt(s) : s, h = (a & Gt) === 0 ? o : bt(o), w = {
    i: h,
    v: c,
    k: n,
    a: null,
    // @ts-expect-error
    e: null,
    prev: r,
    next: i
  };
  try {
    return w.e = wt(() => l(t, c, h, v), Pi), w.e.prev = r && r.e, w.e.next = i && i.e, r === null ? e.first = w : (r.next = w, r.e.next = w.e), i !== null && (i.prev = w, i.e.prev = w.e), w;
  } finally {
  }
}
function ur(t, e, r) {
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
      /* @__PURE__ */ Ot(n)
    );
    s.before(n), n = o;
  }
}
function Re(t, e, r) {
  e === null ? t.first = r : (e.next = r, e.e.next = r && r.e), r !== null && (r.prev = e, r.e.prev = e && e.e);
}
function as(t, e, r, i, s) {
  var n = e.$$slots?.[r], o = !1;
  n === !0 && (n = e.children, o = !0), n === void 0 || n(t, o ? () => i : i);
}
const cr = [...` 	
\r\f \v\uFEFF`];
function ls(t, e, r) {
  var i = t == null ? "" : "" + t;
  if (e && (i = i ? i + " " + e : e), r) {
    for (var s in r)
      if (r[s])
        i = i ? i + " " + s : s;
      else if (i.length)
        for (var n = s.length, o = 0; (o = i.indexOf(s, o)) >= 0; ) {
          var l = o + n;
          (o === 0 || cr.includes(i[o - 1])) && (l === i.length || cr.includes(i[l])) ? i = (o === 0 ? "" : i.substring(0, o)) + i.substring(l + 1) : o = l;
        }
  }
  return i === "" ? null : i;
}
function us(t, e) {
  return t == null ? null : String(t);
}
function be(t, e, r, i, s, n) {
  var o = t.__className;
  if (o !== r || o === void 0) {
    var l = ls(r, i, n);
    l == null ? t.removeAttribute("class") : e ? t.className = l : t.setAttribute("class", l), t.__className = r;
  } else if (n && s !== n)
    for (var a in n) {
      var v = !!n[a];
      (s == null || v !== !!s[a]) && t.classList.toggle(a, v);
    }
  return n;
}
function Br(t, e, r, i) {
  var s = t.__style;
  if (s !== e) {
    var n = us(e);
    n == null ? t.removeAttribute("style") : t.style.cssText = n, t.__style = e;
  }
  return i;
}
const cs = Symbol("is custom element"), vs = Symbol("is html");
function ds(t, e) {
  var r = Hr(t);
  r.value === (r.value = // treat null and undefined the same for the initial value
  e ?? void 0) || // @ts-expect-error
  // `progress` elements always need their value set when it's `0`
  t.value === e && (e !== 0 || t.nodeName !== "PROGRESS") || (t.value = e ?? "");
}
function Gr(t, e, r, i) {
  var s = Hr(t);
  s[e] !== (s[e] = r) && (e === "loading" && (t[pi] = r), r == null ? t.removeAttribute(e) : typeof r != "string" && fs(t).includes(e) ? t[e] = r : t.setAttribute(e, r));
}
function Hr(t) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    // @ts-expect-error
    t.__attributes ?? (t.__attributes = {
      [cs]: t.nodeName.includes("-"),
      [vs]: t.namespaceURI === oi
    })
  );
}
var vr = /* @__PURE__ */ new Map();
function fs(t) {
  var e = vr.get(t.nodeName);
  if (e) return e;
  vr.set(t.nodeName, e = []);
  for (var r, i = t, s = Element.prototype; s !== i; ) {
    r = li(i);
    for (var n in r)
      r[n].set && e.push(n);
    i = gr(i);
  }
  return e;
}
const Mt = /* @__PURE__ */ new Set();
function dr(t, e, r, i, s = i) {
  var n = r.getAttribute("type") === "checkbox", o = t;
  if (e !== null)
    for (var l of e)
      o = o[l] ?? (o[l] = []);
  o.push(r), Zi(
    r,
    "change",
    () => {
      var a = r.__value;
      n && (a = _s(o, a, r.checked)), s(a);
    },
    // TODO better default value handling
    () => s(n ? [] : null)
  ), ji(() => {
    var a = i();
    n ? (a = a || [], r.checked = a.includes(r.__value)) : r.checked = Ci(r.__value, a);
  }), Pr(() => {
    var a = o.indexOf(r);
    a !== -1 && o.splice(a, 1);
  }), Mt.has(o) || (Mt.add(o), zt(() => {
    o.sort((a, v) => a.compareDocumentPosition(v) === 4 ? -1 : 1), Mt.delete(o);
  })), zt(() => {
  });
}
function _s(t, e, r) {
  for (var i = /* @__PURE__ */ new Set(), s = 0; s < t.length; s += 1)
    t[s].checked && i.add(t[s].__value);
  return r || i.delete(e), Array.from(i);
}
let pt = !1;
function ps(t) {
  var e = pt;
  try {
    return pt = !1, [t(), pt];
  } finally {
    pt = e;
  }
}
function fr(t) {
  return t.ctx?.d ?? !1;
}
function _e(t, e, r, i) {
  var s = (r & ei) !== 0, n = !0, o = (r & ri) !== 0, l = (r & ii) !== 0, a = !1, v;
  o ? [v, a] = ps(() => (
    /** @type {V} */
    t[e]
  )) : v = /** @type {V} */
  t[e];
  var p = Ye in t || _i in t, f = o && (ht(t, e)?.set ?? (p && e in t && ((m) => t[e] = m))) || void 0, c = (
    /** @type {V} */
    i
  ), h = !0, w = !1, F = () => (w = !0, h && (h = !1, l ? c = Ft(
    /** @type {() => V} */
    i
  ) : c = /** @type {V} */
  i), c);
  v === void 0 && i !== void 0 && (f && n && wi(), v = F(), f && f(v));
  var S;
  if (S = () => {
    var m = (
      /** @type {V} */
      t[e]
    );
    return m === void 0 ? F() : (h = !0, w = !1, m);
  }, (r & ti) === 0 && n)
    return S;
  if (f) {
    var V = t.$$legacy;
    return function(m, M) {
      return arguments.length > 0 ? ((!M || V || a) && f(M ? S() : m), m) : S();
    };
  }
  var B = !1, C = /* @__PURE__ */ Ir(v), b = /* @__PURE__ */ Pt(() => {
    var m = S(), M = d(C);
    return B ? (B = !1, M) : C.v = m;
  });
  return o && d(b), s || (b.equals = Kt), function(m, M) {
    if (arguments.length > 0) {
      const E = M ? d(b) : o ? xe(m) : m;
      if (!b.equals(E)) {
        if (B = !0, O(C, E), w && c !== void 0 && (c = E), fr(b))
          return m;
        Ft(() => d(b));
      }
      return m;
    }
    return fr(b) ? b.v : d(b);
  };
}
class hs {
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
      const n = new AbortController(), o = setTimeout(() => n.abort(), this.timeout), l = await fetch(i, {
        ...s,
        signal: n.signal
      });
      if (clearTimeout(o), !l.ok) {
        const v = await l.text();
        let p = `HTTP ${l.status}: ${l.statusText}`;
        try {
          const f = JSON.parse(v);
          p = f.message || f.error || p;
        } catch {
          v.includes("<html") || (p = v || p);
        }
        throw console.error(`API Error from ${e}:`, p), l.status === 404 ? new Error(`Endpoint not found: ${i}. Please check if the backend server is running and the API path is correct.`) : new Error(p);
      }
      const a = await l.json();
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
var We, Qe, Je, Ke, Ze, Xe, $e, et, tt, rt, it, st, nt, ot, at;
class gs {
  constructor() {
    ue(this, We);
    ue(this, Qe);
    ue(this, Je);
    ue(this, Ke);
    ue(this, Ze);
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
    ce(this, We, /* @__PURE__ */ H("")), ce(this, Qe, /* @__PURE__ */ H(null)), ce(this, Je, /* @__PURE__ */ H(xe({}))), ce(this, Ke, /* @__PURE__ */ H(xe([]))), ce(this, Ze, /* @__PURE__ */ H(null)), ce(this, Xe, /* @__PURE__ */ H(xe([]))), ce(this, $e, /* @__PURE__ */ H(!1)), ce(this, et, /* @__PURE__ */ H(!1)), ce(this, tt, /* @__PURE__ */ H(!1)), ce(this, rt, /* @__PURE__ */ H(null)), ce(this, it, /* @__PURE__ */ H(0)), ce(this, st, /* @__PURE__ */ H(null)), ce(this, nt, /* @__PURE__ */ H(null)), ce(this, ot, /* @__PURE__ */ H(!1)), ce(this, at, /* @__PURE__ */ H(0)), this.api = null, this._initialized = !1, this._debounceTimers = /* @__PURE__ */ new Map(), this._loadingPromise = null;
  }
  get modelId() {
    return d(G(this, We));
  }
  set modelId(e) {
    O(G(this, We), e, !0);
  }
  get model() {
    return d(G(this, Qe));
  }
  set model(e) {
    O(G(this, Qe), e, !0);
  }
  get selections() {
    return d(G(this, Je));
  }
  set selections(e) {
    O(G(this, Je), e, !0);
  }
  get validationResults() {
    return d(G(this, Ke));
  }
  set validationResults(e) {
    O(G(this, Ke), e, !0);
  }
  get pricingData() {
    return d(G(this, Ze));
  }
  set pricingData(e) {
    O(G(this, Ze), e, !0);
  }
  get availableOptions() {
    return d(G(this, Xe));
  }
  set availableOptions(e) {
    O(G(this, Xe), e, !0);
  }
  get isLoading() {
    return d(G(this, $e));
  }
  set isLoading(e) {
    O(G(this, $e), e, !0);
  }
  get isValidating() {
    return d(G(this, et));
  }
  set isValidating(e) {
    O(G(this, et), e, !0);
  }
  get isPricing() {
    return d(G(this, tt));
  }
  set isPricing(e) {
    O(G(this, tt), e, !0);
  }
  get error() {
    return d(G(this, rt));
  }
  set error(e) {
    O(G(this, rt), e, !0);
  }
  get retryCount() {
    return d(G(this, it));
  }
  set retryCount(e) {
    O(G(this, it), e, !0);
  }
  get configurationId() {
    return d(G(this, st));
  }
  set configurationId(e) {
    O(G(this, st), e, !0);
  }
  get lastSaved() {
    return d(G(this, nt));
  }
  set lastSaved(e) {
    O(G(this, nt), e, !0);
  }
  get isDirty() {
    return d(G(this, ot));
  }
  set isDirty(e) {
    O(G(this, ot), e, !0);
  }
  get currentStep() {
    return d(G(this, at));
  }
  set currentStep(e) {
    O(G(this, at), e, !0);
  }
  // Initialize store and effects
  initialize() {
    this._initialized || (this._initialized = !0, console.log("🔧 ConfigurationStore initialized"), this._testConnection(), Ne(() => {
      this.modelId && !this._loadingPromise && (this.api = new hs(window.__API_BASE_URL__, { modelId: this.modelId }), this.loadModel());
    }), Ne(() => {
      this.api && Object.keys(this.selections).length > 0 && this.model && this._debounce("validate", () => this.validateSelections(), 300);
    }), Ne(() => {
      this.api && this.isValid && Object.keys(this.selections).length > 0 && this.model && this._debounce("pricing", () => this.calculatePricing(), 500);
    }), Ne(() => {
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
              const l = o.group_id || o.groupId || o.group || "default";
              n.has(l) || n.set(l, {
                id: l,
                name: o.group_name || o.groupName || l,
                options: []
              }), n.get(l).options.push(o);
            }), this.model.option_groups = Array.from(n.values()), console.log("Created groups from flat options:", this.model.option_groups);
          }
          if (console.log("Groups loaded:", this.model.option_groups?.length || 0, "groups"), this.model.option_groups?.length > 0 && (console.log("First group structure:", this.model.option_groups[0]), console.log("Group properties:", Object.keys(this.model.option_groups[0]))), !this.model.option_groups.some((s) => s.options && Array.isArray(s.options) && s.options.length > 0 || s.Options && Array.isArray(s.Options) && s.Options.length > 0 || s.items && Array.isArray(s.items) && s.items.length > 0 || s.choices && Array.isArray(s.choices) && s.choices.length > 0) && this.model.option_groups.length > 0) {
            console.log("No options found in groups, fetching options separately...");
            try {
              const s = await this.api.getModelOptions();
              console.log("Options API response:", s);
              let n = [];
              Array.isArray(s) ? n = s : s.options ? n = s.options : s.data && Array.isArray(s.data) ? n = s.data : s.data?.options && (n = s.data.options), console.log("Total options found:", n.length), n.length > 0 && (console.log("First option structure:", n[0]), console.log("Option properties:", Object.keys(n[0]))), n.length > 0 && (this.model.option_groups = this.model.option_groups.map((o) => {
                const l = n.filter((a) => a.group_id === o.id || a.groupId === o.id || a.group === o.id || a.group_name === o.name || a.groupName === o.name || a.group_id === o.name || // Also check if group has a different ID property
                o.group_id && (a.group_id === o.group_id || a.group === o.group_id));
                return console.log(`Group "${o.name}" matched ${l.length} options`), l.length === 0 && this.model.option_groups.length === 1 ? (console.warn("No options matched group criteria, showing all options in single group"), { ...o, options: n }) : { ...o, options: l };
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
We = new WeakMap(), Qe = new WeakMap(), Je = new WeakMap(), Ke = new WeakMap(), Ze = new WeakMap(), Xe = new WeakMap(), $e = new WeakMap(), et = new WeakMap(), tt = new WeakMap(), rt = new WeakMap(), it = new WeakMap(), st = new WeakMap(), nt = new WeakMap(), ot = new WeakMap(), at = new WeakMap();
const y = new gs();
var ms = /* @__PURE__ */ A("<div></div>"), bs = /* @__PURE__ */ A('<div><div class="step-icon svelte-19jrra3"><!></div> <div class="step-label svelte-19jrra3"> </div></div> <!>', 1), ys = /* @__PURE__ */ A('<div class="progress-indicator svelte-19jrra3"><div class="steps svelte-19jrra3"></div> <div class="progress-bar svelte-19jrra3"><div class="progress-fill svelte-19jrra3"></div></div></div>');
function ws(t, e) {
  Le(e, !0);
  let r = _e(e, "steps", 19, () => []), i = _e(e, "currentStep", 3, 0), s = _e(e, "completionPercentage", 3, 0);
  var n = ys(), o = u(n);
  qe(o, 21, r, Te, (v, p, f) => {
    var c = bs(), h = De(c);
    let w;
    var F = u(h), S = u(F);
    {
      var V = (E) => {
        var R = lr("✓");
        g(E, R);
      }, B = (E) => {
        var R = lr();
        q(() => P(R, d(p).icon || f + 1)), g(E, R);
      };
      I(S, (E) => {
        f < i() ? E(V) : E(B, !1);
      });
    }
    var C = _(F, 2), b = u(C), m = _(h, 2);
    {
      var M = (E) => {
        var R = ms();
        let te;
        q((X) => te = be(R, 1, "step-connector svelte-19jrra3", null, te, X), [
          () => ({ completed: f < i() })
        ]), g(E, R);
      };
      I(m, (E) => {
        f < r().length - 1 && E(M);
      });
    }
    q(
      (E) => {
        w = be(h, 1, "step svelte-19jrra3", null, w, E), P(b, d(p).label);
      },
      [
        () => ({
          active: f === i(),
          completed: f < i()
        })
      ]
    ), g(v, c);
  });
  var l = _(o, 2), a = u(l);
  q(() => Br(a, `width: ${s() ?? ""}%`)), g(t, n), Fe();
}
var As = /* @__PURE__ */ A('<div><div class="spinner svelte-kq7kpf"></div> <p class="message svelte-kq7kpf"> </p></div>');
function ks(t, e) {
  let r = _e(e, "message", 3, "Loading..."), i = _e(e, "size", 3, "medium");
  var s = As(), n = _(u(s), 2), o = u(n);
  q(() => {
    be(s, 1, `loading-spinner ${i() ?? ""}`, "svelte-kq7kpf"), P(o, r());
  }), g(t, s);
}
function Ss(t, e, r) {
  O(e, null), O(r, null);
}
function Es() {
  location.reload();
}
var Cs = /* @__PURE__ */ A('<div class="error-boundary svelte-1dzw8vs"><div class="error-content svelte-1dzw8vs"><h2 class="svelte-1dzw8vs">Something went wrong</h2> <p class="error-message svelte-1dzw8vs"> </p> <!> <div class="error-actions svelte-1dzw8vs"><button class="btn btn-secondary svelte-1dzw8vs">Try Again</button> <button class="btn btn-primary svelte-1dzw8vs">Reload Page</button></div></div></div>');
function Is(t, e) {
  Le(e, !0);
  let r = /* @__PURE__ */ H(null), i = /* @__PURE__ */ H(null);
  Vr(() => {
    const a = (v) => {
      O(r, v.error || new Error("Unknown error"), !0), O(
        i,
        {
          componentStack: v.filename || "Unknown",
          lineNumber: v.lineno,
          columnNumber: v.colno
        },
        !0
      ), console.error("Error caught by boundary:", d(r)), v.preventDefault();
    };
    return window.addEventListener("error", a), window.addEventListener("unhandledrejection", (v) => {
      O(r, new Error(v.reason), !0), O(i, { componentStack: "Promise rejection" }, !0), v.preventDefault();
    }), () => {
      window.removeEventListener("error", a);
    };
  });
  var s = Be(), n = De(s);
  {
    var o = (a) => {
      var v = Cs(), p = u(v), f = _(u(p), 2), c = u(f), h = _(f, 2);
      I(h, (V) => {
      });
      var w = _(h, 2), F = u(w);
      F.__click = [Ss, r, i];
      var S = _(F, 2);
      S.__click = [Es], q(() => P(c, d(r).message)), g(a, v);
    }, l = (a) => {
      var v = Be(), p = De(v);
      as(p, e, "default", {}), g(a, v);
    };
    I(n, (a) => {
      d(r) ? a(o) : a(l, !1);
    });
  }
  g(t, s), Fe();
}
ft(["click"]);
function xs(t, e, r, i) {
  d(e) < r() && i(d(e) + 1);
}
function Ps(t, e, r) {
  d(e) > 0 && r(d(e) - 1);
}
function Os(t, e, r) {
  e(d(r) ? 0 : 1);
}
var Ts = /* @__PURE__ */ A('<span class="sku svelte-14bz86j"> </span>'), qs = /* @__PURE__ */ A('<p class="description svelte-14bz86j"> </p>'), Ds = /* @__PURE__ */ A('<span class="price-each svelte-14bz86j">each</span>'), Ms = /* @__PURE__ */ A('<span class="total-price svelte-14bz86j"> </span>'), Rs = /* @__PURE__ */ A("<button> </button>"), Ns = (t, e) => e(parseInt(t.target.value) || 0), js = /* @__PURE__ */ A('<div class="quantity-controls svelte-14bz86j"><button class="qty-button svelte-14bz86j" aria-label="Decrease quantity">−</button> <input type="number" min="0" aria-label="Quantity" class="svelte-14bz86j"/> <button class="qty-button svelte-14bz86j" aria-label="Increase quantity">+</button></div>'), zs = /* @__PURE__ */ A('<div class="unavailable-overlay svelte-14bz86j"><span class="svelte-14bz86j">Not available with current selection</span></div>'), Ls = /* @__PURE__ */ A('<div><div class="option-header svelte-14bz86j"><h4 class="svelte-14bz86j"> </h4> <!></div> <!> <div class="price-section svelte-14bz86j"><span class="base-price svelte-14bz86j"> <!></span> <!></div> <div class="actions svelte-14bz86j"><!></div> <!></div>');
function Fs(t, e) {
  Le(e, !0);
  let r = /* @__PURE__ */ ke(() => y.selections[e.option.id] || 0), i = /* @__PURE__ */ ke(() => d(r) > 0), s = /* @__PURE__ */ ke(() => !y.availableOptions.length || y.availableOptions.some((k) => k.option_id === e.option.id)), n = /* @__PURE__ */ ke(() => d(r) * (e.option.base_price || 0));
  function o() {
    return e.group.selection_type === "single" ? 1 : e.group.max_selections || 10;
  }
  function l(k) {
    !d(s) && k > 0 || y.updateSelection(e.option.id, k);
  }
  var a = Ls();
  let v;
  var p = u(a), f = u(p), c = u(f), h = _(f, 2);
  {
    var w = (k) => {
      var T = Ts(), x = u(T);
      q(() => P(x, `SKU: ${e.option.sku ?? ""}`)), g(k, T);
    };
    I(h, (k) => {
      e.option.sku && k(w);
    });
  }
  var F = _(p, 2);
  {
    var S = (k) => {
      var T = qs(), x = u(T);
      q(() => P(x, e.option.description)), g(k, T);
    };
    I(F, (k) => {
      e.option.description && k(S);
    });
  }
  var V = _(F, 2), B = u(V), C = u(B), b = _(C);
  {
    var m = (k) => {
      var T = Ds();
      g(k, T);
    };
    I(b, (k) => {
      d(r) > 1 && k(m);
    });
  }
  var M = _(B, 2);
  {
    var E = (k) => {
      var T = Ms(), x = u(T);
      q((N) => P(x, `Total: $${N ?? ""}`), [() => d(n).toFixed(2)]), g(k, T);
    };
    I(M, (k) => {
      d(r) > 1 && k(E);
    });
  }
  var R = _(V, 2), te = u(R);
  {
    var X = (k) => {
      var T = Rs();
      let x;
      T.__click = [Os, l, i];
      var N = u(T);
      q(
        (Y) => {
          x = be(T, 1, "select-button svelte-14bz86j", null, x, Y), T.disabled = !d(s), P(N, d(i) ? "✓ Selected" : "Select");
        },
        [() => ({ selected: d(i) })]
      ), g(k, T);
    }, re = (k) => {
      var T = js(), x = u(T);
      x.__click = [Ps, r, l];
      var N = _(x, 2);
      N.__change = [Ns, l];
      var Y = _(N, 2);
      Y.__click = [
        xs,
        r,
        o,
        l
      ], q(
        (z, W) => {
          x.disabled = d(r) === 0, ds(N, d(r)), Gr(N, "max", z), N.disabled = !d(s), Y.disabled = W;
        },
        [
          o,
          () => d(r) >= o() || !d(s)
        ]
      ), g(k, T);
    };
    I(te, (k) => {
      e.group.selection_type === "single" ? k(X) : k(re, !1);
    });
  }
  var ie = _(R, 2);
  {
    var Z = (k) => {
      var T = zs();
      g(k, T);
    };
    I(ie, (k) => {
      !d(s) && !d(i) && k(Z);
    });
  }
  q(
    (k, T) => {
      v = be(a, 1, "option-card svelte-14bz86j", null, v, k), P(c, e.option.name), P(C, `$${T ?? ""} `);
    },
    [
      () => ({
        selected: d(i),
        unavailable: !d(s)
      }),
      () => (e.option.base_price || 0).toFixed(2)
    ]
  ), g(t, a), Fe();
}
ft(["click", "change"]);
var Us = (t, e) => O(e, !d(e)), Vs = /* @__PURE__ */ A('<span class="required svelte-6zoark">*</span>'), Bs = /* @__PURE__ */ A('<p class="group-description svelte-6zoark"> </p>'), Gs = /* @__PURE__ */ A('<span class="selection-constraint svelte-6zoark"> </span>'), Hs = /* @__PURE__ */ A('<span class="selection-constraint svelte-6zoark"> </span>'), Ys = /* @__PURE__ */ A('<div class="no-options svelte-6zoark"><p class="svelte-6zoark">No options available</p> <p class="help-text svelte-6zoark">Check API response</p></div>'), Ws = /* @__PURE__ */ A('<div class="group-content svelte-6zoark"><div class="selection-info svelte-6zoark"><span class="selection-type svelte-6zoark"> </span> <!> <!></div> <div class="options-grid svelte-6zoark"><!></div></div>'), Qs = /* @__PURE__ */ A('<div><div class="group-header svelte-6zoark"><div class="group-info svelte-6zoark"><h3 class="svelte-6zoark"> <!></h3> <!></div> <button class="expand-toggle svelte-6zoark" aria-label="Toggle group"><svg width="20" height="20" viewBox="0 0 20 20"><path fill="currentColor" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"></path></svg></button></div> <!></div>');
function Js(t, e) {
  Le(e, !0);
  let r = /* @__PURE__ */ H(!0), i = /* @__PURE__ */ ke(() => e.group.options && Array.isArray(e.group.options) && e.group.options.some((C) => y.selections[C.id] > 0));
  Ne(() => {
    e.group.options?.length === 0 && console.warn(`⚠️ Group "${e.group.name}" has no options!`, {
      groupId: e.group.id,
      groupData: e.group
    });
  });
  var s = Qs();
  let n;
  var o = u(s);
  o.__click = [Us, r];
  var l = u(o), a = u(l), v = u(a), p = _(v);
  {
    var f = (C) => {
      var b = Vs();
      g(C, b);
    };
    I(p, (C) => {
      e.group.required && C(f);
    });
  }
  var c = _(a, 2);
  {
    var h = (C) => {
      var b = Bs(), m = u(b);
      q(() => P(m, e.group.description)), g(C, b);
    };
    I(c, (C) => {
      e.group.description && C(h);
    });
  }
  var w = _(l, 2), F = u(w);
  let S;
  var V = _(o, 2);
  {
    var B = (C) => {
      var b = Ws(), m = u(b), M = u(m), E = u(M), R = _(M, 2);
      {
        var te = (x) => {
          var N = Gs(), Y = u(N);
          q(() => P(Y, `Min: ${e.group.min_selections ?? ""}`)), g(x, N);
        };
        I(R, (x) => {
          e.group.min_selections && x(te);
        });
      }
      var X = _(R, 2);
      {
        var re = (x) => {
          var N = Hs(), Y = u(N);
          q(() => P(Y, `Max: ${e.group.max_selections ?? ""}`)), g(x, N);
        };
        I(X, (x) => {
          e.group.max_selections && x(re);
        });
      }
      var ie = _(m, 2), Z = u(ie);
      {
        var k = (x) => {
          var N = Be(), Y = De(N);
          qe(Y, 17, () => e.group.options, Te, (z, W) => {
            Fs(z, {
              get option() {
                return d(W);
              },
              get group() {
                return e.group;
              }
            });
          }), g(x, N);
        }, T = (x) => {
          var N = Ys();
          g(x, N);
        };
        I(Z, (x) => {
          e.group.options && Array.isArray(e.group.options) ? x(k) : x(T, !1);
        });
      }
      q(() => P(E, e.group.selection_type === "single" ? "Choose one" : "Choose multiple")), g(C, b);
    };
    I(V, (C) => {
      d(r) && C(B);
    });
  }
  q(
    (C, b) => {
      n = be(s, 1, "option-group svelte-6zoark", null, n, C), P(v, `${e.group.name ?? ""} `), S = be(F, 0, "icon svelte-6zoark", null, S, b);
    },
    [
      () => ({ "has-selection": d(i) }),
      () => ({ rotated: !d(r) })
    ]
  ), g(t, s), Fe();
}
ft(["click"]);
var Ks = /* @__PURE__ */ A('<div class="loading svelte-13kqu2s"><span class="spinner svelte-13kqu2s"></span> Calculating price...</div>'), Zs = /* @__PURE__ */ A('<div class="price-line adjustment svelte-13kqu2s"><span class="label svelte-13kqu2s"> </span> <span> </span></div>'), Xs = /* @__PURE__ */ A('<div class="adjustments svelte-13kqu2s"></div>'), $s = /* @__PURE__ */ A('<div class="price-line svelte-13kqu2s"><span class="label svelte-13kqu2s">Savings</span> <span class="amount discount svelte-13kqu2s"> </span></div>'), en = /* @__PURE__ */ A('<div class="price-line svelte-13kqu2s"><span class="label svelte-13kqu2s">Additional Charges</span> <span class="amount svelte-13kqu2s"> </span></div>'), tn = /* @__PURE__ */ A("<!> <!>", 1), rn = /* @__PURE__ */ A('<div class="price-breakdown svelte-13kqu2s"><div class="price-line svelte-13kqu2s"><span class="label svelte-13kqu2s">Base Price</span> <span class="amount svelte-13kqu2s"> </span></div> <!></div>'), sn = /* @__PURE__ */ A('<div class="savings-badge svelte-13kqu2s"> </div>'), nn = /* @__PURE__ */ A('<div class="price-summary svelte-13kqu2s"><div class="price-line total svelte-13kqu2s"><span class="label svelte-13kqu2s">Total Price</span> <span class="amount svelte-13kqu2s"> </span></div> <!> <!></div>'), on = /* @__PURE__ */ A("<div><!></div>");
function Ut(t, e) {
  Le(e, !0);
  let r = _e(e, "detailed", 3, !1), i = _e(e, "showBreakdown", 3, !0), s = /* @__PURE__ */ ke(() => y.adjustments.filter((c) => c.amount < 0).reduce((c, h) => c + Math.abs(h.amount), 0)), n = /* @__PURE__ */ ke(() => y.adjustments.filter((c) => c.amount > 0).reduce((c, h) => c + h.amount, 0)), o = (c) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(c);
  var l = on();
  let a;
  var v = u(l);
  {
    var p = (c) => {
      var h = Ks();
      g(c, h);
    }, f = (c) => {
      var h = nn(), w = u(h), F = _(u(w), 2), S = u(F), V = _(w, 2);
      {
        var B = (m) => {
          var M = rn(), E = u(M), R = _(u(E), 2), te = u(R), X = _(E, 2);
          {
            var re = (Z) => {
              var k = Xs();
              qe(k, 21, () => y.adjustments, Te, (T, x) => {
                var N = Zs(), Y = u(N), z = u(Y), W = _(Y, 2);
                let ne;
                var ae = u(W);
                q(
                  (ee, de) => {
                    P(z, `${d(x).type === "discount" ? "−" : "+"}
                    ${d(x).description ?? ""}`), ne = be(W, 1, "amount svelte-13kqu2s", null, ne, ee), P(ae, de);
                  },
                  [
                    () => ({ discount: d(x).amount < 0 }),
                    () => o(Math.abs(d(x).amount))
                  ]
                ), g(T, N);
              }), g(Z, k);
            }, ie = (Z) => {
              var k = tn(), T = De(k);
              {
                var x = (z) => {
                  var W = $s(), ne = _(u(W), 2), ae = u(ne);
                  q((ee) => P(ae, `−${ee ?? ""}`), [() => o(d(s))]), g(z, W);
                };
                I(T, (z) => {
                  d(s) > 0 && z(x);
                });
              }
              var N = _(T, 2);
              {
                var Y = (z) => {
                  var W = en(), ne = _(u(W), 2), ae = u(ne);
                  q((ee) => P(ae, `+${ee ?? ""}`), [
                    () => o(d(n))
                  ]), g(z, W);
                };
                I(N, (z) => {
                  d(n) > 0 && z(Y);
                });
              }
              g(Z, k);
            };
            I(X, (Z) => {
              r() && y.adjustments.length > 0 ? Z(re) : Z(ie, !1);
            });
          }
          q((Z) => P(te, Z), [
            () => o(y.basePrice)
          ]), g(m, M);
        };
        I(V, (m) => {
          i() && (y.basePrice !== y.totalPrice || r()) && m(B);
        });
      }
      var C = _(V, 2);
      {
        var b = (m) => {
          var M = sn(), E = u(M);
          q((R) => P(E, `You save ${R ?? ""}!`), [() => o(d(s))]), g(m, M);
        };
        I(C, (m) => {
          d(s) > 0 && m(b);
        });
      }
      q((m) => P(S, m), [
        () => o(y.totalPrice)
      ]), g(c, h);
    };
    I(v, (c) => {
      y.isPricing ? c(p) : c(f, !1);
    });
  }
  q((c) => a = be(l, 1, "pricing-display svelte-13kqu2s", null, a, c), [() => ({ detailed: r() })]), g(t, l), Fe();
}
var an = /* @__PURE__ */ A('<div class="validating svelte-bayq38"><span class="spinner svelte-bayq38"></span> Validating configuration...</div>'), ln = /* @__PURE__ */ A('<p class="svelte-bayq38">Your current selection meets all requirements.</p>'), un = /* @__PURE__ */ A('<div class="valid-state svelte-bayq38"><span class="icon svelte-bayq38">✅</span> <div class="message"><h4 class="svelte-bayq38">Configuration Valid</h4> <!></div></div>'), cn = /* @__PURE__ */ A('<h4 class="severity-header svelte-bayq38"> </h4>'), vn = /* @__PURE__ */ A('<span class="compact-icon svelte-bayq38"> </span>'), dn = /* @__PURE__ */ A('<span class="error-field svelte-bayq38"> </span>'), fn = /* @__PURE__ */ A('<li><!> <span class="error-message svelte-bayq38"> </span> <!></li>'), _n = /* @__PURE__ */ A('<div class="severity-group svelte-bayq38"><!> <ul class="error-list svelte-bayq38"></ul></div>'), pn = /* @__PURE__ */ A('<li class="svelte-bayq38"> </li>'), hn = /* @__PURE__ */ A('<div class="suggestions svelte-bayq38"><h4 class="svelte-bayq38">Suggestions</h4> <ul class="svelte-bayq38"></ul></div>'), gn = /* @__PURE__ */ A('<div class="validation-results svelte-bayq38"><!> <!></div>'), mn = /* @__PURE__ */ A("<div><!></div>");
function Vt(t, e) {
  Le(e, !0);
  let r = _e(e, "compact", 3, !1), i = /* @__PURE__ */ ke(() => () => {
    const f = { error: [], warning: [], info: [] };
    for (const c of y.validationResults) {
      const h = c.severity || "error";
      f[h].push(c);
    }
    return f;
  });
  const s = { error: "❌", warning: "⚠️", info: "ℹ️" }, n = {
    error: "#dc2626",
    warning: "#f59e0b",
    info: "#3b82f6"
  };
  var o = mn();
  let l;
  var a = u(o);
  {
    var v = (f) => {
      var c = an();
      g(f, c);
    }, p = (f, c) => {
      {
        var h = (F) => {
          var S = un(), V = _(u(S), 2), B = _(u(V), 2);
          {
            var C = (b) => {
              var m = ln();
              g(b, m);
            };
            I(B, (b) => {
              r() || b(C);
            });
          }
          g(F, S);
        }, w = (F) => {
          var S = gn(), V = u(S);
          qe(V, 17, () => Object.entries(d(i)()), Te, (b, m) => {
            var M = /* @__PURE__ */ ke(() => di(d(m), 2));
            let E = () => d(M)[0], R = () => d(M)[1];
            var te = Be(), X = De(te);
            {
              var re = (ie) => {
                var Z = _n(), k = u(Z);
                {
                  var T = (N) => {
                    var Y = cn(), z = u(Y);
                    q(
                      (W) => {
                        Br(Y, `color: ${n[E()] ?? ""}`), P(z, `${s[E()] ?? ""} ${W ?? ""}s`);
                      },
                      [
                        () => E().charAt(0).toUpperCase() + E().slice(1)
                      ]
                    ), g(N, Y);
                  };
                  I(k, (N) => {
                    r() || N(T);
                  });
                }
                var x = _(k, 2);
                qe(x, 21, R, Te, (N, Y) => {
                  var z = fn(), W = u(z);
                  {
                    var ne = (L) => {
                      var D = vn(), j = u(D);
                      q(() => P(j, s[E()])), g(L, D);
                    };
                    I(W, (L) => {
                      r() && L(ne);
                    });
                  }
                  var ae = _(W, 2), ee = u(ae), de = _(ae, 2);
                  {
                    var U = (L) => {
                      var D = dn(), j = u(D);
                      q(() => P(j, `(${d(Y).field ?? ""})`)), g(L, D);
                    };
                    I(de, (L) => {
                      d(Y).field && !r() && L(U);
                    });
                  }
                  q(() => {
                    be(z, 1, `error-item ${E() ?? ""}`, "svelte-bayq38"), P(ee, d(Y).message);
                  }), g(N, z);
                }), g(ie, Z);
              };
              I(X, (ie) => {
                R().length > 0 && ie(re);
              });
            }
            g(b, te);
          });
          var B = _(V, 2);
          {
            var C = (b) => {
              var m = hn(), M = _(u(m), 2);
              qe(M, 21, () => y.validationResults.filter((E) => E.suggestion), Te, (E, R) => {
                var te = pn(), X = u(te);
                q(() => P(X, d(R).suggestion)), g(E, te);
              }), g(b, m);
            };
            I(B, (b) => {
              !r() && y.validationResults.some((m) => m.suggestion) && b(C);
            });
          }
          g(F, S);
        };
        I(
          f,
          (F) => {
            y.validationResults.length === 0 ? F(h) : F(w, !1);
          },
          c
        );
      }
    };
    I(a, (f) => {
      y.isValidating ? f(v) : f(p, !1);
    });
  }
  q((f) => l = be(o, 1, "validation-display svelte-bayq38", null, l, f), [() => ({ compact: r() })]), g(t, o), Fe();
}
async function bn(t, e) {
  try {
    const r = y.exportConfiguration();
    await navigator.clipboard.writeText(JSON.stringify(r, null, 2)), O(e, !0), setTimeout(() => O(e, !1), 2e3);
  } catch (r) {
    console.error("Failed to copy:", r);
  }
}
async function yn() {
  y.configurationId ? await y.saveConfiguration() : await y.createConfiguration();
}
var wn = (t, e) => O(e, !0), An = /* @__PURE__ */ A('<tr><td class="svelte-10y69ed"> </td><td class="muted svelte-10y69ed"> </td><td class="center svelte-10y69ed"> </td><td class="right svelte-10y69ed"> </td><td class="right bold svelte-10y69ed"> </td></tr>'), kn = /* @__PURE__ */ A('<tr><td colspan="5" class="no-data svelte-10y69ed">No options selected</td></tr>'), Sn = /* @__PURE__ */ A('<section class="section svelte-10y69ed"><h3 class="svelte-10y69ed">Validation Results</h3> <!></section>'), En = /* @__PURE__ */ A('<span class="save-status svelte-10y69ed"> </span>'), Cn = (t, e) => O(e, !1), In = (t) => t.stopPropagation(), xn = (t, e) => O(e, !1), Pn = /* @__PURE__ */ A('<div class="dialog-overlay svelte-10y69ed"><div class="dialog svelte-10y69ed"><h3 class="svelte-10y69ed">Export Configuration</h3> <div class="export-options svelte-10y69ed"><label class="svelte-10y69ed"><input type="radio"/> JSON (Complete configuration data)</label> <label class="svelte-10y69ed"><input type="radio"/> CSV (Selected options only)</label></div> <div class="dialog-actions svelte-10y69ed"><button class="btn btn-secondary svelte-10y69ed">Cancel</button> <button class="btn btn-primary svelte-10y69ed">Export</button></div></div></div>'), On = /* @__PURE__ */ A('<div class="configuration-summary svelte-10y69ed"><div class="summary-header svelte-10y69ed"><h2 class="svelte-10y69ed">Configuration Summary</h2> <div class="actions svelte-10y69ed"><button class="btn btn-secondary svelte-10y69ed">Export</button> <button class="btn btn-primary svelte-10y69ed">Save Configuration</button></div></div> <div class="metrics-grid svelte-10y69ed"><div class="metric svelte-10y69ed"><div class="metric-value svelte-10y69ed"> </div> <div class="metric-label svelte-10y69ed">Options Selected</div></div> <div class="metric svelte-10y69ed"><div class="metric-value svelte-10y69ed"> </div> <div class="metric-label svelte-10y69ed">Complete</div></div> <div class="metric svelte-10y69ed"><div> </div> <div class="metric-label svelte-10y69ed">Status</div></div></div> <section class="section svelte-10y69ed"><h3 class="svelte-10y69ed">Selected Options</h3> <div class="options-table svelte-10y69ed"><table class="svelte-10y69ed"><thead><tr><th class="svelte-10y69ed">Option</th><th class="svelte-10y69ed">Group</th><th class="svelte-10y69ed">Quantity</th><th class="svelte-10y69ed">Unit Price</th><th class="svelte-10y69ed">Total</th></tr></thead><tbody><!></tbody></table></div></section> <section class="section svelte-10y69ed"><h3 class="svelte-10y69ed">Pricing Details</h3> <!></section> <!> <div class="summary-actions svelte-10y69ed"><button class="btn btn-secondary svelte-10y69ed"> </button> <!></div> <!></div>');
function Tn(t, e) {
  Le(e, !0);
  const r = [];
  let i = /* @__PURE__ */ H(!1), s = /* @__PURE__ */ H(!1), n = /* @__PURE__ */ H("json");
  function o() {
    const U = y.exportConfiguration();
    let L, D, j;
    if (d(n) === "json")
      L = JSON.stringify(U, null, 2), D = "application/json", j = "json";
    else {
      const le = [
        "Option",
        "Quantity",
        "Unit Price",
        "Total Price"
      ], ye = y.selectedOptions.map(($) => [
        $.name,
        $.quantity,
        $.base_price.toFixed(2),
        ($.quantity * $.base_price).toFixed(2)
      ]);
      L = [
        le.join(","),
        ...ye.map(($) => $.join(","))
      ].join(`
`), D = "text/csv", j = "csv";
    }
    const Q = new Blob([L], { type: D }), se = URL.createObjectURL(Q), oe = document.createElement("a");
    oe.href = se, oe.download = `configuration-${Date.now()}.${j}`, oe.click(), URL.revokeObjectURL(se), O(i, !1);
  }
  var l = On(), a = u(l), v = _(u(a), 2), p = u(v);
  p.__click = [wn, i];
  var f = _(p, 2);
  f.__click = [yn];
  var c = _(a, 2), h = u(c), w = u(h), F = u(w), S = _(h, 2), V = u(S), B = u(V), C = _(S, 2), b = u(C);
  let m;
  var M = u(b), E = _(c, 2), R = _(u(E), 2), te = u(R), X = _(u(te)), re = u(X);
  {
    var ie = (U) => {
      var L = Be(), D = De(L);
      qe(D, 17, () => y.selectedOptions, Te, (j, Q) => {
        var se = An(), oe = u(se), le = u(oe), ye = _(oe), $ = u(ye), Ae = _(ye), Ue = u(Ae), _t = _(Ae), Yr = u(_t), Wr = _(_t), Qr = u(Wr);
        q(
          (Jr, Kr) => {
            P(le, d(Q).name), P($, d(Q).group_name), P(Ue, d(Q).quantity), P(Yr, `$${Jr ?? ""}`), P(Qr, `$${Kr ?? ""}`);
          },
          [
            () => (d(Q).base_price || 0).toFixed(2),
            () => ((d(Q).quantity || 0) * (d(Q).base_price || 0)).toFixed(2)
          ]
        ), g(j, se);
      }), g(U, L);
    }, Z = (U) => {
      var L = kn();
      g(U, L);
    };
    I(re, (U) => {
      y.selectedOptions.length > 0 ? U(ie) : U(Z, !1);
    });
  }
  var k = _(E, 2), T = _(u(k), 2);
  Ut(T, { detailed: !0 });
  var x = _(k, 2);
  {
    var N = (U) => {
      var L = Sn(), D = _(u(L), 2);
      Vt(D, {}), g(U, L);
    };
    I(x, (U) => {
      y.validationResults.length > 0 && U(N);
    });
  }
  var Y = _(x, 2), z = u(Y);
  z.__click = [bn, s];
  var W = u(z), ne = _(z, 2);
  {
    var ae = (U) => {
      var L = En(), D = u(L);
      q((j) => P(D, `Last saved: ${j ?? ""}`), [
        () => y.lastSaved.toLocaleTimeString()
      ]), g(U, L);
    };
    I(ne, (U) => {
      y.lastSaved && U(ae);
    });
  }
  var ee = _(Y, 2);
  {
    var de = (U) => {
      var L = Pn();
      L.__click = [Cn, i];
      var D = u(L);
      D.__click = [In];
      var j = _(u(D), 2), Q = u(j), se = u(Q);
      se.value = se.__value = "json";
      var oe = _(Q, 2), le = u(oe);
      le.value = le.__value = "csv";
      var ye = _(j, 2), $ = u(ye);
      $.__click = [xn, i];
      var Ae = _($, 2);
      Ae.__click = o, dr(r, [], se, () => d(n), (Ue) => O(n, Ue)), dr(r, [], le, () => d(n), (Ue) => O(n, Ue)), g(U, L);
    };
    I(ee, (U) => {
      d(i) && U(de);
    });
  }
  q(
    (U) => {
      P(F, y.selectedOptions.length), P(B, `${y.completionPercentage ?? ""}%`), m = be(b, 1, "metric-value status svelte-10y69ed", null, m, U), P(M, y.isValid ? "✓ Valid" : "✗ Invalid"), P(W, d(s) ? "✓ Copied!" : "Copy Configuration");
    },
    [() => ({ valid: y.isValid })]
  ), g(t, l), Fe();
}
ft(["click"]);
var qn = () => location.reload(), Dn = /* @__PURE__ */ A('<div class="error-container svelte-fpbtyb"><div class="error-message svelte-fpbtyb"><h3 class="svelte-fpbtyb">Configuration Error</h3> <p> </p> <button class="btn btn-primary svelte-fpbtyb">Reload Page</button></div></div>'), Mn = /* @__PURE__ */ A('<div class="option-groups svelte-fpbtyb"></div>'), Rn = /* @__PURE__ */ A('<div class="no-options svelte-fpbtyb"><h3 class="svelte-fpbtyb">⚠️ No Options Found</h3> <p class="svelte-fpbtyb">Groups exist but contain no options.</p> <p class="help svelte-fpbtyb">Check console for API details or use the debug test page.</p></div>'), Nn = /* @__PURE__ */ A('<div class="no-options svelte-fpbtyb"><h3 class="svelte-fpbtyb">⚠️ No Configuration Options Available</h3> <p class="svelte-fpbtyb">The model has no option groups configured.</p> <p class="help svelte-fpbtyb">Check the browser console for API response details.</p></div>'), jn = /* @__PURE__ */ A('<div class="configuration-step"><h2> </h2> <!> <div class="step-actions svelte-fpbtyb"><button class="btn btn-primary svelte-fpbtyb">Continue to Validation</button></div></div>'), zn = /* @__PURE__ */ A('<div class="validation-step"><h2>Configuration Validation</h2> <!> <div class="step-actions svelte-fpbtyb"><button class="btn btn-secondary svelte-fpbtyb">Back</button> <button class="btn btn-primary svelte-fpbtyb">Continue to Pricing</button></div></div>'), Ln = /* @__PURE__ */ A('<div class="pricing-step"><h2>Pricing Details</h2> <!> <div class="step-actions svelte-fpbtyb"><button class="btn btn-secondary svelte-fpbtyb">Back</button> <button class="btn btn-primary svelte-fpbtyb">Continue to Summary</button></div></div>'), Fn = /* @__PURE__ */ A('<div class="summary-step"><h2>Configuration Summary</h2> <!> <div class="step-actions svelte-fpbtyb"><button class="btn btn-secondary svelte-fpbtyb">Back</button> <button class="btn btn-success svelte-fpbtyb">Complete Configuration</button></div></div>'), Un = /* @__PURE__ */ A('<div class="selected-item svelte-fpbtyb"><span> </span> <span class="quantity svelte-fpbtyb"> </span></div>'), Vn = /* @__PURE__ */ A('<div class="sidebar-section svelte-fpbtyb"><h3 class="svelte-fpbtyb">Issues</h3> <!></div>'), Bn = /* @__PURE__ */ A('<aside class="configurator-sidebar svelte-fpbtyb"><div class="sidebar-section svelte-fpbtyb"><h3 class="svelte-fpbtyb">Current Selection</h3> <div class="selected-items svelte-fpbtyb"></div></div> <div class="sidebar-section svelte-fpbtyb"><h3 class="svelte-fpbtyb">Pricing Summary</h3> <!></div> <!></aside>'), Gn = /* @__PURE__ */ A('<div class="configurator-container svelte-fpbtyb"><!> <div class="configurator-content svelte-fpbtyb"><!></div> <!></div>'), Hn = /* @__PURE__ */ A("<div><!></div>");
function Yn(t, e) {
  Le(e, !0);
  let r = _e(e, "theme", 3, "light"), i = _e(e, "apiUrl", 3, "/api/v1"), s = _e(e, "embedMode", 3, !1), n = _e(e, "onComplete", 3, null), o = _e(e, "onConfigurationChange", 3, null), l = _e(e, "onError", 3, null);
  const a = rs();
  let v = /* @__PURE__ */ H(!1), p = /* @__PURE__ */ ke(() => [
    {
      id: "configure",
      label: "Configure",
      icon: "⚙️"
    },
    { id: "validate", label: "Validate", icon: "✓" },
    { id: "price", label: "Price", icon: "💰" },
    { id: "summary", label: "Summary", icon: "📋" }
  ]);
  typeof window < "u" && (window.__API_BASE_URL__ = i(), console.log("Configurator initialized with API URL:", i())), Vr(() => {
    y.initialize(), y.setModelId(e.modelId), O(v, !0), document.documentElement.setAttribute("data-theme", r());
    const S = Ni(() => {
      Ne(() => {
        o() && Object.keys(y.selections).length > 0 && o()(y.exportConfiguration());
      }), Ne(() => {
        l() && y.error && l()(y.error);
      });
    });
    return () => {
      S(), y.reset();
    };
  });
  function f() {
    const S = y.exportConfiguration();
    a("complete", S), n()?.(S);
  }
  function c() {
    y.currentStep < d(p).length - 1 && y.currentStep++;
  }
  function h() {
    y.currentStep > 0 && y.currentStep--;
  }
  var w = Hn(), F = u(w);
  Is(F, {
    children: (S, V) => {
      var B = Be(), C = De(B);
      {
        var b = (M) => {
          ks(M, { message: "Loading configuration..." });
        }, m = (M, E) => {
          {
            var R = (X) => {
              var re = Dn(), ie = u(re), Z = _(u(ie), 2), k = u(Z), T = _(Z, 2);
              T.__click = [qn], q(() => P(k, y.error)), g(X, re);
            }, te = (X) => {
              var re = Gn(), ie = u(re);
              ws(ie, {
                get steps() {
                  return d(p);
                },
                get currentStep() {
                  return y.currentStep;
                },
                get completionPercentage() {
                  return y.completionPercentage;
                }
              });
              var Z = _(ie, 2), k = u(Z);
              {
                var T = (z) => {
                  var W = jn(), ne = u(W), ae = u(ne), ee = _(ne, 2);
                  {
                    var de = (j) => {
                      var Q = Be();
                      const se = /* @__PURE__ */ ke(() => y.model.option_groups.some(($) => $.options?.length > 0));
                      var oe = De(Q);
                      {
                        var le = ($) => {
                          var Ae = Mn();
                          qe(Ae, 21, () => y.model.option_groups, Te, (Ue, _t) => {
                            Js(Ue, {
                              get group() {
                                return d(_t);
                              }
                            });
                          }), g($, Ae);
                        }, ye = ($) => {
                          var Ae = Rn();
                          g($, Ae);
                        };
                        I(oe, ($) => {
                          d(se) ? $(le) : $(ye, !1);
                        });
                      }
                      g(j, Q);
                    }, U = (j) => {
                      var Q = Nn();
                      g(j, Q);
                    };
                    I(ee, (j) => {
                      y.model?.option_groups && Array.isArray(y.model.option_groups) ? j(de) : j(U, !1);
                    });
                  }
                  var L = _(ee, 2), D = u(L);
                  D.__click = c, q(() => {
                    P(ae, `Configure Your ${y.model?.name || "Product"}`), D.disabled = !y.canProceedToNextStep;
                  }), g(z, W);
                }, x = (z, W) => {
                  {
                    var ne = (ee) => {
                      var de = zn(), U = _(u(de), 2);
                      Vt(U, {});
                      var L = _(U, 2), D = u(L);
                      D.__click = h;
                      var j = _(D, 2);
                      j.__click = c, q(() => j.disabled = !y.isValid), g(ee, de);
                    }, ae = (ee, de) => {
                      {
                        var U = (D) => {
                          var j = Ln(), Q = _(u(j), 2);
                          Ut(Q, { detailed: !0 });
                          var se = _(Q, 2), oe = u(se);
                          oe.__click = h;
                          var le = _(oe, 2);
                          le.__click = c, g(D, j);
                        }, L = (D, j) => {
                          {
                            var Q = (se) => {
                              var oe = Fn(), le = _(u(oe), 2);
                              Tn(le, {});
                              var ye = _(le, 2), $ = u(ye);
                              $.__click = h;
                              var Ae = _($, 2);
                              Ae.__click = f, g(se, oe);
                            };
                            I(
                              D,
                              (se) => {
                                y.currentStep === 3 && se(Q);
                              },
                              j
                            );
                          }
                        };
                        I(
                          ee,
                          (D) => {
                            y.currentStep === 2 ? D(U) : D(L, !1);
                          },
                          de
                        );
                      }
                    };
                    I(
                      z,
                      (ee) => {
                        y.currentStep === 1 ? ee(ne) : ee(ae, !1);
                      },
                      W
                    );
                  }
                };
                I(k, (z) => {
                  y.currentStep === 0 ? z(T) : z(x, !1);
                });
              }
              var N = _(Z, 2);
              {
                var Y = (z) => {
                  var W = Bn(), ne = u(W), ae = _(u(ne), 2);
                  qe(ae, 21, () => y.selectedOptions, Te, (D, j) => {
                    var Q = Un(), se = u(Q), oe = u(se), le = _(se, 2), ye = u(le);
                    q(() => {
                      P(oe, d(j).name), P(ye, `×${d(j).quantity ?? ""}`);
                    }), g(D, Q);
                  });
                  var ee = _(ne, 2), de = _(u(ee), 2);
                  Ut(de, {});
                  var U = _(ee, 2);
                  {
                    var L = (D) => {
                      var j = Vn(), Q = _(u(j), 2);
                      Vt(Q, { compact: !0 }), g(D, j);
                    };
                    I(U, (D) => {
                      y.validationResults.length > 0 && D(L);
                    });
                  }
                  g(z, W);
                };
                I(N, (z) => {
                  s() || z(Y);
                });
              }
              g(X, re);
            };
            I(
              M,
              (X) => {
                y.error && y.retryCount >= 3 ? X(R) : X(te, !1);
              },
              E
            );
          }
        };
        I(C, (M) => {
          !d(v) || y.isLoading ? M(b) : M(m, !1);
        });
      }
      g(S, B);
    },
    $$slots: { default: !0 }
  }), q(() => {
    be(w, 1, `configurator-app ${s() ? "embed-mode" : ""}`, "svelte-fpbtyb"), Gr(w, "data-theme", r());
  }), g(t, w), Fe();
}
ft(["click"]);
window.CPQConfigurator = {
  create: function(t, e = {}) {
    if (!t)
      throw new Error("Container element is required");
    if (!e.modelId)
      throw new Error("Model ID is required");
    const r = typeof t == "string" ? document.querySelector(t) : t;
    if (!r)
      throw new Error("Container element not found");
    const i = new Yn({
      target: r,
      props: {
        modelId: e.modelId,
        apiUrl: e.apiUrl || "/api/v1",
        theme: e.theme || "light",
        embedMode: e.embedMode !== !1,
        onComplete: e.onComplete,
        onConfigurationChange: e.onConfigurationChange,
        onError: e.onError
      }
    });
    return {
      destroy: () => i.$destroy(),
      updateConfig: (s) => {
        s.modelId && i.$set({ modelId: s.modelId }), s.theme && i.$set({ theme: s.theme });
      },
      getConfiguration: () => i.configStore?.exportConfiguration(),
      loadConfiguration: (s) => i.configStore?.loadConfiguration(s),
      reset: () => {
        i.configStore?.reset();
      }
    };
  }
};
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-cpq-auto-init]").forEach((e) => {
    const r = e.getAttribute("data-model-id"), i = e.getAttribute("data-api-url"), s = e.getAttribute("data-theme");
    r && window.CPQConfigurator.create(e, {
      modelId: r,
      apiUrl: i,
      theme: s,
      embedMode: !0
    });
  });
});
const Qn = window.CPQConfigurator;
export {
  Qn as default
};
