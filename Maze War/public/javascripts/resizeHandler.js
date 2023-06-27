function handleResize(){
    var w = $(window).innerWidth() * 9/10;
    var h = $(window).innerHeight() * 9 / 10;
    console.log("width is ", w, ", height is ", h);

    if(w > (h*1850/1150)){
        w = h*1850/1150;
    }
    else {
        h = w*1150/1850;
    }

    console.log("width should be ", w, ", height should be ", h);


    let hFS = String(h*250/1150) + "px";
    let slFS = String(h*40/1150) + "px";
    let nFS = String(h*40/1150) + "px";
    let nfFs = String(h*20/1150) + "px";
    let gBM = h*30/1150;

    let nIF = h*200/1150;

    let mainLogo = $("#mainLogo");
    mainLogo.css("font-size", hFS);
    mainLogo.css("line-height",hFS);

    let subLogo = $("#subLogo");
    subLogo.css("font-size", slFS);

    let nameField = $("#nameField");
    nameField.css("font-size", nFS);

    let nameInput = $("#nameInput");
    nameInput.css("width", nIF);
    nameInput.css("font-size", nfFs);

    let goButton = $("#goButton");
    goButton.css("margin-top", gBM);





    let cModW = w*1200/1850;
    let sModW = w*300/1850;

    let cModH = h*900/1150;
    let sModH = h*450/1150;

    let oModW = w*900/1850;
    let oModH = h*225/1150;

    let sR2W = w*475/1850;
    let sR2FS = String(h*25/1150) + "px";

    let aModM = String(w*25/1850) + "px";

    let tS = String(h*25/1150) + "px";
    let ls = String(h*45/1150) + "px";

    let sTrH = Math.floor(h*450/11500);
    console.log("strh: " + sTrH);


    let scoreTable = $("#scoreTable");
    scoreTable.css("width", sModW);
    scoreTable.css("font-size", tS);
    scoreTable.css("line-height", ls);
    scoreTable.css("padding-left", sModW*1/20);
    scoreTable.css("padding-right", sModW*1/20);
    scoreTable.css("padding-top", sModW*1/20);

    let scoreTableHeader = $("#scoreTable th");
    scoreTableHeader.css("height", sTrH);

    let scoreTableRow = $("#scoreTable td");
    scoreTableRow.css("height", sTrH);

    let scoreDiv = $("#scoreDiv");
    scoreDiv.css("width", sModW);
    scoreDiv.css("height", sModH);
    scoreDiv.css("margin", aModM);

    let mazeCanvas = $("#mazeView");
    mazeCanvas.css("width", cModW);
    mazeCanvas.css("height", cModH);
    mazeCanvas.css("margin-top", aModM);

    let mazeOverhead = $("#mazeOverhead");
    mazeOverhead.css("width", sModW);
    mazeOverhead.css("height", sModH);
    mazeOverhead.css("margin", aModM);

    let outputDiv = $("#outputDiv");
    outputDiv.css("margin-top",aModM);

    let output = $("#output");
    output.css("width", oModW);
    output.css("height", oModH);
    output.css("margin-bottom", aModM);
    output.css("font-size", tS);
    output.css("line-height", ls);

    let instructions = $("#instructions");
    instructions.css("width", sR2W);
    instructions.css("font-size", sR2FS);

    let returnB = $("#returnB");
    returnB.css("width", sR2W);

    let backB = $("#backButton");
    backB.css("width", sR2W/2);
    backB.css("font-size", sR2FS);

    let outputText = $("#outputText");
    outputText.css("padding-left", oModW/40);

    let aFS = String(h*20/1150) + "px";
    let aM = h*20/1150;

    let about = $("#about");
    about.css("font-size", aFS);
    about.css("margin-bottom", aM);
    about.css("margin-right", aM);
}