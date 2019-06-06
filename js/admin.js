$(document).ready(() => {

    const debugLoad = false;
    const debugExcel = false;
    const debugPrice = false;
    const showcaseData = false;

    const welcomeHeader = $("#welcomeHeader");
    const user = JSON.parse(sessionStorage.getItem("currentUser"));
    welcomeHeader.append("Velkommen " + user.nameUser);

    let alleProdukter = [];
    let alleBrugere = null;
    let altKoebt = null;

    //lets the user logout
    $("#logoutButton").click(() => {
        SDK.Student.logOut();
    });
    //lets the user return to the kiosk
    $("#kioskButton").click(() => {
        window.location.href = "kiosk.html";
    });
    $("#redigerBrugere").click(() => {
        window.location.href = "redigerBrugere.html";
    });
    $("#redigerProdukter").click(() => {
        window.location.href = "redigerProdukter.html";
    });
    SDK.Admin.loadAllProducts((callback, data) => {
        if (callback) {
            throw callback;
        }
        for (let i = 0; i < data.length; i++) {
            const aktivtProdukt = {
                idProduct: data[i].idProduct,
                nameProduct: data[i].nameProduct,
                priceProduct: data[i].priceProduct
            };
            alleProdukter.push(aktivtProdukt)
        }

        debugLoad && console.log(alleProdukter);
    });
    SDK.Admin.loadEverythingBought((callback, data) => {
        if (callback) {
            throw callback;
        }
        altKoebt = data;
        debugLoad && console.log(altKoebt);
    });
    SDK.Admin.loadAllUsers((callback, data) => {
        if (callback) {
            throw callback;
        }
        alleBrugere = data;
        debugLoad && console.log(alleBrugere);
    });

    /** Only to be used if the above 3 functions prove too much for the server / browser to handle at large amounts of data

     $("#hentProdukter").click(() => {
        SDK.Admin.loadAllProducts((callback, data) => {
            if (callback) {
                throw callback;
            }
            alleProdukter = data;
            console.log(alleProdukter);
        });
    });
     $("#hentAltKoebt").click(() => {
        SDK.Admin.loadEverythingBought((callback, data) => {
            if (callback) {
                throw callback;
            }
            altKoebt = data;
            console.log(altKoebt);
        });
    });
     $("#hentBrugere").click(() => {
        SDK.Admin.loadAllUsers((callback, data) => {
            if (callback) {
                throw callback;
            }
            alleBrugere = data;
            console.log(alleBrugere);
        });
    });*/

    $("#exportExcel").click(() => {

        let data = [];
        let listeTilSletning = [];

        //create an empty field
        data.push({name: '', RFID: '', 'Total pris': '', 'Betalings frist': '', 'Har betalt': ''});

        //creates headers each individual product with empty fields, to ensure they're all added into the excel export
        for (let i = 0; i < alleProdukter.length; i++) {
            data[0][alleProdukter[i].nameProduct] = '';
        }

        //for each user add all their bought products together in the json format required for alasql
        for (let i = 0; i < alleBrugere.length; i++) {
            const userRFID = alleBrugere[i].RFIDUser;
            const userName = alleBrugere[i].nameUser;

            let index = data.indexOf(data.find(user => user.name === userName));
            if (index === -1) {
                debugExcel && console.log("creating new user entry for ", userName, " with RFID ", userRFID);
                data.push({name: userName, RFID: userRFID});
                index = data.indexOf(data.find(user => user.name === userName));
            }

            //sets the date required for the individual users to pay by the latest
            const futureDate = new Date();
            data[index]['Betalings frist'] = new Date(futureDate.setDate(futureDate.getDate() + 30)).toString().substring(0, 15);

            data[index]['Har betalt'] = 'Nej';

            for (let i = 0; i < altKoebt.length; i++) {
                if (altKoebt[i].RFIDUser === userRFID) {
                    const nameProduct = altKoebt[i].nameProduct;
                    const amountBought = altKoebt[i].amountBought;

                    const indexProduct = alleProdukter.indexOf(alleProdukter.find(product => product.nameProduct === nameProduct));
                    if (!data[index]['Total pris']) {
                        debugPrice && console.log("Creating new price entry for ", nameProduct, " for user named: ", userName);
                        data[index]['Total pris'] = amountBought * alleProdukter[indexProduct].priceProduct;

                    } else {
                        data[index]['Total pris'] += amountBought * alleProdukter[indexProduct].priceProduct;
                    }
                    if (!data[index][nameProduct]) {
                        debugExcel && console.log("creating new product entry for ", nameProduct, " for user named: ", userName);
                        data[index][nameProduct] = amountBought;
                    } else {
                        data[index][nameProduct] += amountBought;
                    }

                    listeTilSletning.unshift(i);
                    if (i === altKoebt.length) {
                        for (let i = 0; i < listeTilSletning.length; i++) {
                            altKoebt.splice(i, 1);
                        }
                    }
                }
            }
            if (data[index]['Total pris'] === undefined) {
                data[index]['Total pris'] = 0;
            }
            data[index]['Total pris'] += " kr.";
        }

        //possibility to showcase the data to check if necessary
        showcaseData && console.log(data);

        //utilize alasql to download a XLSX file
        alasql('SELECT * INTO XLSX("kiosk_udtræk.xlsx",{headers:true}) FROM ? ', [data]);

    });

    $("#hentDoekDataBtn").click(() => {
        if (document.getElementById("hentDoekDataVaelgArrangement").selectedIndex === 0) {
            alert("Du skal vælge et arrangement før du kan hente data.");
            return
        }
        $("#hentDoekDataAdvarsel").hide();
        const doekDataTable = $("#hentDoekDataTable");
        doekDataTable.append('' +
            '<thead class="text-center"><tr>' +
            '<th>Armbånd #</th>' +
            '<th>RFID</th>' +
            '<th>UserID</th>' +
            '<th>User name</th>' +
            '<th>Sex</th>' +
            '</tr></thead>');
        $("#hentDoekDataProgress").show();
        const elem = document.getElementById("hentDoekDataProgressBar");
        let width = 0, i = 0;
        const id = setInterval(frame, 100);
        const fakeUsers = ['Jørgen', 'Jensine', 'Alba', 'Hannah', 'Oscar', 'Mynte', 'Michael', 'Tilde', 'Noah', 'Noam'];

        function frame() {
            if (width >= 100) {
                clearInterval(id);
                return;
            } else {
                width += 2;
                elem.style.width = width + '%';
                elem.innerHTML = width + '%';
            }
            if (width % 10 === 0 && width !== 0) {
                const userSex = Math.random() < 0.5 ? 'Male' : 'Female';
                let tr = '<tr>';
                tr += '<td style="margin-left: 20px;">' + (i + 1) + '</td>';
                tr += '<td>' + Math.round(Math.random() * 10000000000) + '</td>';
                tr += '<td>' + (Math.round(Math.random() * 100) + 30) + '</td>';
                tr += '<td>' + fakeUsers[i] + '</td>';
                tr += '<td>' + userSex + '</td></tr>';
                i++;
                doekDataTable.append(tr);
            }
        }
    });

    $("#hentDoekDataSubmit").click(() => {
        const rowCount = $('#hentDoekDataTable tr').length;
        if (rowCount > 2) {
            alert("Data er blevet tilføjet til databasen");
            $("#hentDoekDataModal").modal('toggle');
        } else {
            alert("Du kan ikke tilføje data til databasen, får du har trykket 'Hent data'");
        }
    });

    $("#sletArrangementData").click(() => {
        if (confirm("This will delete ALL:" +
            "\n Non admins" +
            "\n Entire purchase history" +
            "\n Are you really sure you want to do this?")) {
            if (confirm("Are you 100% certain, clicking OK here makes any data that will be lost untrievable!!")) {
                SDK.Admin.sletArrangementData((err, data) => {
                    if (err && err.xhr.status === 400) {
                        $(".form-group").addClass("Client fail");
                    } else {
                        alert("Purchase history and non-admins have been deleted");
                    }
                });
            }
        }
    });

    $("#hentDoekDataModal").on("hidden.bs.modal", function () {
        $("#hentDoekDataTable").empty();
        $("#hentDoekDataProgress").hide();
        document.getElementById("hentDoekDataVaelgArrangement").selectedIndex = "0";
        $("#hentDoekDataAdvarsel").show();
    });

    $("#opretBrugerModal, #opretProduktModal").on("hidden.bs.modal", function () {
        $("#newName").val('');
        $("#newRFID").val('');
        document.getElementById("newSex").selectedIndex = "0";
        document.getElementById("newAdmin").selectedIndex = "0";
        $("#newProductName").val('');
        $("#newProductPrice").val('');
        $("#newProductStock").val('');
        document.getElementById("newProductActive").selectedIndex = "0";
    });

    const produktStatusModal = $("#produktStatusModal");
    const myProductTable = $("#productTableBody");
    produktStatusModal.on("shown.bs.modal", function () {
        SDK.Admin.loadAllProducts((callback, data) => {
            if (callback) {
                throw callback;
            }
            const products = data;
            $.each(products, function (i, callback) {
                let activeStatus = 'No';
                let tr = '<tr>';
                tr += '<td>' + products[i].idProduct + '</td>';
                tr += '<td>' + products[i].nameProduct + '</td>';
                tr += '<td data-id="' + "stock" + products[i].idProduct + '">' + products[i].stockProduct + '</td>';
                if (products[i].isActive === 1) {
                    activeStatus = 'Yes';
                }
                tr += '<td>' + activeStatus + '</td>';
                tr += '<td><input placeholder="Amount to add" type="text" class="form-control" id="refill-productID-' + products[i].idProduct + '"></td>';
                tr += '<td><button class="btn btn-primary refill-button" data-id="' + (i + 1) + '">Add to stock</button></td>';
                i++;
                myProductTable.append(tr);
            });
            $(".refill-button").click(function () {
                let productIDToRefill, amountToRefill, productName;
                let name = $(this).closest("tr").find("td:eq(1)").text();
                for (let i = 0; i < products.length; i++) {
                    if (name === products[i].nameProduct) {
                        productIDToRefill = products[i].idProduct;
                    }
                }
                amountToRefill = Number($("#refill-productID-" + productIDToRefill).val());
                SDK.Product.refillProduct(productIDToRefill, amountToRefill, (err, data) => {
                    if (err && err.xhr.status === 400) {
                        $(".form-group").addClass("Client fail");
                    } else if (err) {
                        console.log("Error")
                    } else {
                        alert("Product with the name " + name + " has increased stock by " + amountToRefill);
                    }
                    const jquerySelector = $(this).closest("tr").find("td:eq(2)");
                    const oldAmount = Number(jquerySelector.text());
                    const newAmount = oldAmount + amountToRefill;
                    jquerySelector.text(newAmount);

                    $("#refill-productID-" + productIDToRefill).val('');
                });
            });
        })

    });
    produktStatusModal.on("hidden.bs.modal", function () {
        $("#productTableBody tr").remove()
    });

    $("#tilfoejProdukt").click(() => {
        //Look at this if you need to upload files for the individual product
        //https://stackoverflow.com/questions/3509333/how-to-upload-save-files-with-desired-name

        //filesaver.js
        //https://github.com/eligrey/FileSaver.js

        //modal?
    });
});