$(document).ready(() => {
    const debug = false;

    let listeTilSletning = [];
    for (let i = 0; i < sessionStorage.length; i++) {
        debug && console.log(sessionStorage.key(i));
        const productName = sessionStorage.key(i);
        if (productName !== 'UserRFID' && productName !== 'currentUser' && productName !== 'activeProducts') {
            const amountBought = sessionStorage.getItem(productName);
            $("#kvittering").append('<br/>' +
                amountBought + 'x ' + productName);
            listeTilSletning.unshift(i);
        }
    }
    for (let i = 0; i < listeTilSletning.length; i++) {
        debug && console.log("skal slettes ", sessionStorage.key(listeTilSletning[i]));
        sessionStorage.removeItem(sessionStorage.key(listeTilSletning[i]));
    }


    let timer = 7000;

    setTimeout(function () {
        SDK.Student.logOut();
        window.location.href = "login.html";
    }, timer);

    setInterval(function () {
        timer -= 1000;
        debug && console.log('Time left: ' + timer / 1000 + 's');
        $("#automatiskLogud").text('Automatisk log ud om ' + timer / 1000 + 's');
    }, 1000);

//lets the user logout instantly
    $("#logUd").click(() => {
        SDK.Student.logOut();
    });

//lets the user buy more
    $("#koebMere").click(() => {
        window.location.href = "kiosk.html";
    });
})
;