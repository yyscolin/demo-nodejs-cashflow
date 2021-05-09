const mdb = require('./help-all-mdb')
const handleError = require('./help-all-handleError.js')

module.exports = async function(req, res) {
  try {
    await mdb.postQuery('start transaction')
    await mdb.postQuery(`delete from exp11.itms where cat = ${req.body.id}`)
    await mdb.postQuery(`delete from exp11.itms where id = ${req.body.id}`)
    await mdb.postQuery('commit')
    res.send()
  } catch(err) {
    handleError(res, err)
  }
}