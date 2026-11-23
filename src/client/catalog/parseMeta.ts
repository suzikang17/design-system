/**
 * Reads a client component's `<id>.meta.ts` as text, for the registry generator. The module is never run:
 * `export default defineMeta({ ... })` is parsed with the TypeScript compiler API and the registry fields are read
 * from the object literal. Each must be a plain literal (a string, or an array of strings).
 */
import ts from 'typescript'

export interface ClientMetaFields {
  id: string
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

  let object: ts.ObjectLiteralExpression | undefined
  for (const statement of file.statements) {
    if (!ts.isExportAssignment(statement) || statement.isExportEquals) continue
    const call = statement.expression
    const arg = ts.isCallExpression(call) ? call.arguments[0] : undefined
    if (arg && ts.isObjectLiteralExpression(arg)) object = arg
  }
  if (!object) throw new Error(`${fileName}: expected \`export default defineMeta({ ... })\` with an object literal.`)

  const props = new Map<string, ts.Expression>()
  for (const prop of object.properties) {
    if (ts.isPropertyAssignment(prop) && (ts.isIdentifier(prop.name) || ts.isStringLiteralLike(prop.name))) {
      props.set(prop.name.text, prop.initializer)
    }
  }

  const text = (field: string): string => {
    const node = props.get(field)
    if (!node) return fail(field, 'is missing.')
    return stringOf(node) ?? fail(field, 'must be a plain string literal.')
  }
  const list = (field: string, required: boolean): string[] => {
    const node = props.get(field)
    if (!node) return required ? fail(field, 'is missing.') : []
    if (!ts.isArrayLiteralExpression(node)) return fail(field, 'must be an array literal of plain strings.')
    return node.elements.map((el) => stringOf(el) ?? fail(field, 'must contain only plain string literals.'))
  }

  return {
    id: text('id'),
    summary: text('summary'),
    files: list('files', true),
    dependencies: list('dependencies', false),
    registryDependencies: list('registryDependencies', false),
  }
}
