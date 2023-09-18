function constructCommentSection(itemId) {
    /* Global variable declaration */
          let isSendMessageToRequestor = false;
      let isSendMessageToAgent = false;

    let currentUser;
    let listName = "PurchaseRequests";
    let siteUrl = "https://sp.bbh.com/sites/ESPurchasing";
	let currentItemID = getQueryStringParameter("ID");
	if (typeof currentItemID === 'undefined' || currentItemID === null || currentItemID === '') {
		currentItemID = itemId;
	}  
    /* Fetching current user's information from SharePoint */
    $.ajax({
      url: siteUrl + "/_api/web/currentuser",
      method: "GET",
      headers: {
        "Accept": "application/json; odata=verbose"
      },
      success: function(data) {
        currentUser = data.d;
        console.log('Current user: ' + currentUser);
        populateActivityLog();
      },
      error: function(error) {
        console.error('Request failed. ' + JSON.stringify(error));
      }
    });
  
    /* Function to create an activity card */
    function createCard(type, user, content, timestamp) {
      let activityType, activityIcon;
      switch (type) {
        case "comment":
          activityType = "commented";
          activityIcon = "circle-user";
          borderType = "border-0";
          textColor = "";

          break;
        case "create":
          activityType = "created this request";
          activityIcon = "add";
          break;
        case "modify":
          activityType = "modified this request";
          activityIcon = "pen";
          break;
        case "alert":
          activityType = "set needs attention";
          activityIcon = "triangle-exclamation warning-yellow";
          borderType = "border-warning";
          textColor = "warning-yellow";
          break;

      }
      let card = `<div class="card ${borderType} activityItemCard ${type}Card my-2 p-1" style="width: 100%">
                    <div class="card-body">
                      <div class="row">
                        <div class="col-2 px-2">
                          <div class="activityIcon">
                            <span><i class="fa-solid fa-${activityIcon}"></i></span>
                          </div>
                        </div>
                        <div class="col-10 textActivityContent">
                          <div class="row">
                            <div class="activity-summary ${textColor}">
                              <b>${user}</b> ${activityType}
                            </div>
                            <div id="ActivityMessageContent" class="activity-msg-content">
                              ${content}
                            </div>
                          </div>
                          <div class="row">
                            <div id="ActivityTimeStamp" class="activity-timestamp">
                              ${timestamp}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>`;
      return card;
    }
  
    /* Function to add a new comment */
    /* Function to add a new activity */
function addActivity(type, content) {
    let timestamp = new Date().toLocaleString();
    let username = currentUser.Title;

    let newCard = createCard(type, username, content, timestamp);
    $("#ActivityLog").prepend(newCard);

    // Retrieve the existing activity history
    let activityHistory = null;
    let authorId = null;

    $.ajax({
        url: siteUrl + "/_api/web/lists/GetByTitle('" + listName + "')/items(" + currentItemID + ")",
        method: "GET",
        headers: {
            "Accept": "application/json; odata=verbose"
        },
        async: false,
        success: function(data) {
            activityHistory = data.d.HistoryLog;
            authorId = data.d.AuthorId;
        },
        error: function(error) {
            console.error('Request failed. ' + JSON.stringify(error));
        }
    });

    // Update the activity history with the new activity
    activityHistory = activityHistory ? activityHistory + '\n' + username + ' {' + type + '} (' + timestamp + '): ' + content : username + ' {' + type + '} (' + timestamp + '): ' + content;

    let isSendMessageToRequestor = false;
    let isSendMessageToAgent = false;
    if(currentUser.Id === authorId) {
        isSendMessageToAgent = true;
    } else {
        isSendMessageToRequestor = true;
    }

    // Update the item with the modified activity history
    $.ajax({
        url: siteUrl + "/_api/web/lists/GetByTitle('" + listName + "')/items(" + currentItemID + ")",
        type: "POST",
        data: JSON.stringify({
            '__metadata': {
                'type': 'SP.Data.' + listName + 'ListItem'
            },
            'HistoryLog': activityHistory,
            'NewComment1': content,
            'CommentingUser1Id': currentUser.Id,
            'IsSendMessageToRequestor': isSendMessageToRequestor,
            'IsSendMessageToAgent': isSendMessageToAgent
        }),
        headers: {
            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
            "accept": "application/json;odata=verbose",
            "IF-MATCH": "*",
            "content-type": "application/json;odata=verbose",
            "X-HTTP-Method": "MERGE"
        },
        success: function() {
            console.log('Activity has been added successfully.');
        },
        error: function(error) {
            console.error('Request failed. ' + JSON.stringify(error));
        }
    });
}    
  
    /* Function to get query string parameter */
    function getQueryStringParameter(name) {
      name = name.replace(/[\[\]]/g, '\\$&');
      let regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(window.location.href);
      if (!results) return null;
      if (!results[2]) return '';
      return decodeURIComponent(results[2].replace(/\+/g, ' '));
    }
  
    /* Function to populate activity log when page loads */
/* Function to populate activity log when page loads */
function populateActivityLog() {
    $.ajax({
        url: siteUrl + "/_api/web/lists/GetByTitle('" + listName + "')/items(" + currentItemID + ")?$select=HistoryLog,Author/Id,Author/Title&$expand=Author",
        method: "GET",
        headers: {
            "Accept": "application/json; odata=verbose"
        },
        success: function(data) {
            let activityHistory = data.d.HistoryLog;
            if (activityHistory) {
                let activities = activityHistory.split('\n');
                activities.forEach(function(activity) {
                    let user, timestamp, content, type;

                    // Extract user
                    let userEndIndex = activity.indexOf(' {');
                    if (userEndIndex !== -1) {
                        user = activity.substring(0, userEndIndex);
                    }

                    // Extract type
                    let typeStartIndex = activity.indexOf('{');
                    let typeEndIndex = activity.indexOf('}');
                    if (typeStartIndex !== -1 && typeEndIndex !== -1) {
                        type = activity.substring(typeStartIndex + 1, typeEndIndex);
                    }

                    // Extract timestamp
                    let timestampStartIndex = activity.indexOf('(');
                    let timestampEndIndex = activity.indexOf(')');
                    if (timestampStartIndex !== -1 && timestampEndIndex !== -1) {
                        timestamp = activity.substring(timestampStartIndex + 1, timestampEndIndex);
                    }

                    // Extract content
                    let contentStartIndex = activity.indexOf('):');
                    if (contentStartIndex !== -1) {
                        content = activity.substring(contentStartIndex + 2).trim();
                    }

                    if (user && timestamp && content) {
                        let newCard = createCard(type, user, content, timestamp);
                        $("#ActivityLog").prepend(newCard);
                    }
                });
            }
        },
        error: function(error) {
            console.error('Request failed. ' + JSON.stringify(error));
        }
    });
}
var needsAttentionBadge = document.querySelector('.needsAttentionBadge');

// Function to update the requiresAttention state
function updateRequiresAttentionState(state, message = null) {
    // Update the item with the new requiresAttention state
    $.ajax({
        url: siteUrl + "/_api/web/lists/GetByTitle('PurchaseRequests')/items(" + currentItemID + ")",
        type: "POST",
        data: JSON.stringify({
            '__metadata': {
                'type': 'SP.Data.PurchaseRequestsListItem'
            },
            'requiresAttention': state,
            'CurrentNeedsAttentionMessage': state ? message : null
        }),
        headers: {
            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
            "accept": "application/json;odata=verbose",
            "IF-MATCH": "*",
            "content-type": "application/json;odata=verbose",
            "X-HTTP-Method": "MERGE"
        },
        success: function() {
        	console.log(state);
        	console.log(message);
        	if(state === true){
	        	type = "alert";
	        	addActivity(type, message);
	        	$("#NeedsAttentionBadge").html('<span class="badge badge-text-Needs-Attention"><i class="fa-solid fa-triangle-exclamation px-1"></i>Needs Attention</i></span>');
	        	$("#NeedsAttentionUserAlert").html('<div id="NeedsAttentionUserAlert" class="alert alert-warning" role="alert"><i class="fa-solid fa-triangle-exclamation px-1"></i>This request currently requires your attention, the purchasing agent has requested you provide more information. Please refer to the Comments & Messages section below!</div>');
            	$("#NeedsAttentionAdminAlert").html('<div id="NeedsAttentionAdminAlert" class="alert alert-warning" role="alert"><i class="fa-solid fa-triangle-exclamation px-1"></i>This request currently requires attention from the requestor!</div>');
	        }
            if (state === false) {
            	$("#NeedsAttentionBadge").html('');
            	$("#NeedsAttentionUserAlert").html('');
            	$("#NeedsAttentionAdminAlert").html('');

            }
            console.log('State has been updated successfully.');
        },
        error: function(error) {
            console.error('Request failed. ' + JSON.stringify(error));
        }
    });
}

// Function to check the initial state of requiresAttention
function checkNeedsAttentionState() {
let siteUrl = "https://sp.bbh.com/sites/ESPurchasing";

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
                $("#NeedsAttentionBadge").append('<span class="badge badge-text-Needs-Attention"><i class="fa-solid fa-triangle-exclamation px-1"></i>Needs Attention</i></span>');
            	$("#NeedsAttentionUserAlert").append('<div id="NeedsAttentionUserAlert" class="alert alert-warning" role="alert"><i class="fa-solid fa-triangle-exclamation px-1"></i>This request currently requires your attention, the purchasing agent has requested you provide more information. Please refer to the Comments & Messages section below!</div>');
            	$("#NeedsAttentionAdminAlert").append('<div id="NeedsAttentionAdminAlert" class="alert alert-warning" role="alert"><i class="fa-solid fa-triangle-exclamation px-1"></i>This request currently requires attention from the requestor!</div>');
            }
        },
        error: function(error) {
            console.error('Request failed. ' + JSON.stringify(error));
        }
    });
}  

  
    /* Binding click event to the comment button */
    $("#addCommentButton").on("click", function() {
      let message = $(".comment-input-box").val();
      if (message === '/cmd clear-all comments') {
        clearHistoryLogForAllItems("PurchaseRequests");
        $(".comment-input-box").val('');
      }

      if (message && message !== '/cmd clear-all comments') {
      	let type = "comment";
      	
      	if($("#toggleNeedsAttention").hasClass("activeNeedsAttention")) {
      		type = "alert";
      	}
        addActivity(type, message);
        
        
        $("#toggleNeedsAttention").removeClass("activeNeedsAttention");
        $(".comment-input-box").val('');
      }
    });
    $("#clearTotalCommentLogs").on("click", function() {
		clearHistoryLogForAllItems("PurchaseRequests");
    });
        // Check the Needs Attention state on page load
    checkNeedsAttentionState();

    // Show the modal when the checkbox is checked
    $("#doesNeedsAttention").on("change", function() {
        if ($(this).is(":checked")) {
            $("#needsAttentionModal").modal("show");
        } else {
            let response = confirm("Remove Needs Attention State?");
            if (response) {
                updateRequiresAttentionState(false);
            } else {
                $(this).prop('checked', true);
            }
        }
    });

    // Save changes
    $("#saveChangesBtn").on("click", function() {
        let message = $("#needsAttentionMessage").val().trim();

        if (message.length > 0) {
            updateRequiresAttentionState(true, message);
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


}
  
  
  function clearHistoryLogForAllItems(listName) {
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
        listItem.set_item("HistoryLog", "");
        listItem.set_item("NewComment1", "");
		listItem.set_item("CommentingUser1", "");
		
        listItem.update();
      }
      clientContext.executeQueryAsync(onUpdateSucceeded, onQueryFailed);
    }
  
    function onUpdateSucceeded() {
      console.log("HistoryLog cleared for all items successfully.");
    }
  
    function onQueryFailed(sender, args) {
      console.error("Request failed. " + args.get_message());
    }
  }

  
  
  
  
  
  
  
  
  