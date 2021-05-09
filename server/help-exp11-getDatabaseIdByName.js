const mdb = require('./help-all-mdb')

module.exports = async function(database, table, name) {
  var query = `select id from ${database}.${table} where name = "${name}"`
  var dbResponse = await mdb.postQuery(query)
  if (dbResponse.length)
    return dbResponse[0].id

  var query = `insert into ${database}.${table} (name) values ("${name}")`
  var dbResponse = await mdb.postQuery(query)
  return dbResponse.insertId
}