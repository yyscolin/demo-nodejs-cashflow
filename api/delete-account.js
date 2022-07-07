const mdb = require(`../server/help-all-mdb`)
const fieldValidator = require(`../modules/field-validator`)

module.exports = async function(req, res) {
  try {
    const {id: accountId} = req.body
    const apiError = fieldValidator.validateAccountId(accountId)
    if (apiError) return res.status(400).send(apiError)
    await mdb.postQuery(`delete from accs where id=?`, [accountId])
    res.send()
  } catch(err) {
    console.error(err)
    res.status(500).send(`Internal server error`)
  }
}