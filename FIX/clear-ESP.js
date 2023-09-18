function clearESPIDForAllItems() {
    var listName = "PurchaseRequests"; // Replace with your actual list name
    var siteUrl = _spPageContextInfo.webAbsoluteUrl;
    var endpointUrl = siteUrl + "/_api/web/lists/getbytitle('" + listName + "')/items?$select=ID,ESPID";

    $.ajax({
        url: endpointUrl,
        type: "GET",
        headers: {
            "Accept": "application/json;odata=verbose"
        },
        success: function (data) {
            var items = data.d.results;
            items.forEach(function(item) {
                updateESPID(item.ID);
            });
        },
        error: function (error) {
            console.error("Error fetching items:", error);
        }
    });
}

function updateESPID(itemId) {
    var listName = "PurchaseRequests"; // Replace with your actual list name
    var siteUrl = _spPageContextInfo.webAbsoluteUrl;
    var endpointUrl = siteUrl + "/_api/web/lists/getbytitle('" + listName + "')/items(" + itemId + ")";
    
    var itemData = {
        "__metadata": { "type": "SP.Data.YourListNameListItem" }, // Replace 'YourListName' with internal name of the list
        "ESPID": null // Setting ESPID to null
    };

    $.ajax({
        url: endpointUrl,
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
            console.log("ESPID cleared for item with ID:", itemId);
        },
        error: function (error) {
            console.error("Error updating item with ID " + itemId + ":", error);
        }
    });
}

// Execute the function on page load
$(document).ready(function() {
    clearESPIDForAllItems();
});
