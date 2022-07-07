const handleError = require('./help-all-handleError')
const con = require('./help-all-mdb')
const getApiRequestId = require('./help-exp11-getApiRequestId')
const validateName = require('./help-exp11-validateName')

module.exports = async function(req, res) {
  try {
    var id = getApiRequestId(req)
    var name = req.body.name
    validateName(name)

    var cat = req.body.cat ? req.body.cat : null
    var query = `insert into itms (id, name, cat) values (?, ?, ?)
      on duplicate key update name=values(name), cat=values(cat)`
    await con.postQuery(query, [id, name, cat])

    res.send()
  } catch(err) {
    handleError(res, err)
  }
}