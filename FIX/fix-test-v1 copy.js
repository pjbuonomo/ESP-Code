function collectItemData() {
    var itemData = {};
    itemData.__metadata = {
        'type': 'SP.Data.PurchaseRequestsListItem'
    };

    // Collect only AssignedToId
    const assignedToInput = document.querySelector("span.dataQuickLocate[data-internalName='AssignedToId'] input");
    if (assignedToInput) {
        itemData['AssignedToId'] = parseInt(assignedToInput.value) || null;
    }

    // Collect only Status
    const statusInput = document.querySelector("span.dataQuickLocate[data-internalName='Status'] input");
    if (statusInput) {
        itemData['Status'] = statusInput.value;
    }

    return itemData;
}