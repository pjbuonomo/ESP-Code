$(document).ready(function() {
    // Retrieve itemData from SharePoint and initialize fields
    retrieveItemData();
  });
  
  // Function to retrieve itemData from SharePoint
  function retrieveItemData() {
    var itemId = 1; // Set the desired itemId
    $.ajax({
      url: "https://sp.bbh.com/sites/BBHDiningServices/_api/web/lists/getbytitle('DiningServicesSite')/items(" + itemId + ")",
      method: "GET",
      headers: {
        "Accept": "application/json; odata=verbose"
      },
      success: function(data) {
        var itemData = data.d;
        console.log(itemData);
        initializeFields(itemData);
      },
      error: function(data) {
        console.log("Error: " + data);
      }
    });
  }
  
// Function to initialize and populate the fields
function initializeFields(itemData) {
    $('span[data-internalName]').each(function () {
      var internalName = $(this).data('internalname');
      var fieldContent = itemData[internalName];
      
      var inputElement = $('<input type="text" class="form-control offcanvas-field">').val(fieldContent).attr('data-internalName', internalName);
      var textareaElement = $('<textarea class="form-control offcanvas-field"></textarea>').val(fieldContent).attr('data-internalName', internalName);
    
      // Initially show only the span element
      $(this).empty().append($('<span class="inner-span"></span>').text(fieldContent).attr('data-internalName', internalName));
      $(this).append(inputElement.hide()).append(textareaElement.hide());
    });
    
    // Hide the cancel and save buttons initially
    $('#cancelButton').hide();
    $('#saveButton').hide();
  }
  
// Function to toggle between input/textarea and span tags
function toggleEditMode() {
    var editButton = $('#editButton');
    var cancelButton = $('#cancelButton');
    var saveButton = $('#saveButton');
    
    editButton.toggle();
    cancelButton.toggle();
    saveButton.toggle();
    
    $('span[data-internalName]').each(function () {
      var inputElement = $(this).find('input');
      var textareaElement = $(this).find('textarea');
      var spanElement = $(this).find('.inner-span');
      
      if (inputElement.is(':visible') || textareaElement.is(':visible')) {
        spanElement.show();
        inputElement.hide();
        textareaElement.hide();
      } else {
        spanElement.hide();
        inputElement.show();
        textareaElement.show();
      }
    });
  }
  
  
  
  // Button click event handler to toggle edit mode
  $('#editButton').on('click', function (event) {
    event.preventDefault();
    toggleEditMode();
  
    // Show the cancel and save buttons
    $('#cancelButton').show();
    $('#saveButton').show();
  });
  
  // Button click event handler to cancel changes
  $('#cancelButton').on('click', function (event) {
    event.preventDefault();
    toggleEditMode();
  
    // Hide the cancel and save buttons
    $('#cancelButton').hide();
    $('#saveButton').hide();
  });
  
  // Button click event handler to save changes
  $('#saveButton').on('click', function (event) {
    event.preventDefault();
    var itemData = collectItemData();
    var itemId = 1; // Set the desired itemId
    updateListItem(itemId, itemData);
  });
  
  // Function to collect item data from the fields
  function collectItemData() {
    var itemData = {};
  
    $('span[data-internalName] input').each(function () {
      var internalName = $(this).attr('data-internalName');
      var value = $(this).val();
      itemData[internalName] = value;
    });
  
    return itemData;
  }
  
  // Function to update the list item
  function updateListItem(itemId, itemData) {
    var listName = "DiningServicesSite";
    var itemTypeName = $('span[data-internalName]').attr('internalField'); // Get the desired item type name from the 'internalField' attribute
    var url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + listName + "')/items(" + itemId + ")";
  
    itemData.__metadata = { 'type': 'SP.Data.' + itemTypeName + 'ListItem' };
  
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
        toggleEditMode();
        alert('Your changes have been saved!');
      },
      error: function (data) {
        alert("Error updating item: " + JSON.stringify(data));
        console.log("Error updating item: " + JSON.stringify(data));
      }
    });
  }
  function updateListItem(itemId, itemData) {
    var listName = "DiningServicesSite";
    var url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + listName + "')/items(" + itemId + ")";
  
    // Retrieve the list metadata to get the ItemType
    $.ajax({
      url: url,
      type: "GET",
      headers: {
        "Accept": "application/json;odata=verbose"
      },
      success: function(data) {
        var itemMetadata = data.d;
        var itemType = itemMetadata.__metadata.type; // Get the ItemType from the retrieved metadata
  
        // Update the __metadata property with the correct type
        itemData.__metadata = { 'type': itemType };
  
        // Perform the update request
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
          success: function(data) {
            console.log("Item updated successfully");
            console.log(data);
            toggleEditMode();
            alert('Your changes have been saved!');
          },
          error: function(data) {
            alert("Error updating item: " + JSON.stringify(data));
            console.log("Error updating item: " + JSON.stringify(data));
          }
        });
      },
      error: function(data) {
        alert("Error retrieving list metadata: " + JSON.stringify(data));
        console.log("Error retrieving list metadata: " + JSON.stringify(data));
      }
    });
  }

  










  





  