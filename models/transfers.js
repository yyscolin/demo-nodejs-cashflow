const mysqlConnection = require(`../modules/mysql-connection`)

function addExternalTransfer(
  transferDate, transTypeId, accountId, transferAmount, remarks
) {
  const sqlQuery = `
    INSERT INTO exts (date, tft, acc, amt, remarks)
    VALUES (?,?,?,?,?)`
  return mysqlConnection.postQuery(sqlQuery, [
    transferDate, transTypeId, accountId, transferAmount, remarks
  ])
}

function addExtTransferType(transTypeName) {
  const sqlQuery = `INSERT INTO tfts (name) VALUES (?)`
  return mysqlConnection.postQuery(sqlQuery, [transTypeName])
}

function addInternalTransfer(
  transferDate, sourceAccount, sourceAmount, targetAccount, targetAmount
) {
  const sqlQuery = `
    INSERT INTO ints (date, sr_acc, sr_amt, de_acc, de_amt)
    VALUES (?,?,?,?,?)`
  return mysqlConnection.postQuery(sqlQuery, [
    transferDate, sourceAccount, sourceAmount, targetAccount, targetAmount,
  ])
}

function deleteExtTransfer(transferId) {
  const sqlQuery = `DELETE FROM exts WHERE id=?`
  return mysqlConnection.postQuery(sqlQuery, [transferId])
}

function deleteExtTransferType(transTypeId) {
  const sqlQuery = `DELETE FROM tfts WHERE id=?`
  return mysqlConnection.postQuery(sqlQuery, [transTypeId])
}

function deleteIntTransfer(transferId) {
  const sqlQuery = `DELETE FROM ints WHERE id=?`
  return mysqlConnection.postQuery(sqlQuery, [transferId])
}

function editExternalTransfer(
  transferId, transferDate, transTypeId, accountId, transferAmount, remarks
) {
  const sqlQuery = `
    UPDATE exts SET date=?, tft=?, acc=?, amt=?, remarks=?
    WHERE id=?`
  return mysqlConnection.postQuery(sqlQuery, [
    transferDate, transTypeId, accountId, transferAmount, remarks, transferId
  ])
}

function editExtTransferType(transTypeId, transTypeName) {
  const sqlQuery = `UPDATE tfts SET name=? WHERE id=?`
  return mysqlConnection.postQuery(sqlQuery, [transTypeName, transTypeId])
}

function editInternalTransfer(
  transferId, transferDate, sourceAccount,
  sourceAmount, targetAccount, targetAmount
) {
  const sqlQuery = `
    UPDATE ints SET date=?, sr_acc=?, sr_amt=?, de_acc=?,
    de_amt=? WHERE id=?`
  return mysqlConnection.postQuery(sqlQuery, [
    transferDate, sourceAccount, sourceAmount,
    targetAccount, targetAmount, transferId,
  ])
}

function getExternalTransferInfo(transferId) {
  const sqlQuery = `
    SELECT exts.id,
      date_format(date, "%Y-%m-%d") AS date,
      name AS transferType,
      acc,
      amt AS amount,
      remarks
    FROM exts join tfts ON exts.tft=tfts.id
    WHERE exts.id=?`
  return mysqlConnection.getObject(sqlQuery, [transferId])
}

async function getExtTransferTypeId(transTypeName) {
  let sqlQuery = `SELECT id FROM tfts WHERE name=?`
  let dbResponse = await mysqlConnection.getObject(sqlQuery, [transTypeName])
  if (dbResponse) return dbResponse.id

  sqlQuery = `INSERT INTO tfts (name) VALUES (?)`
  dbResponse = await mysqlConnection.postQuery(sqlQuery, [transTypeName])
  return dbResponse.insertId
}

function getExtTransferTypes() {
  const sqlQuery = `SELECT id, name FROM tfts`
  return mysqlConnection.getObjects(sqlQuery)
}

function getExternalTransfersInDateRange(dateStart, dateEnd) {
  const sqlQuery = `
    SELECT exts.id,
      DATE_FORMAT(date, "%Y-%m-%d") AS date,
      tfts.name AS transferType,
      accs.name AS accountName,
      amt AS amount,
      --remarks IS NOT NULL AS hasRemarks
    FROM exts
      LEFT JOIN tfts ON exts.tft=tfts.id
      JOIN accs ON exts.acc=accs.id
    WHERE date>=? AND date<=?
    ORDER BY date`
  return mysqlConnection.getObjects(sqlQuery, [dateStart, dateEnd])
}

function getInternalTransferInfo(transferId) {
  const sqlQuery = `
    SELECT id,
      DATE_FORMAT(date, "%Y-%m-%d") AS date,
      sr_acc AS sourceAccount,
      sr_amt AS sourceAmount,
      de_acc AS targetAccount,
      de_amt AS targetAmount
    FROM ints WHERE id=?`
  return mysqlConnection.getObject(sqlQuery, [transferId])
}

function getInternalTransfersInDateRange(dateStart, dateEnd) {
  const sqlQuery = `
    SELECT ints.id,
      DATE_FORMAT(date, "%Y-%m-%d") AS date,
      t1.name AS sourceAccountName,
      t2.name AS targetAccountName,
      sr_amt AS sourceAmount,
      de_amt AS targetAmount
    FROM ints
      JOIN accs t1 ON ints.sr_acc=t1.id
      JOIN accs t2 ON ints.de_acc=t2.id
    WHERE date>=? AND date<=?
    ORDER BY date,
      sourceAccountName,
      targetAccountName,
      sourceAmount,
      targetAmount`
  return mysqlConnection.getObjects(sqlQuery, [dateStart, dateEnd])
}

module.exports = {
  addExternalTransfer,
  addExtTransferType,
  addInternalTransfer,
  deleteExtTransfer,
  deleteExtTransferType,
  deleteIntTransfer,
  editExternalTransfer,
  editExtTransferType,
  editInternalTransfer,
  getExternalTransferInfo,
  getExtTransferTypeId,
  getExtTransferTypes,
  getExternalTransfersInDateRange,
  getInternalTransferInfo,
  getInternalTransfersInDateRange,
}
