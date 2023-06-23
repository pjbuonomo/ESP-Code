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