const handleError = require('./help-all-handleError')
const con = require('./help-all-mdb')
const getApiRequestId = require('./help-exp11-getApiRequestId')
const validateName = require('./help-exp11-validateName')

module.exports = async function(req, res) {
  try {
    var id = getApiRequestId(req)
    var name = req.body.name
    validateName(name)

    await con.postQuery(
      `insert into tfts (id, name) values (?, ?) on duplicate key update name=values(name)`
      [id, name]
    )

    res.send()
  } catch(err) {
    handleError(res, err)
  }
}