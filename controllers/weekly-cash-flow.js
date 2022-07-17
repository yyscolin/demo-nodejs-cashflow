const balancesModel = require(`../models/balances`)
const purchasesModel = require(`../models/purchases`)
const transfersModel = require(`../models/transfers`)

async function renderWeeklyCashFlowPage(req, res) {
  try {
    const systemStartDate = new Date(process.env.SYSTEM_START_DATE)
    const systemStartTime = systemStartDate.getTime()
    const timeSinceSystemStart = new Date().getTime() - systemStartTime
    const weeksSinceSystemStart = timeSinceSystemStart / 7 / 24 / 60 / 60 / 1000
    const currentWeekNo = Math.ceil(weeksSinceSystemStart)

    let isRedirecting = false
    let pageWeekNo = req.params.week
    if (!pageWeekNo)
      isRedirecting = true
    else {
      const isInteger = parseInt(pageWeekNo) == pageWeekNo
      const isBeforeMin = pageWeekNo < 1
      const isAfterMax = pageWeekNo > currentWeekNo
      isRedirecting = !isInteger || isBeforeMin || isAfterMax
    }

    if (isRedirecting)
      return res.redirect(`/weekly-cash-flow/${currentWeekNo}`)

    pageWeekNo = parseInt(pageWeekNo)
    const weekIndex = pageWeekNo - 1
    const [
      dateBefore, // 1 day before the start of the financial week
      dateStart, // the first day of the financial week
      dateEnd, // the last day of the financial week
    ] = [-1, 0, 6].map(daysDiplacement => {
      const daysSinceSystemStart = weekIndex * 7 + daysDiplacement
      const timeSinceSystemStart = daysSinceSystemStart * 24 * 60 * 60 * 1000
      const timestamp = systemStartTime + timeSinceSystemStart
      return new Date(timestamp).toLocaleDateString(`fr-CA`)
    })

    const [
      accountBalancesLast, // last financial week's account balance
      accountBalancesThis, // this financial week's account balance
      internalTransfers,
      externalTransfers,
      payments,
    ] = await Promise.all([
      balancesModel.getCurrentBalances(dateBefore),
      balancesModel.getCurrentBalances(dateEnd),
      transfersModel.getInternalTransfersInDateRange(dateStart, dateEnd),
      transfersModel.getExternalTransfersInDateRange(dateStart, dateEnd),
      purchasesModel.getPaymentsInDateRange(dateStart, dateEnd),
    ])

    const accountBalances = accountBalancesLast.map(({id, name, amount}) => {
      const getSum = array => array.reduce(
        (accum, current) => {
          if (accountId == current.accountId)
            accum += current.amount
          return Math.round(accum * 100) / 100
        }, 0)

      const accountId = id
      const accountName = name
      const startingAmount = amount
      const paymentAmount = getSum(payments)
      const internalTransferAmount = internalTransfers.reduce(
        (accum, transferInfo) => {
          if (accountId == transferInfo.sourceAccountId)
            accum -= transferInfo.sourceAmount
          if (accountId == transferInfo.targetAccountId)
            accum += transferInfo.targetAmount
          return Math.round(accum * 100) / 100
        }, 0
      )
      const externalTransferAmount = getSum(externalTransfers)
      const balanceAmount = accountBalancesThis.find(_ => _.id == accountId)
        .amount

      if (
        startingAmount == balanceAmount
        && !paymentAmount
        && !internalTransferAmount
        && !externalTransferAmount
      ) return null

      const errorAmount = startingAmount
        + paymentAmount
        + internalTransferAmount
        + externalTransferAmount
        - balanceAmount

      return {
        accountName,
        startingAmount,
        paymentAmount,
        internalTransferAmount,
        externalTransferAmount,
        balanceAmount,
        errorAmount: Math.round(errorAmount * 100) / 100,
      }
    }).filter(_ => _ != null)

    res.render(`weekly-cash-flow-page`, {
      dateStart,
      dateEnd,
      pageWeekNo,
      currentWeekNo,
      accountBalances,
      internalTransfers,
      externalTransfers,
      payments,
    })
  } catch(err) {
    console.error(err)
    res.status(500).send()
  }
}

module.exports = {
  renderWeeklyCashFlowPage,
}
