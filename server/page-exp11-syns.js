const mdb = require('./help-all-mdb')
const handleError = require('./help-all-handleError.js')

module.exports = async function(req, res) {
  try {
    let table = req.url.split('/')[1]
    let objs = await mdb.select(`select id, name from ${table} order by name`)
    res.render('syns', { table, objs })
  } catch(err) {
    handleError(res, err)
  }
}