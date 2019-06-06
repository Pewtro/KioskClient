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
    $("#opdaterBrugerModal").on("hidden.bs.modal", function () {
        sessionStorage.removeItem("updateProduct");
        $("#opdaterBrugerNavn").val('');
        $("#opdaterBrugerRFID").val('');
        document.getElementById("opdaterBrugerAdmin").selectedIndex = "0";
        document.getElementById("opdaterBrugerKoen").selectedIndex = "0";
    });

    const myUserTable = $("#userTableBody");

    SDK.Admin.loadAllUsers((callback, data) => {
        if (callback) {
            throw callback;
        }
        const users = data;
        $.each(users, function (i, callback) {
            let adminStatus = 'No';
            let userSex;
            if (users[i].userIsAdmin === 1) {
                adminStatus = 'Yes';
            }
            if (users[i].userSex === 'M') {
                userSex = 'Male';
            } else {
                userSex = 'Female';
            }
            let tr = '<tr>';
            tr += '<td>' + users[i].idUser + '</td>';
            tr += '<td>' + users[i].nameUser + '</td>';
            tr += '<td>' + users[i].RFIDUser + '</td>';
            tr += '<td>' + adminStatus + '</td>';
            tr += '<td>' + userSex + '</td>';
            tr += '<td><button class="btn btn-primary update-button" data-id="' + (i + 1) + '">Update User</button></td>';
            i++;
            myUserTable.append(tr);
        });
        $(".update-button").click(function () {
            let name = $(this).closest("tr").find("td:eq(1)").text();
            for (let i = 0; i < users.length; i++) {
                if (name === users[i].nameUser) {
                    let constructJson = "{\"idUser\":" + users[i].idUser + ","
                        + "\"nameUser\":\"" + users[i].nameUser + "\","
                        + "\"RFIDUser\":\"" + users[i].RFIDUser + "\","
                        + "\"userIsAdmin\":" + users[i].userIsAdmin + ","
                        + "\"userSex\":\"" + users[i].userSex + "\"}";
                    sessionStorage.setItem("updateUser", constructJson);
                }
            }
            const userToUpdate = JSON.parse(sessionStorage.getItem("updateUser"));
            $("#opdaterBrugerNavn").val(userToUpdate.nameUser);
            $("#opdaterBrugerRFID").val(userToUpdate.RFIDUser);
            if (userToUpdate.userIsAdmin === 1) {
                document.getElementById("opdaterBrugerAdmin").selectedIndex = "1";
            } else {
                document.getElementById("opdaterBrugerAdmin").selectedIndex = "0";
            }
            if (userToUpdate.userSex === "M") {
                document.getElementById("opdaterBrugerKoen").selectedIndex = "0";
            } else {
                document.getElementById("opdaterBrugerKoen").selectedIndex = "1";
            }
            $("#opdaterBrugerModal").modal();
        });
    })

});