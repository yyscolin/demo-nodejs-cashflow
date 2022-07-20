function appendDataList(dataListId, newOption) {
  if (!dataListId || !newOption || !$(`#${dataListId}`).length) return
  let dataList = []
  $(`#${dataListId} option`).each((i, option) => dataList.push($(option).val()))
  if (!dataList.includes(newOption)) {
    dataList.push(newOption)
    dataList.sort((a, b) => a.toLowerCase() > b.toLowerCase())
    $(`#${dataListId}`).html(dataList.map(_ => `<option value="${_}">`))
  }
}
