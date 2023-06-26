<div id="needsAttentionModal" class="modal fade" tabindex="-1" role="dialog">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Needs Attention</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        <label for="needsAttentionMessage">Needs Attention Message</label>
        <textarea id="needsAttentionMessage" class="form-control" rows="3"></textarea>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
        <button type="button" id="saveChangesBtn" class="btn btn-primary">Save changes</button>
      </div>
    </div>
  </div>
</div>
$(document).ready(function() {

    // Check the Needs Attention status on page load
    checkNeedsAttentionStatus();

    // Show the modal when the checkbox is checked
    $("#doesNeedsAttention").on("change", function() {
        if ($(this).is(":checked")) {
            $("#needsAttentionModal").modal("show");
        } else {
            let response = confirm("Remove Needs Attention Status?");
            if (response) {
                updateRequiresAttentionStatus(false);
            } else {
                $(this).prop('checked', true);
            }
        }
    });

    // Save changes
    $("#saveChangesBtn").on("click", function() {
        let message = $("#needsAttentionMessage").val().trim();

        if (message.length > 0) {
            updateRequiresAttentionStatus(true, message);
            $("#needsAttentionModal").modal("hide");
        } else {
            alert("Message cannot be blank");
        }
    });

    // Close button and Cancel button actions
    $(".close, .btn-secondary").on("click", function() {
        $("#doesNeedsAttention").prop('checked', false);
        $("#needsAttentionModal").modal("hide");
    });

});

// Function to update the requiresAttention status
function updateRequiresAttentionStatus(status, message = null) {
    // Update the item with the new requiresAttention status
    $.ajax({
        url: siteUrl + "/_api/web/lists/GetByTitle('PurchaseRequests')/items(" + currentItemID + ")",
        type: "POST",
        data: JSON.stringify({
            '__metadata': {
                'type': 'SP.Data.PurchaseRequestsListItem'
            },
            'requiresAttention': status,
            'CurrentNeedsAttentionMessage': status ? message : null
        }),
        headers: {
            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
            "accept": "application/json;odata=verbose",
            "IF-MATCH": "*",
            "content-type": "application/json;odata=verbose",
            "X-HTTP-Method": "MERGE"
        },
        success: function() {
            console.log('Status has been updated successfully.');
        },
        error: function(error) {
            console.error('Request failed. ' + JSON.stringify(error));
        }
    });
}

// Function to check the initial status of requiresAttention
function checkNeedsAttentionStatus() {
    $.ajax({
        url: siteUrl + "/_api/web/lists/GetByTitle('PurchaseRequests')/items(" + currentItemID + ")",
        method: "GET",
        headers: {
            "Accept": "application/json; odata=verbose"
        },
        success: function(data) {
            let requiresAttention = data.d.requiresAttention;

            if (requiresAttention) {
                $("#doesNeedsAttention").prop('checked', true);
            }
        },
        error: function(error) {
            console.error('Request failed. ' + JSON.stringify(error));
        }
    });
}
