;(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory)
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory()
  } else {
    root.speciesStore = factory()
  }
})(this, function () {
  return [
    { name: 'AT', minsuit: 97.5 },
    { name: 'BA', minsuit: 97.5 },
    { name: 'BG', minsuit: 98.5 },
    { name: 'BL', minsuit: 97.0 },
    { name: 'CW', minsuit: 98.0 },
    { name: 'DR', minsuit: 97.5 },
    { name: 'EP', minsuit: 97.5 },
    { name: 'FDC', minsuit: 97.5 },
    { name: 'FDI', minsuit: 97.5 },
    { name: 'HM', minsuit: 97.5 },
    { name: 'HW', minsuit: 97.5 },
    { name: 'LT', minsuit: 97.5 },
    { name: 'LW', minsuit: 97.5 },
    { name: 'PA', minsuit: 96.5 },
    { name: 'PJ', minsuit: 97.5 },
    { name: 'PLC', minsuit: 97.5 },
    { name: 'PLI', minsuit: 97.5 },
    { name: 'PW', minsuit: 96.0 },
    { name: 'PY', minsuit: 96.0 },
    { name: 'SB', minsuit: 97.5 },
    { name: 'SS', minsuit: 97.0 },
    { name: 'SX', minsuit: 97.5 },
    { name: 'SXS', minsuit: 97.5 },
    { name: 'YC', minsuit: 96.0 },
  ]
})
