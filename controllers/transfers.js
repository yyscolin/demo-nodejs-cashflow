const accountsModel = require(`../models/accounts`)
const fieldValidator = require(`../modules/field-validator`)
const transfersModel = require(`../models/transfers`)

async function addExternalTransfer(req, res) {
  try {
    const transferDate = req.body.date
    const transferType = req.body.type
    const accountId = req.body.accountId
    const transferAmount = req.body.amount
    const remarks = req.body.remarks

    const apiErrors = [
      fieldValidator.checkDate(`Transfer date`, transferDate),
      fieldValidator.checkId(`Account ID`, accountId),
      fieldValidator.checkAmount(`Tranfer amount`, transferAmount),
    ]
    for (const apiError of apiErrors)
      if (apiError) return res.status(400).send(apiError)

    const typeId = await transfersModel.getExtTransferTypeId(transferType)

    await transfersModel.addExternalTransfer(
      transferDate, typeId, accountId, transferAmount, remarks
    )
    return res.send()
  } catch(err) {
    console.error(err)
    res.status(500).send()
  }
}

async function addExtTransferType(req, res) {
  try {
    const typeName = req.body.name

    const apiError = fieldValidator.checkString(`Account name`, typeName, 48)
    if (apiError) return res.status(400).send(apiError)

    await transfersModel.addExtTransferType(typeName)
    return res.send()
  } catch(err) {
    console.error(err)
    res.status(500).send()
  }
}

async function addInternalTransfer(req, res) {
  try {
    const transferDate = req.body.date
    const sourceAccount = req.body.sourceAccount
    const sourceAmount = req.body.sourceAmount
    const targetAccount = req.body.targetAccount
    const targetAmount = req.body.targetAmount

    const apiErrors = [
      fieldValidator.checkDate(`Transfer date`, transferDate),
      fieldValidator.checkId(`Source account ID`, sourceAccount),
      fieldValidator.checkId(`Target account ID`, targetAccount),
      fieldValidator.checkAmount(`Source amount`, sourceAmount),
      fieldValidator.checkAmount(`Target amount`, targetAmount),
    ]
    for (const apiError of apiErrors)
      if (apiError) return res.status(400).send(apiError)

    await transfersModel.addInternalTransfer(
      transferDate, sourceAccount, sourceAmount, targetAccount, targetAmount
    )
    res.send()
  } catch(err) {
    console.error(err)
    res.status(500).send()
  }
}

async function deleteExtTransfer(req, res) {
  try {
    const transferId = req.body.id

    const apiError = fieldValidator.checkId(`Transfer ID`, transferId)
    if (apiError) return res.status(400).send(apiError)

    await transfersModel.deleteExtTransfer(transferId)
    res.send()
  } catch(err) {
    console.error(err)
    res.status(500).send()
  }
}

async function deleteExtTransferType(req, res) {
  try {
    const transTypeId = req.body.id

    const apiError = fieldValidator.checkId(`Transfer type ID`, transTypeId)
    if (apiError) return res.status(400).send(apiError)

    await transfersModel.deleteExtTransferType(transTypeId)
    res.send()
  } catch(err) {
    console.error(err)
    res.status(500).send()
  }
}

async function deleteIntTransfer(req, res) {
  try {
    const transferId = req.body.id

    const apiError = fieldValidator.checkId(`Transfer ID`, transferId)
    if (apiError) return res.status(400).send(apiError)

    await transfersModel.deleteIntTransfer(transferId)
    res.send()
  } catch(err) {
    console.error(err)
    res.status(500).send()
  }
}

async function editExternalTransfer(req, res) {
  try {
    const transferId = req.body.id
    const transferDate = req.body.date
    const transferType = req.body.type
    const accountId = req.body.accountId
    const transferAmount = req.body.amount
    const remarks = req.body.remarks

    const apiErrors = [
      fieldValidator.checkId(`Transfer ID`, transferId),
      fieldValidator.checkDate(`Transfer date`, transferDate),
      fieldValidator.checkId(`Account ID`, accountId),
      fieldValidator.checkAmount(`Transfer amount`, transferAmount),
    ]
    for (const apiError of apiErrors)
      if (apiError) return res.status(400).send(apiError)

    const typeId = await transfersModel.getExtTransferTypeId(transferType)

    await transfersModel.editExternalTransfer(
      transferId, transferDate, typeId, accountId, transferAmount, remarks
    )
    res.send()
  } catch(err) {
    console.error(err)
    res.status(500).send()
  }
}

async function editExtTransferType(req, res) {
  try {
    const typeId = req.body.id
    const typeName = req.body.name

    const apiErrors = [
      fieldValidator.checkId(`Transfer type ID`, typeId),
      fieldValidator.checkString(`Account name`, typeName, 48),
    ]
    for (const apiError of apiErrors)
      if (apiError) return res.status(400).send(apiError)

    await transfersModel.editExtTransferType(typeId, typeName)
    res.send()
  } catch(err) {
    console.error(err)
    res.status(500).send()
  }
}

async function editInternalTransfer(req, res) {
  try {
    const transferId = req.body.id
    const transferDate = req.body.date
    const sourceAccount = req.body.sourceAccount
    const sourceAmount = req.body.sourceAmount
    const targetAccount = req.body.targetAccount
    const targetAmount = req.body.targetAmount

    const apiErrors = [
      fieldValidator.checkId(`Transfer ID`, transferId),
      fieldValidator.checkDate(`Transfer date`, transferDate),
      fieldValidator.checkId(`Source account ID`, sourceAccount),
      fieldValidator.checkId(`Target account ID`, targetAccount),
      fieldValidator.checkAmount(`Source amount`, sourceAmount),
      fieldValidator.checkAmount(`Target amount`, targetAmount),
    ]
    for (const apiError of apiErrors)
      if (apiError) return res.status(400).send(apiError)

    await transfersModel.editInternalTransfer(
      transferId, transferDate, sourceAccount,
      sourceAmount, targetAccount, targetAmount,
    )
    res.send()
  } catch(err) {
    console.error(err)
    res.status(500).send()
  }
}

async function renderExtTransferForm(req, res) {
  try {
    let transferInfo = {}
    let apiMethod = `POST`

    const {id: transferId} = req.params
    if (transferId != undefined) {
      const apiError = fieldValidator.checkId(`Transfer ID`, transferId)
      if (apiError) return res.status(404).send(apiError)

      transferInfo = await transfersModel.getExternalTransferInfo(transferId)
      if (!transferInfo) return res.status(404).send(`Page not found`)

      apiMethod = `PUT`
    }

    const accountsInfo = await accountsModel.getAccountsInfo()
    accountsInfo.forEach(
      _ => _.selectedAttr = _.id == transferInfo.acc ? ` selected` : ``
    )

    const transferTypes = await transfersModel.getExtTransferTypes()
    res.render(`external-transfer-form`, {
      transferInfo,
      transferTypes,
      accountsInfo,
      apiMethod,
    })
  } catch(err) {
    console.error(err)
    res.status(500).send()
  }
}

async function renderExtTransTypesPage(req, res) {
  try {
    const pageType = {plural: `Transfer Types`, singular: `Transfer Type`}
    const typeAttributes = [{name: `name`, label: `Name`, type: `text`}]
    const transTypesInfo = await transfersModel.getExtTransferTypes()
    const dataRows = transTypesInfo.map(({id, ...transTypeInfo}) => {
      return {id, columns: transTypeInfo}
    })
    res.render(`common-management-page`, {pageType, typeAttributes, dataRows})
  } catch(err) {
    console.error(err)
    res.status(500).send()
  }
}

async function renderIntTransferForm(req, res) {
  try {
    let transferInfo = {}
    let apiMethod = `POST`

    const transferId = req.params.id
    if (transferId != undefined) {
      const apiError = fieldValidator.checkId(`Transfer ID`, transferId)
      if (apiError) return res.status(404).send(apiError)

      transferInfo = await transfersModel.getInternalTransferInfo(transferId)
      if (!transferInfo)
        return res.status(404).send(`Page not found`)

      apiMethod = `PUT`
    }

    const accountsInfo = await accountsModel.getAccountsInfo()
    res.render(`internal-transfer-form`, {
      transferInfo,
      accountsInfo,
      apiMethod
    })
  } catch(err) {
    console.error(err)
    res.status(500).send()
  }
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
  renderExtTransferForm,
  renderExtTransTypesPage,
  renderIntTransferForm,
}
