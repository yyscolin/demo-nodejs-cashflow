document.onkeydown = function() {
  switch (event.key) {
    case `Enter`:
      if (!event.ctrlKey) return
      if (confirm(`Confirm form submission?`)) {
        submitForm()
      }
      break
  }
}

function setSuccessMessage() {
  if (sessionStorage.getItem(`success`)) {
    const messageBox = document.getElementById(`message-box`)
    messageBox.innerHTML = `Successfully submitted`
    messageBox.style.display = `block`
    messageBox.style.color = `green`
    sessionStorage.removeItem(`success`)
    setTimeout(clearSuccessMessage, 2000)
  }
}

function clearSuccessMessage() {
  const messageBox = document.getElementById(`message-box`)
  messageBox.innerhtml = ``
  messageBox.style.display = `none`
}

function sendPayload(payload, endpoint, method) {
  payload = JSON.stringify(payload)
  const xhr = new XMLHttpRequest()
  xhr.open(method, endpoint, true)
  xhr.setRequestHeader(`Content-Type`, `application/json`)
  xhr.send(payload)
  xhr.onload = function() {
    let messageBox = document.getElementById(`message-box`)
    switch(xhr.status) {
      case 200:
        window.opener.location.reload()
        if (method == `PUT`)
          window.close()
        else {
          sessionStorage.setItem(`success`, true)
          window.location.reload(true)
        }
        break
      case 202:
        window.alert(`Demo site - No data was written`)
        window.close()
        break
      case 400:
        if (messageBox) {
          messageBox.innerHTML = xhr.responseText
          messageBox.style.display = ``
          messageBox.style.color = `red`
        }
        break
      case 500:
        if (messageBox) {
          messageBox.innerHTML = `Internal Server Error #${xhr.responseText}`
          messageBox.style.display = ``
          messageBox.style.color = `red`
        }
    }
  }
}
