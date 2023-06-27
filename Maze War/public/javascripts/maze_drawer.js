exports.drawMaze = function(maze,res){
    let w = 600;
    let h = 450;
    let fov = .25;

    let x = 0;
    let y = 0;
    while(true){
        x = Math.floor(Math.random()*maze[0].length);
        y = Math.floor(Math.random()*maze.length);
        if(maze[y][x] == 0) break;
    }
    console.log("loc = " + y +"," + x);

    let dir = getOpenDirection(maze, x, y);

    console.log("dir is " + dir);

    let depth = getHallDepth(maze,x,y,dir)+1;
    //let depth = 20;

    res.write("<svg id=\"canvas\" width=\"" + w + "\", height=\"" + h + "\">");

    res.write("<line x1=\"0\" y1=\"0\" x2=\""+w+"\" y2=\"0\" stroke-width=\"2\" stroke=\"black\"/>")
    res.write("<line x1=\"0\" y1=\"0\" x2=\"0\" y2=\""+h+"\" stroke-width=\"2\" stroke=\"black\"/>")
    res.write("<line x1=\""+w+"\" y1=\"0\" x2=\""+w+"\" y2=\""+h+"\" stroke-width=\"2\" stroke=\"black\"/>")
    res.write("<line x1=\"0\" y1=\""+h+"\" x2=\""+w+"\" y2=\""+h+"\" stroke-width=\"2\" stroke=\"black\"/>")

    for(let i = 0; i < depth; i++){
        if(getTileType(maze, x, y, dir, i, -1) == 0){
            drawLeftExit(i,fov,w,h,res,depth);
        }
        else{
            drawLeftWall(i,fov,w,h,res,depth);
        }

        if(getTileType(maze,x,y,dir,i,1) == 0){
            drawRightExit(i,fov,w,h,res,depth);
        }
        else{
            drawRightWall(i,fov,w,h,res,depth);
        }
    }
    drawEndLines(depth,fov,w,h,res);

    res.write("</svg><br>");
};

function getHallDepth(maze, x, y, dir){
    let d = 0;
    while(true){
        if(dir == 0){
            if(maze[y-d-1][x] == 1) break;
        }
        else if(dir == 1){
            if(maze[y][x+d+1] == 1) break;
        }
        else if(dir == 2){
            if(maze[y+d+1][x] == 1) break;
        }
        else{
            if(maze[y][x-d-1] == 1) break;
        }
        d++;
    }
    console.log("d = " + d);
    return d;
}

function getOpenDirection(maze, x, y){
    /*
    let openDir = [1,1,1,1];
    if(maze[y-1][x] == 0) openDir[0] = 0;
    if(maze[y][x+1] == 0) openDir[1] = 0;
    if(maze[y+1][x] == 0) openDir[2] = 0;
    if(maze[y][x-1] == 0) openDir[3] = 0;
    for(let i = 0; i < 4; i++){
        if(maze[i] == 0) return i;
    }

    */
    return Math.floor(Math.random()*4);
}

function drawLeftWall(i,fov,w,h,res,depth){
    res.write("<line x1=\"" + ((Math.pow(1 / fov, i) - Math.pow((1 / fov) - 1, i)) * (w / 2) / Math.pow(1 / fov, i)) + "\" y1=\"" + ((Math.pow(1 / fov, i) - Math.pow((1 / fov) - 1, i)) * (h / 2) / Math.pow(1 / fov, i)) + "\" x2=\"" + ((Math.pow(1 / fov, i + 1) - Math.pow((1 / fov) - 1, i + 1)) * (w / 2) / Math.pow(1 / fov, i + 1)) + "\" y2=\"" + ((Math.pow(1 / fov, i + 1) - Math.pow((1 / fov) - 1, i + 1)) * (h / 2) / Math.pow(1 / fov, i + 1)) + "\" stroke-width=\""+(4*Math.pow(0.8,i))+"\" stroke=\"black\"/>");
    res.write("<line x1=\"" + ((Math.pow(1/fov,i)-Math.pow((1/fov)-1,i))*(w/2)/Math.pow(1/fov,i)) + "\" y1=\"" + (h-((Math.pow(1/fov,i)-Math.pow((1/fov)-1,i))*(h/2)/Math.pow(1/fov,i))) + "\" x2=\"" + ((Math.pow(1/fov,i+1)-Math.pow((1/fov)-1,i+1))*(w/2)/Math.pow(1/fov,i+1)) +"\" y2=\"" + (h-((Math.pow(1/fov,i+1)-Math.pow((1/fov)-1,i+1))*(h/2)/Math.pow(1/fov,i+1))) + "\" stroke-width=\""+(4*Math.pow(0.8,i))+"\" stroke=\"black\"/>");
    if(i == depth-1) {
        res.write("<line x1=\"" + ((Math.pow(1 / fov, i + 1) - Math.pow((1 / fov) - 1, i + 1)) * (w / 2) / Math.pow(1 / fov, i + 1)) + "\" y1=\"" + ((Math.pow(1 / fov, i + 1) - Math.pow((1 / fov) - 1, i + 1)) * (h / 2) / Math.pow(1 / fov, i + 1)) + "\" x2=\"" + ((Math.pow(1 / fov, i + 1) - Math.pow((1 / fov) - 1, i + 1)) * (w / 2) / Math.pow(1 / fov, i + 1)) + "\" y2=\"" + (h - ((Math.pow(1 / fov, i + 1) - Math.pow((1 / fov) - 1, i + 1)) * (h / 2) / Math.pow(1 / fov, i + 1))) + "\" stroke-width=\""+(4*Math.pow(0.8,i))+"\" stroke=\"black\"/>");
    }
}

function drawRightWall(i,fov,w,h,res,depth){
    res.write("<line x1=\"" + (w-((Math.pow(1/fov,i)-Math.pow((1/fov)-1,i))*(w/2)/Math.pow(1/fov,i))) + "\" y1=\"" + ((Math.pow(1/fov,i)-Math.pow((1/fov)-1,i))*(h/2)/Math.pow(1/fov,i)) + "\" x2=\"" + (w-((Math.pow(1/fov,i+1)-Math.pow((1/fov)-1,i+1))*(w/2)/Math.pow(1/fov,i+1))) +"\" y2=\"" + ((Math.pow(1/fov,i+1)-Math.pow((1/fov)-1,i+1))*(h/2)/Math.pow(1/fov,i+1)) + "\" stroke-width=\""+(4*Math.pow(0.8,i))+"\" stroke=\"black\"/>");
    res.write("<line x1=\"" + (w-((Math.pow(1/fov,i)-Math.pow((1/fov)-1,i))*(w/2)/Math.pow(1/fov,i))) + "\" y1=\"" + (h-((Math.pow(1/fov,i)-Math.pow((1/fov)-1,i))*(h/2)/Math.pow(1/fov,i))) + "\" x2=\"" + (w-((Math.pow(1/fov,i+1)-Math.pow((1/fov)-1,i+1))*(w/2)/Math.pow(1/fov,i+1))) +"\" y2=\"" + (h-((Math.pow(1/fov,i+1)-Math.pow((1/fov)-1,i+1))*(h/2)/Math.pow(1/fov,i+1))) + "\" stroke-width=\""+(4*Math.pow(0.8,i))+"\" stroke=\"black\"/>");
    if(i == depth-1) {
        res.write("<line x1=\"" + (w-((Math.pow(1 / fov, i + 1) - Math.pow((1 / fov) - 1, i + 1))) * (w / 2) / Math.pow(1 / fov, i + 1)) + "\" y1=\"" + ((Math.pow(1 / fov, i + 1) - Math.pow((1 / fov) - 1, i + 1)) * (h / 2) / Math.pow(1 / fov, i + 1)) + "\" x2=\"" + (w-((Math.pow(1 / fov, i + 1) - Math.pow((1 / fov) - 1, i + 1)) * (w / 2) / Math.pow(1 / fov, i + 1))) + "\" y2=\"" + (h - ((Math.pow(1 / fov, i + 1) - Math.pow((1 / fov) - 1, i + 1)) * (h / 2) / Math.pow(1 / fov, i + 1))) + "\" stroke-width=\""+(4*Math.pow(0.8,i))+"\" stroke=\"black\"/>");
    }
}

function drawLeftExit(i,fov,w,h,res,depth){
    res.write("<line x1=\"" + ((Math.pow(1/fov,i)-Math.pow((1/fov)-1,i))*(w/2)/Math.pow(1/fov,i)) + "\" y1=\"" + ((Math.pow(1/fov,i)-Math.pow((1/fov)-1,i))*(h/2)/Math.pow(1/fov,i)) + "\" x2=\"" + ((Math.pow(1/fov,i)-Math.pow((1/fov)-1,i))*(w/2)/Math.pow(1/fov,i)) +"\" y2=\"" + (h-((Math.pow(1/fov,i)-Math.pow((1/fov)-1,i))*(h/2)/Math.pow(1/fov,i))) + "\" stroke-width=\""+(4*Math.pow(0.8,i))+"\" stroke=\"black\"/>");
    if(i != depth-1) {
        res.write("<line x1=\"" + ((Math.pow(1 / fov, i + 1) - Math.pow((1 / fov) - 1, i + 1)) * (w / 2) / Math.pow(1 / fov, i + 1)) + "\" y1=\"" + ((Math.pow(1 / fov, i + 1) - Math.pow((1 / fov) - 1, i + 1)) * (h / 2) / Math.pow(1 / fov, i + 1)) + "\" x2=\"" + ((Math.pow(1 / fov, i + 1) - Math.pow((1 / fov) - 1, i + 1)) * (w / 2) / Math.pow(1 / fov, i + 1)) + "\" y2=\"" + (h - ((Math.pow(1 / fov, i + 1) - Math.pow((1 / fov) - 1, i + 1)) * (h / 2) / Math.pow(1 / fov, i + 1))) + "\" stroke-width=\""+(4*Math.pow(0.8,i))+"\" stroke=\"black\"/>");
    }

    res.write("<line x1=\"" + ((Math.pow(1 / fov, i + 1) - Math.pow((1 / fov) - 1, i + 1)) * (w / 2) / Math.pow(1 / fov, i + 1)) + "\" y1=\"" + ((Math.pow(1 / fov, i + 1) - Math.pow((1 / fov) - 1, i + 1)) * (h / 2) / Math.pow(1 / fov, i + 1)) + "\" x2=\"" + ((Math.pow(1 / fov, i) - Math.pow((1 / fov) - 1, i)) * (w / 2) / Math.pow(1 / fov, i)) + "\" y2=\"" + (((Math.pow(1 / fov, i + 1) - Math.pow((1 / fov) - 1, i + 1)) * (h / 2) / Math.pow(1 / fov, i + 1))) + "\" stroke-width=\""+(4*Math.pow(0.8,i))+"\" stroke=\"black\"/>");
    res.write("<line x1=\"" + ((Math.pow(1 / fov, i + 1) - Math.pow((1 / fov) - 1, i + 1)) * (w / 2) / Math.pow(1 / fov, i + 1)) + "\" y1=\"" + (h - ((Math.pow(1 / fov, i + 1) - Math.pow((1 / fov) - 1, i + 1)) * (h / 2) / Math.pow(1 / fov, i + 1))) + "\" x2=\"" + ((Math.pow(1 / fov, i) - Math.pow((1 / fov) - 1, i)) * (w / 2) / Math.pow(1 / fov, i)) + "\" y2=\"" + (h - ((Math.pow(1 / fov, i + 1) - Math.pow((1 / fov) - 1, i + 1)) * (h / 2) / Math.pow(1 / fov, i + 1))) + "\" stroke-width=\""+(4*Math.pow(0.8,i))+"\" stroke=\"black\"/>");

}

function drawRightExit(i,fov,w,h,res,depth) {
    res.write("<line x1=\"" + (w - ((Math.pow(1 / fov, i) - Math.pow((1 / fov) - 1, i)) * (w / 2) / Math.pow(1 / fov, i))) + "\" y1=\"" + (((Math.pow(1 / fov, i) - Math.pow((1 / fov) - 1, i)) * (h / 2) / Math.pow(1 / fov, i))) + "\" x2=\"" + (w - ((Math.pow(1 / fov, i) - Math.pow((1 / fov) - 1, i)) * (w / 2) / Math.pow(1 / fov, i))) + "\" y2=\"" + (h - ((Math.pow(1 / fov, i) - Math.pow((1 / fov) - 1, i)) * (h / 2) / Math.pow(1 / fov, i))) + "\" stroke-width=\""+(4*Math.pow(0.8,i))+"\" stroke=\"black\"/>");
    if(i != depth-1) {
        res.write("<line x1=\"" + (w - ((Math.pow(1 / fov, i + 1) - Math.pow((1 / fov) - 1, i + 1)) * (w / 2) / Math.pow(1 / fov, i + 1))) + "\" y1=\"" + (((Math.pow(1 / fov, i + 1) - Math.pow((1 / fov) - 1, i + 1)) * (h / 2) / Math.pow(1 / fov, i + 1))) + "\" x2=\"" + (w - ((Math.pow(1 / fov, i + 1) - Math.pow((1 / fov) - 1, i + 1)) * (w / 2) / Math.pow(1 / fov, i + 1))) + "\" y2=\"" + (h - ((Math.pow(1 / fov, i + 1) - Math.pow((1 / fov) - 1, i + 1)) * (h / 2) / Math.pow(1 / fov, i + 1))) + "\" stroke-width=\""+(4*Math.pow(0.8,i))+"\" stroke=\"black\"/>");
    }

    res.write("<line x1=\"" + (w - ((Math.pow(1 / fov, i + 1) - Math.pow((1 / fov) - 1, i + 1)) * (w / 2) / Math.pow(1 / fov, i + 1))) + "\" y1=\"" + (((Math.pow(1 / fov, i + 1) - Math.pow((1 / fov) - 1, i + 1)) * (h / 2) / Math.pow(1 / fov, i + 1))) + "\" x2=\"" + (w - ((Math.pow(1 / fov, i) - Math.pow((1 / fov) - 1, i)) * (w / 2) / Math.pow(1 / fov, i))) + "\" y2=\"" + (((Math.pow(1 / fov, i + 1) - Math.pow((1 / fov) - 1, i + 1)) * (h / 2) / Math.pow(1 / fov, i + 1))) + "\" stroke-width=\""+(4*Math.pow(0.8,i))+"\" stroke=\"black\"/>");
    res.write("<line x1=\"" + (w - ((Math.pow(1 / fov, i + 1) - Math.pow((1 / fov) - 1, i + 1)) * (w / 2) / Math.pow(1 / fov, i + 1))) + "\" y1=\"" + (h - ((Math.pow(1 / fov, i + 1) - Math.pow((1 / fov) - 1, i + 1)) * (h / 2) / Math.pow(1 / fov, i + 1))) + "\" x2=\"" + (w - ((Math.pow(1 / fov, i) - Math.pow((1 / fov) - 1, i)) * (w / 2) / Math.pow(1 / fov, i))) + "\" y2=\"" + (h - ((Math.pow(1 / fov, i + 1) - Math.pow((1 / fov) - 1, i + 1)) * (h / 2) / Math.pow(1 / fov, i + 1))) + "\" stroke-width=\""+(4*Math.pow(0.8,i))+"\" stroke=\"black\"/>");

}
function drawEndLines(i,fov,w,h,res){
    res.write("<line x1=\"" + (((Math.pow(1/fov,i)-Math.pow((1/fov)-1,i))*(w/2)/Math.pow(1/fov,i))) + "\" y1=\"" + (((Math.pow(1/fov,i)-Math.pow((1/fov)-1,i))*(h/2)/Math.pow(1/fov,i))) + "\" x2=\"" + (w-((Math.pow(1/fov,i)-Math.pow((1/fov)-1,i))*(w/2)/Math.pow(1/fov,i))) +"\" y2=\"" + (((Math.pow(1/fov,i)-Math.pow((1/fov)-1,i))*(h/2)/Math.pow(1/fov,i))) + "\" stroke-width=\""+(4*Math.pow(0.8,i))+"\" stroke=\"black\"/>");
    res.write("<line x1=\"" + (((Math.pow(1/fov,i)-Math.pow((1/fov)-1,i))*(w/2)/Math.pow(1/fov,i))) + "\" y1=\"" + (h-((Math.pow(1/fov,i)-Math.pow((1/fov)-1,i))*(h/2)/Math.pow(1/fov,i))) + "\" x2=\"" + (w-((Math.pow(1/fov,i)-Math.pow((1/fov)-1,i))*(w/2)/Math.pow(1/fov,i))) +"\" y2=\"" + (h-((Math.pow(1/fov,i)-Math.pow((1/fov)-1,i))*(h/2)/Math.pow(1/fov,i))) + "\" stroke-width=\""+(4*Math.pow(0.8,i))+"\" stroke=\"black\"/>");
}

function getTileType(maze, x, y, dir, depth, side){
    if(dir == 0){
        return ((maze[y-depth][x+side] == 0) ? 0 : 1);
    }
    else if(dir == 1){
        return ((maze[y+side][x+depth] == 0) ? 0 : 1);
    }
    else if(dir == 2){
        return ((maze[y+depth][x-side] == 0) ? 0 : 1);
    }
    else{
        return ((maze[y-side][x-depth] == 0) ? 0 : 1);
    }
}