const mysqlConnection = require(`../modules/mysql-connection`)

function addExternalTransfer(
  transferDate, transTypeId, accountId, transferAmount, remarks
) {
  const sqlQuery = `
    INSERT INTO external_transfers (
      external_transfer_date,
      transfer_type_id,
      account_id,
      external_transfer_amount,
      remarks
    ) VALUES (?,?,?,?,?)`
  return mysqlConnection.postQuery(sqlQuery, [
    transferDate, transTypeId, accountId, transferAmount, remarks
  ])
}

function addExtTransferType(transTypeName) {
  const sqlQuery = `INSERT INTO transfer_types (transfer_type_name) VALUES (?)`
  return mysqlConnection.postQuery(sqlQuery, [transTypeName])
}

function addInternalTransfer(
  transferDate, sourceAccount, sourceAmount, targetAccount, targetAmount
) {
  const sqlQuery = `
    INSERT INTO internal_transfers (
      internal_transfer_date,
      source_account_id,
      source_amount,
      destination_account_id,
      destination_amount
    ) VALUES (?,?,?,?,?)`
  return mysqlConnection.postQuery(sqlQuery, [
    transferDate, sourceAccount, sourceAmount, targetAccount, targetAmount,
  ])
}

function deleteExtTransfer(transferId) {
  const sqlQuery = `DELETE FROM external_transfers WHERE external_transfer_id=?`
  return mysqlConnection.postQuery(sqlQuery, [transferId])
}

function deleteExtTransferType(transTypeId) {
  const sqlQuery = `DELETE FROM transfer_types WHERE transfer_type_id=?`
  return mysqlConnection.postQuery(sqlQuery, [transTypeId])
}

function deleteIntTransfer(transferId) {
  const sqlQuery = `DELETE FROM internal_transfers WHERE internal_transfer_id=?`
  return mysqlConnection.postQuery(sqlQuery, [transferId])
}

function editExternalTransfer(
  transferId, transferDate, transTypeId, accountId, transferAmount, remarks
) {
  const sqlQuery = `
    UPDATE external_transfers
    SET external_transfer_date=?,
      transfer_type_id=?,
      account_id=?,
      external_transfer_amount=?,
      remarks=?
    WHERE external_transfer_id=?`
  return mysqlConnection.postQuery(sqlQuery, [
    transferDate, transTypeId, accountId, transferAmount, remarks, transferId
  ])
}

function editExtTransferType(transTypeId, transTypeName) {
  const sqlQuery = `
    UPDATE transfer_types SET transfer_type_name=? WHERE transfer_type_id=?`
  return mysqlConnection.postQuery(sqlQuery, [transTypeName, transTypeId])
}

function editInternalTransfer(
  transferId, transferDate, sourceAccount,
  sourceAmount, targetAccount, targetAmount
) {
  const sqlQuery = `
    UPDATE internal_transfers
    SET internal_transfer_date=?,
      source_account_id=?,
      source_amount=?,
      destination_account_id=?,
      destination_amount=?
    WHERE internal_transfer_id=?`
  return mysqlConnection.postQuery(sqlQuery, [
    transferDate, sourceAccount, sourceAmount,
    targetAccount, targetAmount, transferId,
  ])
}

function getExternalTransferInfo(transferId) {
  const sqlQuery = `
    SELECT external_transfer_id AS id,
      DATE_FORMAT(external_transfer_date, "%Y-%m-%d") AS date,
      transfer_type_name AS transferType,
      account_id AS acc,
      external_transfer_amount AS amount,
      remarks
    FROM external_transfers
    JOIN transfer_types USING(transfer_type_id)
    WHERE external_transfer_id=?`
  return mysqlConnection.getObject(sqlQuery, [transferId])
}

async function getExtTransferTypeId(transTypeName) {
  let sqlQuery = `
    SELECT transfer_type_id AS id
    FROM transfer_types
    WHERE transfer_type_name=?`
  let dbResponse = await mysqlConnection.getObject(sqlQuery, [transTypeName])
  if (dbResponse) return dbResponse.id

  sqlQuery = `INSERT into transfer_types (transfer_type_name) VALUES (?)`
  dbResponse = await mysqlConnection.postQuery(sqlQuery, [transTypeName])
  return dbResponse.insertId
}

function getExtTransferTypes() {
  const sqlQuery = `
    SELECT transfer_type_id AS id,
      transfer_type_name AS name
    FROM transfer_types`
  return mysqlConnection.getObjects(sqlQuery)
}

function getExternalTransfersInDateRange(dateStart, dateEnd) {
  const sqlQuery = `
    SELECT external_transfer_id AS id,
      DATE_FORMAT(external_transfer_date, "%Y-%m-%d") AS date,
      transfer_type_name AS transferType,
      account_id AS accountId,
      account_name AS accountName,
      external_transfer_amount AS amount,
      --remarks IS NOT NULL AS hasRemarks
    FROM external_transfers
      LEFT JOIN transfer_types USING(transfer_type_id)
      JOIN accounts USING (account_id)
    WHERE external_transfer_date>=?
      AND external_transfer_date<=?
    ORDER BY external_transfer_date`
  return mysqlConnection.getObjects(sqlQuery, [dateStart, dateEnd])
}

function getInternalTransferInfo(transferId) {
  const sqlQuery = `
    SELECT internal_transfer_id AS id,
      DATE_FORMAT(internal_transfer_date, "%Y-%m-%d") AS date,
      source_account_id AS sourceAccount,
      source_amount AS sourceAmount,
      destination_account_id AS targetAccount,
      destination_amount AS targetAmount
    FROM internal_transfers
    WHERE internal_transfer_id=?`
  return mysqlConnection.getObject(sqlQuery, [transferId])
}

function getInternalTransfersInDateRange(dateStart, dateEnd) {
  const sqlQuery = `
    SELECT internal_transfer_id AS id,
      DATE_FORMAT(internal_transfer_date, "%Y-%m-%d") AS date,
      source_account_id AS sourceAccountId,
      destination_account_id AS targetAccountId,
      t1.account_name AS sourceAccountName,
      t2.account_name AS targetAccountName,
      source_amount AS sourceAmount,
      destination_amount AS targetAmount
    FROM internal_transfers
      JOIN accounts t1 ON t1.account_id=source_account_id
      JOIN accounts t2 ON t2.account_id=destination_account_id
    WHERE internal_transfer_date>=?
      AND internal_transfer_date<=?
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
