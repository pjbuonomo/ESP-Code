function setTitleForAllItems() {
    var listName = "PurchaseRequests"; // Replace with your actual list name
    var siteUrl = _spPageContextInfo.webAbsoluteUrl;
    var endpointUrl = siteUrl + "/_api/web/lists/getbytitle('" + listName + "')/items?$select=ID,Title";

    $.ajax({
        url: endpointUrl,
        type: "GET",
        headers: {
            "Accept": "application/json;odata=verbose"
        },
        success: function (data) {
            var items = data.d.results;
            items.forEach(function(item) {
                updateTitle(item.ID);
            });
        },
        error: function (error) {
            console.error("Error fetching items:", error);
        }
    });
}

function updateTitle(itemId) {
    var listName = "PurchaseRequests"; // Replace with your actual list name
    var siteUrl = _spPageContextInfo.webAbsoluteUrl;
    var endpointUrl = siteUrl + "/_api/web/lists/getbytitle('" + listName + "')/items(" + itemId + ")";
    
    var itemData = {
        "__metadata": { "type": "SP.Data.PurchaseRequestsListItem" }, // Replace 'PurchaseRequests' with internal name of the list
        "Title": "Title (do not touch)"
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
            console.log("Title updated for item with ID:", itemId);
        },
        error: function (error) {
            console.error("Error updating item with ID " + itemId + ":", error);
        }
    });
}

// Execute the function on page load
$(document).ready(function() {
    setTitleForAllItems();
});


function clearTitleForAllItems(listName) {
    let siteUrl = "https://sp.bbh.com/sites/ESPurchasing";
    let clientContext = new SP.ClientContext(siteUrl);
    let oList = clientContext.get_web().get_lists().getByTitle(listName);
    let camlQuery = new SP.CamlQuery();
    camlQuery.set_viewXml("<View><Query></Query></View>");
    let collListItem = oList.getItems(camlQuery);
    clientContext.load(collListItem);
    clientContext.executeQueryAsync(onQuerySucceeded, onQueryFailed);
  
    function onQuerySucceeded() {
      let listItemEnumerator = collListItem.getEnumerator();
      while (listItemEnumerator.moveNext()) {
        let listItem = listItemEnumerator.get_current();
        
        listItem.set_item("Title", "");  // Clearing the "Title" field
        
        listItem.update();
      }
      clientContext.executeQueryAsync(onUpdateSucceeded, onQueryFailed);
    }
  
    function onUpdateSucceeded() {
      console.log("Title cleared for all items successfully.");
    }
  
    function onQueryFailed(sender, args) {
      console.error("Request failed. " + args.get_message());
    }
  }
  