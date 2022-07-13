const mysqlConnection = require(`../modules/mysql-connection`)

function addBusinessEntity(entityName) {
  const sqlQuery = `
    INSERT INTO business_entities (business_entity_name) VALUES (?)`
  return mysqlConnection.postQuery(sqlQuery, [entityName])
}

function deleteBusinessEntity(entityId) {
  const sqlQuery = `DELETE FROM business_entities WHERE business_entity_id=?`
  return mysqlConnection.postQuery(sqlQuery, [entityId])
}

function editBusinessEntity(entityId, entityName) {
  const sqlQuery = `
    UPDATE business_entities
    SET business_entity_name=?
    WHERE business_entity_id=?`
  return mysqlConnection.postQuery(sqlQuery, [entityName, entityId])
}

async function getBusEntityId(busEntityId) {
  if (!busEntityId) return null

  let sqlQuery = `
    SELECT business_entity_id AS id
    FROM business_entities
    WHERE business_entity_name=?`
  let dbResponse = await mysqlConnection.getObject(sqlQuery, [busEntityId])
  if (dbResponse) return dbResponse.id

  sqlQuery = `INSERT INTO business_entities (business_entity_name) VALUES (?)`
  dbResponse = await mysqlConnection.postQuery(sqlQuery, [busEntityId])
  return dbResponse.insertId
}

function getBusEntitiesInfo() {
  const sqlQuery = `
    SELECT business_entity_id AS id,
      business_entity_name AS name
    FROM business_entities`
  return mysqlConnection.getObjects(sqlQuery)
}

module.exports = {
  addBusinessEntity,
  deleteBusinessEntity,
  editBusinessEntity,
  getBusEntityId,
  getBusEntitiesInfo,
}
