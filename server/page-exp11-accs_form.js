const mdb = require('./help-all-mdb')
const handleError = require('./help-all-handleError.js')

module.exports = async function(req, res) {
  try {
    let id = req.params.id
    if (id != undefined) {
      if (id != parseInt(id)) throw new Error('400::Page not found')
      var dbResponse = await mdb.get(`select name, currency from accs where id = ${id}`)
      if (!dbResponse) throw new Error('400::Page not found')
      var acc = {
        id,
        name: ` value='${dbResponse.name}'`,
        currency: ` value='${dbResponse.currency}'`
      }
      isNew = false
    } else {
      var acc = {
        name: '',
        curreny: ''
      }
      isNew = true
    }
    res.render('accs_form', { acc, isNew })
  } catch(err) {
    handleError(res, err)
  }
}