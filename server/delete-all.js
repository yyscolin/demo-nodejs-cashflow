const mdb = require('./help-all-mdb')

module.exports = async function(req, res) {
  try {
    await mdb.postQuery(`delete from ${req.body.database}.${req.body.table} where id = ${req.body.id}`)
    res.send()
  } catch(err) {
    console.error(err)
    res.status(500).send(`Internal server error`)
  }
}