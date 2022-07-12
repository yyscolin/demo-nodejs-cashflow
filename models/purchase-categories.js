const mysqlConnection = require(`../modules/mysql-connection`)

function addPurCategory(categoryName, superCatId) {
  const sqlQuery = `INSERT INTO itms (name, cat) VALUES (?, ?)`
  return mysqlConnection.postQuery(sqlQuery, [categoryName, superCatId])
}

function deletePurCategory(categoryId) {
  const sqlQuery = `DELETE FROM itms WHERE id=?`
  return mysqlConnection.postQuery(sqlQuery, [categoryId])
}

function editPurCategory(categoryId, categoryName, superCatId) {
  const sqlQuery = `UPDATE itms SET name=?, cat=? WHERE id=?`
  const sqlParams = [categoryName, superCatId, categoryId]
  return mysqlConnection.postQuery(sqlQuery, sqlParams)
}

async function getPurchaseCatId(purcaseCatId) {
  if (!purcaseCatId) return null

  let sqlQuery = `SELECT id FROM itms WHERE name=?`
  let dbResponse = await mysqlConnection.getObject(sqlQuery, [purcaseCatId])
  if (dbResponse) return dbResponse.id

  sqlQuery = `INSERT INTO itms (name) VALUES (?)`
  dbResponse = await mysqlConnection.postQuery(sqlQuery, [purcaseCatId])
  return dbResponse.insertId
}

function getPurchaseCatsInfo() {
  const sqlQuery = `SELECT id, name, cat AS superCatId FROM itms`
  return mysqlConnection.getObjects(sqlQuery)
}

module.exports = {
  addPurCategory,
  deletePurCategory,
  editPurCategory,
  getPurchaseCatId,
  getPurchaseCatsInfo,
}
