$(document).ready(() => {

    //this variable can be set to true to let the developer debug - see the "debug && console.log(x)" lines throughout this class
    const debug = false;

    //used in validateDetails
    const productFields = ['productName', 'productPrice', 'productStock', 'productIsActive'];
    const userFields = ['name', 'RFID', 'admin', 'sex'];


    //used in validateDetails below
    function isEmpty(str) {
        return !str.replace(/^\s+/g, '').length; // boolean (`true` if field is empty)
    }

    //checks that all the required fields aren't empty, and that they also exist
    function validateDetails(array, keys) {
        let errors = 0;
        debug && console.log("array i validateDetails: ", array);
        debug && console.log("keys i validateDetails: ", keys);
        keys.forEach(function (k) {
            if (k in array[0]) {
                if (isEmpty(array[0][k])) {
                    console.log(k, "is empty");
                    errors += 1;
                }
            } else {
                console.log(k, "doesn't exist");
                errors += 1;
            }
        });
        return errors <= 0;
    }

    $("#tilfoejBruger").click(() => {
        let details = [
            {
                name: $("#newName").val(),
                RFID: $("#newRFID").val(),
                sex: $("#newSex").val(),
                admin: $("#newAdmin").val(),
            }
        ];
        if (!validateDetails(details, userFields)) {
            alert("You didn't fill out the necessary fields")
        } else {
            SDK.Student.createUser(details[0].name, details[0].RFID, details[0].sex, details[0].admin, (err, data) => {
                if (err && err.xhr.status === 400) {
                    $(".form-group").addClass("Client fail");
                } else if (err) {
                    console.log("Error")
                } else {
                    window.alert("User with the name " + details[0].name + " has been made");
                    $("#newName").val('');
                    $("#newRFID").val('');
                    document.getElementById("newSex").selectedIndex = "0";
                    document.getElementById("newAdmin").selectedIndex = "0";
                    const oneMoreUser = confirm("Do you want to create another user?\nOk to create another, Cancel to go back to admin page.");
                    if (!oneMoreUser) {
                        $('#opretBrugerModal').modal('hide');
                    }
                }
            })
        }
    });
    $("#tilfoejProdukt").click(() => {
        let details = [
            {
                productName: $("#newProductName").val(),
                productPrice: $("#newProductPrice").val(),
                productStock: $("#newProductStock").val(),
                productIsActive: $("#newProductActive").val(),
            }
        ];
        if (!validateDetails(details, productFields)) {
            alert("You didn't fill out the necessary fields");
        } else if (/[a-zA-Z]/.test(details[0].productPrice) || /[a-zA-Z]/.test(details[0].productStock)) {
            alert("You can only use numbers in stock and pricing fields");
        } else {
            SDK.Product.createProduct(details[0].productName, details[0].productPrice, details[0].productStock, details[0].productIsActive, (err, data) => {
                if (err && err.xhr.status === 400) {
                    $(".form-group").addClass("Client fail");
                } else if (err) {
                    console.log("Error")
                } else {
                    window.alert("Product with the name " + details[0].productName + " has been made");
                    $("#newProductName").val('');
                    $("#newProductPrice").val('');
                    $("#newProductStock").val('');
                    document.getElementById("newProductActive").selectedIndex = "0";
                    const oneMoreProduct = confirm("Do you want to create another product?\nOk to create another, Cancel to go back to admin page.");
                    if (!oneMoreProduct) {
                        $('#opretProduktModal').modal('hide');
                    }
                }
            })
        }
    });
    $("#opdaterProdukt").click(() => {
        let details = [
            {
                productName: $("#opdaterProductName").val(),
                productPrice: $("#opdaterProductPrice").val(),
                productStock: $("#opdaterProductStock").val(),
                productIsActive: $("#opdaterProductActive").val(),
            }
        ];
        if (!validateDetails(details, productFields)) {
            alert("You didn't fill out the necessary fields");
        } else if (/[a-zA-Z]/.test(details[0].productPrice) || /[a-zA-Z]/.test(details[0].productStock)) {
            alert("You can only use numbers in stock and pricing fields");
        } else {
            let productActive;
            if (details[0].productIsActive === '1') {
                productActive = 'Yes'
            } else {
                productActive = 'No'
            }
            if (confirm("Event will be updated to have the following information: " +
                "\n Name: " + details[0].productName +
                "\n Price: " + details[0].productPrice + " DKK" +
                "\n Stock: " + details[0].productStock + " pcs" +
                "\n Active Product: " + productActive +
                "\n Is this correct?" +
                "\n Ok to submit your changes to the product, cancel to continue editing.")) {
                const productID = JSON.stringify(JSON.parse(sessionStorage.getItem("updateProduct")).idProduct);
                SDK.Product.updateProduct(productID, details[0].productName, details[0].productPrice, details[0].productStock, details[0].productIsActive, (err, data) => {
                    if (err && err.xhr.status === 400) {
                        $(".form-group").addClass("Client fail");
                    } else if (err) {
                        console.log("Error")
                    } else {
                        alert("Product with the name " + details[0].productName + " has been updated");
                        sessionStorage.removeItem("updateProduct");
                        $('#opdaterProduktModal').modal('hide');
                        location.reload();
                    }
                })
            }
        }
    });
    $("#opdaterBruger").click(() => {
        let details = [
            {
                name: $("#opdaterBrugerNavn").val(),
                RFID: $("#opdaterBrugerRFID").val(),
                admin: $("#opdaterBrugerAdmin").val(),
                sex: $("#opdaterBrugerKoen").val(),
            }
        ];
        if (!validateDetails(details, userFields)) {
            alert("You didn't fill out the necessary fields");
        } else {
            let userSex, userIsAdmin = 'No';
            if (details[0].sex === 'M') {
                userSex = 'Male'
            } else {
                userSex = 'Female'
            }
            if (details[0].admin === "1") {
                userIsAdmin = 'Yes'
            }
            if (confirm("Event will be updated to have the following information: " +
                "\n Name: " + details[0].name +
                "\n RFID: " + details[0].RFID +
                "\n Is Admin: " + userIsAdmin +
                "\n User Sex: " + userSex +
                "\n Is this correct?" +
                "\n Ok to submit your changes to the user, cancel to continue editing.")) {
                const userID = JSON.stringify(JSON.parse(sessionStorage.getItem("updateUser")).idUser);
                SDK.Student.updateUser(userID, details[0].name, details[0].RFID, details[0].admin, details[0].sex, (err, data) => {
                    if (err && err.xhr.status === 400) {
                        $(".form-group").addClass("Client fail");
                    } else if (err) {
                        console.log("Error")
                    } else {
                        alert("User with the name " + details[0].name + " has been updated");
                        sessionStorage.removeItem("updateUser");
                        $('#opdaterBrugerModal').modal('hide');
                        location.reload();
                    }
                })
            }
        }
    });

    $("#sletBruger").click(() => {
        const userName = JSON.stringify(JSON.parse(sessionStorage.getItem("updateUser")).nameUser);
        if (confirm("Are you sure you want to delete the user with the name " + userName + "?")) {
            SDK.Student.deleteUser(JSON.stringify(JSON.parse(sessionStorage.getItem("updateUser")).idUser), (err, data) => {
                if (err && err.xhr.status === 400) {
                    $(".form-group").addClass("Client fail");
                } else if (err) {
                    console.log("Error")
                } else {
                    alert("User with the name " + userName + " has been deleted");
                    sessionStorage.removeItem("updateUser");
                    $('#opdaterBrugerModal').modal('hide');
                    location.reload();
                }
            });
        }
    });
    $("#sletProdukt").click(() => {
        const productName = JSON.stringify(JSON.parse(sessionStorage.getItem("updateProduct")).nameProduct);
        if (confirm("Are you sure you want to delete the product with the name " + productName + "?")) {
            SDK.Product.deleteProduct(JSON.stringify(JSON.parse(sessionStorage.getItem("updateProduct")).idProduct), (err, data) => {
                if (err && err.xhr.status === 400) {
                    $(".form-group").addClass("Client fail");
                } else if (err) {
                    console.log("Error")
                } else {
                    alert("Product with the name " + productName + " has been deleted");
                    sessionStorage.removeItem("updateProduct");
                    $('#opdaterProduktModal').modal('hide');
                    location.reload();
                }
            });
        }
    });

});

