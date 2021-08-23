$(document).ready(function() {
  let keywordSearch = $('#keyword-search');
  keywordSearch.on('change textInput input', updateFilters);

  let checkboxes = $(".filter-tags > input[type='checkbox']");
  checkboxes.change(updateFilters);

  let products = document.getElementsByClassName('productCard');

  function updateFilters() {
    let keyword = keywordSearch[0].value.toLowerCase();
    checked = [];
    for (let checkbox of checkboxes) {
      if (checkbox.checked) {
        checked.push(checkbox.name);
      }
    }

    for (let product of products) {
      let hide = product.textContent.toLowerCase().indexOf(keyword) == -1;
      let tags = $(".tags", product)[0].textContent;
      for (tag of checked) {
        hide = hide || tags.indexOf(tag) == -1;
      }

      if (hide) $(product).hide();
      else $(product).show();
    }
  }
});