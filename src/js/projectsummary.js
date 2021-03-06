//var t = window.TrelloPowerUp.iframe();
var t = TrelloPowerUp.iframe();
const API_BASE = 'https://fwittrello.csrsinc.com/api/dashboard/clientcontacts';
//const API_BASE = 'https://glp2.csrsinc.com/api/dashboard/projectsummary';

var formatCurrency = function (val) {

    var rtnVal = '';

    var pureVal = val;
    if (pureVal < 0) {
        pureVal = Math.abs(pureVal);
    }

    rtnVal = pureVal.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
    });

    if (val < 0) {
        rtnVal = "(" + rtnVal + ")";
    }

    return rtnVal;
};

var formatPercent = function (val, useNegativeSign) {

    var rtnVal = '';

    var pureVal = val / 100.0000;
    if (pureVal < 0) {
        pureVal = Math.abs(pureVal);
    }

    rtnVal = pureVal.toLocaleString('en-US', {
        style: 'percent',
        currency: 'USD',
    });

    if (val < 0) {
        if (useNegativeSign) {
            rtnVal = "-" + rtnVal;
        } else {
            rtnVal = "(" + rtnVal + ")";
        }
    }

    return rtnVal;

};

var formatDecimal = function (val) {
    return val.toLocaleString('en-US', {
        style: 'decimal',
        minimumFractionDigits: 2,
        currency: 'USD',
    });
};

t.render(function () {
    // make sure your rendering logic lives here, since we will
    // recall this method as the user adds and removes attachments
    // from your section

    var customFieldID = 'NA';
    var boardName = '';
    var isTestBoard = false;

    t.get('board', 'shared')
        .then(function (board) {
            //console.log(JSON.stringify(board, null, 2));

            if (board && board.clientcontacts) {
                customFieldID = board.clientcontacts;
            }

            return t.board('id', 'name');

        }).then(function (brd) {

            if (brd) {
                boardName = brd.name;
            }

            return t.card('all');
        }).then(function (card) {

            //console.log(JSON.stringify(card, null, 2));

            if (card) {

                var id = "NA";
                var desc = card.desc;
                if (desc && desc.length > 0)
                    id = desc;

                //get project number from custom field
                if (card.customFieldItems && card.customFieldItems.length > 0) {
                    for (var i = 0; i < card.customFieldItems.length; i++) {
                        if (card.customFieldItems[i].idCustomField === customFieldID) {
                            if (card.customFieldItems[i].value) {
                                id = card.customFieldItems[i].value.text;
                                break;
                            }
                        }
                    }
                }

                //console.log("boardName = " + boardName);

                let apiUrl = `${API_BASE}?id=${id}`;
                if (boardName && boardName.toLowerCase().indexOf('test') >= 0) {
                    isTestBoard = true;
                    apiUrl = 'https://glp2.csrsinc.com/api/dashboard/clientcontacts?id=' + id;
                }

                //console.log("apiUrl = " + apiUrl);

                fetch(apiUrl)
                    .then(function (response) {
                        return response.json();
                    }).then(function (j) {
                        //var data = JSON.stringify(j);
                        if (j != null) {
                            var firstProcessed = false;
                            try {
                                
                                for (let index = 0; index < j.length; index++) {
                                    const item = j[index];
                                    const contacts = item.contacts;

                                    var table = document.getElementById("tbl_clientsummary");
                                    var row = table.insertRow(-1);
                                    
                                    if (firstProcessed){
                                        row.className = "border-top";
                                    }
                                    else{
                                        firstProcessed = true;
                                    }
                                                                        
                                    row.insertCell(0).innerHTML = item.fullName;
                                    row.insertCell(1).innerHTML = item.title;
                                    var emailLink = '';
                                    if (item.email && item.email.length > 3){
                                        emailLink = '<a href="mailto:' + item.email + '">' + item.email + '</a>';
                                    }
                                    var emailCell = row.insertCell(2)
                                    emailCell.className = "text-right";
                                    emailCell.innerHTML = emailLink;
                                                                        
                                    //create child rows
                                    if (contacts && contacts.length > 0){
                                        //create row for child table
                                        var childrow = table.insertRow(-1);
                                        //childrow.insertCell(0).innerHTML = "";
                                        var ctCell = childrow.insertCell(0);
                                        ctCell.colSpan = 3;
                                        var childTable = document.createElement('table'); 
                                        childTable.className = "child-table"; 
                                        // //create header row
                                        // var header_row = childTable.insertRow(-1);
                                        // header_row.insertCell(0).outerHTML = "<th>Name</th>";
                                        // header_row.insertCell(1).outerHTML = "<th>Desc</th>";
                                        // header_row.insertCell(2).outerHTML = "<th>Relation</th>";

                                        for (let cidx = 0; cidx < contacts.length; cidx++) {
                                            const c = contacts[cidx];
                                            //create row for child table
                                            var contact_row = childTable.insertRow(-1);
                                            //contact_row.insertCell(0).innerHTML = "";
                                            var nameData = c.employeeName;
                                            if (c.description && c.description.length > 0){
                                                nameData = nameData + ' (' + c.description + ')';
                                            }
                                            var cCell = contact_row.insertCell(0);
                                            cCell.className = "child-name-cell";
                                            cCell.innerHTML = nameData;
                                            contact_row.insertCell(1).innerHTML = c.relationshipDesc;
                                        }

                                        ctCell.appendChild(childTable);
                                    }
                                }

                            } catch (err) {
                                console.log('Binding HTML Failed', err);
                            }

                        }

                        //t.sizeTo(document.body).done();

                    }).catch(function (error) {
                        console.log('Request failed', error)
                    });

            }
        });





    //   t.getAll()
    //   .then(function(card){
    //       console.log(card);
    //     document.getElementById('project_summary_content').innerHTML  = "CARD ID = "  + card.idShort;
    //   });
});