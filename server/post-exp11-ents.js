const handleError = require('./help-all-handleError')
const con = require('./help-all-mdb')
const getApiRequestId = require('./help-exp11-getApiRequestId')
const validateName = require('./help-exp11-validateName')

module.exports = async function(req, res) {
  try {
    var id = getApiRequestId(req)
    var name = req.body.name
    validateName(name)

    var query = `insert into ents (id, name) values (${id}, "${name}") on duplicate key update name=values(name)`
    await con.postQuery(query)

    res.send()
  } catch(err) {
    handleError(res, err)
  }
}