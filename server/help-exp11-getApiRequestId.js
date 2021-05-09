module.exports = function(req) {
  if (req.method == 'PUT') {
    var id = req.body.id
    if (id == null || id == undefined) throw new Error(`400::Id cannot be empty`)
    if (parseInt(id) != id) throw new Error(`400::Invalid id`)
    return id
  }
  return null
}