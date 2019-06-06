const debug = false;

const SDK = {
    serverURL: "http://localhost:8080/api",
    request: (options, callback) => {

        let headers = {};
        if (options.headers) {
            Object.keys(options.headers).forEach((h) => {
                headers[h] = (typeof options.headers[h] === 'object') ? JSON.stringify(options.headers[h]) : options.headers[h];
            });
        }

        $.ajax({
            url: SDK.serverURL + options.url,
            method: options.method,
            headers: headers,
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify(options.data),
            success: (data, status, xhr) => {
                callback(null, data, status, xhr);
            },
            error: (xhr, status, errorThrown) => {
                callback({xhr: xhr, status: status, error: errorThrown});
            }
        })
    },

    //Everything related to the student
    Student: {
        //calls the login function on the server
        login: (RFIDUser, callback) => {
            SDK.request({
                    data: {
                        RFIDUser: RFIDUser,
                    },
                    url: "/login",
                    method: "POST"
                },
                (err, data) => {
                    if (err) {
                        return callback(err);
                    }
                    //sets the users token which is returned by the server on successful login
                    data.RFIDUser = "\"" + data.RFIDUser + "\"";
                    sessionStorage.setItem("UserRFID", JSON.parse(data.RFIDUser));
                    callback(null, data);
                });
        },
        //loads the current user by getting their profile with the token in session storage
        loadCurrentStudent: (callback) => {
            SDK.request({
                method: "GET",
                url: "/login",
                headers: {
                    authorization: sessionStorage.getItem("UserRFID"),
                },
            }, (err, student) => {
                if (err) {
                    console.log("error i loadCurrentUser");
                    return callback(err);
                }
                callback(null, student);
                //sets the found student as our student in sessionStorage
                sessionStorage.setItem("currentUser", JSON.stringify(student));

            });
        },
        logOut: () => {
            sessionStorage.clear();
            window.location.href = "login.html";
        },
        createUser: (name, RFID, Sex, Admin, callback) => {
            SDK.request({
                url: "/admin/addUser",
                method: "POST",
                data: {
                    nameUser: name,
                    RFIDUser: RFID,
                    userSex: Sex,
                    userIsAdmin: Admin,
                }
            }, (err, data) => {
                if (err) {
                    return callback(err);
                }
                callback(null, data);
            });
        },
        updateUser: (idUser, nameUser, RFIDUser, userIsAdmin, userSex, callback) => {
            SDK.request({
                method: "PUT",
                data: {
                    idUser: idUser,
                    nameUser: nameUser,
                    RFIDUser: RFIDUser,
                    userIsAdmin: userIsAdmin,
                    userSex: userSex,
                },
                url: "/admin/" + idUser + "/update-user",
            }, (err, data) => {
                if (err) {
                    return callback(err);
                }
                callback(null, data);
            });
        },
        deleteUser: (idUser, callback) => {
            SDK.request({
                method: "DELETE",
                data: {
                    idUser: idUser,
                },
                url: "/admin/" + idUser + "/delete-user",
            }, (err, data) => {
                if (err) {
                    return callback(err);
                }
                callback(null, data);
            });
        },
    },

//Products
    Product: {
        finalizePurchase: (product, amountBought, callback) => {
            SDK.request({
                method: "POST",
                url: "/kiosk",
                headers: {
                    authorization: sessionStorage.getItem("UserRFID"),
                },
                data: {
                    nameProduct: product,
                    amountBought: amountBought,
                }
            }, (err, data) => {
                if (err) {
                    return callback(err);
                }
                callback(null, data);
            });
        },
        loadAllActiveProducts: (callback) => {
            SDK.request({
                method: "GET",
                url: "/kiosk",
            }, (err, data) => {
                if (err) {
                    return callback(err);
                }
                callback(null, data);
                sessionStorage.setItem("activeProducts", JSON.stringify(data));
            });
        },
        createProduct: (productName, productPrice, productStock, productIsActive, callback) => {
            SDK.request({
                url: "/kiosk/admin/createProduct",
                method: "POST",
                data: {
                    nameProduct: productName,
                    priceProduct: productPrice,
                    stockProduct: productStock,
                    isActive: productIsActive,
                }
            }, (err, data) => {
                if (err) {
                    return callback(err);
                }
                callback(null, data);
            });
        },
        updateProduct: (productID, productName, productPrice, productStock, productIsActive, callback) => {
            SDK.request({
                method: "PUT",
                data: {
                    idProduct: productID,
                    nameProduct: productName,
                    priceProduct: productPrice,
                    stockProduct: productStock,
                    isActive: productIsActive,
                },
                url: "/kiosk/admin/" + productID + "/update-product",
            }, (err, data) => {
                if (err) {
                    return callback(err);
                }
                callback(null, data);
            });
        },
        deleteProduct: (idProduct, callback) => {
            SDK.request({
                method: "DELETE",
                data: {
                    idProduct: idProduct,
                },
                url: "/kiosk/admin/" + idProduct + "/delete-product",
            }, (err, data) => {
                if (err) {
                    return callback(err);
                }
                callback(null, data);
            });
        },
        refillProduct: (idProduct, stockIncrease, callback) => {
            SDK.request({
                method: "PUT",
                data: {
                    idProduct: idProduct,
                    stockProduct: stockIncrease,
                },
                url: "/kiosk/admin/" + idProduct + "/refill",
            }, (err, data) => {
                if (err) {
                    return callback(err);
                }
                callback(null, data);
            });
        },
    },

//Administrative functionality
    Admin: {
        loadEverythingBought:
            (callback) => {
                SDK.request({
                    method: "GET",
                    url: "/kiosk/admin/everythingBought",
                }, (err, data) => {
                    if (err) {
                        return callback(err);
                    }
                    callback(null, data);
                });
            },
        loadAllProducts: (callback) => {
            SDK.request({
                method: "GET",
                url: "/kiosk/admin/allProducts",
            }, (err, data) => {
                if (err) {
                    return callback(err);
                }
                callback(null, data);
            });
        },
        loadAllUsers: (callback) => {
            SDK.request({
                    method: "GET",
                    url: "/admin/allUsers",
                },
                (err, data) => {
                    if (err) {
                        return callback(err);
                    }
                    callback(null, data);
                });
        },
        sletArrangementData: (callback) => {
            SDK.request({
                method: "DELETE",
                url: "/kiosk/admin/delete-arrangement-data",
            }, (err, data) => {
                if (err) {
                    return callback(err);
                }
                callback(null, data);
            });
        },
    },
};