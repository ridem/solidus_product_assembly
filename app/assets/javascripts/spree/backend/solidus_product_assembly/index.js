"use strict";

//= require ./translations

$(document).ready(function () {
  Spree.routes.available_admin_product_parts = function (productSlug) {
    return Spree.pathFor("admin/products/" + productSlug + "/parts/available");
  };

  var showErrorMessages = function showErrorMessages(xhr, text, error) {
    var response = JSON.parse(xhr.responseText);
    return show_flash("error", response);
  };

  var partsTable = $("#product_parts");
  var searchResults = $("#search_hits");

  var searchForParts = function searchForParts() {
    var productSlug = partsTable.data("product-slug");
    var searchUrl = Spree.routes.available_admin_product_parts(productSlug);

    return $.ajax({
      data: {
        q: $("#searchtext").val()
      },
      dataType: 'html',
      success: function success(request) {
        searchResults.html(request);
        searchResults.show();
        return $('select.select2').select2();
      },

      type: 'POST',
      url: searchUrl
    });
  };

  $("#searchtext").keypress(function (e) {
    if (e.which && e.which === 13 || e.keyCode && e.keyCode === 13) {
      searchForParts();
      return false;
    } else {
      return true;
    }
  });

  $("#search_parts_button").click(function (e) {
    e.preventDefault();
    return searchForParts();
  });

  var makePostRequest = function makePostRequest(link, post_params) {
    if (post_params == null) {
      post_params = {};
    }
    var request = $.ajax({
      type: "POST",
      url: link.attr("href"),
      data: post_params,
      dataType: "script"
    });
    request.fail(showErrorMessages);
    request.always(function (data, status, error) {
      $("#progress").hide();
    });

    return false;
  };

  searchResults.on("click", "a.add_product_part_link", function (event) {
    event.preventDefault();

    var part = {};
    var link = $(this);
    var row = $("#" + link.data("target"));
    var loadingIndicator = $("img.spinner", link.parent());
    var quantityField = $('input:last', row);

    part.count = quantityField.val();

    if (row.hasClass("with-variants")) {
      var selectedVariantOption = $('select.part_selector option:selected', row);
      part.part_id = selectedVariantOption.val();

      if (selectedVariantOption.text() === Spree.translations.user_selectable) {
        part.variant_selection_deferred = "t";
        part.part_id = link.data("master-variant-id");
      }
    } else {
      part.part_id = $('input[name="part[id]"]', row).val();
    }

    part.assembly_id = $('[name="part[assembly_id]"]', row).val();

    return makePostRequest(link, { assemblies_part: part });
  });

  partsTable.on("click", "a.set_count_admin_product_part_link", function () {
    var params = { count: $("input", $(this).parent().parent()).val() };
    return makePostRequest($(this), params);
  });

  return partsTable.on("click", "a.remove_admin_product_part_link", function () {
    return makePostRequest($(this));
  });
});