function switchToGame(name){
    console.log("got name as " + name);
    $("#home").css("display", "none");
    $("#modules").css("display", "flex");
    $("#modules").css("flex-direction", "column");
    $("#modules").css("justify-content", "center");
    $("#modules").css("align-items", "center");

    $("#about").css("display", "none");

    loadMaze(name);
};

function returnToMenu(){
    location.reload();
}

document.addEventListener('keyup', function(event){
    let nameInput = $("#nameInput");
    let text = nameInput.val();

    console.log("input changed, is now ", text);

    if(text.length > 0 && text.length < 9){
        $("#goButton").prop('disabled', false);
        console.log("home status: " + $("#home").is(":hidden"));
        if(event.keyCode == 13 && $("#home").is(":visible")){
            $("#goButton").click();
        }
    }
    else{
        $("#goButton").prop('disabled', true);
    }

});



function displayKillEffect(){
    let body = $("body");
    let modules = $("#modules");
    let effectDelay = 100;

    body.css("background-color", "#000000");
    setTimeout(function(){
        body.css("background-color", "#dbdbdb");
    }, effectDelay);
    setTimeout(function(){
        body.css("background-color", "#000000");
    }, effectDelay*2);
    setTimeout(function(){
        body.css("background-color", "#dbdbdb");
    }, effectDelay*3);
}