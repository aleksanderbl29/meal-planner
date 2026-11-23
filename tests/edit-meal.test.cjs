const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')

function load(file, dependencies, env = {}, globals = {}) {
  const exports = {}
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
  }).outputText
  vm.runInNewContext(source, {
    exports, require: (name) => {
      if (!(name in dependencies)) throw new Error(`Unexpected dependency: ${name}`)
      return dependencies[name]
    }, process: { env }, console: { error() {} }, ...globals,
  }, { filename: file })
  return exports
}

const original = { id: 'meal-1', name: 'Suppe', week: 42, year: 2026, isThisWeek: false, eaten: true }
const changed = { ...original, name: 'Pasta', week: 3, year: 2027 }

function storage(kv, configured = true) {
  return load('lib/storage.ts', { '@vercel/kv': { kv } }, configured
    ? { KV_REST_API_URL: 'https://example.invalid', KV_REST_API_TOKEN: 'test' } : {})
}

test('editing name, week and year survives a fresh storage read and preserves other meals', async () => {
  const other = { ...original, id: 'meal-2' }
  let rows = [original, other]
  const api = storage({ get: async () => structuredClone(rows), set: async (_, value) => { rows = structuredClone(value) } })
  await api.updateMeal(changed)
  assert.deepEqual(JSON.parse(JSON.stringify(await api.getMeals())), [changed, other])
})

test('editing rejects unavailable persistence, read/write failures and missing meals', async () => {
  await assert.rejects(storage({}, false).updateMeal(changed))
  await assert.rejects(storage({ get: async () => { throw Error('offline') } }).updateMeal(changed))
  await assert.rejects(storage({ get: async () => [original], set: async () => { throw Error('offline') } }).updateMeal(changed))
  await assert.rejects(storage({ get: async () => [], set: async () => assert.fail('must not write') }).updateMeal(changed))
})

test('edit action trims the name, validates fields, authenticates and revalidates only successful writes', async () => {
  let saved
  let revalidated = 0
  let userId = 'user-1'
  let writeFails = false
  const api = load('app/actions.ts', {
    zod: require('zod'),
    '@clerk/nextjs/server': { auth: async () => ({ userId }) },
    '@/lib/storage': { updateMeal: async (meal) => {
      if (writeFails) throw Error('offline')
      saved = meal
    } },
    'next/cache': { revalidatePath: () => { revalidated++ } },
  })
  const result = await api.editMeal({ ...changed, name: '  Pasta  ' })
  assert.equal(saved.name, 'Pasta')
  assert.equal(result.name, 'Pasta')
  for (const patch of [{ name: ' ' }, { week: 0 }, { week: 54 }, { week: 1.5 }, { year: NaN }, { id: '' }]) {
    await assert.rejects(api.editMeal({ ...changed, ...patch }))
  }
  writeFails = true
  await assert.rejects(api.editMeal(changed))
  userId = null
  await assert.rejects(api.editMeal(changed))
  assert.equal(revalidated, 1)
})

test('edit dialog retains failed drafts, retries, updates all fields and discards cancelled changes', async () => {
  const state = []
  let cursor = 0
  let effects = []
  let firstRender = true
  let fail = true
  let submitted
  const components = new Proxy({}, { get: (_, name) => name })
  const dependencies = new Proxy({
    react: {
      useState(initial) {
        const index = cursor++
        if (!(index in state)) state[index] = initial
        return [state[index], (value) => { state[index] = typeof value === 'function' ? value(state[index]) : value }]
      },
      useEffect(effect) { if (firstRender) effects.push(effect) },
    },
    'react/jsx-runtime': {
      jsx: (type, props) => ({ type, props }),
      jsxs: (type, props) => ({ type, props }),
    },
    'date-fns': require('date-fns'),
    'date-fns/locale': require('date-fns/locale'),
    './actions': {
      fetchMeals: async () => [original],
      editMeal: async (meal) => {
        submitted = meal
        if (fail) throw Error('offline')
        return meal
      },
    },
  }, {
    has: () => true,
    get: (target, name) => name in target ? target[name] : components,
  })
  const app = load('app/page.tsx', dependencies, {}, {
    localStorage: { getItem: () => null, setItem() {} },
  }).default
  function render() {
    cursor = 0
    const tree = app()
    firstRender = false
    return tree
  }
  function all(node) {
    if (Array.isArray(node)) return node.flatMap(all)
    if (!node || typeof node !== 'object') return []
    return [node, ...all(node.props?.children)]
  }
  function find(predicate) {
    const node = all(render()).find(predicate)
    assert.ok(node, 'expected UI element')
    return node.props
  }
  render()
  for (const effect of effects) effect()
  await new Promise(setImmediate)
  const open = () => find((n) => n.type === 'Card' && n.props.onClick).onClick()
  const input = () => find((n) => n.props?.id === 'edit-meal-name')
  const dialog = () => find((n) => n.type === 'Dialog' && n.props.open)
  const save = () => find((n) => n.type === 'Button' && n.props.children === 'Opdater måltid')
  open()
  input().onChange({ target: { value: '  Pasta  ' } })
  all(render()).filter((n) => n.type === 'Button' && n.props.children?.type === 'MoreHorizontal').at(-1).props.onClick()
  const selects = () => all(render()).filter((n) => n.type === 'Select')
  selects().at(-2).props.onValueChange('3')
  selects().at(-1).props.onValueChange('2027')
  const attempt = save().onClick()
  dialog().onOpenChange(false)
  assert.equal(dialog().open, true)
  await attempt
  assert.match(find((n) => n.props?.role === 'alert').children, /kunne ikke gemmes/)
  assert.equal(input().value, '  Pasta  ')
  assert.equal(dialog().open, true)
  assert.equal(submitted.name, 'Pasta')
  assert.equal(submitted.week, 3)
  assert.equal(submitted.year, 2027)
  fail = false
  await save().onClick()
  open()
  assert.equal(input().value, 'Pasta')
  input().onChange({ target: { value: ' ' } })
  assert.equal(save().disabled, true)
  input().onChange({ target: { value: 'Discard me' } })
  dialog().onOpenChange(false)
  open()
  assert.equal(input().value, 'Pasta')
})
