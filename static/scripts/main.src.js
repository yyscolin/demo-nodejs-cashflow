function disableScrolling() {
  scrollTop = window.pageYOffset || document.documentElement.scrollTop
  scrollLeft = window.pageXOffset || document.documentElement.scrollLeft
  window.onscroll = () => window.scrollTo(scrollLeft, scrollTop)
}

function enableScrolling() {
  window.onscroll = null
}
