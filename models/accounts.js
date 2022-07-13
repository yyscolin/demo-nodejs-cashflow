const mysqlConnection = require(`../modules/mysql-connection`)

function addAccount(accountName, accountCurrency) {
  const sqlQuery = `
    INSERT INTO accounts (account_name, account_currency) VALUES (?,?)`
  return mysqlConnection.postQuery(sqlQuery, [accountName, accountCurrency])
}

function editAccount(accountId, accountName, accountCurrency) {
  const sqlQuery = `
    UPDATE accounts SET account_name=?, account_currency=? WHERE account_id=?`
  const sqlParams = [accountName, accountCurrency, accountId]
  return mysqlConnection.postQuery(sqlQuery, sqlParams)
}

function getAccountInfo(accountId) {
  const sqlQuery = `
    SELECT account_id AS id,
      account_name AS name,
      account_currency AS currency
    FROM accounts WHERE account_id=?`
  return mysqlConnection.getObject(sqlQuery, [accountId])
}

function getAccountsInfo() {
  const sqlQuery = `
    SELECT account_id AS id,
      account_name AS name,
      account_currency AS currency
    FROM accounts ORDER BY account_name`
  return mysqlConnection.getObjects(sqlQuery)
}

function getCurrencies() {
  const sqlQuery = `
    SELECT DISTINCT account_currency FROM accounts order by account_currency`
  return mysqlConnection.getValues(sqlQuery)
}

function deleteAccount(accountId) {
  const sqlQuery = `DELETE FROM accounts WHERE account_id=?`
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
