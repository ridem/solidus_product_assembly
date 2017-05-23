//= require ./translations

$(document).ready(function() {
  Spree.routes.available_admin_product_parts = productSlug => Spree.pathFor(`admin/products/${productSlug}/parts/available`);

  let showErrorMessages = function(xhr, text,error) {
    console.log("failure")
    console.log(xhr)
    console.log(text)
    console.log(error)
    let response = JSON.parse(xhr.responseText);
    return show_flash("error", response);
  };

  let partsTable = $("#product_parts");
  let searchResults = $("#search_hits");

  let searchForParts = function() {
    let productSlug = partsTable.data("product-slug");
    let searchUrl = Spree.routes.available_admin_product_parts(productSlug);

    return $.ajax({
     data: {
       q: $("#searchtext").val()
     },
     dataType: 'html',
     success(request) {
       searchResults.html(request);
       searchResults.show();
       return $('select.select2').select2();
     },
     type: 'POST',
     url: searchUrl
    });
  };

  $("#searchtext").keypress(function(e) {
    if ((e.which && (e.which === 13)) || (e.keyCode && (e.keyCode === 13))) {
      searchForParts();
      return false;
    } else {
      return true;
    }
  });

  $("#search_parts_button").click(function(e) {
    e.preventDefault();
    return searchForParts();
  });

  let makePostRequest = function(link, post_params) {
    if (post_params == null) { post_params = {}; }
    // let spinner = $("img.spinner", link.parent());
    // spinner.show();
    console.log(post_params)
    console.log(link.attr("href"))
    let request = $.ajax({
      type: "POST",
      url: link.attr("href"),
      data: post_params,
      dataType: "script"
    });
    console.log("success")
    console.log(request)
    request.fail(showErrorMessages);
    request.always((data,status,error) => {
      console.log("ALWAYS")
      console.log(error)
      console.log(status)
      console.log(data)
      $("#progress").hide()
    });

    return false;
  };

  searchResults.on("click", "a.add_product_part_link", function(event) {
    event.preventDefault();

    let part = {};
    let link = $(this);
    let row = $(`#${link.data("target")}`);
    let loadingIndicator = $("img.spinner", link.parent());
    let quantityField = $('input:last', row);

    part.count = quantityField.val();

    if (row.hasClass("with-variants")) {
      let selectedVariantOption = $('select.part_selector option:selected', row);
      part.part_id = selectedVariantOption.val();

      if (selectedVariantOption.text() === Spree.translations.user_selectable) {
        part.variant_selection_deferred = "t";
        part.part_id = link.data("master-variant-id");
      }

    } else {
      part.part_id = $('input[name="part[id]"]', row).val();
    }

    part.assembly_id = $('[name="part[assembly_id]"]', row).val();

    return makePostRequest(link, {assemblies_part: part});
  });

  partsTable.on("click", "a.set_count_admin_product_part_link", function() {
    let params = { count: $("input", $(this).parent().parent()).val() };
    return makePostRequest($(this), params);
  });

  return partsTable.on("click", "a.remove_admin_product_part_link", function() {
    return makePostRequest($(this));
  });
});