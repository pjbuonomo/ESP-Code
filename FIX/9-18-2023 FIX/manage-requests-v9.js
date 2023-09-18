$(document).ready(function () {
    loadListItems(); //to load list items
    getCount("Not-Started");
    getCount("In-Progress");
    getCount("In-Approval");
    getCount("Ordered");
    getCount("Completed");

    $(".stats-header").each(function () {
        $(this)
            .prop("Counter", 0)
            .animate(
                {
                    Counter: $(this).text(),
                },
                {
                    duration: 1500,
                    easing: "swing",
                    step: function (now) {
                        $(this).text(Math.ceil(now));
                    },
                }
            );
    });
	setTimeout(function() {
 	}, 500);
adjustPanels();
  // Call the function to update the list items
  //updateListItemsToFalse();
  

});
window.onload = function() {
  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
  const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))

};

$(document).on('click', '.view-details-button',

function() {
	var itemId = $(this).data('id');
	localStorage.clear();
	localStorage.setItem('storedItemId', itemId);
	console.log(itemId);
	constructCommentSection(itemId);
  $.ajax({
    url: "https://sp.bbh.com/sites/ESPurchasing/_api/web/lists/getbytitle('PurchaseRequests')/items(" + itemId + ")",
    method: "GET",
    headers: {
      "Accept": "application/json; odata=verbose"
    },
    success: function(data) {
      var itemData = data.d;
      console.log(itemData);
      openOffcanvas(itemData);
      getStaticData(itemId);
    },
    error: function(data) {
      console.log("Error: " + data);
    }
  });
});
//click event for toggle
function addClickEvent() {}
function styleOverride() {
    }

function getCount(status) {
    //console.log(category);
    var listName = "PurchaseRequests";
    var query = "$filter=(Status eq '" + status + "')";
    var url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + listName + "')/items?" + query;

    getListItems(url, function (data) {
        var items = data.d.results;
        $("#" + status).text(items.length);
    });
}
function checkNeedsAttentionState() {
let siteUrl = "https://sp.bbh.com/sites/ESPurchasing";
console.log("NEEDS ATTENTION");
    $.ajax({
        url: siteUrl + "/_api/web/lists/GetByTitle('PurchaseRequests')/items(" + currentItemID + ")",
        method: "GET",
        headers: {
            "Accept": "application/json; odata=verbose"
        },
        success: function(data) {
            let requiresAttention = data.d.requiresAttention;

            if (requiresAttention) {
            	console.log("NEEDS ATTENTION");
            	$(".needsAttentionBadgeSymbol").append('<span class="badge badge-text-Needs-Attention"><i class="fa-solid fa-triangle-exclamation px-1"></i>Needs Attention</i></span>');
            }
        },
        error: function(error) {
            console.error('Request failed. ' + JSON.stringify(error));
        }
    });
} 
function loadListItems() {
  return new Promise(function(resolve, reject) {
    var oDataUrl = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('PurchaseRequests')/items?$select=*,AssignedTo/Title&$expand=AssignedTo";
    console.log(_spPageContextInfo);
    $.ajax({
      url: oDataUrl,
      type: "GET",
      dataType: "json",
      headers: {
        accept: "application/json;odata=verbose",
      },
      success: function(data) {
        successFunction(data);
        resolve(data);
      },
      error: function(error) {
        errorFunction(error);
        reject(error);
      }
    });
  });
}
function successFunction(data) {
    try {
        var dataTableExample = $("#pDashboard").DataTable();
        if (dataTableExample != "undefined") {
            dataTableExample.destroy();
        }
        dataTableExample = $("#pDashboard").DataTable({
            order: [[2, 'desc']],
            rowId: "ID",
            autoWidth: true,
            dom: 'PQBlfs<"filters">r<"delete-btn">tip',
		    buttons: [
					'copy', 'excel', 'pdf', 'print'
		    ],
		    searchBuilder: {
		        preDefined: {
		            criteria: [
		                {
		                    data: 'Status',
		                    condition: '!=',
		                    value: ['Completed']
		                }
		            ]
		        }
		    },
		    scrollY: '800px',
            searchPanes: true,
			searchPanes: {
			  panes: [{
			    header: 'Views',
			    options: [{
			      label: 'All Requests',
			      value: function(rowData, rowIdx) {
			        var displayName = web.get_currentUser().get_title();
			        return rowData["Status"] !== "Completed";
			      },
			    },
			    {
			      label: 'Unassigned Requests',
			      value: function(rowData, rowIdx) {
			      	var displayName = web.get_currentUser().get_title();
			      	console.log(rowData["AssignedTo"].Title);
			        return rowData["AssignedTo"].Title === undefined;

			      
			      
			      },
			    },
			    {
			      label: 'Assigned To Me',
			      value: function(rowData, rowIdx) {
			        var displayName = web.get_currentUser().get_title();
			        return rowData["AssignedTo"].Title === displayName && rowData["Status"] !== "Completed";
			      },
			    },
			    {
			      label: 'Completed Requests',
			      value: function(rowData, rowIdx) {
			        var displayName = web.get_currentUser().get_title();
			        return rowData["Status"] === "Completed";
			      },
			    },
			    /* Add more options as needed */
			    ],
			  },
			  ],
			},
            pageLength: 50,
            
            columnDefs: [
            
                {
                    width: "0.5%",
                    targets: [0],
                },
                {
                    width: "0.5%",
                    targets: [1],
                },
                {
                    width: "2.5%",
                    targets: [2],
                },
                {
                    width: "4%",
                    targets: [3],
                },
                {
                    width: "3%",
                    targets: [4],
                },
                {
                    width: "2.5%",
                    targets: [5],
                },
                {
                
                    width: "2.50%",
                    targets: [6],
                },
                {
                    width: "0.50%",
                    targets: [7],
                },
            ],
	        select: {
	            style:    'multi',
	            selector: 'td:first-child'
	        },

        	aaData: data.d.results,
            aoColumns: [
                {
                	mData: null,
                    orderable: false,
		            className: 'select-checkbox',
		            data: null,
                    defaultContent: "",
		            targets:   0,
                },
                {
                    mData: "ID",
                    sType: "numeric",
                    render: {
                    	_: function (data, type, row, meta, full) {
                        	return data;
                        },
                        display: function (data, type, row, meta, full) {
	                        var returnText = "";
	                        var url = _spPageContextInfo.webAbsoluteUrl + "/Lists/PurchaseRequests/EditForm.aspx?ID=" + data;
	                        returnText = "<a target='_blank' href=" + url + ">" + "ESP" + data + "</a>";
	                        return returnText;
	                    }

                    }
                },
                {
                    mData: "Created",
                    render: function (mData, type, row, meta) {
                    	const formattedDate = getDates(mData);
                    	if(type === "sort") {
                    		return mData;
                    	}
                        const returnText = "<div>" + formattedDate + "</div>";
                        return returnText;
                    },

                },
                {
                    mData: "Comment",
                },

                {
                    mData: "Request_x0020_For",
                },

                {
                    mData: "Status",
                    render: {
                    	_: function (data, type, row, meta, full) {
                        	return data;
                        },
                        display: function (data, type, row, meta, full) {
	                        var requiresAttention = row.requiresAttention;
	                    	if (requiresAttention) {
	                    		var statusBadgeHTML = "<div id='StatusBadgeRow-" + row.ID + "' class='statusBadgeRowStyling'><div class='row d-flex align-content-center justify-content-center text-center mb-1'><label class='badge1 badge-" + data + "'>" + data + "</label></div>" + "<div class='d-flex align-content-center justify-content-center text-center row'><span class='badge badge-text-Needs-Attention'><i class='fa-solid fa-triangle-exclamation px-1'></i>Needs Attention</span></div></div>";
	                    		return statusBadgeHTML;
	                    	} else {
	                    		var statusBadgeHTML = "<div id='StatusBadgeRow-" + row.ID + "' class='statusBadgeRowStyling'><div class='row d-flex align-content-center justify-content-center text-center'><label class='badge1 badge-" + data + "'>" + data + "</label></div></div>";
	                    		return statusBadgeHTML;
	                    	}
	                    }

                    }
                },
                {
                    mData: "AssignedTo",
                    render: function (mData, type, full, meta) {
                        var returnText = "";
                        var itemId = full.ID;
                        if (mData.Title == undefined) return "<div class='fw-bold red-e3'>Unassigned</div>";
                        else return mData.Title;
                    },
                    /*"<a id=takereq class='btn btn-danger btn-take' href='#' onclick=\"assignToMe('" + itemId + "')\">Take</a>"*/
                },
                {
                    mData: null,
                    orderable: false,
                    render: function (mData, type, full, meta) {
                        var itemId = full.ID;
                        var assignedTo;
                        var url = _spPageContextInfo.webAbsoluteUrl + "/Lists/PurchaseRequests/EditForm.aspx?ID=" + itemId;
						var viewDetailsButton = "<div class='col-sm'><a href='#' class='view-details-button findRowItemButton red-e3' style='color: red;' data-bs-toggle='tooltip' data-bs-placement='top' data-bs-title='Quick View' data-id='" + itemId + "'><i class='fa-solid fa-eye'></i></a></div>";
                        var personIcon = "<div id='takeIcon' class='col-sm'><a href='' data-bs-toggle='tooltip' data-bs-placement='top' data-bs-title='Take Request' onclick='assignToMe(\"" + itemId + "\")' style='text-decoration: none; color: #2e7dff;'><i class='fa fa-user'></i></a></div>";
                        var editIcon = "<div class='col-sm'><a href= '" + url + "' data-bs-toggle='tooltip' data-bs-placement='top' data-bs-title='Edit' style='text-decoration: none; color: #2e7dff;'><i class='fa-solid fa-pen-to-square'></i></a></div>";
                        if (full.AssignedTo.Title === undefined) {
                            return personIcon + viewDetailsButton + editIcon;
                        } else {
                            return viewDetailsButton + editIcon;
                        }
                        //return personIcon + editIcon + trashIcon;
                    },
                },
            ],
        });
        $('div.filters').html('<p><div class="button-container" style="display: flex; gap: 10px;"><a class="btn btn-danger filterButton" data-bs-toggle="collapse" href="#filterExample" role="button" aria-expanded="false" aria-controls="filterExample"> <i class="fa fa-filter"></i></a><div class="refresh-btn"></div></div> </p> <div class="collapse filterCollapse" id="filterExample"> <div class="card card-body filterExampleCard"> <div class="search-builder"> <div class="searchBuilderSection"></div> </div> <div class="searchPaneSection"> </div> <div class="row"> <div class="col-md-3"> </div> </div> </div> </div>');
        $('.dtsb-searchBuilder').appendTo('#filterExample .searchBuilderSection');
 		$('.dtsp-panesContainer').appendTo('.searchPaneSection');
 		$(".dt-buttons.btn-group.flex-wrap").addClass("col col col");
		$(".dt-buttons.btn-group.flex-wrap").each(function() {
		  var $column = $(this);
		  $column.append($(".delete-btn"));
		  $column.append($(".buttons-collection"));
		});
 		$('div.delete-btn').html('<a class="btn btn-danger" id="delete-button"><i class="fa-solid fa-trash"></i></a>');
 		
var refreshButton = $('<a class="btn btn-primary"><i class="fa-solid fa-arrows-rotate"></i></a>');
$('div.refresh-btn').append(refreshButton);
refreshButton.on('click',
function() {
  $("#pDashboard").hide();
  refreshTable();
  $("#pDashboard").show();
});

		$('#delete-button').click(function() {
		  var itemIds = [];
		  dataTableExample.rows('.selected').every(function() {
		    var data = this.data();
		    itemIds.push(data.ID);
		  });
		  confirmDelete(itemIds);
		});
		function confirmDelete(itemIds) {
		  if(itemIds.length === 0) {
		  	alert("No cells selected.");
		  	return;
		  }
		  if (window.confirm("Are you sure you want to delete ('" + "Purchase Requests: " + itemIds + "') ?")) {
		    var ctx = SP.ClientContext.get_current();
		    var list = ctx.get_web().get_lists().getByTitle("PurchaseRequests");
		    for (var i = 0; i < itemIds.length; i++) {
		      var item = list.getItemById(itemIds[i]);
		      item.deleteObject();
		    }
		    ctx.executeQueryAsync(function() {
		      alert("Items deleted successfully.");
		      loadListItems();
		    },
		    function(sender, args) {
		      alert("Error: " + args.get_message());
		    });
		  } else {
		  }
		}

        //
    } catch (e) {
        //alert(e.message);
    }
}

function errorFunction(data, errCode, errMessage) {
    Console.log("Error: " + errMessage);
}

function numberFormat(data) {
    var s = data + "",
        a = s.split(""),
        out = "",
        iLen = s.length;

    for (var i = 0; i < iLen; i++) {
        if (i % 3 === 0 && i !== 0) {
            out = "," + out;
        }
        out = a[iLen - i - 1] + out;
    }
    return out;
}

function getListItems(siteurl, success, failure) {
    $.ajax({
        url: siteurl,
        method: "GET",
        async: false,
        headers: {
            Accept: "application/json; odata=verbose",
        },
        success: function (data) {
            success(data);
        },
        error: function (data) {
            failure(data);
        },
    });
}

function getDates(data) {
    var retDate = "";
    if (data != null) {
        var date = new Date(data);
        var month = date.getMonth() + 1;
        //return (month.length > 1 ? month : "0" + month) + "/" + date.getDate() + "/" + date.getFullYear();
        retDate = formatDate(date);
    }
    return retDate;
}

function formatDate(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var seconds = date.getSeconds();
  var period = hours >= 12 ? "PM": "AM";
  hours = hours % 12;
  hours = hours ? hours: 12;
  var dd = date.getDate();
  var mm = date.getMonth() + 1;
  var yyyy = date.getFullYear();
  if (dd < 10) {
    dd = "0" + dd;
  }
  if (mm < 10) {
    mm = "0" + mm;
  }
  if (hours < 10) {
    hours = "0" + hours;
  }
  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  if (seconds < 10) {
    seconds = "0" + seconds;
  }
  var formattedDateTime = hours + ":" + minutes + " " + period + " " + mm + "-" + dd + "-" + yyyy;
  return formattedDateTime;
}

function assignToMe(itemId) {
    var ctx = SP.ClientContext.get_current();
    var list = ctx.get_web().get_lists().getByTitle("PurchaseRequests");
    var item = list.getItemById(itemId);
    item.set_item("AssignedTo", _spPageContextInfo.userId);
    item.set_item("Status", "In-Progress");
    item.update();
    ctx.executeQueryAsync(
        function () {
            console.log("Item assigned to " + _spPageContextInfo.userId);
            refreshTable();
        },
        function (sender, args) {
            console.log("Error: " + args.get_message());
        }
    );
}
function getCurrentUserDisplayName(callback) {
  var clientContext = new SP.ClientContext.get_current();
  var web = clientContext.get_web();
  var currentUser = web.get_currentUser();
  clientContext.load(currentUser);
  clientContext.executeQueryAsync(function() {
    var displayName = currentUser.get_title();
    callback(displayName);
  },
  function(sender, args) {
    console.error('Error getting current user: ' + args.get_message());
  });
}
function refreshTable() {
  if ($.fn.DataTable.isDataTable("#pDashboard")) {
    $("#pDashboard").DataTable().destroy();
  }
  $("#pDashboard tbody").empty();
  loadListItems().then(function(updatedData) {
    dataTableExample = $("#pDashboard").DataTable({
      aaData: updatedData.d.results,
      retrieve: true
      /* Other options... */
    });
  }).
  catch(function(error) {
    console.error('Error loading list items:', error);
  });
}
function openOffcanvas(itemData) {
    console.log(itemData + "outside test");
    $('span.dataQuickLocate').empty();
    $("#ActivityLog").empty();
    $('#offcanvasSaveButton').find('button').remove();

    $('span.dataQuickLocate').each(function () {
        var internalName = $(this).data('internalname');
        var input = null;
        if (internalName === "Item_x0020_Details" || internalName === "Comment") {
        	input = document.createElement('textarea');
        } else {
	        input = document.createElement('input');
        }
        input.type = 'text';
	    input.className = 'form-control offcanvas-field';
	    input.value = itemData[internalName];

        $(this).append(input);
    });

    // Add a save button to the offcanvas header
    var saveButton = $('<button type="button" id="#offcanvasSaveButton" class="btn ms-2 custom-topbar-btn-group toolbar-btn"><i class="fa-regular fa-floppy-disk me-1"></i>Save</button>');
    $('#offcanvasSaveButton').append(saveButton);

    // Attach click event handler to the save button
    saveButton.on('click', function () {
        updateListItem(itemData.ID, collectItemData());
    });

    $('.request-details-offcanvas').offcanvas('show');
    	const initialValue = document.querySelector("span.dataQuickLocate[data-internalName='AssignedToId'] input").value;
	retrieveGroupMembers(initialValue);
	retrieveStatusOptions();

}
function collectItemData() {
  var itemData = {};
  itemData.__metadata = {
    'type': 'SP.Data.PurchaseRequestsListItem'
  };
  $('span.dataQuickLocate input').each(function() {
    var internalName = $(this).parent().data('internalname');
    var value = $(this).val();
    itemData[internalName] = value;
  });
  return itemData;
}
function getStaticData(itemId) {
  var ctx = SP.ClientContext.get_current();
  var list = ctx.get_web().get_lists().getByTitle("PurchaseRequests");
  var item = list.getItemById(itemId);
  ctx.load(item, "AssignedTo", "Status", "Request_x0020_For", "Comment", "Author", "Created", "ID",);
  ctx.executeQueryAsync(function() {
    /*var assignedTo = item.get_item("AssignedTo").get_lookupValue();*/
    var status = item.get_item("Status");
    //statusTracker(status, '');
    console.log(status);
    var requestFor = item.get_item("Request_x0020_For");
    var comment = item.get_item("Comment");
    var author = item.get_item("Author").get_lookupValue();
    var created = item.get_item("Created");
    var id = item.get_item("ID");
	console.log(author);
    /*document.getElementById("assignedToElementId").innerText = assignedTo;*/
    //$('#statusElementBadgeId').html($('#StatusBadgeRow-' + id).html());
    $('#statusElementBadgeId').empty();
    $('#StatusBadgeRow-' + id).clone().appendTo('#statusElementBadgeId');
    //document.getElementById("statusElementId").innerText = status;
    document.getElementById("authorElementId").innerText = author;
    document.getElementById("createdElementId").innerText = created;
    document.getElementById("customID").innerText = "ESP" + id;

    
  },
  function(sender, args) {
    console.log("Error: " + args.get_message());
  });
}

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
  
function retrieveGroupMembers(initialValue) {
    const siteUrl = "https://sp.bbh.com/sites/ESPurchasing";
    const groupId = 7;
    const endpointUrl = `${siteUrl}/_api/web/sitegroups(${groupId})/users`;

    fetch(endpointUrl, {
        headers: {
            Accept: "application/json;odata=verbose",
        },
    })
    .then(response => response.json())
    .then(data => {
        const members = data.d.results.map(member => {
            return {
                name: member.Title,
                userId: member.Id,
            };
        });

        // Create the dropdown and assign options
        const assignedToDropdown = document.createElement("select");
        assignedToDropdown.id = "assignedToDropdown";

        // Add Unassigned option first
        const unassignedOption = document.createElement("option");
        unassignedOption.value = "";
        unassignedOption.text = "Unassigned";
        assignedToDropdown.appendChild(unassignedOption);

        members.forEach(member => {
            const option = document.createElement("option");
            option.value = member.userId;
            option.text = member.name;
            assignedToDropdown.appendChild(option);
        });

        // Set default value of dropdown based on initial input value (userId)
        const initialOption = Array.from(assignedToDropdown.options).find(option => option.value === String(initialValue));
        if (initialOption) {
            initialOption.selected = true;
        } else {
            assignedToDropdown.options[0].selected = true;
        }

        // Set event listener for the dropdown change
        assignedToDropdown.addEventListener("change", () => {
            const selectedOption = assignedToDropdown.options[assignedToDropdown.selectedIndex];
            const inputElement = document.querySelector("span.dataQuickLocate[data-internalName='AssignedToId'] input");
            inputElement.value = selectedOption.value;
        });

        // Append the dropdown to a container element with its own ID
        const dropdownContainer = document.getElementById("assignedToDropdownContainer");

        // Clear previous dropdown if it exists
        const previousDropdown = document.getElementById("assignedToDropdown");
        if (previousDropdown) {
            dropdownContainer.removeChild(previousDropdown);
        }

        dropdownContainer.appendChild(assignedToDropdown);
    })
    .catch(error => {
        console.log("Error retrieving group members:", error);
    });
}

function updateListItem(itemId, itemData) {
  var listName = "PurchaseRequests";
  var url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + listName + "')/items(" + itemId + ")";
  $.ajax({
    url: url,
    type: "POST",
    contentType: "application/json;odata=verbose",
    data: JSON.stringify(itemData),
    headers: {
      "Accept": "application/json;odata=verbose",
      "X-RequestDigest": $("#__REQUESTDIGEST").val(),
      "X-HTTP-Method": "MERGE",
      "If-Match": "*"
    },
    success: function(data) {
      console.log("Item updated successfully");
      console.log(data);
      refreshTable();
      alert('Your changes have been saved!');
      
    },
    error: function(data) {
      alert("Error updating item: " + data);
      console.log("Error updating item: " + data);
    }
  });
}

function adjustPanels() {
  $('#openPanelButton').click(function(e) {
    $(this).toggleClass('comment-btn-active');
    $('.list-form-activity-pane').toggle();
    adjustLeftPanelSize();
  });
  $(window).resize(function() {
    adjustLeftPanelSize();
  });
  function adjustLeftPanelSize() {
    var screenWidth = $(window).width();
    var isActive = $('#openPanelButton').hasClass('comment-btn-active');
    if (screenWidth > 640) {
      var leftPanelWidth = isActive ? 'calc(100% - 0.5px - 320px)': '100%';
      $('.list-form-client--withRightPane').css('width', leftPanelWidth);
      if (isActive) {
        $('.list-form-activity-pane').show();
      } else {
        $('.list-form-activity-pane').hide();
      }
    } else {
      var leftPanelWidth = '100%';
      $('.list-form-client--withRightPane').css('width', leftPanelWidth);
      $('.list-form-activity-pane').hide();
    }
  }
  adjustLeftPanelSize();
}    
/*function updateListItemsToFalse() {
  SP.SOD.executeFunc('sp.js', 'SP.ClientContext',
  function() {
    var siteUrl = 'https://sp.bbh.com/sites/ESPurchasing';
    var listName = 'PurchaseRequests';
    var clientContext = new SP.ClientContext(siteUrl);
    var list = clientContext.get_web().get_lists().getByTitle(listName);
    var query = SP.CamlQuery.createAllItemsQuery();
    var items = list.getItems(query);
    clientContext.load(items, 'Include(isSendMessageToRequestor,isSendMessageToAgent)');
    clientContext.executeQueryAsync(function() {
      var enumerator = items.getEnumerator();
      while (enumerator.moveNext()) {
        var item = enumerator.get_current();
        item.set_item('isSendMessageToRequestor', false);
        item.set_item('isSendMessageToAgent', false);
        item.update();
      }
      clientContext.executeQueryAsync(function() {
        console.log('Values updated successfully.');
      },
      function(sender, args) {
        console.log('Error updating values: ' + args.get_message());
      });
    },
    function(sender, args) {
      console.log('Error retrieving items: ' + args.get_message());
    });
  });
}*/

