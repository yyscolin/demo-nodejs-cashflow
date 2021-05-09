module.exports = function(name) {
  if (name==null||name==undefined||name=='') throw new Error('400::Name cannot be empty')
  if (typeof(name)!='string'||/"/.test(name)) throw new Error('400::Invalid name')
  if (name.length > 48) throw new Error("400::Account name cannot exceed 48 characters long")
}