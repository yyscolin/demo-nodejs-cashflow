const mysqlConnection = require(`../modules/mysql-connection`)

async function addOrEditPayments(purchaseId, newPayments=[], oldPayments=[]) {
  if (newPayments.length) {
    const sqlQuery = `
      INSERT INTO payments (
        payment_id, purchase_id, payment_date, account_id, payment_amount
      ) VALUES ?`
    const sqlParams = newPayments.map(payment =>
      [payment.id, purchaseId, payment.date, payment.accountId, payment.amount]
    )
    await mysqlConnection.postQuery(sqlQuery, [sqlParams])
  }
  if (oldPayments.length) {
    const sqlQuery = `
      UPDATE payments
      SET payment_date=?, account_id=?, payment_amount=?
      WHERE payment_id=?;`

    let sqlQueries = ``
    let sqlData = []

    oldPayments.forEach(payment => {
      sqlQueries += sqlQuery
      sqlData.push(payment.date, payment.accountId, payment.amount, payment.id)
    })
    await mysqlConnection.postQuery(sqlQueries, sqlData)
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
  const sqlQuery = `
    INSERT INTO purchases (
      purchase_date,
      purchase_category_id,
      purchase_currency,
      purchase_amount,
      business_entity_id,
      remarks
    ) VALUES (?,?,?,?,?,?)`
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
  const sqlQuery = `DELETE FROM payments WHERE payment_id=?`
  return mysqlConnection.postQuery(sqlQuery, [paymentId])
}


function deletePurchase(purchaseId) {
  const sqlQuery = `DELETE FROM purchases WHERE purchase_id=?`
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
    UPDATE purchases
    SET purchase_date=?,
      purchase_category_id=?,
      purchase_currency=?,
      purchase_amount=?,
      business_entity_id=?,
      remarks=?
    WHERE purchase_id=?`
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
  const sqlQuery = `
    SELECT payment_id AS id FROM payments WHERE payment_id in (?)`
  const dbPayments = await mysqlConnection.getObjects(sqlQuery, [paymentIds])
  const dbPaymentIds = dbPayments.map(({id}) => id)
  return paymentIds.filter(paymentId => !dbPaymentIds.includes(paymentId))
}

async function getPaymentsInDateRange(dateStart, dateEnd) {
  const sqlQuery = `
    SELECT payment_id AS paymentId,
      purchase_id AS purchaseId,
      DATE_FORMAT(payment_date, "%Y-%m-%d") AS date,
      purchase_category_name AS purchaseCategory,
      account_id AS accountId,
      account_name AS accountName,
      payment_amount AS amount,
      business_entity_name AS businessEntity,
      remarks
    FROM payments
      JOIN purchases USING(purchase_id)
      JOIN accounts USING(account_id)
      JOIN purchase_categories USING(purchase_category_id)
      LEFT JOIN business_entities USING(business_entity_id)
    WHERE payment_date>=? AND payment_date<=?
    ORDER BY payment_date`
  return mysqlConnection.getObjects(sqlQuery, [dateStart, dateEnd])
}

async function getPurchaseInfo(purchaseId) {
  const sqlQuery1 = `
    SELECT purchase_id AS id,
      DATE_FORMAT(purchase_date, "%Y-%m-%d") AS date,
      purchase_category_name AS purchaseCategory,
      purchase_currency AS currency,
      purchase_amount AS amount,
      business_entity_name AS businessEntity,
    remarks
    FROM purchases
      LEFT JOIN purchase_categories USING(purchase_category_id)
      LEFT JOIN business_entities USING(business_entity_id)
    WHERE purchase_id=?`

  const purchaseInfo = await mysqlConnection.getObject(sqlQuery1, [purchaseId])
  if (!purchaseInfo) return null

  const sqlQuery2 = `
    SELECT payment_id AS id,
      DATE_FORMAT(payment_date, "%Y-%m-%d") AS date,
      account_id AS accountId,
      payment_amount AS amount
    FROM payments
    WHERE purchase_id=?`
  const payments = await mysqlConnection.getObjects(sqlQuery2, [purchaseId])
  purchaseInfo.payments = payments
  return purchaseInfo
}

function getPurchasesInfo(sqlConditions) {
  const {dateStart, dateEnd, currency, purCatIds, busEntIds} = sqlConditions

  let sqlQuery = `
    SELECT purchase_id AS id,
      DATE_FORMAT(purchase_date, "%Y-%m-%d") AS date,
      purchase_category_name AS itm,
      business_entity_name AS ent,
      purchase_amount AS buy,
      remarks,
      (purchase_amount + IFNULL(payment_amount, 0)) AS paid
    FROM purchases LEFT JOIN (
      SELECT purchase_id,
        sum(payment_amount) AS payment_amount
      FROM payments
      GROUP BY purchase_id
    ) payments USING(purchase_id)
      LEFT JOIN purchase_categories USING(purchase_category_id)
      LEFT JOIN business_entities USING(business_entity_id)
    WHERE purchase_currency=?`
  const sqlParams = [currency]

  if (dateStart) {
    sqlQuery += ` AND purchase_date>=?`
    sqlParams.push(dateStart)
  }

  if (dateEnd) {
    sqlQuery += ` AND purchase_date<=?`
    sqlParams.push(dateEnd)
  }
  
  if (purCatIds) {
    sqlQuery += ` AND purchase_category_id IN (?)`
    sqlParams.push(purCatIds)
  }

  if (busEntIds) {
    sqlQuery += ` AND (business_entity_id IN (?)`
    sqlParams.push(busEntIds)
    const canBeNull = busEntIds.find(_ => _ == 0) != undefined
    if (canBeNull) sqlQuery += ` OR business_entity_id IS NULL`
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
