const con = require('./help-all-mdb')
const getApiRequestId = require('./help-exp11-getApiRequestId')
const fieldValidator = require(`../modules/field-validator`)

module.exports = async function(req, res) {
  try {
    var id = getApiRequestId(req)
    var name = req.body.name
    const apiError = fieldValidator.validateAccountName(name)
    if (apiError) return res.status(400).send(apiError)

    var query = `insert into ents (id, name) values (${id}, "${name}") on duplicate key update name=values(name)`
    await con.postQuery(query)

    res.send()
  } catch(err) {
    console.error(err)
    res.status(500).send(`Internal server error`)
  }
}