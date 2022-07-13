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

function getAccountBalancesInDateRange(dateStart, dateEnd) {
  const sqlQuery = `
    SELECT account_name AS accountName,
      startingAmount,
      IFNULL(paymentAmount, 0) AS paymentAmount,
      IFNULL(it_amount, 0) AS internalTransferAmount,
      IFNULL(et_amount, 0) AS externalTransferAmount,
      balanceAmount,
      startingAmount-balanceAmount+IFNULL(paymentAmount,0)+IFNULL(it_amount,0)+IFNULL(et_amount,0) AS errorAmount
    FROM (
      SELECT account_id,
        balance_amount AS startingAmount
      FROM account_balances
      WHERE (balance_date, account_id) IN (
        SELECT MAX(balance_date), account_id
        FROM account_balances
        WHERE balance_date<?
        GROUP BY account_id
      )
    ) t1
    RIGHT JOIN (
      SELECT account_id,
        balance_amount AS balanceAmount
      FROM account_balances
      WHERE balance_id IN (
        SELECT MAX(balance_id)
        FROM account_balances
        WHERE balance_date>=? AND balance_date<=?
        GROUP BY account_id
      )
    ) t2 USING(account_id)
    LEFT JOIN (
      SELECT account_id,
        sum(payment_amount) AS paymentAmount
      FROM payments
      WHERE payment_date>=? AND payment_date<=?
      GROUP BY account_id
    ) t3 USING(account_id)
    LEFT JOIN (
      SELECT account_id, sum(amt) AS it_amount
      FROM (
        SELECT source_account_id AS account_id,
          source_amount * -1 AS amt
        FROM internal_transfers
        WHERE internal_transfer_date>=? AND internal_transfer_date<=?
        UNION ALL
        SELECT destination_account_id,
          destination_amount AS amt
        FROM internal_transfers
        WHERE internal_transfer_date>=? AND internal_transfer_date<=?
      ) t GROUP BY account_id
    ) t4 USING(account_id)
    LEFT JOIN (
      SELECT account_id, sum(external_transfer_amount) AS et_amount
      FROM external_transfers
      WHERE external_transfer_date>=? AND external_transfer_date<=?
      GROUP BY account_id
    ) t5 USING(account_id)
    JOIN accounts USING(account_id)
    ORDER BY account_id`
  return mysqlConnection.getObjects(sqlQuery, [
    dateStart, dateStart, dateEnd, dateStart, dateEnd,
    dateStart, dateEnd, dateStart, dateEnd, dateStart, dateEnd
  ])
}

function getCurrentBalances() {
  const sqlQuery = `
    SELECT account_id AS id,
      account_name AS name,
      balance_amount AS amount
    FROM (
      SELECT *
      FROM account_balances
      JOIN (
        SELECT account_id,
          max(balance_date) AS balance_date
        FROM account_balances
        GROUP BY account_id
      ) t1 USING(balance_date, account_id)
    ) t2
    JOIN accounts USING(account_id)`
  return mysqlConnection.getObjects(sqlQuery)
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
  getAccountBalancesInDateRange,
  getBalancesOfWeek,
  getCurrentBalances,
  putBalances,
}
