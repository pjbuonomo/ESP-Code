const listTitle = "PurchaseRequests";
const fieldName = "Status";

function retrieveStatusOptions(initialValue) {
  const siteUrl = "https://sp.bbh.com/sites/ESPurchasing";
  const endpointUrl = `${siteUrl}/_api/web/lists/getbytitle('${listTitle}')/fields?$filter=InternalName eq '${fieldName}'&$select=Choices`;

  fetch(endpointUrl, {
    headers: {
      Accept: "application/json;odata=verbose",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      const fieldChoicesXml = data.d.results[0].Choices;
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(fieldChoicesXml, "text/xml");
      const choiceNodes = xmlDoc.getElementsByTagName("CHOICE");

      // Extract the choices from XML
      const fieldChoices = [];
      for (let i = 0; i < choiceNodes.length; i++) {
        const choice = choiceNodes[i].textContent;
        fieldChoices.push(choice);
      }

      // Create the dropdown and assign options
      const statusDropdown = document.createElement("select");
      statusDropdown.id = "statusDropdown";

      fieldChoices.forEach((choice) => {
        const option = document.createElement("option");
        option.value = choice;
        option.text = choice;
        statusDropdown.appendChild(option);
      });

      // Set default value of dropdown based on initial input value
      const initialOption = Array.from(statusDropdown.options).find(
        (option) => option.value === initialValue
      );
      if (initialOption) {
        initialOption.selected = true;
      }

      // Set event listener for the dropdown change
      statusDropdown.addEventListener("change", () => {
        const selectedOption = statusDropdown.options[statusDropdown.selectedIndex];
        // Perform any desired actions with the selected option
        console.log("Selected status:", selectedOption.value);
      });

      // Append the dropdown to a container element with its own ID
      const dropdownContainer = document.getElementById("statusDropdownContainer");

      // Clear previous dropdown if it exists
      const previousDropdown = document.getElementById("statusDropdown");
      if (previousDropdown) {
        dropdownContainer.removeChild(previousDropdown);
      }

      dropdownContainer.appendChild(statusDropdown);
    })
    .catch((error) => {
      console.log("Error retrieving status options:", error);
    });
}

// Call the function with the initial value
retrieveStatusOptions(initialValue);