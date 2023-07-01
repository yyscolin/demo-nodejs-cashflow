document.querySelectorAll(`.smart-filter-display`).forEach(_ => {
  _.onfocus = function() {
    let box = this.parentNode.querySelector(`.smart-filter-box`)
    box.style.display = `block`
    box.querySelector(`input`).focus()
  }
})

document.querySelectorAll(`.smart-filter-input`).forEach(_ => {
  _.oninput = function() {
    $(this).siblings(`.smart-filter-list`).children().each((i, listOption) => {
      const dataName = $(listOption).attr(`data-name`).toLowerCase()
      const isMatch = !this.value || dataName.includes(this.value.toLowerCase())
      $(listOption).css(`display`, isMatch ? `block` : `none`)
    })
  }
  _.onblur = function(event) {
    let target = event.relatedTarget
    if (!target) target = event.explicitOriginalTarget
    if (target.nodeType == 3) target = target.parentNode
    if (target.getAttribute(`smart-class`) != this.getAttribute(`smart-class`)) {
      let box = this.parentNode
      box.style.display = `none`
    }
  }
})

document.querySelectorAll(`.smart-filter-box button`).forEach(_ => {
  _.onclick = function() {
    let box = this.parentNode
    let display = box.previousElementSibling
    display.value = ``
    display.setAttribute(`data-value`, ``)
    let input = this.previousElementSibling
    input.value = ``
    let list = box.querySelector(`.smart-filter-list`)
    let options = list.querySelectorAll(`.smart-filter-option`)
    options.forEach(option => {
      option.style.display = ``
      option.querySelector(`input`).checked = false
    })
  }
})

document.querySelectorAll(`.smart-filter-checkbox`).forEach(_ => {
  _.onclick = function() {
    let option = this.parentNode
    let list = option.parentNode
    let box = list.parentNode
    let display = box.previousElementSibling
    let options = list.children

    const checkedBoxes = Array.from(
      list.querySelectorAll(`.smart-filter-checkbox:checked`)
    )
    const checkedBoxesIds = checkedBoxes.map(
      _ => _.parentNode.getAttribute(`value`)
    )

    $(display).attr(`data-value`, checkedBoxesIds.join(`,`))
    $(display).val(checkedBoxes.length > 1
      ? `${checkedBoxes.length} items selected`
      : $(checkedBoxes[0])?.parent()?.attr(`data-name`) || ``
    )
  }
})

$(`.smart-filter-box`).each((i, filterInput) => {
  $(filterInput).on(`click`, () => {
    filterInput.querySelector(`input`).focus()
  })
})
