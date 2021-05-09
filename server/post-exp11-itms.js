const handleError = require('./help-all-handleError')
const con = require('./help-all-mdb')
const getApiRequestId = require('./help-exp11-getApiRequestId')
const validateName = require('./help-exp11-validateName')
const validateString = require('./help-exp11-validateString')

module.exports = async function(req, res) {
  try {
    var id = getApiRequestId(req)
    var name = req.body.name
    validateName(name)
    var subname = req.body.subname
    validateString(subname, 'subname')

    await con.postQuery('start transaction')
    var cat = req.body.cat ? req.body.cat : null
    var query = `insert into exp11.itms (id, name, subname, cat) values (${id}, "${name}", "${subname}", ${cat})
      on duplicate key update name=values(name), subname=values(subname), cat=values(cat)`
    var dbResponse = await con.postQuery(query)
    if (!id) var id = dbResponse.insertId
    
    var syns = req.body.syns
    if (syns.length) {
      syns = syns.map(_ => `(${_.id}, ${id}, "${_.name}")`)
      var query = `insert into exp11.itms_syns (id, of, name) values ${syns.toString()}
        on duplicate key update of=values(of), name=values(name)`
      await con.postQuery(query)
    }
    await con.postQuery('commit')
    res.send()
  } catch(err) {
    handleError(res, err)
  }
}