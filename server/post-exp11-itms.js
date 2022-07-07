const con = require('./help-all-mdb')
const getApiRequestId = require('./help-exp11-getApiRequestId')
const fieldValidator = require(`../modules/field-validator`)

module.exports = async function(req, res) {
  try {
    var id = getApiRequestId(req)
    var name = req.body.name
    const apiError = fieldValidator.validateAccountName(name)
    if (apiError) return res.status(400).send(apiError)

    var cat = req.body.cat ? req.body.cat : null
    var query = `insert into itms (id, name, cat) values (?, ?, ?)
      on duplicate key update name=values(name), cat=values(cat)`
    await con.postQuery(query, [id, name, cat])

    res.send()
  } catch(err) {
    console.error(err)
    res.status(500).send(`Internal server error`)
  }
}