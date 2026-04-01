// bus.js — IslandOS Event Bus
const bus = { _h: {},
  on(e, fn)     { (this._h[e] ||= []).push(fn); },
  off(e, fn)    { this._h[e] = (this._h[e]||[]).filter(f => f !== fn); },
  emit(e, ...a) { (this._h[e]||[]).forEach(fn => fn(...a)); }
};
window.INSEL_BUS = bus;
