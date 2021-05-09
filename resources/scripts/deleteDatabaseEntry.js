function deleteDatabaseEntry(button, database, table, id) {
  if (confirm('Are you sure?')) {
    let payload = JSON.stringify({database, table, id})
    let xhr = new XMLHttpRequest()
    xhr.open('DELETE', '/', true)
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.send(payload)
    xhr.onload = function() {
      switch(xhr.status) {
        case 200:
          let row = button.parentNode.parentNode
          let form = row.parentNode
          form.removeChild(row)
          break
        case 500:
          alert(`Internal Server Error #${xhr.responseText}`)
      }
    }
  }
}