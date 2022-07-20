function disableScrolling() {
  scrollTop = window.pageYOffset || document.documentElement.scrollTop
  scrollLeft = window.pageXOffset || document.documentElement.scrollLeft
  window.onscroll = () => window.scrollTo(scrollLeft, scrollTop)
}

function enableScrolling(jqXHR, textStatus, errorThrown) {
  window.onscroll = null
}

function handleAjaxError(jqXHR, textStatus, errorThrown) {
  openPromptWindow(
    `An Error has Occured`,
    jqXHR.responseText || jqXHR.statusText,
    [`OK`]
  )
}
