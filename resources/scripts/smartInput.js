document.querySelectorAll('.smart-input').forEach(input => {
  input.onfocus = function() {
    let list = this.parentNode.querySelector('.smart-list')
    list.style.display = 'block'
    list.querySelector('.selected').setAttribute('id', 'smart-highlighted')
  }
  input.onblur = function() {
    let target = event.explicitOriginalTarget
    if (!target) return

    let isOption = $(target).hasClass('smart-option')
      || $(target).parent().hasClass('smart-option')
    if (isOption) return

    $(this).next().css('display', 'none')
    $('#smart-highlighted').removeAttr('id')
  }
  input.oninput = function() {
    let list = this.parentNode.querySelector('.smart-list')
    let regex = new RegExp('(^|::| )'+input.value, 'i')
    let isFirst = true
    let highlighted = document.getElementById('smart-highlighted')
    if (highlighted) highlighted.removeAttribute('id')
    list.querySelectorAll('p').forEach(item => {
      if (regex.test(item.getAttribute('syns'))) {
        if (isFirst) {
          item.setAttribute('id', 'smart-highlighted')
          isFirst = false
        }
        item.classList.add('selected')
      } else {
        item.classList.remove('selected')
      }
    })
  }
  input.onkeydown = function(event) {
    let list = this.parentNode.querySelector('.smart-list')
    let highlighted = document.getElementById('smart-highlighted')
    switch (event.key) {
      case 'Escape':
        list.style.display = 'none'
        if (highlighted) highlighted.removeAttribute('id')
        return focusNextInput(this)
      case 'Tab':
      case 'Enter':
        if (!event.shiftKey) {
          event.preventDefault()
          list.style.display = 'none'
          if (highlighted && this.value) {
            this.value = highlighted.innerText
            highlighted.removeAttribute('id')
          }
          focusNextInput(this)
        }
        break
      case 'ArrowUp':
        if (highlighted) {
          let option = highlighted.previousElementSibling
          while (option) {
            if (option.classList.contains('selected')) {
              highlighted.removeAttribute('id')
              option.setAttribute('id', 'smart-highlighted')
              if (option.offsetTop - 100 <= list.scrollTop)
                list.scrollTop = option.offsetTop - 120
              break
            }
            option = option.previousElementSibling
          }
        }
        break
      case 'ArrowDown':
        if (highlighted) {
          let option = highlighted.nextElementSibling
          while (option) {
            if (option.classList.contains('selected')) {
              highlighted.removeAttribute('id')
              option.setAttribute('id', 'smart-highlighted')
              if (option.offsetTop - 120 >= list.scrollTop)
                list.scrollTop = option.offsetTop - 120
              break
            }
            option = option.nextElementSibling
          }
        }
        break
    }
  }
})

$('.smart-option').each((i, element) => {
  $(element).click(() => {
    $(element).parent().prev().val($(element).text())
    $(element).parent().css('display', 'none')
    $('#smart-highlighted').removeAttr('id')
  })
  $(element).mouseover(() => {
    $('#smart-highlighted').removeAttr('id')
    $(element).attr('id', 'smart-highlighted')
  })
})

function focusNextInput(currentInput) {
  let isThis = false
  let inputs = document.querySelectorAll('input, textarea, select')
  for (i = 0; i < inputs.length; i++) {
    if (isThis) return inputs[i].focus()
    else if (currentInput == inputs[i]) isThis = true
  }
}
