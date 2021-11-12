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

                            try {
                                
                                for (let index = 0; index < j.length; index++) {
                                    const item = j[index];
                                    const contacts = item.contacts;

                                    let row = "<tr>";
                                    row = row + "<td>" +  item.firstName  + "</td>";
                                    row = row + "<td>" +  item.lastName  + "</td>";
                                    row = row + "<td>" +  item.title  + "</td>";
                                    row = row + "<td>" +  item.email  + "</td>";
                                    row = row + "</tr>";

                                    $('#tbl_clientsummary tbody').append(row);
                                    //create child rows
                                    if (contacts && contacts.length > 0){
                                        for (let cidx = 0; cidx < contacts.length; cidx++) {
                                            const c = contacts[index];
                                            let c_row = "<tr>";
                                            c_row = c_row + "<td>&nbsp;</td>";
                                            c_row = c_row + "<td>" +  item.employeeName  + "</td>";
                                            c_row = c_row + "<td>" +  item.description  + "</td>";
                                            c_row = c_row + "<td>" +  item.relationshipDesc  + "</td>";
                                            c_row = c_row + "</tr>";
                                            $('#tbl_clientsummary tbody').append(c_row);
                                        }
                                    }
                                }

                            } catch (err) {
                                console.log('Binding HTML Failed', err);
                            }

                        }

                        t.sizeTo(document.body).done();

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