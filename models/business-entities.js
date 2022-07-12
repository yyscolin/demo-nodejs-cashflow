const mysqlConnection = require(`../modules/mysql-connection`)

function addBusinessEntity(entityName) {
  const sqlQuery = `INSERT INTO ents (name) VALUES (?)`
  return mysqlConnection.postQuery(sqlQuery, [entityName])
}

function deleteBusinessEntity(entityId) {
  const sqlQuery = `DELETE FROM ents WHERE id=?`
  return mysqlConnection.postQuery(sqlQuery, [entityId])
}

function editBusinessEntity(entityId, entityName) {
  const sqlQuery = `UPDATE ents SET name=? WHERE id=?`
  return mysqlConnection.postQuery(sqlQuery, [entityName, entityId])
}

async function getBusEntityId(busEntityId) {
  if (!busEntityId) return null

  let sqlQuery = `SELECT id FROM ents WHERE name=?`
  let dbResponse = await mysqlConnection.getObject(sqlQuery, [busEntityId])
  if (dbResponse) return dbResponse.id

  sqlQuery = `INSERT INTO ents (name) VALUES (?)`
  dbResponse = await mysqlConnection.postQuery(sqlQuery, [busEntityId])
  return dbResponse.insertId
}

function getBusEntitiesInfo() {
  const sqlQuery = `SELECT id, name FROM ents`
  return mysqlConnection.getObjects(sqlQuery)
}

module.exports = {
  addBusinessEntity,
  deleteBusinessEntity,
  editBusinessEntity,
  getBusEntityId,
  getBusEntitiesInfo,
}
