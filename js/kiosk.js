$(document).ready(() => {

    const welcomeHeader = $("#welcomeHeader");
    const user = JSON.parse(sessionStorage.getItem("currentUser"));
    welcomeHeader.append(user.nameUser);
    let activeProducts = JSON.parse(sessionStorage.getItem("activeProducts"));

    if (user.userIsAdmin === 1) {
        $("#buttons").append(`<button style="margin-right: 20px; margin-top: 5px" class="btn btn-primary pull-right"
        id="adminButton">Admin
            </button>`);
    }

    function updateBasket(productName, productAmount, initialStock) {
        let stock, productId;
        let eksisterendeVare = false;
        const kurvTabel = $("#kurvTabel");
        activeProducts = JSON.parse(sessionStorage.getItem("activeProducts"));
        kurvTabel.find("tr").each(function () {
            const name = $(this).find("td:eq(1)").text();
            if (name === productName) {
                $(this).find("td:eq(2)").text(productAmount);
                eksisterendeVare = true;
                document.getElementById(name).style.display = "table-row";
            }
        });
        if (!eksisterendeVare) {
            const initialOutOfStock = initialStock === productAmount ? '"pointer-events": "none"; "filter": "grayscale(100%)"' : "";
            let nyVare = '<tr id="' + productName + '">';
            nyVare += '<td><img src="images/products/' + productName + '.png" alt="' + productName + '" class="kurv-img"></td>';
            nyVare += '<td style="vertical-align:middle">' + productName + '</td>';
            nyVare += '<td style="vertical-align:middle">' + productAmount + '</td>';
            nyVare += '<td style="vertical-align:middle"><button class="kioskKnap tilfoejEn" data-id="' + "tilfoej" + productName + '" style="' + initialOutOfStock + '">+</button></td>';
            nyVare += '<td style="vertical-align:middle"><button class="kioskKnap fjernEn" data-id="' + "fjern" + productName + '"> - </button></td>';
            nyVare += '</tr>';
            kurvTabel.append(nyVare);

            $(".tilfoejEn").on('click', function () {
                const name = $(this).closest('tr').find('td:eq(1)').text();
                if (name === productName) {
                    let amount = Number(sessionStorage.getItem(name));
                    for (let stockI = 0; stockI < activeProducts.length; stockI++) {
                        if (activeProducts[stockI].nameProduct === productName) {
                            stock = Number(activeProducts[stockI].stockProduct);
                            productId = Number(activeProducts[stockI].idProduct);
                        }
                    }
                    amount += 1;
                    if (amount >= stock) {
                        $("#" + productId).parent().css({
                            "pointer-events": "none",
                            "filter": "grayscale(100%)"
                        });
                        $(this).css({
                            "pointer-events": "none",
                            "filter": "grayscale(100%)"
                        });
                    }
                    sessionStorage.setItem(name, amount);
                    updateBasket(name, amount);
                }
            });

            $(".fjernEn").on('click', function () {
                const name = $(this).closest('tr').find('td:eq(1)').text();
                if (name === productName) {
                    let amount = sessionStorage.getItem(name);
                    for (let stockI = 0; stockI < activeProducts.length; stockI++) {
                        if (activeProducts[stockI].nameProduct === productName) {
                            stock = Number(activeProducts[stockI].stockProduct);
                            productId = Number(activeProducts[stockI].idProduct);
                        }
                    }
                    amount -= 1;
                    if (amount < stock) {
                        $("#" + productId).parent().css({
                            "pointer-events": "auto",
                            "filter": "grayscale(0%)"
                        });
                        $("td").find("[data-id='tilfoej" + name + "']").css({
                            "pointer-events": "auto",
                            "filter": "grayscale(0%)"
                        });
                        sessionStorage.setItem(name, amount);
                        updateBasket(name, amount);
                    } else {
                        sessionStorage.setItem(name, amount);
                        updateBasket(name, amount);
                    }
                    if (amount === 0) {
                        document.getElementById(name).style.display = "none";
                        sessionStorage.removeItem(name);
                    }
                }
            });

            if (initialStock === productAmount) {
                $("td").find("[data-id='tilfoej" + productName + "']").css({
                    "pointer-events": "none",
                    "filter": "grayscale(100%)"
                });
            }
        }
    }

//lets the user logout
    $("#logoutButton").click(() => {
        SDK.Student.logOut();
    });
    $("#adminButton").click(() => {
        window.location.href = "admin.html";
    });

    $("#købKnap").click(() => {
        for (let i = 0; i < sessionStorage.length; i++) {
            const productName = sessionStorage.key(i);
            if (productName !== 'UserRFID' && productName !== 'currentUser') {
                const amountBought = sessionStorage.getItem(productName);
                SDK.Product.finalizePurchase(productName, amountBought, (err, data) => {
                    if (err && err.xhr.status === 401) {
                        throw err;
                    }
                });
            }
        }
        $('#kurvTabel').empty();
        window.location.href = "kvittering.html";
    });

    const productsTable = $("#productsTable");

    SDK.Product.loadAllActiveProducts((callback, data) => {
        if (callback) {
            throw callback;
        }
        let products = data;
        $.each(products, function (i, callback) {
            //makes the product grey scale if it's not in stock
            const greyScaleIfNotInStock = products[i].stockProduct > 0 ? 0 : 100;
            //makes the product click through so it's not purchasable if it's not in stock
            const clickThrough = greyScaleIfNotInStock === 100 ? 'pointer-events: none' : 'pointer-events: auto';
            let newProduct = `<div class="col-md-4" style="filter:grayscale(${greyScaleIfNotInStock}%); ${clickThrough}">`;
            newProduct += '<input type="image" class="kioskVare" id="' + products[i].idProduct + '" data-id="' + (i + 1) + '" alt="' + products[i].nameProduct + '" width="80" height="200" src="images/products/' + products[i].nameProduct + '.png" >';
            newProduct += '</div>';
            i++;
            productsTable.append(newProduct);
        });

        $("#productsTable").find("div").on('click', function () {
            let name = $(this).find('input').attr("alt");
            //runs through all products until we find the clicked product
            for (let i = 0; i < products.length; i++) {
                if (name === products[i].nameProduct) {
                    let amount = sessionStorage.getItem(name);
                    if (!amount) {
                        amount = 1;
                    } else {
                        amount++;
                    }
                    if (amount === products[i].stockProduct) {
                        $("#" + products[i].idProduct).parent().css({
                            "pointer-events": "none",
                            "filter": "grayscale(100%)"
                        });
                        $("td").find("[data-id='tilfoej" + name + "']").css({
                            "pointer-events": "none",
                            "filter": "grayscale(100%)"
                        });
                    }
                    sessionStorage.setItem(name, amount);
                    updateBasket(name, amount, products[i].stockProduct);
                }
            }
        });
    });

});
