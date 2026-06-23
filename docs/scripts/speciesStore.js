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
    { name: 'PLI', minsuit: 97.5 },
    { name: 'SX', minsuit: 97.5 },
  ]
})
