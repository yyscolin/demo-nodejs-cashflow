function disableScrolling() {
  scrollTop = window.pageYOffset || document.documentElement.scrollTop
  scrollLeft = window.pageXOffset || document.documentElement.scrollLeft
  window.onscroll = () => window.scrollTo(scrollLeft, scrollTop)
}

function enableScrolling(jqXHR, textStatus, errorThrown) {
  window.onscroll = null
}

async function deleteEntry(entryType, rowId) {
  const promptResponse = await openPromptWindow(
    `Confirm Deletion`,
    `Click CONFIRM button to confirm the deletion of this entry`,
    [`CONFIRM`, `CANCEL`],
  )
  if (promptResponse != `CONFIRM`) return

  openPromptWindow(
    `Deleting Entry`,
    `Deletion in progress... Please wait...`,
  )

  $.ajax({
    url: `/api/${entryType}`,
    type: `DELETE`,
    contentType: `application/json`,
    data: JSON.stringify({id: rowId}),
    success: async (data, textStatus, jqXHR) => {
      switch (entryType) {
        case `purchase`:
          resetPurchaseForm()
          break
        case `payment`:
          if (!$(`#payment-records-list>*`).length) {
            $(`#payment-records-wrapper`).hide()
            $(`#no-payments-msg`).show()
          }
          break
        default:
          closeFormWindow()
      }

      $(`[data-${entryType}-id=${rowId}]`).remove()
      openPromptWindow(
        `Deletion Completed`,
        `This entry was successfully deleted`,
        [`OK`]
      )
    },
    error: handleAjaxError,
  })
}

function handleAjaxError(jqXHR, textStatus, errorThrown) {
  openPromptWindow(
    `An Error has Occured`,
    jqXHR.responseText || jqXHR.statusText,
    [`OK`]
  )
}
