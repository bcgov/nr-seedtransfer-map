const test = require('node:test')
const assert = require('node:assert')

// Expose a global define function to load the AMD module inside Node.js
let exportedModule
const mockSpeciesStore = require('../docs/scripts/speciesStore.js')
const mockBecStore = require('../docs/scripts/becStore.js')

globalThis.define = function (dependencies, factory) {
  if (typeof dependencies === 'function') {
    factory = dependencies
  }
  const mockFlatGeobuf = {
    deserialize: () => {}
  }
  exportedModule = factory(mockFlatGeobuf, mockSpeciesStore, mockBecStore)
}

// Load the target module
require('../docs/scripts/main.js')

const { getIntersection, updateData } = exportedModule

test('Unit Tests for main.js helpers', async (t) => {
  await t.test('getIntersection - 1 array', async () => {
    const input = [[{ BECvar_seed: 'A' }, { BECvar_seed: 'B' }]]
    const result = await getIntersection(input)
    assert.deepStrictEqual(result, [{ BECvar_seed: 'A' }, { BECvar_seed: 'B' }])
  })

  await t.test('getIntersection - 2 arrays intersecting', async () => {
    const input = [
      [{ BECvar_seed: 'A' }, { BECvar_seed: 'B' }, { BECvar_seed: 'C' }],
      [{ BECvar_seed: 'B' }, { BECvar_seed: 'C' }, { BECvar_seed: 'D' }],
    ]
    const result = await getIntersection(input)
    assert.deepStrictEqual(result, [{ BECvar_seed: 'B' }, { BECvar_seed: 'C' }])
  })

  await t.test('getIntersection - 3 arrays intersecting', async () => {
    const input = [
      [{ BECvar_seed: 'A' }, { BECvar_seed: 'B' }, { BECvar_seed: 'C' }],
      [{ BECvar_seed: 'B' }, { BECvar_seed: 'C' }, { BECvar_seed: 'D' }],
      [{ BECvar_seed: 'C' }, { BECvar_seed: 'E' }],
    ]
    const result = await getIntersection(input)
    assert.deepStrictEqual(result, [{ BECvar_seed: 'C' }])
  })

  await t.test('updateData - maps suitability text correctly', async () => {
    const data = [
      { Sp_suit_seed: '1', name: 'suitable item' },
      { Sp_suit_seed: '0', name: 'unsuitable item' },
      { Sp_suit_seed: 'anything else', name: 'other item' },
    ]
    const result = await updateData(data)
    assert.deepStrictEqual(result, [
      { Sp_suit_seed: 'Suitable', name: 'suitable item' },
      { Sp_suit_seed: 'Not Suitable', name: 'unsuitable item' },
      { Sp_suit_seed: 'Not Suitable', name: 'other item' },
    ])
    // Verify non-mutating behavior
    assert.strictEqual(data[0].Sp_suit_seed, '1')
    assert.strictEqual(data[1].Sp_suit_seed, '0')
    assert.strictEqual(data[2].Sp_suit_seed, 'anything else')
  })
})
