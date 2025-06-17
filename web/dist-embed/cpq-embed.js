var tr = (t) => {
  throw TypeError(t);
};
var ir = (t, e, i) => e.has(t) || tr("Cannot " + i);
var N = (t, e, i) => (ir(t, e, "read from private field"), i ? i.call(t) : e.get(t)), Ce = (t, e, i) => e.has(t) ? tr("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), Ie = (t, e, i, r) => (ir(t, e, "write to private field"), r ? r.call(t, i) : e.set(t, i), i);
var yi = Array.isArray, en = Array.prototype.indexOf, Li = Array.from, tn = Object.defineProperty, At = Object.getOwnPropertyDescriptor, rn = Object.getOwnPropertyDescriptors, nn = Object.prototype, sn = Array.prototype, gr = Object.getPrototypeOf, rr = Object.isExtensible;
const an = () => {
};
function on(t) {
  for (var e = 0; e < t.length; e++)
    t[e]();
}
function Ni(t, e) {
  if (Array.isArray(t))
    return t;
  if (!(Symbol.iterator in t))
    return Array.from(t);
  const i = [];
  for (const r of t)
    if (i.push(r), i.length === e) break;
  return i;
}
const We = 2, pr = 4, zi = 8, Fi = 16, ct = 32, xt = 64, Ui = 128, Ye = 256, ci = 512, Qe = 1024, vt = 2048, kt = 4096, ot = 8192, Gi = 16384, mr = 32768, wi = 65536, ln = 1 << 19, br = 1 << 20, qi = 1 << 21, li = Symbol("$state"), vn = Symbol("legacy props"), cn = Symbol("");
function yr(t) {
  return t === this.v;
}
function un(t, e) {
  return t != t ? e == e : t !== e || t !== null && typeof t == "object" || typeof t == "function";
}
function ji(t) {
  return !un(t, this.v);
}
function dn(t) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function fn() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function _n(t) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function hn() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function gn(t) {
  throw new Error("https://svelte.dev/e/props_invalid_value");
}
function pn() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function mn() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function bn() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
const Bi = 1, Hi = 2, wr = 4, yn = 8, wn = 16, Sn = 1, xn = 4, kn = 8, En = 16, An = 1, Cn = 2, Ge = Symbol(), In = "http://www.w3.org/1999/xhtml";
function Yi(t) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
let Ue = null;
function nr(t) {
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
  Vn(() => {
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
          $t(s.effect), _t(s.reaction), Or(s.fn);
        }
      } finally {
        $t(i), _t(r);
      }
    }
    Ue = e.p, e.m = !0;
  }
  return t || /** @type {T} */
  {};
}
function Sr() {
  return !0;
}
function Me(t) {
  if (typeof t != "object" || t === null || li in t)
    return t;
  const e = gr(t);
  if (e !== nn && e !== sn)
    return t;
  var i = /* @__PURE__ */ new Map(), r = yi(t), n = /* @__PURE__ */ Y(0), s = ke, l = (u) => {
    var d = ke;
    _t(s);
    var _ = u();
    return _t(d), _;
  };
  return r && i.set("length", /* @__PURE__ */ Y(
    /** @type {any[]} */
    t.length
  )), new Proxy(
    /** @type {any} */
    t,
    {
      defineProperty(u, d, _) {
        return (!("value" in _) || _.configurable === !1 || _.enumerable === !1 || _.writable === !1) && pn(), l(() => {
          var S = i.get(d);
          S === void 0 ? (S = /* @__PURE__ */ Y(_.value), i.set(d, S)) : U(S, _.value, !0);
        }), !0;
      },
      deleteProperty(u, d) {
        var _ = i.get(d);
        if (_ === void 0) {
          if (d in u) {
            const v = l(() => /* @__PURE__ */ Y(Ge));
            i.set(d, v), Oi(n);
          }
        } else {
          if (r && typeof d == "string") {
            var S = (
              /** @type {Source<number>} */
              i.get("length")
            ), b = Number(d);
            Number.isInteger(b) && b < S.v && U(S, b);
          }
          U(_, Ge), Oi(n);
        }
        return !0;
      },
      get(u, d, _) {
        if (d === li)
          return t;
        var S = i.get(d), b = d in u;
        if (S === void 0 && (!b || At(u, d)?.writable) && (S = l(() => {
          var p = Me(b ? u[d] : Ge), w = /* @__PURE__ */ Y(p);
          return w;
        }), i.set(d, S)), S !== void 0) {
          var v = o(S);
          return v === Ge ? void 0 : v;
        }
        return Reflect.get(u, d, _);
      },
      getOwnPropertyDescriptor(u, d) {
        var _ = Reflect.getOwnPropertyDescriptor(u, d);
        if (_ && "value" in _) {
          var S = i.get(d);
          S && (_.value = o(S));
        } else if (_ === void 0) {
          var b = i.get(d), v = b?.v;
          if (b !== void 0 && v !== Ge)
            return {
              enumerable: !0,
              configurable: !0,
              value: v,
              writable: !0
            };
        }
        return _;
      },
      has(u, d) {
        if (d === li)
          return !0;
        var _ = i.get(d), S = _ !== void 0 && _.v !== Ge || Reflect.has(u, d);
        if (_ !== void 0 || Ee !== null && (!S || At(u, d)?.writable)) {
          _ === void 0 && (_ = l(() => {
            var v = S ? Me(u[d]) : Ge, p = /* @__PURE__ */ Y(v);
            return p;
          }), i.set(d, _));
          var b = o(_);
          if (b === Ge)
            return !1;
        }
        return S;
      },
      set(u, d, _, S) {
        var b = i.get(d), v = d in u;
        if (r && d === "length")
          for (var p = _; p < /** @type {Source<number>} */
          b.v; p += 1) {
            var w = i.get(p + "");
            w !== void 0 ? U(w, Ge) : p in u && (w = l(() => /* @__PURE__ */ Y(Ge)), i.set(p + "", w));
          }
        if (b === void 0)
          (!v || At(u, d)?.writable) && (b = l(() => {
            var T = /* @__PURE__ */ Y(void 0);
            return U(T, Me(_)), T;
          }), i.set(d, b));
        else {
          v = b.v !== Ge;
          var D = l(() => Me(_));
          U(b, D);
        }
        var M = Reflect.getOwnPropertyDescriptor(u, d);
        if (M?.set && M.set.call(S, _), !v) {
          if (r && typeof d == "string") {
            var A = (
              /** @type {Source<number>} */
              i.get("length")
            ), x = Number(d);
            Number.isInteger(x) && x >= A.v && U(A, x + 1);
          }
          Oi(n);
        }
        return !0;
      },
      ownKeys(u) {
        o(n);
        var d = Reflect.ownKeys(u).filter((b) => {
          var v = i.get(b);
          return v === void 0 || v.v !== Ge;
        });
        for (var [_, S] of i)
          S.v !== Ge && !(_ in u) && d.push(_);
        return d;
      },
      setPrototypeOf() {
        mn();
      }
    }
  );
}
function Oi(t, e = 1) {
  U(t, t.v + e);
}
// @__NO_SIDE_EFFECTS__
function Si(t) {
  var e = We | vt, i = ke !== null && (ke.f & We) !== 0 ? (
    /** @type {Derived} */
    ke
  ) : null;
  return Ee === null || i !== null && (i.f & Ye) !== 0 ? e |= Ye : Ee.f |= br, {
    ctx: Ue,
    deps: null,
    effects: null,
    equals: yr,
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
  const e = /* @__PURE__ */ Si(t);
  return Nr(e), e;
}
// @__NO_SIDE_EFFECTS__
function Tn(t) {
  const e = /* @__PURE__ */ Si(t);
  return e.equals = ji, e;
}
function xr(t) {
  var e = t.effects;
  if (e !== null) {
    t.effects = null;
    for (var i = 0; i < e.length; i += 1)
      it(
        /** @type {Effect} */
        e[i]
      );
  }
}
function Pn(t) {
  for (var e = t.parent; e !== null; ) {
    if ((e.f & We) === 0)
      return (
        /** @type {Effect} */
        e
      );
    e = e.parent;
  }
  return null;
}
function kr(t) {
  var e, i = Ee;
  $t(Pn(t));
  try {
    xr(t), e = Gr(t);
  } finally {
    $t(i);
  }
  return e;
}
function Er(t) {
  var e = kr(t);
  if (t.equals(e) || (t.v = e, t.wv = Fr()), !ti) {
    var i = (ft || (t.f & Ye) !== 0) && t.deps !== null ? kt : Qe;
    Je(t, i);
  }
}
const ni = /* @__PURE__ */ new Map();
function ui(t, e) {
  var i = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: t,
    reactions: null,
    equals: yr,
    rv: 0,
    wv: 0
  };
  return i;
}
// @__NO_SIDE_EFFECTS__
function Y(t, e) {
  const i = ui(t);
  return Nr(i), i;
}
// @__NO_SIDE_EFFECTS__
function Ar(t, e = !1, i = !0) {
  const r = ui(t);
  return e || (r.equals = ji), r;
}
function U(t, e, i = !1) {
  ke !== null && !tt && Sr() && (ke.f & (We | Fi)) !== 0 && !lt?.includes(t) && bn();
  let r = i ? Me(e) : e;
  return Ri(t, r);
}
function Ri(t, e) {
  if (!t.equals(e)) {
    var i = t.v;
    ti ? ni.set(t, e) : ni.set(t, i), t.v = e, (t.f & We) !== 0 && ((t.f & vt) !== 0 && kr(
      /** @type {Derived} */
      t
    ), Je(t, (t.f & Ye) === 0 ? Qe : kt)), t.wv = Fr(), Cr(t, vt), Ee !== null && (Ee.f & Qe) !== 0 && (Ee.f & (ct | xt)) === 0 && (Ke === null ? Bn([t]) : Ke.push(t));
  }
  return e;
}
function Cr(t, e) {
  var i = t.reactions;
  if (i !== null)
    for (var r = i.length, n = 0; n < r; n++) {
      var s = i[n], l = s.f;
      (l & vt) === 0 && (Je(s, e), (l & (Qe | Ye)) !== 0 && ((l & We) !== 0 ? Cr(
        /** @type {Derived} */
        s,
        kt
      ) : Ci(
        /** @type {Effect} */
        s
      )));
    }
}
let On = !1;
var sr, Ir, Tr, Pr;
function Dn() {
  if (sr === void 0) {
    sr = window, Ir = /Firefox/.test(navigator.userAgent);
    var t = Element.prototype, e = Node.prototype, i = Text.prototype;
    Tr = At(e, "firstChild").get, Pr = At(e, "nextSibling").get, rr(t) && (t.__click = void 0, t.__className = void 0, t.__attributes = null, t.__style = void 0, t.__e = void 0), rr(i) && (i.__t = void 0);
  }
}
function xi(t = "") {
  return document.createTextNode(t);
}
// @__NO_SIDE_EFFECTS__
function Zt(t) {
  return Tr.call(t);
}
// @__NO_SIDE_EFFECTS__
function ki(t) {
  return Pr.call(t);
}
function a(t, e) {
  return /* @__PURE__ */ Zt(t);
}
function He(t, e) {
  {
    var i = (
      /** @type {DocumentFragment} */
      /* @__PURE__ */ Zt(
        /** @type {Node} */
        t
      )
    );
    return i instanceof Comment && i.data === "" ? /* @__PURE__ */ ki(i) : i;
  }
}
function c(t, e = 1, i = !1) {
  let r = t;
  for (; e--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ ki(r);
  return r;
}
function qn(t) {
  t.textContent = "";
}
function Rn(t) {
  Ee === null && ke === null && _n(), ke !== null && (ke.f & Ye) !== 0 && Ee === null && fn(), ti && dn();
}
function Mn(t, e) {
  var i = e.last;
  i === null ? e.last = e.first = t : (i.next = t, t.prev = i, e.last = t);
}
function ei(t, e, i, r = !0) {
  var n = Ee, s = {
    ctx: Ue,
    deps: null,
    nodes_start: null,
    nodes_end: null,
    f: t | vt,
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
      Ki(s), s.f |= mr;
    } catch (d) {
      throw it(s), d;
    }
  else e !== null && Ci(s);
  var l = i && s.deps === null && s.first === null && s.nodes_start === null && s.teardown === null && (s.f & (br | Ui)) === 0;
  if (!l && r && (n !== null && Mn(s, n), ke !== null && (ke.f & We) !== 0)) {
    var u = (
      /** @type {Derived} */
      ke
    );
    (u.effects ?? (u.effects = [])).push(s);
  }
  return s;
}
function Vn(t) {
  const e = ei(zi, null, !1);
  return Je(e, Qe), e.teardown = t, e;
}
function yt(t) {
  Rn();
  var e = Ee !== null && (Ee.f & ct) !== 0 && Ue !== null && !Ue.m;
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
    var r = Or(t);
    return r;
  }
}
function Ln(t) {
  const e = ei(xt, t, !0);
  return () => {
    it(e);
  };
}
function Nn(t) {
  const e = ei(xt, t, !0);
  return (i = {}) => new Promise((r) => {
    i.outro ? di(e, () => {
      it(e), r(void 0);
    }) : (it(e), r(void 0));
  });
}
function Or(t) {
  return ei(pr, t, !1);
}
function k(t, e = [], i = Si) {
  const r = e.map(i);
  return Ei(() => t(...r.map(o)));
}
function Ei(t, e = 0) {
  return ei(zi | Fi | e, t, !0);
}
function Xt(t, e = !0) {
  return ei(zi | ct, t, !0, e);
}
function Dr(t) {
  var e = t.teardown;
  if (e !== null) {
    const i = ti, r = ke;
    ar(!0), _t(null);
    try {
      e.call(null);
    } finally {
      ar(i), _t(r);
    }
  }
}
function qr(t, e = !1) {
  var i = t.first;
  for (t.first = t.last = null; i !== null; ) {
    var r = i.next;
    (i.f & xt) !== 0 ? i.parent = null : it(i, e), i = r;
  }
}
function zn(t) {
  for (var e = t.first; e !== null; ) {
    var i = e.next;
    (e.f & ct) === 0 && it(e), e = i;
  }
}
function it(t, e = !0) {
  var i = !1;
  (e || (t.f & ln) !== 0) && t.nodes_start !== null && t.nodes_end !== null && (Fn(
    t.nodes_start,
    /** @type {TemplateNode} */
    t.nodes_end
  ), i = !0), qr(t, e && !i), pi(t, 0), Je(t, Gi);
  var r = t.transitions;
  if (r !== null)
    for (const s of r)
      s.stop();
  Dr(t);
  var n = t.parent;
  n !== null && n.first !== null && Rr(t), t.next = t.prev = t.teardown = t.ctx = t.deps = t.fn = t.nodes_start = t.nodes_end = null;
}
function Fn(t, e) {
  for (; t !== null; ) {
    var i = t === e ? null : (
      /** @type {TemplateNode} */
      /* @__PURE__ */ ki(t)
    );
    t.remove(), t = i;
  }
}
function Rr(t) {
  var e = t.parent, i = t.prev, r = t.next;
  i !== null && (i.next = r), r !== null && (r.prev = i), e !== null && (e.first === t && (e.first = r), e.last === t && (e.last = i));
}
function di(t, e) {
  var i = [];
  Qi(t, i, !0), Mr(i, () => {
    it(t), e && e();
  });
}
function Mr(t, e) {
  var i = t.length;
  if (i > 0) {
    var r = () => --i || e();
    for (var n of t)
      n.out(r);
  } else
    e();
}
function Qi(t, e, i) {
  if ((t.f & ot) === 0) {
    if (t.f ^= ot, t.transitions !== null)
      for (const l of t.transitions)
        (l.is_global || i) && e.push(l);
    for (var r = t.first; r !== null; ) {
      var n = r.next, s = (r.f & wi) !== 0 || (r.f & ct) !== 0;
      Qi(r, e, s ? i : !1), r = n;
    }
  }
}
function fi(t) {
  Vr(t, !0);
}
function Vr(t, e) {
  if ((t.f & ot) !== 0) {
    t.f ^= ot, (t.f & Qe) !== 0 && (Je(t, vt), Ci(t));
    for (var i = t.first; i !== null; ) {
      var r = i.next, n = (i.f & wi) !== 0 || (i.f & ct) !== 0;
      Vr(i, n ? e : !1), i = r;
    }
    if (t.transitions !== null)
      for (const s of t.transitions)
        (s.is_global || e) && s.in();
  }
}
let _i = [];
function Un() {
  var t = _i;
  _i = [], on(t);
}
function Gn(t) {
  _i.length === 0 && queueMicrotask(Un), _i.push(t);
}
function jn(t) {
  var e = (
    /** @type {Effect} */
    Ee
  );
  if ((e.f & mr) === 0) {
    if ((e.f & Ui) === 0)
      throw t;
    e.fn(t);
  } else
    Lr(t, e);
}
function Lr(t, e) {
  for (; e !== null; ) {
    if ((e.f & Ui) !== 0)
      try {
        e.fn(t);
        return;
      } catch {
      }
    e = e.parent;
  }
  throw t;
}
let Mi = !1, hi = null, St = !1, ti = !1;
function ar(t) {
  ti = t;
}
let vi = [];
let ke = null, tt = !1;
function _t(t) {
  ke = t;
}
let Ee = null;
function $t(t) {
  Ee = t;
}
let lt = null;
function Nr(t) {
  ke !== null && ke.f & qi && (lt === null ? lt = [t] : lt.push(t));
}
let Fe = null, Be = 0, Ke = null;
function Bn(t) {
  Ke = t;
}
let zr = 1, gi = 0, ft = !1;
function Fr() {
  return ++zr;
}
function Ai(t) {
  var e = t.f;
  if ((e & vt) !== 0)
    return !0;
  if ((e & kt) !== 0) {
    var i = t.deps, r = (e & Ye) !== 0;
    if (i !== null) {
      var n, s, l = (e & ci) !== 0, u = r && Ee !== null && !ft, d = i.length;
      if (l || u) {
        var _ = (
          /** @type {Derived} */
          t
        ), S = _.parent;
        for (n = 0; n < d; n++)
          s = i[n], (l || !s?.reactions?.includes(_)) && (s.reactions ?? (s.reactions = [])).push(_);
        l && (_.f ^= ci), u && S !== null && (S.f & Ye) === 0 && (_.f ^= Ye);
      }
      for (n = 0; n < d; n++)
        if (s = i[n], Ai(
          /** @type {Derived} */
          s
        ) && Er(
          /** @type {Derived} */
          s
        ), s.wv > t.wv)
          return !0;
    }
    (!r || Ee !== null && !ft) && Je(t, Qe);
  }
  return !1;
}
function Ur(t, e, i = !0) {
  var r = t.reactions;
  if (r !== null)
    for (var n = 0; n < r.length; n++) {
      var s = r[n];
      lt?.includes(t) || ((s.f & We) !== 0 ? Ur(
        /** @type {Derived} */
        s,
        e,
        !1
      ) : e === s && (i ? Je(s, vt) : (s.f & Qe) !== 0 && Je(s, kt), Ci(
        /** @type {Effect} */
        s
      )));
    }
}
function Gr(t) {
  var p;
  var e = Fe, i = Be, r = Ke, n = ke, s = ft, l = lt, u = Ue, d = tt, _ = t.f;
  Fe = /** @type {null | Value[]} */
  null, Be = 0, Ke = null, ft = (_ & Ye) !== 0 && (tt || !St || ke === null), ke = (_ & (ct | xt)) === 0 ? t : null, lt = null, nr(t.ctx), tt = !1, gi++, t.f |= qi;
  try {
    var S = (
      /** @type {Function} */
      (0, t.fn)()
    ), b = t.deps;
    if (Fe !== null) {
      var v;
      if (pi(t, Be), b !== null && Be > 0)
        for (b.length = Be + Fe.length, v = 0; v < Fe.length; v++)
          b[Be + v] = Fe[v];
      else
        t.deps = b = Fe;
      if (!ft)
        for (v = Be; v < b.length; v++)
          ((p = b[v]).reactions ?? (p.reactions = [])).push(t);
    } else b !== null && Be < b.length && (pi(t, Be), b.length = Be);
    if (Sr() && Ke !== null && !tt && b !== null && (t.f & (We | kt | vt)) === 0)
      for (v = 0; v < /** @type {Source[]} */
      Ke.length; v++)
        Ur(
          Ke[v],
          /** @type {Effect} */
          t
        );
    return n !== null && n !== t && (gi++, Ke !== null && (r === null ? r = Ke : r.push(.../** @type {Source[]} */
    Ke))), S;
  } catch (w) {
    jn(w);
  } finally {
    Fe = e, Be = i, Ke = r, ke = n, ft = s, lt = l, nr(u), tt = d, t.f ^= qi;
  }
}
function Hn(t, e) {
  let i = e.reactions;
  if (i !== null) {
    var r = en.call(i, t);
    if (r !== -1) {
      var n = i.length - 1;
      n === 0 ? i = e.reactions = null : (i[r] = i[n], i.pop());
    }
  }
  i === null && (e.f & We) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (Fe === null || !Fe.includes(e)) && (Je(e, kt), (e.f & (Ye | ci)) === 0 && (e.f ^= ci), xr(
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
      Hn(t, i[r]);
}
function Ki(t) {
  var e = t.f;
  if ((e & Gi) === 0) {
    Je(t, Qe);
    var i = Ee, r = St;
    Ee = t, St = !0;
    try {
      (e & Fi) !== 0 ? zn(t) : qr(t), Dr(t);
      var n = Gr(t);
      t.teardown = typeof n == "function" ? n : null, t.wv = zr;
      var s;
    } finally {
      St = r, Ee = i;
    }
  }
}
function Yn() {
  try {
    hn();
  } catch (t) {
    if (hi !== null)
      Lr(t, hi);
    else
      throw t;
  }
}
function Qn() {
  var t = St;
  try {
    var e = 0;
    for (St = !0; vi.length > 0; ) {
      e++ > 1e3 && Yn();
      var i = vi, r = i.length;
      vi = [];
      for (var n = 0; n < r; n++) {
        var s = Wn(i[n]);
        Kn(s);
      }
      ni.clear();
    }
  } finally {
    Mi = !1, St = t, hi = null;
  }
}
function Kn(t) {
  var e = t.length;
  if (e !== 0)
    for (var i = 0; i < e; i++) {
      var r = t[i];
      (r.f & (Gi | ot)) === 0 && Ai(r) && (Ki(r), r.deps === null && r.first === null && r.nodes_start === null && (r.teardown === null ? Rr(r) : r.fn = null));
    }
}
function Ci(t) {
  Mi || (Mi = !0, queueMicrotask(Qn));
  for (var e = hi = t; e.parent !== null; ) {
    e = e.parent;
    var i = e.f;
    if ((i & (xt | ct)) !== 0) {
      if ((i & Qe) === 0) return;
      e.f ^= Qe;
    }
  }
  vi.push(e);
}
function Wn(t) {
  for (var e = [], i = t; i !== null; ) {
    var r = i.f, n = (r & (ct | xt)) !== 0, s = n && (r & Qe) !== 0;
    if (!s && (r & ot) === 0) {
      (r & pr) !== 0 ? e.push(i) : n ? i.f ^= Qe : Ai(i) && Ki(i);
      var l = i.first;
      if (l !== null) {
        i = l;
        continue;
      }
    }
    var u = i.parent;
    for (i = i.next; i === null && u !== null; )
      i = u.next, u = u.parent;
  }
  return e;
}
function o(t) {
  var e = t.f, i = (e & We) !== 0;
  if (ke !== null && !tt) {
    if (!lt?.includes(t)) {
      var r = ke.deps;
      t.rv < gi && (t.rv = gi, Fe === null && r !== null && r[Be] === t ? Be++ : Fe === null ? Fe = [t] : (!ft || !Fe.includes(t)) && Fe.push(t));
    }
  } else if (i && /** @type {Derived} */
  t.deps === null && /** @type {Derived} */
  t.effects === null) {
    var n = (
      /** @type {Derived} */
      t
    ), s = n.parent;
    s !== null && (s.f & Ye) === 0 && (n.f ^= Ye);
  }
  return i && (n = /** @type {Derived} */
  t, Ai(n) && Er(n)), ti && ni.has(t) ? ni.get(t) : t.v;
}
function mi(t) {
  var e = tt;
  try {
    return tt = !0, t();
  } finally {
    tt = e;
  }
}
const Jn = -7169;
function Je(t, e) {
  t.f = t.f & Jn | e;
}
const Zn = ["touchstart", "touchmove"];
function Xn(t) {
  return Zn.includes(t);
}
const jr = /* @__PURE__ */ new Set(), Vi = /* @__PURE__ */ new Set();
function gt(t) {
  for (var e = 0; e < t.length; e++)
    jr.add(t[e]);
  for (var i of Vi)
    i(t);
}
function ai(t) {
  var e = this, i = (
    /** @type {Node} */
    e.ownerDocument
  ), r = t.type, n = t.composedPath?.() || [], s = (
    /** @type {null | Element} */
    n[0] || t.target
  ), l = 0, u = t.__root;
  if (u) {
    var d = n.indexOf(u);
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
    tn(t, "currentTarget", {
      configurable: !0,
      get() {
        return s || i;
      }
    });
    var S = ke, b = Ee;
    _t(null), $t(null);
    try {
      for (var v, p = []; s !== null; ) {
        var w = s.assignedSlot || s.parentNode || /** @type {any} */
        s.host || null;
        try {
          var D = s["__" + r];
          if (D != null && (!/** @type {any} */
          s.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          t.target === s))
            if (yi(D)) {
              var [M, ...A] = D;
              M.apply(s, [t, ...A]);
            } else
              D.call(s, t);
        } catch (x) {
          v ? p.push(x) : v = x;
        }
        if (t.cancelBubble || w === e || w === null)
          break;
        s = w;
      }
      if (v) {
        for (let x of p)
          queueMicrotask(() => {
            throw x;
          });
        throw v;
      }
    } finally {
      t.__root = e, delete t.currentTarget, _t(S), $t(b);
    }
  }
}
function Br(t) {
  var e = document.createElement("template");
  return e.innerHTML = t.replaceAll("<!>", "<!---->"), e.content;
}
function si(t, e) {
  var i = (
    /** @type {Effect} */
    Ee
  );
  i.nodes_start === null && (i.nodes_start = t, i.nodes_end = e);
}
// @__NO_SIDE_EFFECTS__
function h(t, e) {
  var i = (e & An) !== 0, r = (e & Cn) !== 0, n, s = !t.startsWith("<!>");
  return () => {
    n === void 0 && (n = Br(s ? t : "<!>" + t), i || (n = /** @type {Node} */
    /* @__PURE__ */ Zt(n)));
    var l = (
      /** @type {TemplateNode} */
      r || Ir ? document.importNode(n, !0) : n.cloneNode(!0)
    );
    if (i) {
      var u = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Zt(l)
      ), d = (
        /** @type {TemplateNode} */
        l.lastChild
      );
      si(u, d);
    } else
      si(l, l);
    return l;
  };
}
// @__NO_SIDE_EFFECTS__
function $n(t, e, i = "svg") {
  var r = !t.startsWith("<!>"), n = `<${i}>${r ? t : "<!>" + t}</${i}>`, s;
  return () => {
    if (!s) {
      var l = (
        /** @type {DocumentFragment} */
        Br(n)
      ), u = (
        /** @type {Element} */
        /* @__PURE__ */ Zt(l)
      );
      s = /** @type {Element} */
      /* @__PURE__ */ Zt(u);
    }
    var d = (
      /** @type {TemplateNode} */
      s.cloneNode(!0)
    );
    return si(d, d), d;
  };
}
// @__NO_SIDE_EFFECTS__
function es(t, e) {
  return /* @__PURE__ */ $n(t, e, "svg");
}
function wt(t = "") {
  {
    var e = xi(t + "");
    return si(e, e), e;
  }
}
function at() {
  var t = document.createDocumentFragment(), e = document.createComment(""), i = xi();
  return t.append(e, i), si(e, i), t;
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
function ts(t, e) {
  return is(t, e);
}
const Et = /* @__PURE__ */ new Map();
function is(t, { target: e, anchor: i, props: r = {}, events: n, context: s, intro: l = !0 }) {
  Dn();
  var u = /* @__PURE__ */ new Set(), d = (b) => {
    for (var v = 0; v < b.length; v++) {
      var p = b[v];
      if (!u.has(p)) {
        u.add(p);
        var w = Xn(p);
        e.addEventListener(p, ai, { passive: w });
        var D = Et.get(p);
        D === void 0 ? (document.addEventListener(p, ai, { passive: w }), Et.set(p, 1)) : Et.set(p, D + 1);
      }
    }
  };
  d(Li(jr)), Vi.add(d);
  var _ = void 0, S = Nn(() => {
    var b = i ?? e.appendChild(xi());
    return Xt(() => {
      if (s) {
        Ze({});
        var v = (
          /** @type {ComponentContext} */
          Ue
        );
        v.c = s;
      }
      n && (r.$$events = n), _ = t(b, r) || {}, s && Xe();
    }), () => {
      for (var v of u) {
        e.removeEventListener(v, ai);
        var p = (
          /** @type {number} */
          Et.get(v)
        );
        --p === 0 ? (document.removeEventListener(v, ai), Et.delete(v)) : Et.set(v, p);
      }
      Vi.delete(d), b !== i && b.parentNode?.removeChild(b);
    };
  });
  return rs.set(_, S), _;
}
let rs = /* @__PURE__ */ new WeakMap();
function m(t, e, [i, r] = [0, 0]) {
  var n = t, s = null, l = null, u = Ge, d = i > 0 ? wi : 0, _ = !1;
  const S = (v, p = !0) => {
    _ = !0, b(p, v);
  }, b = (v, p) => {
    u !== (u = v) && (u ? (s ? fi(s) : p && (s = Xt(() => p(n))), l && di(l, () => {
      l = null;
    })) : (l ? fi(l) : p && (l = Xt(() => p(n, [i + 1, r]))), s && di(s, () => {
      s = null;
    })));
  };
  Ei(() => {
    _ = !1, e(S), _ || b(null, null);
  }, d);
}
function je(t, e) {
  return e;
}
function ns(t, e, i, r) {
  for (var n = [], s = e.length, l = 0; l < s; l++)
    Qi(e[l].e, n, !0);
  var u = s > 0 && n.length === 0 && i !== null;
  if (u) {
    var d = (
      /** @type {Element} */
      /** @type {Element} */
      i.parentNode
    );
    qn(d), d.append(
      /** @type {Element} */
      i
    ), r.clear(), dt(t, e[0].prev, e[s - 1].next);
  }
  Mr(n, () => {
    for (var _ = 0; _ < s; _++) {
      var S = e[_];
      u || (r.delete(S.k), dt(t, S.prev, S.next)), it(S.e, !u);
    }
  });
}
function ze(t, e, i, r, n, s = null) {
  var l = t, u = { flags: e, items: /* @__PURE__ */ new Map(), first: null }, d = (e & wr) !== 0;
  if (d) {
    var _ = (
      /** @type {Element} */
      t
    );
    l = _.appendChild(xi());
  }
  var S = null, b = !1, v = /* @__PURE__ */ Tn(() => {
    var p = i();
    return yi(p) ? p : p == null ? [] : Li(p);
  });
  Ei(() => {
    var p = o(v), w = p.length;
    b && w === 0 || (b = w === 0, ss(p, u, l, n, e, r, i), s !== null && (w === 0 ? S ? fi(S) : S = Xt(() => s(l)) : S !== null && di(S, () => {
      S = null;
    })), o(v));
  });
}
function ss(t, e, i, r, n, s, l) {
  var u = (n & yn) !== 0, d = (n & (Bi | Hi)) !== 0, _ = t.length, S = e.items, b = e.first, v = b, p, w = null, D, M = [], A = [], x, T, I, C;
  if (u)
    for (C = 0; C < _; C += 1)
      x = t[C], T = s(x, C), I = S.get(T), I !== void 0 && (I.a?.measure(), (D ?? (D = /* @__PURE__ */ new Set())).add(I));
  for (C = 0; C < _; C += 1) {
    if (x = t[C], T = s(x, C), I = S.get(T), I === void 0) {
      var se = v ? (
        /** @type {TemplateNode} */
        v.e.nodes_start
      ) : i;
      w = os(
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
      ), S.set(T, w), M = [], A = [], v = w.next;
      continue;
    }
    if (d && as(I, x, C, n), (I.e.f & ot) !== 0 && (fi(I.e), u && (I.a?.unfix(), (D ?? (D = /* @__PURE__ */ new Set())).delete(I))), I !== v) {
      if (p !== void 0 && p.has(I)) {
        if (M.length < A.length) {
          var re = A[0], ne;
          w = re.prev;
          var Te = M[0], Ae = M[M.length - 1];
          for (ne = 0; ne < M.length; ne += 1)
            or(M[ne], re, i);
          for (ne = 0; ne < A.length; ne += 1)
            p.delete(A[ne]);
          dt(e, Te.prev, Ae.next), dt(e, w, Te), dt(e, Ae, re), v = re, w = Ae, C -= 1, M = [], A = [];
        } else
          p.delete(I), or(I, v, i), dt(e, I.prev, I.next), dt(e, I, w === null ? e.first : w.next), dt(e, w, I), w = I;
        continue;
      }
      for (M = [], A = []; v !== null && v.k !== T; )
        (v.e.f & ot) === 0 && (p ?? (p = /* @__PURE__ */ new Set())).add(v), A.push(v), v = v.next;
      if (v === null)
        continue;
      I = v;
    }
    M.push(I), w = I, v = I.next;
  }
  if (v !== null || p !== void 0) {
    for (var V = p === void 0 ? [] : Li(p); v !== null; )
      (v.e.f & ot) === 0 && V.push(v), v = v.next;
    var G = V.length;
    if (G > 0) {
      var _e = (n & wr) !== 0 && _ === 0 ? i : null;
      if (u) {
        for (C = 0; C < G; C += 1)
          V[C].a?.measure();
        for (C = 0; C < G; C += 1)
          V[C].a?.fix();
      }
      ns(e, V, _e, S);
    }
  }
  u && Gn(() => {
    if (D !== void 0)
      for (I of D)
        I.a?.apply();
  }), Ee.first = e.first && e.first.e, Ee.last = w && w.e;
}
function as(t, e, i, r) {
  (r & Bi) !== 0 && Ri(t.v, e), (r & Hi) !== 0 ? Ri(
    /** @type {Value<number>} */
    t.i,
    i
  ) : t.i = i;
}
function os(t, e, i, r, n, s, l, u, d, _) {
  var S = (d & Bi) !== 0, b = (d & wn) === 0, v = S ? b ? /* @__PURE__ */ Ar(n, !1, !1) : ui(n) : n, p = (d & Hi) === 0 ? l : ui(l), w = {
    i: p,
    v,
    k: s,
    a: null,
    // @ts-expect-error
    e: null,
    prev: i,
    next: r
  };
  try {
    return w.e = Xt(() => u(t, v, p, _), On), w.e.prev = i && i.e, w.e.next = r && r.e, i === null ? e.first = w : (i.next = w, i.e.next = w.e), r !== null && (r.prev = w, r.e.prev = w.e), w;
  } finally {
  }
}
function or(t, e, i) {
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
      /* @__PURE__ */ ki(s)
    );
    n.before(s), s = l;
  }
}
function dt(t, e, i) {
  e === null ? t.first = i : (e.next = i, e.e.next = i && i.e), i !== null && (i.prev = e, i.e.prev = e && e.e);
}
function lr(t, e, ...i) {
  var r = t, n = an, s;
  Ei(() => {
    n !== (n = e()) && (s && (it(s), s = null), s = Xt(() => (
      /** @type {SnippetFn} */
      n(r, ...i)
    )));
  }, wi);
}
function Hr(t) {
  var e, i, r = "";
  if (typeof t == "string" || typeof t == "number") r += t;
  else if (typeof t == "object") if (Array.isArray(t)) {
    var n = t.length;
    for (e = 0; e < n; e++) t[e] && (i = Hr(t[e])) && (r && (r += " "), r += i);
  } else for (i in t) t[i] && (r && (r += " "), r += i);
  return r;
}
function ls() {
  for (var t, e, i = 0, r = "", n = arguments.length; i < n; i++) (t = arguments[i]) && (e = Hr(t)) && (r && (r += " "), r += e);
  return r;
}
function bt(t) {
  return typeof t == "object" ? ls(t) : t ?? "";
}
const vr = [...` 	
\r\f \v\uFEFF`];
function vs(t, e, i) {
  var r = t == null ? "" : "" + t;
  if (e && (r = r ? r + " " + e : e), i) {
    for (var n in i)
      if (i[n])
        r = r ? r + " " + n : n;
      else if (r.length)
        for (var s = n.length, l = 0; (l = r.indexOf(n, l)) >= 0; ) {
          var u = l + s;
          (l === 0 || vr.includes(r[l - 1])) && (u === r.length || vr.includes(r[u])) ? r = (l === 0 ? "" : r.substring(0, l)) + r.substring(u + 1) : l = u;
        }
  }
  return r === "" ? null : r;
}
function cs(t, e) {
  return t == null ? null : String(t);
}
function xe(t, e, i, r, n, s) {
  var l = t.__className;
  if (l !== i || l === void 0) {
    var u = vs(i, r, s);
    u == null ? t.removeAttribute("class") : e ? t.className = u : t.setAttribute("class", u), t.__className = i;
  } else if (s && n !== s)
    for (var d in s) {
      var _ = !!s[d];
      (n == null || _ !== !!n[d]) && t.classList.toggle(d, _);
    }
  return s;
}
function us(t, e, i, r) {
  var n = t.__style;
  if (n !== e) {
    var s = cs(e);
    s == null ? t.removeAttribute("style") : t.style.cssText = s, t.__style = e;
  }
  return r;
}
const ds = Symbol("is custom element"), fs = Symbol("is html");
function _s(t, e) {
  var i = Wi(t);
  i.value === (i.value = // treat null and undefined the same for the initial value
  e ?? void 0) || // @ts-expect-error
  // `progress` elements always need their value set when it's `0`
  t.value === e && (e !== 0 || t.nodeName !== "PROGRESS") || (t.value = e ?? "");
}
function cr(t, e) {
  var i = Wi(t);
  i.checked !== (i.checked = // treat null and undefined the same for the initial value
  e ?? void 0) && (t.checked = e);
}
function ht(t, e, i, r) {
  var n = Wi(t);
  n[e] !== (n[e] = i) && (e === "loading" && (t[cn] = i), i == null ? t.removeAttribute(e) : typeof i != "string" && hs(t).includes(e) ? t[e] = i : t.setAttribute(e, i));
}
function Wi(t) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    // @ts-expect-error
    t.__attributes ?? (t.__attributes = {
      [ds]: t.nodeName.includes("-"),
      [fs]: t.namespaceURI === In
    })
  );
}
var ur = /* @__PURE__ */ new Map();
function hs(t) {
  var e = ur.get(t.nodeName);
  if (e) return e;
  ur.set(t.nodeName, e = []);
  for (var i, r = t, n = Element.prototype; n !== r; ) {
    i = rn(r);
    for (var s in i)
      i[s].set && e.push(s);
    r = gr(r);
  }
  return e;
}
let oi = !1;
function gs(t) {
  var e = oi;
  try {
    return oi = !1, [t(), oi];
  } finally {
    oi = e;
  }
}
function dr(t) {
  return t.ctx?.d ?? !1;
}
function te(t, e, i, r) {
  var n = (i & Sn) !== 0, s = !0, l = (i & kn) !== 0, u = (i & En) !== 0, d = !1, _;
  l ? [_, d] = gs(() => (
    /** @type {V} */
    t[e]
  )) : _ = /** @type {V} */
  t[e];
  var S = li in t || vn in t, b = l && (At(t, e)?.set ?? (S && e in t && ((C) => t[e] = C))) || void 0, v = (
    /** @type {V} */
    r
  ), p = !0, w = !1, D = () => (w = !0, p && (p = !1, u ? v = mi(
    /** @type {() => V} */
    r
  ) : v = /** @type {V} */
  r), v);
  _ === void 0 && r !== void 0 && (b && s && gn(), _ = D(), b && b(_));
  var M;
  if (M = () => {
    var C = (
      /** @type {V} */
      t[e]
    );
    return C === void 0 ? D() : (p = !0, w = !1, C);
  }, (i & xn) === 0 && s)
    return M;
  if (b) {
    var A = t.$$legacy;
    return function(C, se) {
      return arguments.length > 0 ? ((!se || A || d) && b(se ? M() : C), C) : M();
    };
  }
  var x = !1, T = /* @__PURE__ */ Ar(_), I = /* @__PURE__ */ Si(() => {
    var C = M(), se = o(T);
    return x ? (x = !1, se) : T.v = C;
  });
  return l && o(I), n || (I.equals = ji), function(C, se) {
    if (arguments.length > 0) {
      const re = se ? o(I) : l ? Me(C) : C;
      if (!I.equals(re)) {
        if (x = !0, U(T, re), w && v !== void 0 && (v = re), dr(I))
          return C;
        mi(() => o(I));
      }
      return C;
    }
    return dr(I) ? I.v : o(I);
  };
}
function Ii(t) {
  Ue === null && Yi(), yt(() => {
    const e = mi(t);
    if (typeof e == "function") return (
      /** @type {() => void} */
      e
    );
  });
}
function ps(t) {
  Ue === null && Yi(), Ii(() => () => mi(t));
}
function ms(t, e, { bubbles: i = !1, cancelable: r = !1 } = {}) {
  return new CustomEvent(t, { detail: e, bubbles: i, cancelable: r });
}
function bs() {
  const t = Ue;
  return t === null && Yi(), (e, i, r) => {
    const n = (
      /** @type {Record<string, Function | Function[]>} */
      t.s.$$events?.[
        /** @type {any} */
        e
      ]
    );
    if (n) {
      const s = yi(n) ? n.slice() : [n], l = ms(
        /** @type {string} */
        e,
        i,
        r
      );
      for (const u of s)
        u.call(t.x, l);
      return !l.defaultPrevented;
    }
    return !0;
  };
}
const ys = "5";
var hr;
typeof window < "u" && ((hr = window.__svelte ?? (window.__svelte = {})).v ?? (hr.v = /* @__PURE__ */ new Set())).add(ys);
class ws {
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
      const s = new AbortController(), l = setTimeout(() => s.abort(), this.timeout), u = await fetch(r, {
        ...n,
        signal: s.signal
      });
      if (clearTimeout(l), !u.ok) {
        const _ = await u.json().catch(() => ({ message: u.statusText }));
        throw new Error(_.message || _.error || `HTTP ${u.status}`);
      }
      const d = await u.json();
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
function fr(t) {
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
function Yr(t, e = "") {
  if (t == null) return e;
  const i = String(t);
  return typeof t == "string" && !fr(i) ? i : fr(i) ? (console.warn("[Sanitizer] Code pattern detected and removed:", {
    original: i.substring(0, 100) + (i.length > 100 ? "..." : ""),
    fallback: e
  }), e) : i;
}
var Ct, It, Tt, Pt, Ot, Dt, qt, Rt, Mt, Vt, Lt, Nt, zt, Ft, Ut, Gt, jt, Bt, Ht, Yt, Qt, Kt, Wt, Jt;
class Ss {
  constructor() {
    Ce(this, Ct);
    Ce(this, It);
    Ce(this, Tt);
    Ce(this, Pt);
    Ce(this, Ot);
    Ce(this, Dt);
    Ce(this, qt);
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
    Ce(this, Yt);
    Ce(this, Qt);
    Ce(this, Kt);
    Ce(this, Wt);
    Ce(this, Jt);
    Ie(this, Ct, /* @__PURE__ */ Y("")), Ie(this, It, /* @__PURE__ */ Y(null)), Ie(this, Tt, /* @__PURE__ */ Y(null)), Ie(this, Pt, /* @__PURE__ */ Y(Me({}))), Ie(this, Ot, /* @__PURE__ */ Y(null)), Ie(this, Dt, /* @__PURE__ */ Y(null)), Ie(this, qt, /* @__PURE__ */ Y(Me([]))), Ie(this, Rt, /* @__PURE__ */ Y(Me([]))), Ie(this, Mt, /* @__PURE__ */ Y(Me([]))), Ie(this, Vt, /* @__PURE__ */ Y(Me([]))), Ie(this, Lt, /* @__PURE__ */ Y(Me([]))), Ie(this, Nt, /* @__PURE__ */ Y(Me([]))), Ie(this, zt, /* @__PURE__ */ Y(Me([]))), Ie(this, Ft, /* @__PURE__ */ Y(!1)), Ie(this, Ut, /* @__PURE__ */ Y(!1)), Ie(this, Gt, /* @__PURE__ */ Y(!1)), Ie(this, jt, /* @__PURE__ */ Y(!1)), Ie(this, Bt, /* @__PURE__ */ Y(null)), Ie(this, Ht, /* @__PURE__ */ Y(Me([]))), Ie(this, Yt, /* @__PURE__ */ Y(null)), Ie(this, Qt, /* @__PURE__ */ Y(null)), Ie(this, Kt, /* @__PURE__ */ Y(!1)), Ie(this, Wt, /* @__PURE__ */ Y(0)), Ie(this, Jt, /* @__PURE__ */ Y(Me(/* @__PURE__ */ new Set()))), this.api = null, this._initialized = !1, this._debounceTimers = /* @__PURE__ */ new Map(), this._modelLoaded = !1;
  }
  get modelId() {
    return o(N(this, Ct));
  }
  set modelId(e) {
    U(N(this, Ct), e, !0);
  }
  get model() {
    return o(N(this, It));
  }
  set model(e) {
    U(N(this, It), e, !0);
  }
  get configuration() {
    return o(N(this, Tt));
  }
  set configuration(e) {
    U(N(this, Tt), e, !0);
  }
  get selections() {
    return o(N(this, Pt));
  }
  set selections(e) {
    U(N(this, Pt), e, !0);
  }
  get validationResults() {
    return o(N(this, Ot));
  }
  set validationResults(e) {
    U(N(this, Ot), e, !0);
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
    return o(N(this, Rt));
  }
  set constraints(e) {
    U(N(this, Rt), e, !0);
  }
  get groups() {
    return o(N(this, Mt));
  }
  set groups(e) {
    U(N(this, Mt), e, !0);
  }
  get options() {
    return o(N(this, Vt));
  }
  set options(e) {
    U(N(this, Vt), e, !0);
  }
  get rules() {
    return o(N(this, Lt));
  }
  set rules(e) {
    U(N(this, Lt), e, !0);
  }
  get pricingRules() {
    return o(N(this, Nt));
  }
  set pricingRules(e) {
    U(N(this, Nt), e, !0);
  }
  get volumeTiers() {
    return o(N(this, zt));
  }
  set volumeTiers(e) {
    U(N(this, zt), e, !0);
  }
  get isLoading() {
    return o(N(this, Ft));
  }
  set isLoading(e) {
    U(N(this, Ft), e, !0);
  }
  get isValidating() {
    return o(N(this, Ut));
  }
  set isValidating(e) {
    U(N(this, Ut), e, !0);
  }
  get isPricing() {
    return o(N(this, Gt));
  }
  set isPricing(e) {
    U(N(this, Gt), e, !0);
  }
  get isSaving() {
    return o(N(this, jt));
  }
  set isSaving(e) {
    U(N(this, jt), e, !0);
  }
  get error() {
    return o(N(this, Bt));
  }
  set error(e) {
    U(N(this, Bt), e, !0);
  }
  get validationErrors() {
    return o(N(this, Ht));
  }
  set validationErrors(e) {
    U(N(this, Ht), e, !0);
  }
  get configurationId() {
    return o(N(this, Yt));
  }
  set configurationId(e) {
    U(N(this, Yt), e, !0);
  }
  get lastSaved() {
    return o(N(this, Qt));
  }
  set lastSaved(e) {
    U(N(this, Qt), e, !0);
  }
  get isDirty() {
    return o(N(this, Kt));
  }
  set isDirty(e) {
    U(N(this, Kt), e, !0);
  }
  get currentStep() {
    return o(N(this, Wt));
  }
  set currentStep(e) {
    U(N(this, Wt), e, !0);
  }
  get expandedGroups() {
    return o(N(this, Jt));
  }
  set expandedGroups(e) {
    U(N(this, Jt), e, !0);
  }
  // Initialize store
  async initialize() {
    this._initialized || (this._initialized = !0, console.log("🚀 ConfigurationStore initialized"), Array.isArray(this.groups) || (this.groups = []), Array.isArray(this.options) || (this.options = []), Array.isArray(this.rules) || (this.rules = []), Array.isArray(this.pricingRules) || (this.pricingRules = []), Array.isArray(this.volumeTiers) || (this.volumeTiers = []), Array.isArray(this.availableOptions) || (this.availableOptions = []), Array.isArray(this.validationErrors) || (this.validationErrors = []), yt(() => {
      this.modelId && !this.api && (this.api = new ws(window.__API_BASE_URL__, { modelId: this.modelId }), this.loadModel());
    }), yt(() => {
      this.api && Object.keys(this.selections).length > 0 && this._debounce("validate", () => this.validateSelections(), 500);
    }), yt(() => {
      this.api && this.isValid && Object.keys(this.selections).length > 0 && this._debounce("pricing", () => this.calculatePricing(), 300);
    }), yt(() => {
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
          this.groups.forEach((u) => {
            Array.isArray(u.options) && u.options.forEach((d) => {
              l.push({ ...d, group_id: u.id });
            });
          }), l.length > 0 && (console.log("Extracted options from groups:", l.length), this.options = l);
        }
        console.log("Model loaded:", {
          model: e,
          groups: this.groups,
          options: this.options,
          groupsCount: this.groups.length,
          optionsCount: this.options.length
        }), this.groups.forEach((l, u) => {
          l.description && typeof l.description == "string" && (l.description.includes("=>") || l.description.includes("function")) && console.warn(`Group ${u} (${l.name}) has function code in description:`, l.description), l.name && typeof l.name == "string" && (l.name.includes("=>") || l.name.includes("function")) && console.warn(`Group ${u} has function code in name:`, l.name);
        }), this.options.forEach((l, u) => {
          l.description && typeof l.description == "string" && (l.description.includes("=>") || l.description.includes("function")) && console.warn(`Option ${u} (${l.name}) has function code in description:`, l.description), l.name && typeof l.name == "string" && (l.name.includes("=>") || l.name.includes("function")) && console.warn(`Option ${u} has function code in name:`, l.name);
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
    const l = r.find((u) => u.id === e);
    if (l) {
      const u = n.find((d) => d.id === l.group_id);
      if (u?.selection_type === "single" && r.filter((d) => d.group_id === u.id && d.id !== e).forEach((d) => delete s[d.id]), u?.max_selections && r.filter((_) => _.group_id === u.id && s[_.id]).length > u.max_selections) {
        this.error = `Maximum ${u.max_selections} selections allowed in ${u.name}`;
        return;
      }
    }
    if (this.selections = s, this.configurationId)
      try {
        i > 0 ? await this.api.addSelections(this.configurationId, s) : await this.api.removeSelection(this.configurationId, e);
      } catch (u) {
        this.error = u.message;
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
Ct = new WeakMap(), It = new WeakMap(), Tt = new WeakMap(), Pt = new WeakMap(), Ot = new WeakMap(), Dt = new WeakMap(), qt = new WeakMap(), Rt = new WeakMap(), Mt = new WeakMap(), Vt = new WeakMap(), Lt = new WeakMap(), Nt = new WeakMap(), zt = new WeakMap(), Ft = new WeakMap(), Ut = new WeakMap(), Gt = new WeakMap(), jt = new WeakMap(), Bt = new WeakMap(), Ht = new WeakMap(), Yt = new WeakMap(), Qt = new WeakMap(), Kt = new WeakMap(), Wt = new WeakMap(), Jt = new WeakMap();
const g = new Ss();
var xs = /* @__PURE__ */ es('<svg class="checkmark svelte-19ib3n" width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M13.854 3.646a.5.5 0 010 .708l-7 7a.5.5 0 01-.708 0l-3.5-3.5a.5.5 0 11.708-.708L6.5 10.293l6.646-6.647a.5.5 0 01.708 0z"></path></svg>'), ks = /* @__PURE__ */ h('<span class="step-number svelte-19ib3n"></span>'), Es = /* @__PURE__ */ h('<div><div class="step-marker svelte-19ib3n"><!></div> <div class="step-content svelte-19ib3n"><span class="step-icon svelte-19ib3n"> </span> <span class="step-label svelte-19ib3n"> </span></div></div>'), As = /* @__PURE__ */ h('<div class="progress-indicator svelte-19ib3n"><div class="progress-bar svelte-19ib3n"><div class="progress-fill svelte-19ib3n"></div></div> <div class="steps svelte-19ib3n"></div></div>');
function Cs(t, e) {
  Ze(e, !0);
  let i = te(e, "steps", 19, () => []), r = te(e, "currentStep", 3, 0), n = te(e, "onStepClick", 3, null), s = te(e, "canNavigate", 3, !1);
  function l(v) {
    s() && n() && v <= r() && n()(v);
  }
  function u(v) {
    return v < r() ? "completed" : v === r() ? "active" : "pending";
  }
  var d = As(), _ = a(d), S = a(_), b = c(_, 2);
  ze(b, 21, i, je, (v, p, w) => {
    var D = Es();
    const M = /* @__PURE__ */ ye(() => u(w)), A = /* @__PURE__ */ ye(() => s() && w <= r());
    let x;
    D.__click = () => l(w), D.__keydown = (G) => {
      o(A) && (G.key === "Enter" || G.key === " ") && (G.preventDefault(), l(w));
    };
    var T = a(D), I = a(T);
    {
      var C = (G) => {
        var _e = xs();
        f(G, _e);
      }, se = (G) => {
        var _e = ks();
        _e.textContent = w + 1, f(G, _e);
      };
      m(I, (G) => {
        o(M) === "completed" ? G(C) : G(se, !1);
      });
    }
    var re = c(T, 2), ne = a(re), Te = a(ne), Ae = c(ne, 2), V = a(Ae);
    k(
      (G) => {
        x = xe(D, 1, `step ${o(M) ?? ""}`, "svelte-19ib3n", x, G), ht(D, "role", o(A) ? "button" : "presentation"), ht(D, "tabindex", o(A) ? 0 : -1), y(Te, o(p).icon), y(V, o(p).label);
      },
      [() => ({ clickable: o(A) })]
    ), f(v, D);
  }), k(() => us(S, `width: ${r() === 0 ? 0 : r() / (i().length - 1) * 100}%`)), f(t, d), Xe();
}
gt(["click", "keydown"]);
var Is = /* @__PURE__ */ h('<p class="loading-message svelte-121gmln"> </p>'), Ts = /* @__PURE__ */ h('<div class="loading-overlay svelte-121gmln"><div class="loading-content svelte-121gmln"><div></div> <!></div></div>'), Ps = /* @__PURE__ */ h('<p class="loading-message svelte-121gmln"> </p>'), Os = /* @__PURE__ */ h('<div class="loading-container svelte-121gmln"><div></div> <!></div>');
function ri(t, e) {
  Ze(e, !0);
  let i = te(e, "size", 3, "medium"), r = te(e, "message", 3, ""), n = te(e, "overlay", 3, !1), s = te(e, "color", 3, "primary"), l = /* @__PURE__ */ ye(() => ({
    small: "w-4 h-4 border-2",
    medium: "w-8 h-8 border-3",
    large: "w-12 h-12 border-4"
  })[i()] || "w-8 h-8 border-3"), u = /* @__PURE__ */ ye(() => ({
    primary: "border-blue-600 border-t-transparent",
    white: "border-white border-t-transparent",
    gray: "border-gray-600 border-t-transparent"
  })[s()] || "border-blue-600 border-t-transparent");
  var d = at(), _ = He(d);
  {
    var S = (v) => {
      var p = Ts(), w = a(p), D = a(w), M = c(D, 2);
      {
        var A = (x) => {
          var T = Is(), I = a(T);
          k(() => y(I, r())), f(x, T);
        };
        m(M, (x) => {
          r() && x(A);
        });
      }
      k(() => xe(D, 1, `spinner ${o(l) ?? ""} ${o(u) ?? ""}`, "svelte-121gmln")), f(v, p);
    }, b = (v) => {
      var p = Os(), w = a(p), D = c(w, 2);
      {
        var M = (A) => {
          var x = Ps(), T = a(x);
          k(() => y(T, r())), f(A, x);
        };
        m(D, (A) => {
          r() && A(M);
        });
      }
      k(() => xe(w, 1, `spinner ${o(l) ?? ""} ${o(u) ?? ""}`, "svelte-121gmln")), f(v, p);
    };
    m(_, (v) => {
      n() ? v(S) : v(b, !1);
    });
  }
  f(t, d), Xe();
}
var Ds = () => location.reload(), qs = /* @__PURE__ */ h('<div class="error-boundary svelte-szpq5s"><div class="error-content svelte-szpq5s"><div class="error-icon svelte-szpq5s">⚠️</div> <h2 class="error-title svelte-szpq5s">Something went wrong</h2> <p class="error-message svelte-szpq5s"> </p> <!> <div class="error-actions svelte-szpq5s"><button class="btn btn-primary svelte-szpq5s">Try Again</button> <button class="btn btn-secondary svelte-szpq5s">Reload Page</button></div></div></div>');
function Rs(t, e) {
  Ze(e, !0);
  let i = te(e, "fallback", 3, null), r = te(e, "onError", 3, null), n = /* @__PURE__ */ Y(null), s = /* @__PURE__ */ Y(!1);
  function l(v) {
    console.error("ErrorBoundary caught:", v.error), U(n, v.error, !0), U(s, !0), r() && r()(v.error), v.preventDefault(), v.stopPropagation();
  }
  function u() {
    U(n, null), U(s, !1);
  }
  Ii(() => (window.addEventListener("error", l), window.addEventListener("unhandledrejection", (v) => {
    l({ error: v.reason });
  }), () => {
    window.removeEventListener("error", l), window.removeEventListener("unhandledrejection", l);
  }));
  var d = at(), _ = He(d);
  {
    var S = (v) => {
      var p = at(), w = He(p);
      {
        var D = (A) => {
          var x = at(), T = He(x);
          lr(T, i, () => o(n), () => u), f(A, x);
        }, M = (A) => {
          var x = qs(), T = a(x), I = c(a(T), 4), C = a(I), se = c(I, 2);
          m(se, (Ae) => {
          });
          var re = c(se, 2), ne = a(re);
          ne.__click = u;
          var Te = c(ne, 2);
          Te.__click = [Ds], k(() => y(C, o(n)?.message || "An unexpected error occurred")), f(A, x);
        };
        m(w, (A) => {
          i() ? A(D) : A(M, !1);
        });
      }
      f(v, p);
    }, b = (v) => {
      var p = at(), w = He(p);
      lr(w, () => e.children), f(v, p);
    };
    m(_, (v) => {
      o(s) ? v(S) : v(b, !1);
    });
  }
  f(t, d), Xe();
}
gt(["click"]);
var Ms = /* @__PURE__ */ h("<p> </p>"), Vs = /* @__PURE__ */ h("<h1> </h1>"), Ls = /* @__PURE__ */ h("<h2> </h2>"), Ns = /* @__PURE__ */ h("<h3> </h3>"), zs = /* @__PURE__ */ h("<h4> </h4>"), Fs = /* @__PURE__ */ h("<div> </div>"), Us = /* @__PURE__ */ h("<span> </span>");
function Di(t, e) {
  Ze(e, !0);
  let i = te(e, "text", 3, ""), r = te(e, "fallback", 3, ""), n = te(e, "tag", 3, "span"), s = te(e, "class", 3, ""), l = /* @__PURE__ */ ye(() => Yr(i(), r()));
  var u = at(), d = He(u);
  {
    var _ = (b) => {
      var v = Ms(), p = a(v);
      k(() => {
        xe(v, 1, bt(s())), y(p, o(l));
      }), f(b, v);
    }, S = (b, v) => {
      {
        var p = (D) => {
          var M = Vs(), A = a(M);
          k(() => {
            xe(M, 1, bt(s())), y(A, o(l));
          }), f(D, M);
        }, w = (D, M) => {
          {
            var A = (T) => {
              var I = Ls(), C = a(I);
              k(() => {
                xe(I, 1, bt(s())), y(C, o(l));
              }), f(T, I);
            }, x = (T, I) => {
              {
                var C = (re) => {
                  var ne = Ns(), Te = a(ne);
                  k(() => {
                    xe(ne, 1, bt(s())), y(Te, o(l));
                  }), f(re, ne);
                }, se = (re, ne) => {
                  {
                    var Te = (V) => {
                      var G = zs(), _e = a(G);
                      k(() => {
                        xe(G, 1, bt(s())), y(_e, o(l));
                      }), f(V, G);
                    }, Ae = (V, G) => {
                      {
                        var _e = (ue) => {
                          var we = Fs(), Oe = a(we);
                          k(() => {
                            xe(we, 1, bt(s())), y(Oe, o(l));
                          }), f(ue, we);
                        }, Ve = (ue) => {
                          var we = Us(), Oe = a(we);
                          k(() => {
                            xe(we, 1, bt(s())), y(Oe, o(l));
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
              D,
              (T) => {
                n() === "h2" ? T(A) : T(x, !1);
              },
              M
            );
          }
        };
        m(
          b,
          (D) => {
            n() === "h1" ? D(p) : D(w, !1);
          },
          v
        );
      }
    };
    m(d, (b) => {
      n() === "p" ? b(_) : b(S, !1);
    });
  }
  f(t, u), Xe();
}
function Gs(t, e, i) {
  e(i() + 1);
}
function js(t, e, i) {
  e(i() - 1);
}
var Bs = (t, e) => {
  (t.key === "Enter" || t.key === " ") && (t.preventDefault(), e());
}, Hs = (t) => t.stopPropagation(), Ys = /* @__PURE__ */ h('<input type="radio" class="radio-input svelte-1ll8uv2"/>'), Qs = (t) => t.stopPropagation(), Ks = /* @__PURE__ */ h('<input type="checkbox" class="checkbox-input svelte-1ll8uv2"/>'), Ws = /* @__PURE__ */ h('<span class="option-sku svelte-1ll8uv2"> </span>'), Js = /* @__PURE__ */ h('<span class="total-price svelte-1ll8uv2"> </span>'), Zs = /* @__PURE__ */ h('<li class="svelte-1ll8uv2"><!></li>'), Xs = /* @__PURE__ */ h('<ul class="option-features svelte-1ll8uv2"></ul>'), $s = (t) => t.stopPropagation(), ea = (t, e) => e(parseInt(t.target.value) || 0), ta = (t) => t.stopPropagation(), ia = /* @__PURE__ */ h('<div class="quantity-controls svelte-1ll8uv2"><label class="quantity-label svelte-1ll8uv2">Quantity:</label> <div class="quantity-input svelte-1ll8uv2"><button class="qty-btn svelte-1ll8uv2" aria-label="Decrease quantity">−</button> <input type="number" min="1" class="qty-value svelte-1ll8uv2"/> <button class="qty-btn svelte-1ll8uv2" aria-label="Increase quantity">+</button></div></div>'), ra = /* @__PURE__ */ h('<div class="unavailable-message svelte-1ll8uv2">Not available with current selections</div>'), na = /* @__PURE__ */ h('<div class="disabled-message svelte-1ll8uv2">Maximum selections reached for this group</div>'), sa = /* @__PURE__ */ h('<div role="button"><div class="option-header svelte-1ll8uv2"><!> <div class="option-info svelte-1ll8uv2"><!> <!></div> <div class="option-price svelte-1ll8uv2"><span class="price svelte-1ll8uv2"> </span> <!></div></div> <!> <!> <!> <!> <!></div>');
function aa(t, e) {
  Ze(e, !0);
  let i = te(e, "selected", 3, !1), r = te(e, "quantity", 3, 0), n = te(e, "disabled", 3, !1), s = te(e, "available", 3, !0), l = te(e, "selectionType", 3, "multiple"), u = te(e, "maxQuantity", 3, 10);
  function d() {
    n() || (l(), e.onChange(i() ? 0 : 1));
  }
  function _(E) {
    if (n()) return;
    const R = Math.max(0, Math.min(E, u()));
    e.onChange(R);
  }
  let S = /* @__PURE__ */ ye(() => e.option.price ? `$${e.option.price.toFixed(2)}` : "Included"), b = /* @__PURE__ */ ye(() => r() > 1 && e.option.price ? `$${(e.option.price * r()).toFixed(2)} total` : "");
  var v = sa();
  let p;
  v.__click = function(...E) {
    (l() === "single" ? d : void 0)?.apply(this, E);
  }, v.__keydown = [Bs, d];
  var w = a(v), D = a(w);
  {
    var M = (E) => {
      var R = Ys();
      R.__change = d, R.__click = [Hs], k(() => {
        cr(R, i()), R.disabled = n();
      }), f(E, R);
    }, A = (E) => {
      var R = Ks();
      R.__change = d, R.__click = [Qs], k(() => {
        cr(R, i()), R.disabled = n();
      }), f(E, R);
    };
    m(D, (E) => {
      l() === "single" ? E(M) : E(A, !1);
    });
  }
  var x = c(D, 2), T = a(x);
  Di(T, {
    get text() {
      return e.option.name;
    },
    fallback: "Unnamed Option",
    tag: "h4",
    class: "option-name"
  });
  var I = c(T, 2);
  {
    var C = (E) => {
      var R = Ws(), ve = a(R);
      k(() => y(ve, `SKU: ${e.option.sku ?? ""}`)), f(E, R);
    };
    m(I, (E) => {
      e.option.sku && E(C);
    });
  }
  var se = c(x, 2), re = a(se), ne = a(re), Te = c(re, 2);
  {
    var Ae = (E) => {
      var R = Js(), ve = a(R);
      k(() => y(ve, o(b))), f(E, R);
    };
    m(Te, (E) => {
      o(b) && E(Ae);
    });
  }
  var V = c(w, 2);
  {
    var G = (E) => {
      Di(E, {
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
  var _e = c(V, 2);
  {
    var Ve = (E) => {
      var R = Xs();
      ze(R, 21, () => e.option.features, je, (ve, B) => {
        var Q = Zs(), me = a(Q);
        Di(me, {
          get text() {
            return o(B);
          },
          tag: "span"
        }), f(ve, Q);
      }), f(E, R);
    };
    m(_e, (E) => {
      e.option.features && e.option.features.length > 0 && E(Ve);
    });
  }
  var ue = c(_e, 2);
  {
    var we = (E) => {
      var R = ia();
      R.__click = [$s];
      var ve = c(a(R), 2), B = a(ve);
      B.__click = [js, _, r];
      var Q = c(B, 2);
      Q.__change = [ea, _], Q.__click = [ta];
      var me = c(Q, 2);
      me.__click = [Gs, _, r], k(() => {
        B.disabled = n() || r() <= 1, _s(Q, r()), ht(Q, "max", u()), Q.disabled = n(), me.disabled = n() || r() >= u();
      }), f(E, R);
    };
    m(ue, (E) => {
      l() === "multiple" && i() && E(we);
    });
  }
  var Oe = c(ue, 2);
  {
    var P = (E) => {
      var R = ra();
      f(E, R);
    };
    m(Oe, (E) => {
      !s() && !n() && E(P);
    });
  }
  var Z = c(Oe, 2);
  {
    var L = (E) => {
      var R = na();
      f(E, R);
    };
    m(Z, (E) => {
      n() && s() && E(L);
    });
  }
  k(
    (E) => {
      p = xe(v, 1, "option-card svelte-1ll8uv2", null, p, E), ht(v, "tabindex", n() ? -1 : 0), y(ne, o(S));
    },
    [
      () => ({
        selected: i(),
        disabled: n(),
        unavailable: !s()
      })
    ]
  ), f(t, v), Xe();
}
gt(["click", "keydown", "change"]);
var oa = /* @__PURE__ */ h('<span class="required svelte-99mz6y">*</span>'), la = /* @__PURE__ */ h('<p class="group-description svelte-99mz6y"> </p>'), va = /* @__PURE__ */ h('<span class="selection-count svelte-99mz6y"> <!></span>'), ca = /* @__PURE__ */ h('<div class="options-grid svelte-99mz6y"></div>'), ua = /* @__PURE__ */ h('<div class="no-options svelte-99mz6y"><p>No options available in this group.</p></div>'), da = /* @__PURE__ */ h('<div class="group-content svelte-99mz6y"><!></div>'), fa = /* @__PURE__ */ h('<div><div class="group-header svelte-99mz6y"><div class="group-info svelte-99mz6y"><h3 class="group-name svelte-99mz6y"> <!></h3> <!></div> <div class="group-meta svelte-99mz6y"><div class="selection-info svelte-99mz6y"><span class="selection-type svelte-99mz6y"> </span> <!></div> <button class="expand-toggle svelte-99mz6y"><svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg></button></div></div> <!></div>');
function _a(t, e) {
  Ze(e, !0);
  let i = te(e, "options", 19, () => []), r = te(e, "selections", 19, () => ({})), n = te(e, "availableOptions", 19, () => []), s = te(e, "expanded", 3, !0), l = /* @__PURE__ */ ye(() => Array.isArray(i()) ? i().filter((P) => r()[P.id] > 0).length : 0), u = /* @__PURE__ */ ye(() => Array.isArray(i()) ? i().reduce((P, Z) => P + (r()[Z.id] || 0), 0) : 0);
  function d() {
    return e.group.selection_type === "single" ? "Select one" : e.group.selection_type === "multiple" ? e.group.min_selections && e.group.max_selections ? e.group.min_selections === e.group.max_selections ? `Select exactly ${e.group.min_selections}` : `Select ${e.group.min_selections}-${e.group.max_selections}` : e.group.min_selections ? `Select at least ${e.group.min_selections}` : e.group.max_selections ? `Select up to ${e.group.max_selections}` : "Select multiple" : "";
  }
  let _ = Me(d());
  Ii(() => {
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
  function v(P) {
    const Z = r()[P.id] > 0, L = n().length === 0 || n().includes(P.id), E = b(P);
    return {
      selected: Z,
      available: L,
      disabled: E,
      quantity: r()[P.id] || 0
    };
  }
  var p = fa();
  let w;
  var D = a(p);
  D.__click = function(...P) {
    e.onToggle?.apply(this, P);
  };
  var M = a(D), A = a(M), x = a(A), T = c(x);
  {
    var I = (P) => {
      var Z = oa();
      f(P, Z);
    };
    m(T, (P) => {
      e.group.required && P(I);
    });
  }
  var C = c(A, 2);
  {
    var se = (P) => {
      var Z = la(), L = a(Z);
      k(() => y(L, e.group.description)), f(P, Z);
    };
    m(C, (P) => {
      e.group.description && typeof e.group.description == "string" && !e.group.description.includes("=>") && !e.group.description.includes("function") && !e.group.description.includes("$props") && P(se);
    });
  }
  var re = c(M, 2), ne = a(re), Te = a(ne), Ae = a(Te), V = c(Te, 2);
  {
    var G = (P) => {
      var Z = va(), L = a(Z), E = c(L);
      {
        var R = (ve) => {
          var B = wt();
          k(() => y(B, `(${o(u) ?? ""} total)`)), f(ve, B);
        };
        m(E, (ve) => {
          o(u) > o(l) && ve(R);
        });
      }
      k(() => y(L, `${o(l) ?? ""} selected `)), f(P, Z);
    };
    m(V, (P) => {
      o(l) > 0 && P(G);
    });
  }
  var _e = c(ne, 2), Ve = a(_e);
  let ue;
  var we = c(D, 2);
  {
    var Oe = (P) => {
      var Z = da(), L = a(Z);
      {
        var E = (ve) => {
          var B = ca();
          ze(B, 21, i, (Q) => Q.id, (Q, me) => {
            const Re = /* @__PURE__ */ ye(() => v(o(me))), Le = /* @__PURE__ */ ye(() => o(me).max_quantity || 10);
            aa(Q, {
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
              onChange: (rt) => S(o(me).id, rt)
            });
          }), k(() => ht(B, "data-selection-type", e.group.selection_type)), f(ve, B);
        }, R = (ve) => {
          var B = ua();
          f(ve, B);
        };
        m(L, (ve) => {
          Array.isArray(i()) && i().length > 0 ? ve(E) : ve(R, !1);
        });
      }
      f(P, Z);
    };
    m(we, (P) => {
      s() && P(Oe);
    });
  }
  k(
    (P, Z, L) => {
      w = xe(p, 1, "option-group svelte-99mz6y", null, w, P), y(x, `${e.group.name || "Unnamed Group"} `), y(Ae, Z), ht(_e, "aria-label", s() ? "Collapse" : "Expand"), ue = xe(Ve, 0, "icon svelte-99mz6y", null, ue, L);
    },
    [
      () => ({
        expanded: s(),
        required: e.group.required
      }),
      () => Yr(_, e.group.selection_type === "single" ? "Select one" : "Select multiple"),
      () => ({ rotated: !s() })
    ]
  ), f(t, p), Xe();
}
gt(["click"]);
var ha = /* @__PURE__ */ h('<div class="pricing-empty svelte-hgfbko"><p>Add options to see pricing</p></div>'), ga = /* @__PURE__ */ h('<div class="summary-row savings svelte-hgfbko"><span class="label">Total Savings</span> <span class="amount"> </span></div>'), pa = (t, e) => U(e, !o(e)), ma = /* @__PURE__ */ h('<button class="toggle-btn svelte-hgfbko"> <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M4.646 6.646a.5.5 0 01.708 0L8 9.293l2.646-2.647a.5.5 0 01.708.708l-3 3a.5.5 0 01-.708 0l-3-3a.5.5 0 010-.708z"></path></svg></button>'), ba = /* @__PURE__ */ h('<span class="item-quantity svelte-hgfbko"> </span>'), ya = /* @__PURE__ */ h('<div class="line-item svelte-hgfbko"><div class="item-details svelte-hgfbko"><span class="item-name svelte-hgfbko"> </span> <!></div> <span class="item-price svelte-hgfbko"> </span></div>'), wa = /* @__PURE__ */ h('<div class="option-group svelte-hgfbko"></div>'), Sa = /* @__PURE__ */ h('<div class="pricing-section svelte-hgfbko"><h4 class="section-title svelte-hgfbko">Selected Options</h4> <!> <div class="line-item subtotal svelte-hgfbko"><span class="item-name svelte-hgfbko">Options Subtotal</span> <span class="item-price svelte-hgfbko"> </span></div></div>'), xa = (t, e) => U(e, !o(e)), ka = /* @__PURE__ */ h('<span class="item-description svelte-hgfbko"> </span>'), Ea = /* @__PURE__ */ h('<div class="line-item discount svelte-hgfbko"><div class="item-details svelte-hgfbko"><span class="item-name svelte-hgfbko"> </span> <!></div> <span class="item-price discount-amount svelte-hgfbko"> </span></div>'), Aa = /* @__PURE__ */ h('<div class="pricing-section svelte-hgfbko"><h4 class="section-title svelte-hgfbko">Discounts Applied <button class="toggle-discounts svelte-hgfbko"> </button></h4> <!></div>'), Ca = /* @__PURE__ */ h('<span class="active-badge svelte-hgfbko">Active</span>'), Ia = /* @__PURE__ */ h('<div><div class="tier-range svelte-hgfbko"> <!> units</div> <div class="tier-discount svelte-hgfbko"> <!></div></div>'), Ta = /* @__PURE__ */ h('<div class="pricing-section svelte-hgfbko"><h4 class="section-title svelte-hgfbko">Volume Pricing Tiers</h4> <div class="volume-tiers svelte-hgfbko"></div></div>'), Pa = /* @__PURE__ */ h('<div class="line-item small svelte-hgfbko"><span class="item-name svelte-hgfbko"> </span> <span class="item-price svelte-hgfbko"> </span></div>'), Oa = /* @__PURE__ */ h('<div class="pricing-section svelte-hgfbko"><h4 class="section-title svelte-hgfbko">Detailed Breakdown</h4> <div class="breakdown-items svelte-hgfbko"></div></div>'), Da = /* @__PURE__ */ h('<div class="pricing-section svelte-hgfbko"><h4 class="section-title svelte-hgfbko">Base Configuration</h4> <div class="line-item svelte-hgfbko"><span class="item-name svelte-hgfbko">Base Model Price</span> <span class="item-price svelte-hgfbko"> </span></div></div> <!> <!> <!> <!>', 1), qa = /* @__PURE__ */ h('<div class="currency-note svelte-hgfbko"> </div>'), Ra = /* @__PURE__ */ h('<div class="pricing-summary svelte-hgfbko"><div class="summary-row total svelte-hgfbko"><span class="label">Total Price</span> <span class="amount"> </span></div> <!> <!></div> <!> <div class="pricing-footer svelte-hgfbko"><div class="final-total svelte-hgfbko"><span class="label">Total</span> <span class="amount"> </span></div> <!></div>', 1), Ma = /* @__PURE__ */ h("<div><!></div>");
function Va(t, e) {
  Ze(e, !0);
  let i = te(e, "selections", 19, () => ({})), r = te(e, "options", 19, () => []), n = te(e, "volumeTiers", 19, () => []), s = te(e, "detailed", 3, !1), l = /* @__PURE__ */ Y(Me(s())), u = /* @__PURE__ */ Y(!0);
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
  }), v = /* @__PURE__ */ ye(() => () => {
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
  var p = Ma();
  let w;
  var D = a(p);
  {
    var M = (x) => {
      var T = ha();
      f(x, T);
    }, A = (x) => {
      var T = Ra(), I = He(T), C = a(I), se = c(a(C), 2), re = a(se), ne = c(C, 2);
      {
        var Te = (L) => {
          var E = ga(), R = c(a(E), 2), ve = a(R);
          k((B) => y(ve, `-${B ?? ""} (${o(b) ?? ""}%)`), [() => _(o(S))]), f(L, E);
        };
        m(ne, (L) => {
          o(S) > 0 && L(Te);
        });
      }
      var Ae = c(ne, 2);
      {
        var V = (L) => {
          var E = ma();
          E.__click = [pa, l];
          var R = a(E), ve = c(R);
          let B;
          k(
            (Q) => {
              y(R, `${o(l) ? "Hide" : "Show"} Breakdown `), B = xe(ve, 0, "chevron svelte-hgfbko", null, B, Q);
            },
            [() => ({ rotated: o(l) })]
          ), f(L, E);
        };
        m(Ae, (L) => {
          s() && L(V);
        });
      }
      var G = c(I, 2);
      {
        var _e = (L) => {
          var E = Da(), R = He(E), ve = c(a(R), 2), B = c(a(ve), 2), Q = a(B), me = c(R, 2);
          {
            var Re = (ae) => {
              var De = Sa(), O = c(a(De), 2);
              ze(O, 17, () => o(v), je, (Pe, z) => {
                var K = /* @__PURE__ */ ye(() => Ni(o(z), 2));
                let F = () => o(K)[1];
                var H = wa();
                ze(H, 21, F, je, (X, oe) => {
                  let q = () => o(oe).option, W = () => o(oe).quantity, de = () => o(oe).lineTotal;
                  var Se = ya(), $ = a(Se), le = a($), he = a(le), J = c(le, 2);
                  {
                    var ie = (ee) => {
                      var fe = ba(), Ne = a(fe);
                      k(($e) => y(Ne, `×${W() ?? ""} @ ${$e ?? ""} each`), [() => _(q().price)]), f(ee, fe);
                    };
                    m(J, (ee) => {
                      W() > 1 && ee(ie);
                    });
                  }
                  var ge = c($, 2), pe = a(ge);
                  k(
                    (ee) => {
                      y(he, q().name), y(pe, ee);
                    },
                    [() => _(de())]
                  ), f(X, Se);
                }), f(Pe, H);
              });
              var j = c(O, 2), ce = c(a(j), 2), be = a(ce);
              k((Pe) => y(be, Pe), [
                () => _(e.pricingData.options_total || 0)
              ]), f(ae, De);
            };
            m(me, (ae) => {
              o(v).length > 0 && ae(Re);
            });
          }
          var Le = c(me, 2);
          {
            var rt = (ae) => {
              var De = Aa(), O = a(De), j = c(a(O));
              j.__click = [xa, u];
              var ce = a(j), be = c(O, 2);
              {
                var Pe = (z) => {
                  var K = at(), F = He(K);
                  ze(F, 17, () => e.pricingData.discounts, je, (H, X) => {
                    var oe = Ea(), q = a(oe), W = a(q), de = a(W), Se = c(W, 2);
                    {
                      var $ = (J) => {
                        var ie = ka(), ge = a(ie);
                        k(() => y(ge, o(X).description)), f(J, ie);
                      };
                      m(Se, (J) => {
                        o(X).description && J($);
                      });
                    }
                    var le = c(q, 2), he = a(le);
                    k(
                      (J) => {
                        y(de, o(X).name), y(he, `-${J ?? ""}`);
                      },
                      [
                        () => _(o(X).amount)
                      ]
                    ), f(H, oe);
                  }), f(z, K);
                };
                m(be, (z) => {
                  o(u) && z(Pe);
                });
              }
              k(() => y(ce, o(u) ? "Hide" : "Show")), f(ae, De);
            };
            m(Le, (ae) => {
              e.pricingData.discounts?.length > 0 && ae(rt);
            });
          }
          var nt = c(Le, 2);
          {
            var pt = (ae) => {
              var De = Ta(), O = c(a(De), 2);
              ze(O, 21, n, je, (j, ce) => {
                var be = Ia();
                const Pe = /* @__PURE__ */ ye(() => e.pricingData.active_tier?.id === o(ce).id);
                let z;
                var K = a(be), F = a(K), H = c(F);
                {
                  var X = ($) => {
                    var le = wt();
                    k(() => y(le, `- ${o(ce).max_quantity ?? ""}`)), f($, le);
                  }, oe = ($) => {
                    var le = wt("+");
                    f($, le);
                  };
                  m(H, ($) => {
                    o(ce).max_quantity ? $(X) : $(oe, !1);
                  });
                }
                var q = c(K, 2), W = a(q), de = c(W);
                {
                  var Se = ($) => {
                    var le = Ca();
                    f($, le);
                  };
                  m(de, ($) => {
                    o(Pe) && $(Se);
                  });
                }
                k(
                  ($) => {
                    z = xe(be, 1, "tier-item svelte-hgfbko", null, z, $), y(F, `${o(ce).min_quantity ?? ""} `), y(W, `${o(ce).discount_percent ?? ""}% off `);
                  },
                  [() => ({ active: o(Pe) })]
                ), f(j, be);
              }), f(ae, De);
            };
            m(nt, (ae) => {
              n().length > 0 && s() && ae(pt);
            });
          }
          var ut = c(nt, 2);
          {
            var qe = (ae) => {
              var De = Oa(), O = c(a(De), 2);
              ze(O, 21, () => e.pricingData.breakdown, je, (j, ce) => {
                var be = Pa(), Pe = a(be), z = a(Pe), K = c(Pe, 2), F = a(K);
                k(
                  (H) => {
                    y(z, o(ce).name), y(F, H);
                  },
                  [() => _(o(ce).amount)]
                ), f(j, be);
              }), f(ae, De);
            };
            m(ut, (ae) => {
              e.pricingData.breakdown && s() && ae(qe);
            });
          }
          k((ae) => y(Q, ae), [
            () => _(e.pricingData.base_price)
          ]), f(L, E);
        };
        m(G, (L) => {
          o(l) && L(_e);
        });
      }
      var Ve = c(G, 2), ue = a(Ve), we = c(a(ue), 2), Oe = a(we), P = c(ue, 2);
      {
        var Z = (L) => {
          var E = qa(), R = a(E);
          k(() => y(R, `Prices shown in ${e.pricingData.currency ?? ""}`)), f(L, E);
        };
        m(P, (L) => {
          e.pricingData.currency && e.pricingData.currency !== "USD" && L(Z);
        });
      }
      k(
        (L, E) => {
          y(re, L), y(Oe, E);
        },
        [
          () => _(e.pricingData.total_price),
          () => _(e.pricingData.total_price)
        ]
      ), f(x, T);
    };
    m(D, (x) => {
      e.pricingData ? x(A, !1) : x(M);
    });
  }
  k((x) => w = xe(p, 1, "pricing-display svelte-hgfbko", null, w, x), [() => ({ detailed: s() })]), f(t, p), Xe();
}
gt(["click"]);
var La = /* @__PURE__ */ h('<div class="validation-success svelte-5l87sd"><div class="success-icon svelte-5l87sd">✅</div> <div class="success-content svelte-5l87sd"><h3 class="svelte-5l87sd">Configuration Valid</h3> <p class="svelte-5l87sd">All constraints are satisfied. Your configuration is ready.</p></div></div>'), Na = (t, e) => U(e, "all"), za = (t, e) => U(e, "critical"), Fa = /* @__PURE__ */ h("<button> </button>"), Ua = (t, e) => U(e, "warning"), Ga = /* @__PURE__ */ h("<button> </button>"), ja = (t, e) => U(e, "info"), Ba = /* @__PURE__ */ h("<button> </button>"), Ha = /* @__PURE__ */ h('<div class="validation-header svelte-5l87sd"><h3 class="svelte-5l87sd"> </h3> <div class="severity-filters svelte-5l87sd"><button> </button> <!> <!> <!></div></div>'), Ya = /* @__PURE__ */ h('<div class="violation-rule svelte-5l87sd"> </div>'), Qa = (t, e, i) => {
  t.stopPropagation(), e(o(i));
}, Ka = /* @__PURE__ */ h('<button class="fix-btn svelte-5l87sd" title="Apply suggested fix">Fix</button>'), Wa = /* @__PURE__ */ h('<div class="detail-section svelte-5l87sd"><h4 class="svelte-5l87sd">Details</h4> <p class="svelte-5l87sd"> </p></div>'), Ja = /* @__PURE__ */ h("<li> </li>"), Za = /* @__PURE__ */ h('<div class="detail-section svelte-5l87sd"><h4 class="svelte-5l87sd">Affected Options</h4> <ul class="affected-list svelte-5l87sd"></ul></div>'), Xa = /* @__PURE__ */ h(" <!>", 1), $a = (t, e, i) => e.onFix(o(i)), eo = /* @__PURE__ */ h('<button class="apply-btn svelte-5l87sd">Apply</button>'), to = /* @__PURE__ */ h('<div class="suggestion svelte-5l87sd"><span class="suggestion-text"><!></span> <!></div>'), io = /* @__PURE__ */ h('<div class="detail-section svelte-5l87sd"><h4 class="svelte-5l87sd">Suggested Actions</h4> <div class="suggestions svelte-5l87sd"></div></div>'), ro = /* @__PURE__ */ h('<div class="detail-section svelte-5l87sd"><h4 class="svelte-5l87sd">Rule Expression</h4> <code class="expression svelte-5l87sd"> </code></div>'), no = /* @__PURE__ */ h('<div class="violation-details svelte-5l87sd"><!> <!> <!> <!></div>'), so = /* @__PURE__ */ h('<div><div class="violation-header svelte-5l87sd"><div class="violation-icon svelte-5l87sd"> </div> <div class="violation-content svelte-5l87sd"><div class="violation-message svelte-5l87sd"> </div> <!></div> <div class="violation-actions svelte-5l87sd"><!> <button class="expand-btn svelte-5l87sd"><svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M4.646 6.646a.5.5 0 01.708 0L8 9.293l2.646-2.647a.5.5 0 01.708.708l-3 3a.5.5 0 01-.708 0l-3-3a.5.5 0 010-.708z"></path></svg></button></div></div> <!></div>'), ao = /* @__PURE__ */ h('<!> <div class="violations-list svelte-5l87sd"></div>', 1), oo = /* @__PURE__ */ h('<div class="validation-empty svelte-5l87sd"><p>Validating configuration...</p></div>'), lo = /* @__PURE__ */ h("<div><!></div>");
function _r(t, e) {
  Ze(e, !0);
  let i = te(e, "compact", 3, !1), r = /* @__PURE__ */ Y(Me(/* @__PURE__ */ new Set())), n = /* @__PURE__ */ Y("all"), s = /* @__PURE__ */ ye(() => e.validationResults?.violations || []), l = /* @__PURE__ */ ye(() => () => o(n) === "all" ? o(s) : o(s).filter((A) => A.severity === o(n))), u = /* @__PURE__ */ ye(() => () => {
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
  var v = lo();
  let p;
  var w = a(v);
  {
    var D = (A) => {
      var x = La();
      f(A, x);
    }, M = (A, x) => {
      {
        var T = (C) => {
          var se = ao(), re = He(se);
          {
            var ne = (Ae) => {
              var V = Ha(), G = a(V), _e = a(G), Ve = c(G, 2), ue = a(Ve);
              let we;
              ue.__click = [Na, n];
              var Oe = a(ue), P = c(ue, 2);
              {
                var Z = (B) => {
                  var Q = Fa();
                  let me;
                  Q.__click = [za, n];
                  var Re = a(Q);
                  k(
                    (Le) => {
                      me = xe(Q, 1, "filter-btn critical svelte-5l87sd", null, me, Le), y(Re, `Critical (${o(u).critical ?? ""})`);
                    },
                    [
                      () => ({
                        active: o(n) === "critical"
                      })
                    ]
                  ), f(B, Q);
                };
                m(P, (B) => {
                  o(u).critical > 0 && B(Z);
                });
              }
              var L = c(P, 2);
              {
                var E = (B) => {
                  var Q = Ga();
                  let me;
                  Q.__click = [Ua, n];
                  var Re = a(Q);
                  k(
                    (Le) => {
                      me = xe(Q, 1, "filter-btn warning svelte-5l87sd", null, me, Le), y(Re, `Warning (${o(u).warning ?? ""})`);
                    },
                    [
                      () => ({
                        active: o(n) === "warning"
                      })
                    ]
                  ), f(B, Q);
                };
                m(L, (B) => {
                  o(u).warning > 0 && B(E);
                });
              }
              var R = c(L, 2);
              {
                var ve = (B) => {
                  var Q = Ba();
                  let me;
                  Q.__click = [ja, n];
                  var Re = a(Q);
                  k(
                    (Le) => {
                      me = xe(Q, 1, "filter-btn info svelte-5l87sd", null, me, Le), y(Re, `Info (${o(u).info ?? ""})`);
                    },
                    [
                      () => ({ active: o(n) === "info" })
                    ]
                  ), f(B, Q);
                };
                m(R, (B) => {
                  o(u).info > 0 && B(ve);
                });
              }
              k(
                (B) => {
                  y(_e, `Validation Issues (${o(s).length ?? ""})`), we = xe(ue, 1, "filter-btn svelte-5l87sd", null, we, B), y(Oe, `All (${o(s).length ?? ""})`);
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
          var Te = c(re, 2);
          ze(Te, 21, () => o(l), je, (Ae, V, G) => {
            var _e = so();
            const Ve = /* @__PURE__ */ ye(() => o(r).has(o(V).rule_id || G)), ue = /* @__PURE__ */ ye(() => S(o(V).severity));
            let we;
            var Oe = a(_e);
            Oe.__click = () => d(o(V).rule_id || G);
            var P = a(Oe), Z = a(P), L = c(P, 2), E = a(L), R = a(E), ve = c(E, 2);
            {
              var B = (qe) => {
                var ae = Ya(), De = a(ae);
                k(() => y(De, `Rule: ${o(V).rule_name ?? ""}`)), f(qe, ae);
              };
              m(ve, (qe) => {
                o(V).rule_name && !i() && qe(B);
              });
            }
            var Q = c(L, 2), me = a(Q);
            {
              var Re = (qe) => {
                var ae = Ka();
                ae.__click = [Qa, b, V], f(qe, ae);
              };
              m(me, (qe) => {
                o(V).suggestions?.length > 0 && e.onFix && qe(Re);
              });
            }
            var Le = c(me, 2), rt = a(Le);
            let nt;
            var pt = c(Oe, 2);
            {
              var ut = (qe) => {
                var ae = no(), De = a(ae);
                {
                  var O = (F) => {
                    var H = Wa(), X = c(a(H), 2), oe = a(X);
                    k(() => y(oe, o(V).details)), f(F, H);
                  };
                  m(De, (F) => {
                    o(V).details && F(O);
                  });
                }
                var j = c(De, 2);
                {
                  var ce = (F) => {
                    var H = Za(), X = c(a(H), 2);
                    ze(X, 21, () => o(V).affected_options, je, (oe, q) => {
                      var W = Ja(), de = a(W);
                      k(() => y(de, o(q).name || o(q).id)), f(oe, W);
                    }), f(F, H);
                  };
                  m(j, (F) => {
                    o(V).affected_options?.length > 0 && F(ce);
                  });
                }
                var be = c(j, 2);
                {
                  var Pe = (F) => {
                    var H = io(), X = c(a(H), 2);
                    ze(X, 21, () => o(V).suggestions, je, (oe, q) => {
                      var W = to(), de = a(W), Se = a(de);
                      {
                        var $ = (ie) => {
                          var ge = Xa(), pe = He(ge), ee = c(pe);
                          {
                            var fe = (Ne) => {
                              var $e = wt();
                              k(() => y($e, `(×${o(q).quantity ?? ""})`)), f(Ne, $e);
                            };
                            m(ee, (Ne) => {
                              o(q).quantity > 1 && Ne(fe);
                            });
                          }
                          k(() => y(pe, `Add: ${(o(q).option_name || o(q).option_id) ?? ""} `)), f(ie, ge);
                        }, le = (ie, ge) => {
                          {
                            var pe = (fe) => {
                              var Ne = wt();
                              k(() => y(Ne, `Remove: ${(o(q).option_name || o(q).option_id) ?? ""}`)), f(fe, Ne);
                            }, ee = (fe, Ne) => {
                              {
                                var $e = (st) => {
                                  var mt = wt();
                                  k(() => y(mt, `Change: ${o(q).description ?? ""}`)), f(st, mt);
                                }, Pi = (st) => {
                                  var mt = wt();
                                  k(() => y(mt, o(q).description)), f(st, mt);
                                };
                                m(
                                  fe,
                                  (st) => {
                                    o(q).action === "change" ? st($e) : st(Pi, !1);
                                  },
                                  Ne
                                );
                              }
                            };
                            m(
                              ie,
                              (fe) => {
                                o(q).action === "remove" ? fe(pe) : fe(ee, !1);
                              },
                              ge
                            );
                          }
                        };
                        m(Se, (ie) => {
                          o(q).action === "add" ? ie($) : ie(le, !1);
                        });
                      }
                      var he = c(de, 2);
                      {
                        var J = (ie) => {
                          var ge = eo();
                          ge.__click = [$a, e, q], f(ie, ge);
                        };
                        m(he, (ie) => {
                          e.onFix && ie(J);
                        });
                      }
                      f(oe, W);
                    }), f(F, H);
                  };
                  m(be, (F) => {
                    o(V).suggestions?.length > 0 && F(Pe);
                  });
                }
                var z = c(be, 2);
                {
                  var K = (F) => {
                    var H = ro(), X = c(a(H), 2), oe = a(X);
                    k(() => y(oe, o(V).rule_expression)), f(F, H);
                  };
                  m(z, (F) => {
                    o(V).rule_expression && !i() && F(K);
                  });
                }
                f(qe, ae);
              };
              m(pt, (qe) => {
                o(Ve) && qe(ut);
              });
            }
            k(
              (qe, ae, De) => {
                we = xe(_e, 1, `violation-item ${o(ue) ?? ""}`, "svelte-5l87sd", we, qe), y(Z, ae), y(R, o(V).message), ht(Le, "aria-label", o(Ve) ? "Collapse" : "Expand"), nt = xe(rt, 0, "chevron svelte-5l87sd", null, nt, De);
              },
              [
                () => ({ expanded: o(Ve) }),
                () => _(o(V).severity),
                () => ({ rotated: o(Ve) })
              ]
            ), f(Ae, _e);
          }), f(C, se);
        }, I = (C) => {
          var se = oo();
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
      e.validationResults?.is_valid ? A(D) : A(M, !1);
    });
  }
  k((A) => p = xe(v, 1, "validation-display svelte-5l87sd", null, p, A), [() => ({ compact: i() })]), f(t, v), Xe();
}
gt(["click"]);
var vo = /* @__PURE__ */ h('<span class="status-badge valid svelte-onht75">✅ Valid</span>'), co = /* @__PURE__ */ h('<span class="status-badge invalid svelte-onht75">⚠️ Issues</span>'), uo = (t, e) => e.onEdit(0), fo = /* @__PURE__ */ h('<button class="edit-btn svelte-onht75">Edit Selections</button>'), _o = /* @__PURE__ */ h('<span class="item-quantity svelte-onht75"> </span>'), ho = /* @__PURE__ */ h('<div class="selection-item svelte-onht75"><div class="item-info svelte-onht75"><span class="item-name svelte-onht75"> </span> <!></div> <span class="item-price svelte-onht75"> </span></div>'), go = /* @__PURE__ */ h('<div class="selection-group svelte-onht75"><h5 class="group-name svelte-onht75"> </h5> <div class="group-items svelte-onht75"></div></div>'), po = /* @__PURE__ */ h('<div class="selections-list svelte-onht75"></div>'), mo = /* @__PURE__ */ h('<p class="empty-message svelte-onht75">No options selected</p>'), bo = (t, e) => e.onEdit(1), yo = /* @__PURE__ */ h('<button class="edit-btn svelte-onht75">Review Issues</button>'), wo = /* @__PURE__ */ h('<div class="violation-summary svelte-onht75"><span class="violation-icon svelte-onht75"> </span> <span class="violation-text svelte-onht75"> </span></div>'), So = /* @__PURE__ */ h('<p class="more-violations svelte-onht75"> </p>'), xo = /* @__PURE__ */ h('<div class="summary-section svelte-onht75"><div class="section-header svelte-onht75"><h4 class="section-title validation-title svelte-onht75"> </h4> <!></div> <div class="violations-summary svelte-onht75"><!> <!></div></div>'), ko = (t, e) => e.onEdit(2), Eo = /* @__PURE__ */ h('<button class="edit-btn svelte-onht75">View Details</button>'), Ao = /* @__PURE__ */ h('<div class="price-line discount svelte-onht75"><span class="label">Discounts Applied</span> <span class="value"> </span></div>'), Co = () => window.print(), Io = /* @__PURE__ */ h('<div class="configuration-summary svelte-onht75"><div class="summary-header svelte-onht75"><div class="header-info svelte-onht75"><h3 class="svelte-onht75">Configuration Summary</h3> <p class="config-id svelte-onht75"> </p></div> <div class="header-status"><!></div></div> <div class="summary-section svelte-onht75"><h4 class="section-title svelte-onht75">Product Model</h4> <div class="info-grid svelte-onht75"><div class="info-item svelte-onht75"><span class="label svelte-onht75">Model</span> <span class="value svelte-onht75"> </span></div> <div class="info-item svelte-onht75"><span class="label svelte-onht75">Created</span> <span class="value svelte-onht75"> </span></div> <div class="info-item svelte-onht75"><span class="label svelte-onht75">Last Updated</span> <span class="value svelte-onht75"> </span></div></div></div> <div class="summary-section svelte-onht75"><div class="section-header svelte-onht75"><h4 class="section-title svelte-onht75"> </h4> <!></div> <!></div> <!> <div class="summary-section svelte-onht75"><div class="section-header svelte-onht75"><h4 class="section-title svelte-onht75">Pricing Summary</h4> <!></div> <div class="pricing-summary svelte-onht75"><div class="price-line svelte-onht75"><span class="label">Base Price</span> <span class="value"> </span></div> <!> <div class="price-line total svelte-onht75"><span class="label">Total Price</span> <span class="value"> </span></div></div></div> <div class="summary-actions svelte-onht75"><button class="action-btn secondary svelte-onht75"><svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M5 3V1h6v2H5zM4 3H2.5A1.5 1.5 0 001 4.5V10h2V8h10v2h2V4.5A1.5 1.5 0 0013.5 3H12v2H4V3zm9 7h-2v4H5v-4H3v4.5A1.5 1.5 0 004.5 16h7a1.5 1.5 0 001.5-1.5V10z"></path></svg> Print Summary</button> <button class="action-btn secondary svelte-onht75"><svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V2zm10-1H4a1 1 0 00-1 1v12a1 1 0 001 1h8a1 1 0 001-1V2a1 1 0 00-1-1z"></path><path d="M8 3.5a.5.5 0 01.5.5v4.793l1.146-1.147a.5.5 0 01.708.708l-2 2a.5.5 0 01-.708 0l-2-2a.5.5 0 11.708-.708L7.5 8.793V4a.5.5 0 01.5-.5z"></path></svg> Export Configuration</button></div></div>');
function To(t, e) {
  Ze(e, !0);
  function i(O) {
    return O ? new Date(O).toLocaleString() : "N/A";
  }
  function r(O) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(O || 0);
  }
  let n = /* @__PURE__ */ ye(() => () => {
    const O = /* @__PURE__ */ new Map();
    return Array.isArray(e.configuration?.selections) && e.configuration.selections.forEach((j) => {
      const ce = j.group_name || "Other Options";
      O.has(ce) || O.set(ce, []), O.get(ce).push(j);
    }), Array.from(O.entries());
  });
  var s = Io(), l = a(s), u = a(l), d = c(a(u), 2), _ = a(d), S = c(u, 2), b = a(S);
  {
    var v = (O) => {
      var j = vo();
      f(O, j);
    }, p = (O) => {
      var j = co();
      f(O, j);
    };
    m(b, (O) => {
      e.configuration?.validation?.is_valid ? O(v) : O(p, !1);
    });
  }
  var w = c(l, 2), D = c(a(w), 2), M = a(D), A = c(a(M), 2), x = a(A), T = c(M, 2), I = c(a(T), 2), C = a(I), se = c(T, 2), re = c(a(se), 2), ne = a(re), Te = c(w, 2), Ae = a(Te), V = a(Ae), G = a(V), _e = c(V, 2);
  {
    var Ve = (O) => {
      var j = fo();
      j.__click = [uo, e], f(O, j);
    };
    m(_e, (O) => {
      e.onEdit && O(Ve);
    });
  }
  var ue = c(Ae, 2);
  {
    var we = (O) => {
      var j = po();
      ze(j, 21, () => o(n), je, (ce, be) => {
        var Pe = /* @__PURE__ */ ye(() => Ni(o(be), 2));
        let z = () => o(Pe)[0], K = () => o(Pe)[1];
        var F = go(), H = a(F), X = a(H), oe = c(H, 2);
        ze(oe, 21, K, je, (q, W) => {
          var de = ho(), Se = a(de), $ = a(Se), le = a($), he = c($, 2);
          {
            var J = (pe) => {
              var ee = _o(), fe = a(ee);
              k(() => y(fe, `×${o(W).quantity ?? ""}`)), f(pe, ee);
            };
            m(he, (pe) => {
              o(W).quantity > 1 && pe(J);
            });
          }
          var ie = c(Se, 2), ge = a(ie);
          k(
            (pe) => {
              y(le, o(W).option_name), y(ge, pe);
            },
            [
              () => r(o(W).total_price)
            ]
          ), f(q, de);
        }), k(() => y(X, z())), f(ce, F);
      }), f(O, j);
    }, Oe = (O) => {
      var j = mo();
      f(O, j);
    };
    m(ue, (O) => {
      o(n).length > 0 ? O(we) : O(Oe, !1);
    });
  }
  var P = c(Te, 2);
  {
    var Z = (O) => {
      var j = xo(), ce = a(j), be = a(ce), Pe = a(be), z = c(be, 2);
      {
        var K = (q) => {
          var W = yo();
          W.__click = [bo, e], f(q, W);
        };
        m(z, (q) => {
          e.onEdit && q(K);
        });
      }
      var F = c(ce, 2), H = a(F);
      ze(H, 17, () => e.configuration.validation.violations.slice(0, 3), je, (q, W) => {
        var de = wo(), Se = a(de), $ = a(Se), le = c(Se, 2), he = a(le);
        k(() => {
          y($, o(W).severity === "critical" ? "🚫" : "⚠️"), y(he, o(W).message);
        }), f(q, de);
      });
      var X = c(H, 2);
      {
        var oe = (q) => {
          var W = So(), de = a(W);
          k(() => y(de, `+${e.configuration.validation.violations.length - 3} more issues`)), f(q, W);
        };
        m(X, (q) => {
          e.configuration.validation.violations.length > 3 && q(oe);
        });
      }
      k(() => y(Pe, `Validation Issues (${e.configuration.validation.violations.length ?? ""})`)), f(O, j);
    };
    m(P, (O) => {
      e.configuration?.validation?.violations?.length > 0 && O(Z);
    });
  }
  var L = c(P, 2), E = a(L), R = c(a(E), 2);
  {
    var ve = (O) => {
      var j = Eo();
      j.__click = [ko, e], f(O, j);
    };
    m(R, (O) => {
      e.onEdit && O(ve);
    });
  }
  var B = c(E, 2), Q = a(B), me = c(a(Q), 2), Re = a(me), Le = c(Q, 2);
  {
    var rt = (O) => {
      var j = Ao(), ce = c(a(j), 2), be = a(ce);
      k((Pe) => y(be, `-${Pe ?? ""}`), [
        () => r(e.configuration.pricing.discounts.reduce((Pe, z) => Pe + z.amount, 0))
      ]), f(O, j);
    };
    m(Le, (O) => {
      e.configuration?.pricing?.discounts?.length > 0 && O(rt);
    });
  }
  var nt = c(Le, 2), pt = c(a(nt), 2), ut = a(pt), qe = c(L, 2), ae = a(qe);
  ae.__click = [Co];
  var De = c(ae, 2);
  De.__click = () => {
    const O = JSON.stringify(e.configuration, null, 2), j = new Blob([O], { type: "application/json" }), ce = URL.createObjectURL(j), be = document.createElement("a");
    be.href = ce, be.download = `configuration-${e.configuration?.id || "draft"}.json`, be.click(), URL.revokeObjectURL(ce);
  }, k(
    (O, j, ce, be) => {
      y(_, `ID: ${e.configuration?.id || "Not saved"}`), y(x, e.configuration?.model_name || e.model?.name || "Unknown"), y(C, O), y(ne, j), y(G, `Selected Options (${(e.configuration?.selections?.length || 0) ?? ""})`), y(Re, ce), y(ut, be);
    },
    [
      () => i(e.configuration?.metadata?.created),
      () => i(e.configuration?.metadata?.updated),
      () => r(e.configuration?.pricing?.base_price),
      () => r(e.configuration?.pricing?.total_price)
    ]
  ), f(t, s), Xe();
}
gt(["click"]);
function Po(t, e) {
  U(e, !o(e));
}
var Oo = /* @__PURE__ */ h('<div class="loading-container svelte-7b7116"><!></div>'), Do = () => location.reload(), qo = /* @__PURE__ */ h('<div class="error-container svelte-7b7116"><div class="error-content svelte-7b7116"><div class="error-icon svelte-7b7116">⚠️</div> <h2>Configuration Error</h2> <p> </p> <button class="btn btn-primary svelte-7b7116">Reload Page</button></div></div>'), Ro = /* @__PURE__ */ h('<p class="model-description svelte-7b7116"> </p>'), Mo = /* @__PURE__ */ h('<button class="validation-indicator warning svelte-7b7116" title="View validation issues"> </button>'), Vo = /* @__PURE__ */ h('<span class="save-indicator svelte-7b7116"><!> Saving...</span>'), Lo = /* @__PURE__ */ h('<span class="save-indicator saved svelte-7b7116"> </span>'), No = /* @__PURE__ */ h('<div class="groups-container svelte-7b7116"></div>'), zo = /* @__PURE__ */ h('<div class="loading-state svelte-7b7116"><!></div>'), Fo = /* @__PURE__ */ h('<div class="empty-state svelte-7b7116"><p>No option groups available for this model.</p></div>'), Uo = /* @__PURE__ */ h('<span class="progress-text svelte-7b7116"> </span>'), Go = /* @__PURE__ */ h('<div class="configuration-step"><div class="step-header svelte-7b7116"><h2 class="svelte-7b7116">Select Your Options</h2> <p class="svelte-7b7116">Choose from the available options below. Required selections are marked with *</p></div> <!> <div class="step-actions svelte-7b7116"><div class="selection-summary svelte-7b7116"><span> </span> <!></div> <button class="btn btn-primary svelte-7b7116">Continue to Validation</button></div></div>'), jo = /* @__PURE__ */ h('<div class="validation-loading"><!></div>'), Bo = /* @__PURE__ */ h('<div class="validation-step"><div class="step-header svelte-7b7116"><h2 class="svelte-7b7116">Configuration Validation</h2> <p class="svelte-7b7116">Review and resolve any configuration issues</p></div> <!> <!> <div class="step-actions svelte-7b7116"><button class="btn btn-secondary svelte-7b7116">Back</button> <button class="btn btn-primary svelte-7b7116"> </button></div></div>'), Ho = /* @__PURE__ */ h('<div class="pricing-loading"><!></div>'), Yo = /* @__PURE__ */ h('<div class="pricing-step"><div class="step-header svelte-7b7116"><h2 class="svelte-7b7116">Pricing Details</h2> <p class="svelte-7b7116">Review your configuration pricing</p></div> <!> <!> <div class="step-actions svelte-7b7116"><button class="btn btn-secondary svelte-7b7116">Back</button> <button class="btn btn-primary svelte-7b7116">Continue to Summary</button></div></div>'), Qo = /* @__PURE__ */ h('<div class="summary-step"><div class="step-header svelte-7b7116"><h2 class="svelte-7b7116">Configuration Summary</h2> <p class="svelte-7b7116">Review your complete configuration</p></div> <!> <div class="step-actions svelte-7b7116"><button class="btn btn-secondary svelte-7b7116">Back</button> <button class="btn btn-success svelte-7b7116"> </button></div></div>'), Ko = (t, e) => U(e, !1), Wo = /* @__PURE__ */ h('<div><div class="panel-header svelte-7b7116"><h3 class="svelte-7b7116">Validation Issues</h3> <button class="close-btn svelte-7b7116">×</button></div> <!></div>'), Jo = /* @__PURE__ */ h('<div class="summary-item discount svelte-7b7116"><span>Discounts Applied</span> <strong class="svelte-7b7116"> </strong></div>'), Zo = /* @__PURE__ */ h('<div class="selected-item svelte-7b7116"><span class="item-name"> </span> <span class="item-quantity svelte-7b7116"> </span></div>'), Xo = /* @__PURE__ */ h('<div class="sidebar-section svelte-7b7116"><h3 class="svelte-7b7116">Selected Items</h3> <div class="selected-items svelte-7b7116"></div></div>'), $o = /* @__PURE__ */ h('<aside class="configurator-sidebar svelte-7b7116"><div class="sidebar-section svelte-7b7116"><h3 class="svelte-7b7116">Quick Summary</h3> <div class="summary-item svelte-7b7116"><span>Selected Options</span> <strong class="svelte-7b7116"> </strong></div> <div class="summary-item svelte-7b7116"><span>Total Price</span> <strong class="price svelte-7b7116"> </strong></div> <!> <div class="summary-item status svelte-7b7116"><span>Status</span> <strong> </strong></div></div> <!></aside>'), el = /* @__PURE__ */ h('<div class="configurator-container svelte-7b7116"><header class="configurator-header svelte-7b7116"><div class="header-content svelte-7b7116"><h1 class="svelte-7b7116"> </h1> <!></div> <div class="header-actions svelte-7b7116"><!> <!></div></header> <!> <div class="configurator-content svelte-7b7116"><!></div> <!> <!></div>'), tl = /* @__PURE__ */ h("<div><!></div>");
function il(t, e) {
  Ze(e, !0);
  let i = te(e, "theme", 3, "light"), r = te(e, "apiUrl", 3, "/api/v1"), n = te(e, "embedMode", 3, !1), s = te(e, "onComplete", 3, null), l = te(e, "onConfigurationChange", 3, null), u = te(e, "onError", 3, null), d = te(e, "configurationId", 3, null);
  const _ = bs();
  let S = /* @__PURE__ */ Y(!1), b = /* @__PURE__ */ Y(!1), v = null;
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
  typeof window < "u" && (window.__API_BASE_URL__ = r()), Ii(async () => {
    await g.initialize(), g.setModelId(e.modelId), d() && await g.loadConfiguration(d()), U(S, !0), document.documentElement.setAttribute("data-theme", i()), v = setInterval(
      () => {
        g.isDirty && g.saveConfiguration();
      },
      3e4
    );
    const C = Ln(() => {
      yt(() => {
        l() && g.selectedCount > 0 && l()(g.exportConfiguration());
      }), yt(() => {
        u() && g.error && (u()(new Error(g.error)), _("error", { message: g.error }));
      });
    });
    return () => {
      C(), v && clearInterval(v);
    };
  }), ps(() => {
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
  function D() {
    g.canProceedToStep(g.currentStep + 1) ? g.nextStep() : g.currentStep === 0 && g.selectedCount === 0 ? g.error = "Please select at least one option" : g.currentStep === 1 && !g.isValid && (g.error = "Please resolve validation issues");
  }
  function M() {
    g.previousStep();
  }
  function A(C) {
    g.goToStep(C);
  }
  const x = g;
  var T = tl(), I = a(T);
  return Rs(I, {
    children: (C, se) => {
      var re = at(), ne = He(re);
      {
        var Te = (V) => {
          var G = Oo(), _e = a(G);
          ri(_e, {
            size: "large",
            message: "Loading configuration model..."
          }), f(V, G);
        }, Ae = (V, G) => {
          {
            var _e = (ue) => {
              var we = qo(), Oe = a(we), P = c(a(Oe), 4), Z = a(P), L = c(P, 2);
              L.__click = [Do], k(() => y(Z, g.error)), f(ue, we);
            }, Ve = (ue, we) => {
              {
                var Oe = (P) => {
                  var Z = el(), L = a(Z), E = a(L), R = a(E), ve = a(R), B = c(R, 2);
                  {
                    var Q = (z) => {
                      var K = Ro(), F = a(K);
                      k(() => y(F, g.model.description)), f(z, K);
                    };
                    m(B, (z) => {
                      g.model.description && z(Q);
                    });
                  }
                  var me = c(E, 2), Re = a(me);
                  {
                    var Le = (z) => {
                      var K = Mo();
                      K.__click = [Po, b];
                      var F = a(K);
                      k(() => y(F, `⚠️ ${(g.validationResults?.violations?.length || 0) ?? ""} Issues`)), f(z, K);
                    };
                    m(Re, (z) => {
                      g.hasViolations && z(Le);
                    });
                  }
                  var rt = c(Re, 2);
                  {
                    var nt = (z) => {
                      var K = Vo(), F = a(K);
                      ri(F, { size: "small" }), f(z, K);
                    }, pt = (z, K) => {
                      {
                        var F = (H) => {
                          var X = Lo(), oe = a(X);
                          k((q) => y(oe, `✅ Saved ${q ?? ""}`), [
                            () => new Date(g.lastSaved).toLocaleTimeString()
                          ]), f(H, X);
                        };
                        m(
                          z,
                          (H) => {
                            g.lastSaved && H(F);
                          },
                          K
                        );
                      }
                    };
                    m(rt, (z) => {
                      g.isSaving ? z(nt) : z(pt, !1);
                    });
                  }
                  var ut = c(L, 2);
                  Cs(ut, {
                    get steps() {
                      return p;
                    },
                    get currentStep() {
                      return g.currentStep;
                    },
                    onStepClick: A,
                    canNavigate: !0
                  });
                  var qe = c(ut, 2), ae = a(qe);
                  {
                    var De = (z) => {
                      var K = Go(), F = c(a(K), 2);
                      {
                        var H = (he) => {
                          var J = No();
                          ze(J, 21, () => g.safeGroups, (ie) => ie.id, (ie, ge) => {
                            const pe = /* @__PURE__ */ ye(() => g.safeOptions.filter((fe) => fe.group_id === o(ge).id)), ee = /* @__PURE__ */ ye(() => g.isGroupExpanded(o(ge).id));
                            _a(ie, {
                              get group() {
                                return o(ge);
                              },
                              get options() {
                                return o(pe);
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
                              onToggle: () => g.toggleGroup(o(ge).id)
                            });
                          }), f(he, J);
                        }, X = (he, J) => {
                          {
                            var ie = (pe) => {
                              var ee = zo(), fe = a(ee);
                              ri(fe, { size: "medium", message: "Loading options..." }), f(pe, ee);
                            }, ge = (pe) => {
                              var ee = Fo();
                              f(pe, ee);
                            };
                            m(
                              he,
                              (pe) => {
                                g.isLoading ? pe(ie) : pe(ge, !1);
                              },
                              J
                            );
                          }
                        };
                        m(F, (he) => {
                          g.safeGroups.length > 0 ? he(H) : he(X, !1);
                        });
                      }
                      var oe = c(F, 2), q = a(oe), W = a(q), de = a(W), Se = c(W, 2);
                      {
                        var $ = (he) => {
                          var J = Uo(), ie = a(J);
                          k((ge) => y(ie, `${ge ?? ""}% complete`), [() => Math.round(g.progress)]), f(he, J);
                        };
                        m(Se, (he) => {
                          g.progress > 0 && he($);
                        });
                      }
                      var le = c(q, 2);
                      le.__click = D, k(() => {
                        y(de, `${g.selectedCount ?? ""} options selected`), le.disabled = g.selectedCount === 0;
                      }), f(z, K);
                    }, O = (z, K) => {
                      {
                        var F = (X) => {
                          var oe = Bo(), q = c(a(oe), 2);
                          _r(q, {
                            get validationResults() {
                              return g.validationResults;
                            },
                            onFix: (J) => {
                              J.action === "add" ? g.updateSelection(J.option_id, J.quantity || 1) : J.action === "remove" && g.updateSelection(J.option_id, 0);
                            }
                          });
                          var W = c(q, 2);
                          {
                            var de = (J) => {
                              var ie = jo(), ge = a(ie);
                              ri(ge, {
                                size: "small",
                                message: "Validating configuration..."
                              }), f(J, ie);
                            };
                            m(W, (J) => {
                              g.isValidating && J(de);
                            });
                          }
                          var Se = c(W, 2), $ = a(Se);
                          $.__click = M;
                          var le = c($, 2);
                          le.__click = D;
                          var he = a(le);
                          k(() => {
                            le.disabled = !g.isValid, y(he, g.isValid ? "Continue to Pricing" : "Resolve Issues First");
                          }), f(X, oe);
                        }, H = (X, oe) => {
                          {
                            var q = (de) => {
                              var Se = Yo(), $ = c(a(Se), 2);
                              Va($, {
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
                              var le = c($, 2);
                              {
                                var he = (pe) => {
                                  var ee = Ho(), fe = a(ee);
                                  ri(fe, {
                                    size: "small",
                                    message: "Calculating pricing..."
                                  }), f(pe, ee);
                                };
                                m(le, (pe) => {
                                  g.isPricing && pe(he);
                                });
                              }
                              var J = c(le, 2), ie = a(J);
                              ie.__click = M;
                              var ge = c(ie, 2);
                              ge.__click = D, f(de, Se);
                            }, W = (de, Se) => {
                              {
                                var $ = (le) => {
                                  var he = Qo(), J = c(a(he), 2);
                                  const ie = /* @__PURE__ */ ye(() => g.exportConfiguration());
                                  To(J, {
                                    get configuration() {
                                      return o(ie);
                                    },
                                    get model() {
                                      return g.model;
                                    },
                                    onEdit: (Ne) => A(Ne)
                                  });
                                  var ge = c(J, 2), pe = a(ge);
                                  pe.__click = M;
                                  var ee = c(pe, 2);
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
                                g.currentStep === 2 ? de(q) : de(W, !1);
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
                          K
                        );
                      }
                    };
                    m(ae, (z) => {
                      g.currentStep === 0 ? z(De) : z(O, !1);
                    });
                  }
                  var j = c(qe, 2);
                  {
                    var ce = (z) => {
                      var K = Wo();
                      let F;
                      var H = a(K), X = c(a(H), 2);
                      X.__click = [Ko, b];
                      var oe = c(H, 2);
                      _r(oe, {
                        get validationResults() {
                          return g.validationResults;
                        },
                        compact: !0,
                        onFix: (q) => {
                          q.action === "add" ? g.updateSelection(q.option_id, q.quantity || 1) : q.action === "remove" && g.updateSelection(q.option_id, 0), U(b, !1);
                        }
                      }), k((q) => F = xe(K, 1, "validation-panel svelte-7b7116", null, F, q), [
                        () => ({ open: o(b) })
                      ]), f(z, K);
                    };
                    m(j, (z) => {
                      o(b) && g.hasViolations && z(ce);
                    });
                  }
                  var be = c(j, 2);
                  {
                    var Pe = (z) => {
                      var K = $o(), F = a(K), H = c(a(F), 2), X = c(a(H), 2), oe = a(X), q = c(H, 2), W = c(a(q), 2), de = a(W), Se = c(q, 2);
                      {
                        var $ = (ee) => {
                          var fe = Jo(), Ne = c(a(fe), 2), $e = a(Ne);
                          k(() => y($e, g.discounts.length)), f(ee, fe);
                        };
                        m(Se, (ee) => {
                          g.discounts.length > 0 && ee($);
                        });
                      }
                      var le = c(Se, 2), he = c(a(le), 2);
                      let J;
                      var ie = a(he), ge = c(F, 2);
                      {
                        var pe = (ee) => {
                          var fe = Xo(), Ne = c(a(fe), 2);
                          ze(Ne, 21, () => Object.entries(g.selections), je, ($e, Pi) => {
                            var st = /* @__PURE__ */ ye(() => Ni(o(Pi), 2));
                            let mt = () => o(st)[0], Ji = () => o(st)[1];
                            var Zi = at();
                            const Xi = /* @__PURE__ */ ye(() => g.safeOptions.find((ii) => ii.id === mt()));
                            var Wr = He(Zi);
                            {
                              var Jr = (ii) => {
                                var $i = Zo(), er = a($i), Zr = a(er), Xr = c(er, 2), $r = a(Xr);
                                k(() => {
                                  y(Zr, o(Xi).name), y($r, `×${Ji() ?? ""}`);
                                }), f(ii, $i);
                              };
                              m(Wr, (ii) => {
                                o(Xi) && Ji() > 0 && ii(Jr);
                              });
                            }
                            f($e, Zi);
                          }), f(ee, fe);
                        };
                        m(ge, (ee) => {
                          g.selectedCount > 0 && ee(pe);
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
                      ), f(z, K);
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
                    o(S) && g.model && P(Oe);
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
    xe(T, 1, `configurator-app ${n() ? "embed-mode" : "standalone-mode"}`, "svelte-7b7116"), ht(T, "data-theme", i());
  }), f(t, T), Xe({ store: x });
}
gt(["click"]);
const Ti = new URLSearchParams(window.location.search), bi = Ti.get("model") || window.location.pathname.split("/").pop(), Qr = Ti.get("theme") || "light", Kr = Ti.get("api") || window.__API_BASE_URL__ || "/api/v1", rl = Ti.get("config");
class nl {
  constructor() {
    this.parentOrigin = "*";
  }
  send(e, i) {
    window.parent !== window && window.parent.postMessage({
      type: `cpq:${e}`,
      ...i
    }, this.parentOrigin);
  }
  sendConfiguration(e) {
    this.send("configuration", { configuration: e });
  }
  sendComplete(e) {
    this.send("complete", { configuration: e });
  }
  sendError(e) {
    this.send("error", {
      error: {
        message: e.message || String(e),
        stack: e.stack
      }
    });
  }
  sendReady() {
    this.send("ready", {
      modelId: bi,
      version: "1.0.0"
    });
  }
  sendResize(e) {
    this.send("resize", { height: e });
  }
}
const et = new nl();
bi ? (ts(il, {
  target: document.body,
  props: {
    modelId: bi,
    theme: Qr,
    apiUrl: Kr,
    configurationId: rl,
    embedMode: !0,
    onComplete: (e) => {
      et.sendComplete(e);
    },
    onConfigurationChange: (e) => {
      et.sendConfiguration(e);
    },
    onError: (e) => {
      et.sendError(e);
    }
  }
}), new ResizeObserver((e) => {
  for (const i of e) {
    const r = i.contentRect.height;
    et.sendResize(r);
  }
}).observe(document.body), window.addEventListener("message", (e) => {
  const { data: i } = e;
  if (i.type === "cpq:command")
    switch (i.command) {
      case "reset":
        g.reset();
        break;
      case "next":
        g.nextStep();
        break;
      case "previous":
        g.previousStep();
        break;
      case "goToStep":
        i.step !== void 0 && g.goToStep(i.step);
        break;
      case "updateSelection":
        i.optionId && i.quantity !== void 0 && g.updateSelection(i.optionId, i.quantity);
        break;
      case "getConfiguration":
        et.sendConfiguration(g.exportConfiguration());
        break;
      case "validate":
        g.validateSelections().then(() => {
          et.send("validation", {
            results: g.validationResults
          });
        });
        break;
      case "calculatePricing":
        g.calculatePricing(i.context || {}).then(() => {
          et.send("pricing", {
            data: g.pricingData
          });
        });
        break;
    }
}), g.initialize().then(() => {
  et.sendReady();
})) : (document.body.innerHTML = `
    <div style="padding: 2rem; text-align: center; font-family: system-ui, sans-serif;">
      <h2 style="color: #dc2626;">Configuration Error</h2>
      <p style="color: #6b7280;">No model ID provided. Please specify a model parameter.</p>
    </div>
  `, et.sendError(new Error("No model ID provided")));
window.__CPQ_EMBED__ = {
  store: g,
  messenger: et,
  modelId: bi,
  theme: Qr,
  apiUrl: Kr
};
