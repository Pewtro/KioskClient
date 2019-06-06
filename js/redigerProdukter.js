$(document).ready(() => {
    $("#adminButton").click(() => {
        window.location.href = "admin.html";
    });
    $("#kioskButton").click(() => {
        window.location.href = "kiosk.html";
    });
    $("#logoutButton").click(() => {
        SDK.Student.logOut();
    });
    $("#opdaterProduktModal").on("hidden.bs.modal", function () {
        sessionStorage.removeItem("updateProduct");
        $("#opdaterProductName").val('');
        $("#opdaterProductPrice").val('');
        $("#opdaterProductStock").val('');
        document.getElementById("opdaterProductActive").selectedIndex = "0";
    });

    const myProductTable = $("#productTableBody");

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
            tr += '<td>' + products[i].priceProduct + '</td>';
            tr += '<td>' + products[i].stockProduct + '</td>';
            if (products[i].isActive === 1) {
                activeStatus = 'Yes';
            }
            tr += '<td>' + activeStatus + '</td>';
            tr += '<td><button class="btn btn-primary update-button" data-id="' + (i + 1) + '">Update product</button></td>';
            i++;
            myProductTable.append(tr);
        });
        //if the update event button is clicked we construct a fake JSON string and set that as our update
        // in sessionStorage then send the user to the updateEvent html page
        $(".update-button").click(function () {
            let name = $(this).closest("tr").find("td:eq(1)").text();
            for (let i = 0; i < products.length; i++) {
                if (name === products[i].nameProduct) {
                    let constructJson = "{\"idProduct\":" + products[i].idProduct + ","
                        + "\"nameProduct\":\"" + products[i].nameProduct + "\","
                        + "\"priceProduct\":\"" + products[i].priceProduct + "\","
                        + "\"stockProduct\":" + products[i].stockProduct + ","
                        + "\"isActive\":\"" + products[i].isActive + "\"}";
                    sessionStorage.setItem("updateProduct", constructJson);
                }
            }
            const productToUpdate = JSON.parse(sessionStorage.getItem("updateProduct"));
            $("#opdaterProductName").val(productToUpdate.nameProduct);
            $("#opdaterProductPrice").val(productToUpdate.priceProduct);
            $("#opdaterProductStock").val(productToUpdate.stockProduct);
            if (productToUpdate.isActive === "1") {
                document.getElementById("opdaterProductActive").selectedIndex = "0";
            } else {
                document.getElementById("opdaterProductActive").selectedIndex = "1";
            }
            $("#opdaterProduktModal").modal();
        });
    })

});