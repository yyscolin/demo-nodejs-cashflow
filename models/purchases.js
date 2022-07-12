const mysqlConnection = require(`../modules/mysql-connection`)

async function addOrEditPayments(purchaseId, newPayments=[], oldPayments=[]) {
  if (newPayments.length) {
    const sqlQuery = `INSERT INTO pays (id, buy, date, acc, amt) VALUES ?`
    const sqlParams = newPayments.map(payment =>
      [payment.id, purchaseId, payment.date, payment.accountId, payment.amount]
    )
    await mysqlConnection.postQuery(sqlQuery, [sqlParams])
  }
  if (oldPayments.length) {
    const sqlQuery = `UPDATE pays SET date=?, acc=?, amt=? WHERE id=?`
    const sqlQueries = oldPayments.map(payment => mysqlConnection.format(
      sqlQuery, [payment.date, payment.accountId, payment.amount, payment.id]
    ))
    await mysqlConnection.postQuery(sqlQueries.join(`;`))
  }
}

async function addPurchase(
  purchaseDate,
  purCatId,
  currency,
  purchaseAmount,
  busEntId,
  remarks,
  newPayments,
  oldPayments
) {
  const sqlQuery = `INSERT INTO buys (date, itm, cur, amt, ent, remarks)
    VALUES (?,?,?,?,?,?)`
  const dbResponse = await mysqlConnection.postQuery(sqlQuery, [
    purchaseDate,
    purCatId,
    currency,
    purchaseAmount,
    busEntId,
    remarks
  ])
  const purchaseId = dbResponse.insertId
  await addOrEditPayments(purchaseId, newPayments, oldPayments)
}

function deletePayment(paymentId) {
  const sqlQuery = `DELETE FROM pays WHERE id=?`
  return mysqlConnection.postQuery(sqlQuery, [paymentId])
}


function deletePurchase(purchaseId) {
  const sqlQuery = `DELETE FROM buys WHERE id=?`
  return mysqlConnection.postQuery(sqlQuery, [purchaseId])
}

async function editPurchase(
  purchaseId,
  purchaseDate,
  purCatId,
  currency,
  purchaseAmount,
  busEntId,
  remarks,
  newPayments,
  oldPayments
) {
  const sqlQuery = `
    UPDATE buys SET date=?, itm=?, cur=?, amt=?, ent=?, remarks=?
    WHERE id=?`
  await mysqlConnection.postQuery(sqlQuery, [
    purchaseDate,
    purCatId,
    currency,
    purchaseAmount,
    busEntId,
    remarks,
    purchaseId
  ])
  await addOrEditPayments(purchaseId, newPayments, oldPayments)
}

async function getNonExistPayments(paymentIds=[]) {
  if (!paymentIds.length) return []
  const sqlQuery = `SELECT id FROM pays WHERE id in (?)`
  const dbPayments = await mysqlConnection.getObjects(sqlQuery, [paymentIds])
  const dbPaymentIds = dbPayments.map(({id}) => id)
  return paymentIds.filter(paymentId => !dbPaymentIds.includes(paymentId))
}

async function getPaymentsInDateRange(dateStart, dateEnd) {
  const sqlQuery = `
    SELECT pays.id AS paymentId,
      buy AS purchaseId,
      DATE_FORMAT(pays.date, "%Y-%m-%d") AS date,
      itms.name AS purchaseCategory,
      accs.name AS accountName,
      pays.amt AS amount,
      ents.name AS businessEntity,
      remarks
    FROM pays
      JOIN buys ON pays.buy=buys.id
      JOIN accs ON pays.acc=accs.id
      JOIN itms ON buys.itm=itms.id
      LEFT JOIN ents ON buys.ent=ents.id
    WHERE pays.date>=? AND pays.date<=?
    ORDER BY pays.date`
  return mysqlConnection.getObjects(sqlQuery, [dateStart, dateEnd])
}

async function getPurchaseInfo(purchaseId) {
  const sqlQuery1 = `
    SELECT buys.id,
      DATE_FORMAT(date, "%Y-%m-%d") AS date,
      itms.name AS purchaseCategory,
      cur AS currency,
      amt AS amount,
      ents.name AS businessEntity,
    remarks
    FROM buys
      LEFT JOIN itms on buys.itm=itms.id
      LEFT JOIN ents on buys.ent=ents.id
    WHERE buys.id=?`
  const purchaseInfo = await mysqlConnection.getObject(sqlQuery1, [purchaseId])
  if (!purchaseInfo) return null

  const sqlQuery2 = `
    SELECT id,
      DATE_FORMAT(date, "%Y-%m-%d") AS date,
      acc AS accountId, amt AS amount
    FROM pays
    WHERE buy=?`
  const payments = await mysqlConnection.getObjects(sqlQuery2, [purchaseId])
  purchaseInfo.payments = payments
  return purchaseInfo
}

function getPurchasesInfo(sqlConditions) {
  const {dateStart, dateEnd, currency, purCatIds, busEntIds} = sqlConditions

  let sqlQuery = `
    SELECT buys.id,
      DATE_FORMAT(date, "%Y-%m-%d") AS date,
      itms.name AS itm,
      ents.name AS ent,
      buys.amt AS buy,
      remarks,
      (buys.amt + IFNULL(pays.amt, 0)) AS paid
    FROM buys LEFT JOIN (
      SELECT buy,
        sum(amt) AS amt
      FROM pays
      GROUP BY buy
    ) pays ON buys.id=pays.buy
      LEFT JOIN itms ON buys.itm=itms.id
      LEFT JOIN ents ON buys.ent=ents.id
    WHERE buys.cur=?`
  const sqlParams = [currency]

  if (dateStart) {
    sqlQuery += ` AND date>=?`
    sqlParams.push(dateStart)
  }

  if (dateEnd) {
    sqlQuery += ` AND date<=?`
    sqlParams.push(dateEnd)
  }
  
  if (purCatIds) {
    sqlQuery += ` AND itm IN (?)`
    sqlParams.push(purCatIds)
  }

  if (busEntIds) {
    sqlQuery += ` AND (ent IN (?)`
    sqlParams.push(busEntIds)
    const canBeNull = busEntIds.find(_ => _ == 0) != undefined
    if (canBeNull) sqlQuery += ` OR ent IS NULL`
    sqlQuery += `)`
  }
  sqlQuery += ` ORDER BY date`

  return mysqlConnection.getObjects(sqlQuery, sqlParams)
}

module.exports = {
  addPurchase,
  deletePayment,
  deletePurchase,
  editPurchase,
  getNonExistPayments,
  getPaymentsInDateRange,
  getPurchaseInfo,
  getPurchasesInfo,
}
