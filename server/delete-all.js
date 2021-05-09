const mdb = require('./help-all-mdb')
const handleError = require('./help-all-handleError.js')

module.exports = async function(req, res) {
  try {
    await mdb.postQuery(`delete from ${req.body.database}.${req.body.table} where id = ${req.body.id}`)
    res.send()
  } catch(err) {
    handleError(res, err)
  }
}