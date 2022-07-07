const mdb = require('./help-all-mdb')
const handleError = require('./help-all-handleError.js')

module.exports = async function(req, res) {
  try {
    const sqlQuery = `SELECT id, name, currency FROM accs ORDER BY name`
    const accountsInfo = await mdb.getObjects(sqlQuery)
    res.render(`accs`, {accountsInfo})
  } catch(err) {
    handleError(res, err)
  }
}