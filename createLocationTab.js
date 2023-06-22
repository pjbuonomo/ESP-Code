$(document).ready(function() {
    // Execute the following code when the SharePoint page has finished loading
    
    // Get the SharePoint list
    var listName = "LocationContent";
    
    // Get the SharePoint site URL
    var siteUrl = "https://sp.bbh.com/sites/BBHDiningServices";
    
    // Retrieve the list items using SharePoint's REST API
    $.ajax({
      url: siteUrl + "/_api/web/lists/getbytitle('" + listName + "')/items",
      method: "GET",
      headers: {
        "Accept": "application/json; odata=verbose"
      },
      success: function(data) {
        // Loop through each item in the list
        $(data.d.results).each(function(index, item) {
          // Create a new tab element
          var tabId = "tab-" + (index + 1);
          var tabTitle = item.Location;
          var tabContent = item.Details;
          
          // Create the tab title link
          var tabLink = $("<a>").addClass("nav-link").attr("data-bs-toggle", "tab").attr("href", "#" + tabId).text(tabTitle);
          
          // Create the tab content
          var tabContentDiv = $("<div>").addClass("tab-pane").attr("id", tabId).html(tabContent);
          
          // Append the tab title and content to the respective containers
          $(".nav-tabs").append($("<li>").addClass("nav-item").append(tabLink));
          $(".tab-content").append(tabContentDiv);
        });
      },
      error: function(error) {
        console.log(JSON.stringify(error));
      }
    });
  });