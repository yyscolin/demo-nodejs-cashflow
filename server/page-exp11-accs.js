const mdb = require('./help-all-mdb')

module.exports = async function(req, res) {
  try {
    const sqlQuery = `SELECT id, name, currency FROM accs ORDER BY name`
    const accountsInfo = await mdb.getObjects(sqlQuery)
    res.render(`accs`, {accountsInfo})
  } catch(err) {
    console.error(err)
    res.status(500).send(`Internal server error`)
  }
}