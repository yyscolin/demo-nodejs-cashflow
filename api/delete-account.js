const mdb = require(`../server/help-all-mdb`)
const handleError = require(`../server/help-all-handleError`)

module.exports = async function(req, res) {
  try {
    const {id: accountId} = req.body
    await mdb.postQuery(`delete from accs where id=?`, [accountId])
    res.send()
  } catch(err) {
    handleError(res, err)
  }
}