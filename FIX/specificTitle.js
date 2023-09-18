function updateSpecificTitles() {
    const itemIds = [232, 233, 234];
    itemIds.forEach(function(itemId) {
        updateTitle(itemId);
    });
}

function updateTitle(itemId) {
    var listName = "PurchaseRequests"; // Replace this with the internal name of your list if different
    var url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + listName + "')/items(" + itemId + ")";
    
    $.ajax({
        url: url,
        type: "POST",
        contentType: "application/json;odata=verbose",
        data: JSON.stringify({
            '__metadata': {
                'type': 'SP.Data.' + listName + 'ListItem'
            },
            'Title': "Title (do not touch)"
        }),
        headers: {
            "Accept": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
            "X-HTTP-Method": "MERGE",
            "If-Match": "*"
        },
        success: function(data) {
            console.log("Item with ID " + itemId + " updated successfully");
        },
        error: function(error) {
            console.error("Error updating item with ID " + itemId + ":", error.responseText);
        }
    });
}

// Call the function to initiate the update
updateSpecificTitles();
