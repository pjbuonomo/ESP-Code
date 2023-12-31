function constructCommentSection(itemId) {
    /* Global variable declaration */
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
                break;
            case "alert":
                activityType = "set needs attention";
                activityIcon = "triangle-exclamation";
                break;
            case "create":
                activityType = "created this request";
                activityIcon = "add";
                break;
            case "modify":
                activityType = "modified this request";
                activityIcon = "pen";
                break;
        }
        // Rest of the card creation logic using activityType and activityIcon
    }

    /* Function to add a new activity (previously addComment) */
    /* Function to add a new activity */
function addActivity(type, content) {
    let timestamp = new Date().toLocaleString();
    let username = currentUser.Title;

    let newCard = createCard(type, username, content, timestamp);
    $("#ActivityLog").append(newCard);

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
        // The existing logic
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


    /* Binding click event to the comment button */
    $("#addCommentButton").on("click", function() {
        let type = "comment"; // Default is comment
        let message = $(".comment-input-box").val();

        if (message && message !== '/cmd clear-all comments') {
            if (message.startsWith('/alert')) { // Example command to send alert type message
                type = "alert";
                message = message.replace('/alert ', ''); // Remove the command part from the message
            }
            addActivity(type, message);
            $(".comment-input-box").val('');
        }
    });

    $("#clearTotalCommentLogs").on("click", function() {
        clearHistoryLogForAllItems("PurchaseRequests");
    });
}

function clearHistoryLogForAllItems(listName) {
    // The existing logic
}
