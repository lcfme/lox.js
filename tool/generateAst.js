const fs = require('fs')
const path = require('path')
const outputDir = process.argv[2]

if (!outputDir) {
  console.error('usage: node generateAst.tool.js <output directory>')
  process.exit(1)
}

const indent = '  '

defineAst(outputDir, 'Expr', {
  Binary: 'Expr left, Token operator, Expr right',
  Grouping: 'Expr expression',
  Literal: 'Object value',
  Unary: 'Token operator, Expr right'
})

defineAst(outputDir, 'Stmt', {
  Expression: 'Expr expression',
  Print: 'Expr expression'
})

function defineAst (outputDir, baseName, types) {
  const outputPath = path.resolve(outputDir, baseName + '.js')
  const writer = fs.createWriteStream(outputPath)

  writer.write(`/* generated by ${path.basename(__filename)} */\n\n`)
  writer.write(`class ${baseName} {\n`)
  writer.write(`${indent}accept (visitor) {}\n`)
  writer.write(`}\n\n`)

  const classNames = Object.keys(types)
  classNames.forEach(className => {
    defineType(writer, baseName, className, types[className])
    writer.write('\n')
  })

  const allExports = classNames.map(className =>
    `${indent}${className}`
  ).join(`,\n`)

  writer.write(`module.exports = {\n`)
  writer.write(allExports)
  writer.write('\n}\n')

  writer.end()
}

function defineType (writer, baseName, className, fieldList) {
  writer.write(`class ${className} extends ${baseName} {\n`)

  const fields = fieldList.split(', ')
  const fieldNames = fields.map(field =>
    field.split(' ')[1]
  )

  writer.write(`${indent}constructor (${fieldNames.join(', ')}) {\n`)
  writer.write(`${indent}${indent}super()\n`)
  fieldNames.forEach(fieldName => {
    writer.write(`${indent}${indent}this.${fieldName} = ${fieldName}\n`)
  })
  writer.write(`${indent}}\n\n`)

  writer.write(`${indent}accept (visitor) {\n`)
  writer.write(`${indent}${indent}return visitor.visit${className}${baseName}(this)\n`)
  writer.write(`${indent}}\n`)

  writer.write(`}\n`)
}
