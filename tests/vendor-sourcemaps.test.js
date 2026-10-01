const test = require('node:test')
const assert = require('node:assert')
const fs = require('node:fs')
const path = require('node:path')

function listVendorSources(dir) {
  const files = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...listVendorSources(fullPath))
    } else if (entry.name.endsWith('.js') || entry.name.endsWith('.css')) {
      files.push(fullPath)
    }
  }
  return files
}

test('vendored libs do not reference missing source maps', () => {
  const root = path.join(__dirname, '..', 'docs', 'lib')
  const hits = listVendorSources(root).filter((file) =>
    fs.readFileSync(file, 'utf8').includes('sourceMappingURL'),
  )
  assert.deepStrictEqual(
    hits.map((file) => path.relative(root, file)),
    [],
  )
})
