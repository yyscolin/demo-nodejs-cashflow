const mysqlConnection = require(`../modules/mysql-connection`)

function getBalancesOfWeek(accountingDate) {
  const sqlQuery = `
    SELECT id AS accountId, name AS accountName, IFNULL(amt, "") AS amount
    FROM accs
    LEFT JOIN (
      SELECT acc,
        amt FROM bals
      WHERE date=?
    ) t ON accs.id=t.acc
    ORDER BY name`
  return mysqlConnection.getObjects(sqlQuery, [accountingDate])
}

function getAccountBalancesInDateRange(dateStart, dateEnd) {
  const sqlQuery = `
    SELECT name AS accountName,
    startingAmount,
    IFNULL(pays, 0) AS paymentAmount,
    IFNULL(ROUND(ints, 2), 0) AS internalTransferAmount,
    IFNULL(exts, 0) AS externalTransferAmount,
    balance AS balanceAmount,
    startingAmount-balance+IFNULL(pays,0)+IFNULL(ints,0)+IFNULL(exts,0) AS errorAmount
    FROM (
      SELECT acc, amt AS startingAmount
      FROM bals
      WHERE (date, acc) IN (
        SELECT MAX(date), acc
        FROM (
          SELECT date, acc FROM bals
          WHERE date<?
        ) t GROUP BY acc
      )
    ) t
    RIGHT JOIN (
      SELECT acc, amt AS balance FROM bals
      WHERE id IN (
        SELECT MAX(id) FROM bals
        WHERE date>=? AND date<=?
        GROUP BY acc
      )
    ) balance USING (acc)
    LEFT JOIN (
      SELECT acc, sum(amt) AS pays
      FROM pays
      WHERE date>=? AND date<=?
      GROUP BY acc
    ) pays USING (acc)
    LEFT JOIN (
      SELECT acc, sum(amt) AS ints
      FROM (
        SELECT sr_acc AS acc, sr_amt*-1 AS amt
        FROM ints
        WHERE date>=? AND date<=?
        UNION ALL
        SELECT de_acc AS acc, de_amt AS amt
        FROM ints
        WHERE date>=? AND date<=?
      ) t GROUP BY acc
    ) ints USING (acc) LEFT JOIN (
      SELECT acc, sum(amt) AS exts
      FROM exts
      WHERE date>=? AND date<=?
      GROUP BY acc
    ) exts USING (acc) JOIN
    accs ON acc=accs.id
    ORDER BY acc`
  return mysqlConnection.getObjects(sqlQuery, [
    dateStart, dateStart, dateEnd, dateStart, dateEnd,
    dateStart, dateEnd, dateStart, dateEnd, dateStart, dateEnd
  ])
}

function getCurrentBalances() {
  const sqlQuery = `
    SELECT id,
      name,
      amt AS amount
    FROM (
      SELECT t1.acc,
        t1.amt
      FROM bals t1
        JOIN (
          SELECT acc, max(date) AS date FROM bals GROUP BY acc
        ) t2 ON t1.date=t2.date AND t1.acc=t2.acc
    ) t3 JOIN accs ON t3.acc=accs.id`
  return mysqlConnection.getObjects(sqlQuery)
}

function putBalances(balancesInfo) {
  const sqlQuery = `
    INSERT INTO bals (date, acc, amt) VALUES ?
    ON DUPLICATE KEY UPDATE date=VALUES(date), acc=VALUES(acc), amt=VALUES(amt)`
  return mysqlConnection.postQuery(sqlQuery, [balancesInfo])
}

module.exports = {
  getAccountBalancesInDateRange,
  getBalancesOfWeek,
  getCurrentBalances,
  putBalances,
}
