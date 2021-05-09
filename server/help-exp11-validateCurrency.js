module.exports = function(currency) {
  if (currency==null||currency==undefined||currency=='') throw new Error('400::Currency cannot be empty')
  if (typeof(currency)!='string') throw new Error('400::Invalid currency code')
  if (!/^[a-zA-Z]{3}$/.test(currency)) throw new Error("400::Currency must be 3 alphabets long")
}