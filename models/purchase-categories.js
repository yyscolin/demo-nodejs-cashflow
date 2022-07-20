const mysqlConnection = require(`../modules/mysql-connection`)

function addPurCategory(categoryName, superCatId) {
  const sqlQuery = `
    INSERT INTO purchase_categories (purchase_category_name, parent_category_id)
    VALUES (?, ?)`
  return mysqlConnection.postQuery(sqlQuery, [categoryName, superCatId])
}

function deletePurCategory(categoryId) {
  const sqlQuery = `
    DELETE FROM purchase_categories WHERE purchase_category_id=?`
  return mysqlConnection.postQuery(sqlQuery, [categoryId])
}

function editPurCategory(categoryId, categoryName, superCatId) {
  const sqlQuery = `
    UPDATE purchase_categories
    SET purchase_category_name=?, parent_category_id=?
    WHERE purchase_category_id=?`
  const sqlParams = [categoryName, superCatId, categoryId]
  return mysqlConnection.postQuery(sqlQuery, sqlParams)
}

async function getPurchaseCatId(purcaseCatId) {
  if (!purcaseCatId) return null

  let sqlQuery = `
    SELECT purchase_category_id AS id
    FROM purchase_categories
    WHERE purchase_category_name=?`
  let dbResponse = await mysqlConnection.getObject(sqlQuery, [purcaseCatId])
  if (dbResponse) return dbResponse.id

  sqlQuery = `
    INSERT INTO purchase_categories (purchase_category_name) VALUES (?)`
  dbResponse = await mysqlConnection.postQuery(sqlQuery, [purcaseCatId])
  return dbResponse.insertId
}

function getPurchaseCatsInfo() {
  const sqlQuery = `
    SELECT purchase_category_id AS id,
      purchase_category_name AS name,
      parent_category_id AS superCatId
    FROM purchase_categories
    ORDER BY name`
  return mysqlConnection.getObjects(sqlQuery)
}

module.exports = {
  addPurCategory,
  deletePurCategory,
  editPurCategory,
  getPurchaseCatId,
  getPurchaseCatsInfo,
}
