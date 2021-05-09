module.exports = function(string, name) {
  if (typeof(string) != 'string') throw new Error(`400::${name} must be a string value`)
  if (/"/.test(string)) throw new Error(`400::Illegal character detected in ${name.toLowerCase()}`)
}