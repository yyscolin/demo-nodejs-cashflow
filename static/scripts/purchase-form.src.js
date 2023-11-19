function openPurchaseForm(purchaseId) {
  if (purchaseId) {
    openPromptWindow(
      `Loading Purchase Entry`,
      `Retrieving details... Please wait...`
    )

    $.get(`/api/purchase/${purchaseId}`, payload => {
      $(`#purchase-form-fields [name=date]`).val(payload.date)
      $(`#purchase-form-fields [name=category]`).val(payload.purchaseCategory)
      $(`#purchase-form-fields [name=currency]`).val(payload.currency)
      $(`#purchase-form-fields [name=amount]`).val(payload.amount)
      $(`#purchase-form-fields [name=entity]`).val(payload.businessEntity)
      $(`#purchase-form-fields [name=remarks]`).val(payload.remarks)
      payload.payments.forEach(addPaymentRow)
      $(`#purchase-form-del-btn`).show()
        .on(`click`, () => deleteEntry(`purchase`, purchaseId))
      $(`#purchase-form-sub-btn`).attr(
        `onclick`,
        `submitPurchaseForm(${purchaseId})`
      )
      closePromptWindow()
    })
  }

  disableScrolling()
  $(`#purchase-form-mask`).show()
}

function resetPurchaseForm(isFullReset=false) {
  $(`#purchase-form-del-btn`).off(`click`).hide()
  $(`#no-payments-msg`).show()
  $(`#payment-records-wrapper`).hide()
  $(`#payment-records-list>*`).remove()
  $(`#purchase-form-sub-btn`).attr(`onclick`, `submitPurchaseForm()`)
  if (isFullReset) {
    $(`#purchase-form-mask [name]`).val(``)
  } else {
    $(`#purchase-form-fields [name=amount]`).val(``)
    $(`#purchase-form-fields [name=entity]`).val(``)
    $(`#purchase-form-fields [name=remarks]`).val(``)
  }
  const todaysDate = new Date().toLocaleDateString(`fr-ca`)
  $(`#purchase-form-fields [name=date]`).val(todaysDate)
}

function closePurchaseForm() {
  $(`#purchase-form-mask`).hide()
  resetPurchaseForm()
  enableScrolling()
}

function submitPurchaseForm(purchaseId) {
  const payload = {
    date: $(`#purchase-form-fields [name=date]`).val(),
    category: $(`#purchase-form-fields [name=category]`).val(),
    currency: $(`#purchase-form-fields [name=currency]`).val(),
    amount: $(`#purchase-form-fields [name=amount]`).val(),
    entity: $(`#purchase-form-fields [name=entity]`).val(),
    remarks: $(`#purchase-form-fields [name=remarks]`).val(),
    payments: [],
  }

  $(`#payment-records-list>*`).each((i, paymentRow) => {
    const paymentId = $(paymentRow).attr(`data-payment-id`)
    const paymentInfo = {
      date: $(paymentRow).find(`[name=date]`).val(),
      accountId: $(paymentRow).find(`[name=account-id]`).val(),
      amount: $(paymentRow).find(`[name=amount]`).val(),
    }
    if (paymentId) paymentInfo.id = paymentId
    payload.payments.push(paymentInfo)
  })

  openPromptWindow(
    `Submitting Form`,
    `Please wait while form is being submitted...`,
  )

  let submitMethod = `POST`
  if (purchaseId) {
    payload.id = purchaseId
    submitMethod = `PUT`
  }
  $.ajax({
    url: `/api/purchase`,
    type: submitMethod,
    contentType: `application/json`,
    data: JSON.stringify(payload),
    success: async (data, textStatus, jqXHR) => {
      resetPurchaseForm()

      if (jqXHR?.status == 202) {
        await openPromptWindow(
          `Submission Successful`,
          `However, this is a demo website, so no data was written`,
          [`OK`]
        )
      } else {
        if (payload.category)
          appendDataList(`purchase-categories-list`, payload.category)
        if (payload.entity)
          appendDataList(`business-entities-list`, payload.entity)
        appendDataList(`currencies-list`, payload.currency)
        await openPromptWindow(
          `Submission Completed`,
          `Form has been successfully submitted`,
          [`OK`]
        )
      }

      window.location.reload()
    },
    error: handleAjaxError,
  })
}

function addPaymentRow(paymentInfo) {
  $(`#no-payments-msg`).hide()
  $(`#payment-records-wrapper`).show()

  const selectedCurrency = $(`#purchase-form-fields [name=currency]`).val()
  let paymentDate = ``
  let paymentAccountId = ``
  let paymentAmount = ``
  if (paymentInfo) {
    paymentDate = paymentInfo.date
    paymentAccountId = paymentInfo.accountId
    paymentAmount = paymentInfo.amount
  } else {
    const lastPaymentRow = $(`#payment-records-list>*:last-child`)
    const hasPreviousRecord = lastPaymentRow.length > 0
    if (hasPreviousRecord) {
      paymentDate = lastPaymentRow.find(`[name=date]`).val()
      paymentAccountId = lastPaymentRow.find(`[name=account-id]`).val()
    } else {
      paymentDate = $(`#purchase-form-fields [name=date]`).val()
      if (selectedCurrency) paymentAccountId = accountsInfo.find(
        _ => _.currency == selectedCurrency
      )?.id
      paymentAmount = $(`#purchase-form-fields [name=amount]`).val()
      paymentAmount = parseFloat(paymentAmount) != NaN ? paymentAmount * -1 : ``
    }
  }

  const paymentId = paymentInfo?.id || ``
  let fontColor = `green`
  let deleteButtonHTML = ``
    + `<button onclick="removePaymentRow(this)" `
    + `style="color:${fontColor}">REMOVE</button>`
  if (paymentId) {
    fontColor = ``
    deleteButtonHTML = ``
      + `<button onclick="deleteEntry(\`payment\`, ${paymentId})">`
      + `DELETE</button>`
  }
  $(`#payment-records-list`).append(``
    + `<div data-payment-id="${paymentId}">`
    + `<div style="display:inline-block;text-align:center;width:112px">`
    + `<input name="date" style="color:${fontColor}" type="date" `
    + `value="${paymentDate}">`
    + `</div>`
    + `<div style="display:inline-block;text-align:center;width:150px">`
    + `<select name="account-id" style="color:${fontColor}">`
    + accountsInfo.map(_ => {
      const isValidAccount = !selectedCurrency || _.currency == selectedCurrency
      const fontColor = isValidAccount ? `green` : `red`
      const selectedAttr = _.id == paymentAccountId ? `selected` : ``
      return ``
        + `<option value="${_.id}" style="color:${fontColor}" ${selectedAttr}>`
        + _.name
        + `</option>`
    }).join(``)
    + `</select>`
    + `</div>`
    + `<div style="display:inline-block;text-align:center;width:150px">`
    + `<input name="amount" type="number" style="color:${fontColor}" `
    + `value="${paymentAmount}">`
    + `</div>`
    + `<div style="display:inline-block;text-align:center;width:70px">`
    + deleteButtonHTML
    + `</div>`
    + `</div>`
  )
}

function removePaymentRow(button) {
  $(button).parent().parent().remove()
  if (!$(`#payment-records-list>*`).length) {
    $(`#payment-records-wrapper`).hide()
    $(`#no-payments-msg`).show()
  }
}

resetPurchaseForm()
