// Function to initialize the fields
function initializeFields() {
    $('span[data-internalName]').each(function () {
      var internalName = $(this).data('internalname');
      var fieldContent = itemData[internalName];
      var element = null;
  
      if (internalName === "Item_x0020_Details" || internalName === "Comment") {
        element = $('<textarea class="form-control offcanvas-field"></textarea>');
        element.val(fieldContent);
      } else {
        element = $('<input type="text" class="form-control offcanvas-field">');
        element.val(fieldContent);
      }
  
      element.attr('data-internalName', internalName);
      $(this).empty().append(element);
    });
  }
  
  // Function to toggle between input and span tags
  function toggleEditMode() {
    $('span[data-internalName]').each(function () {
      var internalName = $(this).data('internalname');
      var fieldContent = $(this).find('input, textarea').val();
      var element = null;
  
      if (internalName === "Item_x0020_Details" || internalName === "Comment") {
        element = $('<span></span>');
        element.text(fieldContent);
      } else {
        element = $('<span></span>');
        element.text(fieldContent);
      }
  
      element.attr('data-internalName', internalName);
      $(this).empty().append(element);
    });
  }
  
  // Button click event handler to toggle edit mode
  $('#EditModeToggle').on('click', function () {
    var button = $(this);
    var buttonText = button.text();
  
    if (buttonText === 'Edit') {
      initializeFields();
      button.text('Save');
    } else if (buttonText === 'Save') {
      toggleEditMode();
      button.text('Edit');
      var itemData = collectItemData();
      updateListItem(itemId, itemData);
    }
  });
  
  // Function to collect item data from the fields
  function collectItemData() {
    var itemData = {};
  
    $('span[data-internalName] input, span[data-internalName] textarea').each(function () {
      var internalName = $(this).parent().data('internalname');
      var value = $(this).val();
      itemData[internalName] = value;
    });
  
    return itemData;
  }
  
  // Function to update the list item
  function updateListItem(itemId, itemData) {
    var listName = "DiningServicesSite";
    var url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + listName + "')/items(1)";
  
    $.ajax({
      url: url,
      type: "POST",
      contentType: "application/json;odata=verbose",
      data: JSON.stringify(itemData),
      headers: {
        "Accept": "application/json;odata=verbose",
        "X-RequestDigest": $("#__REQUESTDIGEST").val(),
        "X-HTTP-Method": "MERGE",
        "If-Match": "*"
      },
      success: function (data) {
        console.log("Item updated successfully");
        console.log(data);
        alert('Your changes have been saved!');
      },
      error: function (data) {
        alert("Error updating item: " + data);
        console.log("Error updating item: " + data);
      }
    });
  }
  