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
    const pageWeekNo = req.params.week
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

    const weekIndex = pageWeekNo - 1
    const [dateStart, dateEnd] = [0, 6].map(daysDiplacement => {
      const daysSinceSystemStart = weekIndex * 7 + daysDiplacement
      const timeSinceSystemStart = daysSinceSystemStart * 24 * 60 * 60 * 1000
      const timestamp = systemStartTime + timeSinceSystemStart
      return new Date(timestamp).toLocaleDateString(`fr-CA`)
    })

    const [
      accountBalances,
      internalTransfers,
      externalTransfers,
      payments
    ] = await Promise.all([
      balancesModel.getAccountBalancesInDateRange(dateStart, dateEnd),
      transfersModel.getInternalTransfersInDateRange(dateStart, dateEnd),
      transfersModel.getExternalTransfersInDateRange(dateStart, dateEnd),
      purchasesModel.getPaymentsInDateRange(dateStart, dateEnd),
    ])

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
