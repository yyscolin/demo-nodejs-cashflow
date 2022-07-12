const fieldValidator = require(`../modules/field-validator`)
const balancesModel = require(`../models/balances`)

async function putBalances(req, res) {
  try {
    const balancesInfo = req.body.balances
    if (!balancesInfo?.length) return res.status(400).send(`No balances given`)

    const accountingDate = req.body.accountingDate
    const apiError = fieldValidator.checkDate(`Accounting date`, accountingDate)
    if (apiError) return res.status(400).send(apiError)

    for (let i = 0; i < balancesInfo.length; i++) {
      const {accountId, amount: balanceAmount} = balancesInfo[i]

      const apiErrors = [
        fieldValidator.checkId(`Account ID`, accountId),
        fieldValidator.checkAmount(`Balance amount`, balanceAmount),
      ]
      for (const apiError of apiErrors)
        if (apiError) return res.status(400).send(apiError)

      balancesInfo[i] = [accountingDate, accountId, balanceAmount]
    }

    await balancesModel.putBalances(balancesInfo)
    res.send()
  } catch(err) {
    console.error(err)
    res.status(500).send()
  }
}

async function renderBalancesFormPage(req, res) {
  try {
    const systemStartDate = new Date(`2018-11-04`)
    const systemStartTime = systemStartDate.getTime()
    const daysDelta = req.params.week * 7 - 1
    const timeDelta = daysDelta * 24 * 60 * 60 * 1000
    const timestamp = systemStartTime + timeDelta
    const accountingDate = new Date(timestamp).toLocaleDateString(`fr-CA`)
    const balancesInfo = await balancesModel.getBalancesOfWeek(accountingDate)
    res.render(`balances-form`, {accountingDate, balancesInfo})
  } catch(err) {
    console.error(err)
    res.status(500).send()
  }
}

async function renderBalancesPage(req, res) {
  try {
    const balancesInfo = await balancesModel.getCurrentBalances()
    res.render(`balances-page`, {balancesInfo})
  } catch(err) {
    console.error(err)
    res.status(500).send()
  }
}

module.exports = {
  putBalances,
  renderBalancesFormPage,
  renderBalancesPage,
}
