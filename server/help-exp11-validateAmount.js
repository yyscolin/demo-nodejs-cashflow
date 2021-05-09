module.exports = function(amt) {
  if (amt == null || amt == undefined) throw new Error(`400::Amount cannot be null`)
  if (parseFloat(amt) != amt) throw new Error(`400::Invalid amount`)
}