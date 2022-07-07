const mdb = require(`../server/help-all-mdb`)
const handleError = require(`../server/help-all-handleError`)
const fieldValidator = require(`../modules/field-validator`)

module.exports = async function(req, res) {
  try {
    const {id: accountId} = req.body
    fieldValidator.validateAccountId(accountId)
    await mdb.postQuery(`delete from accs where id=?`, [accountId])
    res.send()
  } catch(err) {
    handleError(res, err)
  }
}