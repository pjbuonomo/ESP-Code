function retrieveStatusOptions() {
    // Get the current status value from the field
    const fieldValueElement = document.querySelector("span.dataQuickLocate[data-internalName='Status'] input");
    const fieldValue = fieldValueElement ? fieldValueElement.value : "";

    // Define the preset choices
    const choices = ["Not-Started", "In-Progress", "In-Approval", "Ordered", "Completed"];

    // Create the dropdown and assign options
    const statusDropdown = document.createElement("select");
    statusDropdown.id = "statusDropdown";

    choices.forEach((choice) => {
        const option = document.createElement("option");
        option.value = choice;
        option.text = choice;
        statusDropdown.appendChild(option);
    });

    // Set default value of dropdown based on current field value
    const initialOption = Array.from(statusDropdown.options).find(
        (option) => option.value === fieldValue
    );
    if (initialOption) {
        initialOption.selected = true;
    }

    // Set event listener for the dropdown change
    statusDropdown.addEventListener("change", () => {
        const selectedOption = statusDropdown.options[statusDropdown.selectedIndex];
        fieldValueElement.value = selectedOption.value;
    });

    // Append the dropdown to a container element with its own ID
    const dropdownContainer = document.getElementById("statusDropdownContainer");

    // Clear previous dropdown if it exists
    const previousDropdown = document.getElementById("statusDropdown");
    if (previousDropdown) {
        dropdownContainer.removeChild(previousDropdown);
    }

    dropdownContainer.appendChild(statusDropdown);
}

// Call the function to retrieve status options and initialize the dropdown
retrieveStatusOptions();
function updateListItemsToFalse() {
    // Load the SharePoint client object model
    SP.SOD.executeFunc('sp.js', 'SP.ClientContext', function() {
      // Replace 'YourSiteUrl' with the actual URL of your SharePoint site
      var siteUrl = 'YourSiteUrl';
      
      // Replace 'PurchaseRequests' with the actual name of your list
      var listName = 'PurchaseRequests';
      
      // Create a new client context
      var clientContext = new SP.ClientContext(siteUrl);
      
      // Get the list by its name
      var list = clientContext.get_web().get_lists().getByTitle(listName);
      
      // Create a query to retrieve all items in the list
      var query = SP.CamlQuery.createAllItemsQuery();
      var items = list.getItems(query);
      
      // Load the 'isSendEmailToRequestor' and 'isSendEmailToAgent' fields for all items
      clientContext.load(items, 'Include(isSendEmailToRequestor,isSendEmailToAgent)');
      
      // Execute the query to retrieve the items
      clientContext.executeQueryAsync(
        function() {
          // Iterate through the items and update the fields to false
          var enumerator = items.getEnumerator();
          while (enumerator.moveNext()) {
            var item = enumerator.get_current();
            item.set_item('isSendEmailToRequestor', false);
            item.set_item('isSendEmailToAgent', false);
            item.update();
          }
          
          // Execute the update operation
          clientContext.executeQueryAsync(
            function() {
              console.log('Values updated successfully.');
            },
            function(sender, args) {
              console.log('Error updating values: ' + args.get_message());
            }
          );
        },
        function(sender, args) {
          console.log('Error retrieving items: ' + args.get_message());
        }
      );
    });
  }
  
  // Call the function to update the list items
  updateListItemsToFalse();