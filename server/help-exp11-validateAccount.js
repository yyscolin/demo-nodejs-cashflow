module.exports = function(acc) {
  if (acc == null || acc == undefined) throw new Error(`400::Account cannot be empty`)
  if (parseInt(acc) != acc || acc < 1) throw new Error(`400::Invalid account`)
}