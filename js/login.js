$(document).ready(() => {

    $("#rfidInput").keyup(function (event) {
        if (event.keyCode === 13) {
            $("#loginBtn").click();
        }
    });
    //when the login button is clicked we run this function
    $("#loginBtn").click(() => {
        //sets the two variables with the information given by the user
        let username = $("#rfidInput").val();

        //if either email or password doesn't contain information we tell the user we're missing information
        if (!username) {
            document.getElementById("error").innerHTML = "Information missing - contact an administrator";
        } else {
            //run the login function with the given information
            SDK.Student.login(username, (err, data) => {
                //a 401 is returned if wrong email/password is entered
                if (err && err.xhr.status === 401) {
                    document.getElementById("error").innerHTML = "RFID information doesn't match database, contact an administrator";
                } else if (err) {
                    document.getElementById("error").innerHTML = "Server is acting up, contact an administrator";
                    //if no user is found when logging in despite email/pass is correct (implies server is acting up)
                } else {
                    SDK.Student.loadCurrentStudent((err, data) => {
                        //this is merely a failsafe - should never happen
                        if (err && err.xhr.status === 401) {
                            document.getElementById("error").innerHTML = "Wrong username or password";
                        } else if (err && err.xhr.status === 415) {
                            console.log("unsupported media type error");
                        } else if (err) {
                            console.log("general error i loadCurrentUser from login.js");
                            //we logged in successfully, now go to kiosk
                        } else {
                            $("#rfidInput").val("");
                            window.location.href = "kiosk.html";
                        }
                    });
                }
            });
        }

    });
});