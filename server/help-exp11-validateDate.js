module.exports = function(date) {
  if (date==null||date==undefined||date=='') throw new Error('400::Date cannot be empty')
  if (!/^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|30|31)$/.test(date)) throw new Error('400::Invalid Date')
}