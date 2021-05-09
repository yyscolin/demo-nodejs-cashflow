const mdb = require('./help-all-mdb')
const handleError = require('./help-all-handleError.js')

module.exports = async function(req, res) {
  try {
    let accs = await mdb.postQuery(`select id, name, currency from exp11.accs order by name`)
    res.render('accs', {accs})
  } catch(err) {
    handleError(res, err)
  }
}