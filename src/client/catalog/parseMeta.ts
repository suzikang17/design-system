/**
 * Reads a client component's `<id>.meta.ts` as text, for the registry generator. The module is never run:
 * `export default defineMeta({ ... })` is parsed with the TypeScript compiler API and the registry fields are read
 * from the object literal. Each must be a plain literal (a string, or an array of strings).
 */
import ts from 'typescript'

export interface ClientMetaFields {
  id: string
  name: string
  summary: string
  files: string[]
  dependencies: string[]
  registryDependencies: string[]
}

const stringOf = (node: ts.Expression): string | undefined => (ts.isStringLiteralLike(node) ? node.text : undefined)

/** `fileName` only names the file in error messages. */
export function parseClientMeta(source: string, fileName = 'meta file'): ClientMetaFields {
  const file = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, false, ts.ScriptKind.TS)
  const fail = (field: string, why: string): never => {
    throw new Error(`${fileName}: "${field}" ${why}`)
  }

  const EXPECTED = 'expected `export default defineMeta({ ... })` (or `const m = defineMeta({ ... }); export default m`) with an object literal'
  const unwrap = (node: ts.Expression): ts.Expression => {
    let n = node
    while (ts.isParenthesizedExpression(n) || ts.isAsExpression(n) || ts.isSatisfiesExpression(n) || ts.isNonNullExpression(n)) n = n.expression
    return n
  }
  const topLevel = (name: string): ts.Expression | undefined => {
    for (const statement of file.statements) {
      if (!ts.isVariableStatement(statement)) continue
      for (const decl of statement.declarationList.declarations) {
        if (ts.isIdentifier(decl.name) && decl.name.text === name && decl.initializer) return decl.initializer
      }
    }
    return undefined
  }

  let object: ts.ObjectLiteralExpression | undefined
  for (const statement of file.statements) {
    if (!ts.isExportAssignment(statement) || statement.isExportEquals) continue
    let expr = unwrap(statement.expression)
    if (ts.isIdentifier(expr)) {
      const init = topLevel(expr.text)
      if (init) expr = unwrap(init)
    }
    const arg = ts.isCallExpression(expr) ? expr.arguments[0] : undefined
    const inner = arg && unwrap(arg)
    if (inner && ts.isObjectLiteralExpression(inner)) object = inner
  }
  if (!object) throw new Error(`${fileName}: ${EXPECTED}.`)

  const props = new Map<string, ts.Expression>()
  for (const prop of object.properties) {
    if (ts.isSpreadAssignment(prop)) {
      fail('...spread', 'is a spread, which is not allowed: the registry reads this file as text, so every field must be written out.')
    }
    const key = prop.name
    if (!key || !(ts.isIdentifier(key) || ts.isStringLiteralLike(key))) {
      fail(key ? key.getText(file) : 'property', 'is a computed or unnamed property, which is not allowed: the registry reads this file as text.')
    }
    const name = (key as ts.Identifier | ts.StringLiteralLike).text
    if (ts.isShorthandPropertyAssignment(prop)) {
      fail(name, 'is written as shorthand; write it as `name: <plain literal>`, because the registry reads this file as text.')
    }
    if (!ts.isPropertyAssignment(prop)) continue // a method or accessor: not a registry field
    if (props.has(name)) fail(name, 'is listed twice.')
    props.set(name, prop.initializer)
  }

  const text = (field: string): string => {
    const node = props.get(field)
    if (!node) return fail(field, 'is missing.')
    return stringOf(unwrap(node)) ?? fail(field, 'must be a plain string literal.')
  }
  const list = (field: string, required: boolean): string[] => {
    const node = props.get(field)
    if (!node) return required ? fail(field, 'is missing.') : []
    const array = unwrap(node)
    if (!ts.isArrayLiteralExpression(array)) return fail(field, 'must be an array literal of plain strings.')
    return array.elements.map((el) => stringOf(unwrap(el)) ?? fail(field, 'must contain only plain string literals.'))
  }

  return {
    id: text('id'),
    name: text('name'),
    summary: text('summary'),
    files: list('files', true),
    dependencies: list('dependencies', false),
    registryDependencies: list('registryDependencies', false),
  }
}
