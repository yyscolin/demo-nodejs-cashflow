const mysqlConnection = require(`../modules/mysql-connection`)

function getBalancesOfWeek(accountingDate) {
  const sqlQuery = `
    SELECT account_id AS accountId,
      account_name AS accountName,
      IFNULL(balance_amount, "") AS amount
    FROM accounts
    LEFT JOIN (
      SELECT account_id,
        balance_amount FROM account_balances
      WHERE balance_date=?
    ) t USING(account_id)
    ORDER BY account_name`
  return mysqlConnection.getObjects(sqlQuery, [accountingDate])
}

function getCurrentBalances(cutOffDate) {
  if (!cutOffDate) cutOffDate = new Date().toLocaleDateString(`fr-Ca`)
  const sqlQuery = `
    SELECT account_id AS id,
      account_name AS name,
      balance_amount AS amount
    FROM (
      SELECT *
      FROM account_balances
      JOIN (
        SELECT account_id,
          MAX(balance_date) AS balance_date
        FROM account_balances
        WHERE balance_date<=?
        GROUP BY account_id
      ) t1 USING(balance_date, account_id)
    ) t2
    JOIN accounts USING(account_id)`
  return mysqlConnection.getObjects(sqlQuery, [cutOffDate])
}

function putBalances(balancesInfo) {
  const sqlQuery = `
    INSERT INTO account_balances (balance_date, account_id, balance_amount) VALUES ?
    ON DUPLICATE KEY UPDATE balance_date=VALUES(balance_date),
      account_id=VALUES(account_id),
      balance_amount=VALUES(balance_amount)`
  return mysqlConnection.postQuery(sqlQuery, [balancesInfo])
}

module.exports = {
  getBalancesOfWeek,
  getCurrentBalances,
  putBalances,
}
