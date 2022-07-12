const mysqlConnection = require(`../modules/mysql-connection`)

function addAccount(accountName, accountCurrency) {
  const sqlQuery = `INSERT INTO accs (name, currency) VALUES (?,?)`
  return mysqlConnection.postQuery(sqlQuery, [accountName, accountCurrency])
}

function editAccount(accountId, accountName, accountCurrency) {
  const sqlQuery = `UPDATE accs SET name=?, currency=? WHERE id=?`
  const sqlParams = [accountName, accountCurrency, accountId]
  return mysqlConnection.postQuery(sqlQuery, sqlParams)
}

function getAccountInfo(accountId) {
  const sqlQuery = `SELECT id, name, currency FROM accs WHERE id=?`
  return mysqlConnection.getObject(sqlQuery, [accountId])
}

function getAccountsInfo() {
  const sqlQuery = `SELECT id, name, currency FROM accs ORDER BY name`
  return mysqlConnection.getObjects(sqlQuery)
}

function getCurrencies() {
  const sqlQuery = `SELECT DISTINCT currency FROM accs order by currency`
  return mysqlConnection.getValues(sqlQuery)
}

function deleteAccount(accountId) {
  const sqlQuery = `DELETE FROM accs WHERE id=?`
  return mysqlConnection.postQuery(sqlQuery, [accountId])
}

module.exports = {
  addAccount,
  editAccount,
  getAccountInfo,
  getAccountsInfo,
  getCurrencies,
  deleteAccount,
}
