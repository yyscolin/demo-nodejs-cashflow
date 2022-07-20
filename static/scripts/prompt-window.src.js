function openPromptWindow(promptTitle, promptMessage, promptOptions=[]) {
  $(`#prompt-window-title`).html(promptTitle)
  $(`#prompt-window-message`).html(promptMessage)
  $(`#prompt-window-buttons`).html(
    promptOptions.map(promptOption => `<button>${promptOption}</button>`)
  )
  $(`#prompt-window-mask`).show()
  return new Promise(resolve => {
    $(`#prompt-window-buttons>*`).each((i, promptButton) => {
      $(promptButton).on(`click`, () => {
        closePromptWindow()
        resolve($(promptButton).html())
      })
    })
  })
}

function closePromptWindow() {
  $(`#prompt-window-mask`).hide()
  $(`#prompt-window-title`).html(``)
  $(`#prompt-window-message`).html(``)
  $(`#prompt-window-buttons`).html(``)
}
