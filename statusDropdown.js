function createStatusDropdown() {
    Promise.all([getCurrentStatus(), getStatusOptions()])  // fetch current status and status options
        .then(([currentStatus, statusOptions]) => {
            const statusDropdown = document.createElement('select');
            statusDropdown.id = 'statusDropdown';
    
            statusOptions.forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.value = option;
                optionElement.text = option;
    
                if (option === currentStatus) {
                    optionElement.selected = true;
                }
    
                statusDropdown.appendChild(optionElement);
            });
    
            // Set event listener for the dropdown change
            statusDropdown.addEventListener('change', () => {
                const selectedOption = statusDropdown.options[statusDropdown.selectedIndex];
                const inputElement = document.querySelector("span.dataQuickLocate[data-internalName='StatusId'] input");
                inputElement.value = selectedOption.value;
            });

            // Append the dropdown to a container element with its own ID
            const dropdownContainer = document.getElementById('statusDropdownContainer');

            // Clear previous dropdown if it exists
            const previousDropdown = document.getElementById('statusDropdown');
            if (previousDropdown) {
                dropdownContainer.removeChild(previousDropdown);
            }

            dropdownContainer.appendChild(statusDropdown);
        })
        .catch(error => console.log('Error:', error));
}