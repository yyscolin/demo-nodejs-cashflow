const mdb = require('./help-all-mdb')

module.exports = async function(databaseTable, itemName) {
  let sqlQuery = `select id from ${databaseTable} where name=?`
  let dbResponse = await mdb.get(sqlQuery, [itemName])
  if (dbResponse.length)
    return dbResponse[0].id

  sqlQuery = `insert into ${databaseTable} (name) values (?)`
  dbResponse = await mdb.postQuery(sqlQuery, [itemName])
  return dbResponse.insertId
}