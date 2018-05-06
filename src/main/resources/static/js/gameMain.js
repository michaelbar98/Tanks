// TODO:
// Enemy tanks
// Load in screen and process to get to the first campaign levels
// a system to load each game individually
// A start screen for the game
// a way to pause and end the game.

// let canvas;
let TILE_SIZE = 45;
let BOARD_WIDTH = 24;
let BOARD_HEIGHT = 16;
let user, uCannon;
let aKey, sKey, wKey, dKey, space;
let ready = false;
let mousX, mousY, rot;
let bullets = [];
let nonTrav = [];
let treads = [];
let USER_SPEED = 2.5;
let BULLET_SPEED = 5;
let USER_ROT = 0.04;
let lastFire = Date.now();
let gameTime = false;
let globalTime = 0;

let represent = "";
let won;

let isGameOver;
let winner = false;
let survival = false;
let survivalLevel = -1;

let playerTwo = 0;
let gameId = 0;

let explosions = [];
let startTime;
let currentTime = "00:00";
let pauseTime = 0;
let enemyObj;
let pause = false;
let pauseStart;
let pauseSprite;
let statEnemies = [];
let dumbEnemies = [];
let pathEnemies = [];
let homingEnemies = [];
let pathStart = [];
let pathOfPath = [];
// dumb enemies start location
let dumbStart = [];
let homingStart = [];
let mapLand = [];

let allEnemies = [];


let kills = 0;

let enemyLoc = [];


let movingEnemyX;
let movingEnemyY;



class Explosion {
    constructor(sprite) {
        this.sprite = sprite;
        this.stage = 1;
        this.count = 0;
    }
}

class Coordinate {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Enemy {
    constructor(sprite) {
        this.sprite = sprite;
        this.alive = true;
    }
}



// TEMP variables for testing
let placedEnemy = false;
let enemy;

let placedMovingEnemy = false;
let movingEnemy;

let one,two,three, timerSprite;

// set up canvas


// create the Scene object and create the map
let scene = sjs.Scene({w:1080, h:720});
let canvasbg = scene.Layer('background', {useCanvas:false, autoClear:true});


// setup the map
let map = [];
let walls = [];

for (let row = 0; row < 16; row++) {
    map[row] = [];
    mapLand[row] = [];
    for (let col = 0; col < 24; col++) {
        map[row][col] = 0;
        mapLand[row][col] = 0;
    }
}

function visitPage(whereTo){
		const urlArr = document.URL.split("/");
		let newUrl = "";
		switch(whereTo){
			case "Main":
				newUrl = "/home";
			break;
			case "Next":
				if(survival){
					$.post('/nextRound', {}, responseJSON => {
						location.reload();
					});
				}
				const nextLevel = parseInt(urlArr[urlArr.length -1])+1;
				if(nextLevel > 20 && survival !== true){
					alert("Congratulations! you finished all campaign levels");
					return;
				}
				newUrl = nextLevel;
			
			break;
			
		}
		window.location.href = newUrl;
}

function parseTime(time) {
    const totalSeconds = parseInt(time / 1000);
    const seconds = totalSeconds % 60;
    const minutes = parseInt(totalSeconds / 60);
    let timeString = "";
    if (minutes < 10){
        timeString += "0";
    }
    timeString += minutes.toString();
    timeString += ":";
    if (seconds < 10){
        timeString += "0";
    }
    timeString += seconds.toString();
    return timeString;
}

function setUpLeaderboard() {
    let urlArr = document.URL.split("/");
    let level;
    if (survival === true){
        level = survivalLevel;
    }
    else{
        level = parseInt(urlArr[urlArr.length -1]) + 1;
    }
    $.post('/gameLeaderboard', {"survival": survival, "gameId":level}, responseJSON => {
        const respObject = JSON.parse(responseJSON);
        let table = document.getElementById("leaders");
        let tableBody = document.createElement("tbody");
        for(let curRow = 0; curRow < 5; curRow++) {
            let row = document.createElement("tr");
            for (let c = 0; c < 2; c++) {
                let text;
                let cell = document.createElement("td");
                if (curRow <= (respObject.length-1)) {
                    if (c === 0) {
                        text = document.createTextNode(respObject[curRow].first);
                        cell.appendChild(text);
                    } else {
                        if (survival) {
                            text = document.createTextNode(respObject[curRow].second);
                        } else {
                            let time = parseTime(respObject[curRow].second);
                            text = document.createTextNode(time);
                        }
                        cell.appendChild(text);
                    }
                } else {
                    if (c === 0) {
                        text = document.createTextNode("-----");
                        cell.appendChild(text);
                    } else {
                        text = document.createTextNode("--:--");
                        cell.appendChild(text);
                    }
                }

                row.appendChild(cell);
            }
            tableBody.appendChild(row);
        }

        table.appendChild(tableBody);
    });
}

function getMap () {
    $.post('/map', {"url": window.location.href}, responseJSON => {
        const respObject = JSON.parse(responseJSON);

        survival = respObject.survival;
        if (survival){
        		survivalLevel = respObject.round;
        }
        if (!survival) {
            if (respObject.playerTwo !== -1) {
                playerTwo = respObject.playerTwo;
            }
        }
        for (let i in respObject.enemies) {
            if (respObject.enemies[i].type === "s") {
                enemyLoc.push(respObject.enemies[i].location.coordinates);
            }
            if (respObject.enemies[i].type === "d") {
                dumbStart.push(respObject.enemies[i].location.coordinates);
            }
            if (respObject.enemies[i].type === "p") {
                pathStart.push(respObject.enemies[i].location.coordinates);
                pathOfPath.push([respObject.enemies[i].location.coordinates, respObject.enemies[i].endLocation.coordinates]);
            }
            if (respObject.enemies[i].type === "h") {
                homingStart.push(respObject.enemies[i].location.coordinates);
            }
            
        }
        let mapLoc = respObject.map;
        for (let row = 0; row < 16; row++) {
            for (let col = 0; col < 24; col++) {
                populateMap(row, col, mapLoc[row][col]);
            }
        }
        setRepresentation();
        setStatTankMap(enemyLoc);
        startX = (respObject.game.user.location.coordinates[0] * 45) + 5;
        startY = (respObject.game.user.location.coordinates[1] * 45) + 5;
        loadMap();
        
        let urlArr = document.URL.split("/");
	    let level;
	    if (survival === true){
	    		level = survivalLevel;
	    }
	    else{
	    		level = parseInt(urlArr[urlArr.length -1]) + 1;
	    	}
	    document.getElementById("levNumber").innerHTML = "Game Level : " + level.toString();
    });
}


function populateMap(row, col, type) {
    map[row][col] = type;

}

function setRepresentation() {
    for (let row = 0; row < 16; row++) {
        for (let col = 0; col < 24; col++) {
            represent += map[row][col];
        }
    }
}

function setStatTankMap(list) {
    // console.log(list);
    for (let i in list) {
        let row = (list[i])[1];
        let col = (list[i])[0];
        map[row][col] = "st";
    }
}

let startX, startY;
let collideable = [];

// // load in the map
function loadMap() {
    setUpLeaderboard();
    scene.loadImages(["/sprites/wall.png", "/sprites/freeSpace.png", "/sprites/pothole.png", "/sprites/breakable.png",
        "/sprites/imm_tank.png", "/sprites/tank_space.png"], function()  {

        let next;
        //console.log(map);
        for (let row = 0; row < 16; row++) {
            for (let col = 0; col < 24; col++) {

                if (map[row][col] === "u" || map[row][col] === "x") {
                    next = canvasbg.Sprite("/sprites/wall.png");
                    next.isBreakable = false;
                    mapLand[row][col] = next;

                    walls.push(next);
                    nonTrav.push(next);
                } else if (map[row][col] === "b") {
                    next = canvasbg.Sprite("/sprites/freeSpace.png");
                    next.size(45, 45);

                    let breakable = canvasbg.Sprite("/sprites/breakable.png");
                    breakable.size(45, 45);
                    // put in location
                    breakable.move(col * TILE_SIZE, row * TILE_SIZE);
                    // update it
                    breakable.update();
                    breakable.isBreakable = true;
                    collideable.push(breakable);
                    nonTrav.push(breakable);

                } else if (map[row][col] === "p") {
                    next = canvasbg.Sprite("/sprites/pothole.png");
                    nonTrav.push(next);
                } else if (map[row][col] === "st") {
                    next = canvasbg.Sprite("/sprites/tank_space.png");
                } else {
                    next = canvasbg.Sprite("/sprites/freeSpace.png");
                }
                if (map[row][col] !== "b") {

                    next.size(45, 45);
                    // put in location
                    next.move(col * TILE_SIZE, row * TILE_SIZE);
                    // update it
                    next.update();

                }
            }
        }

    });
    // load in the player
    scene.loadImages(["/sprites/one.png", "/sprites/two.png", "/sprites/three.png", "/sprites/tank.png",
        "/sprites/tank_cannon.png", "/sprites/bullet.png", "/sprites/tTreads.png",
        "/sprites/explo2.png", "/sprites/explo1.png", "/sprites/explo3.png", "/sprites/pause.png",
        "/sprites/pause_blank.png", "/sprites/dumbTank.png", "/sprites/dumbTank_Can.png",
        "/sprites/pathTank.png", "/sprites/pathTank_Can.png", "/sprites/homingTank.png",
        "/sprites/homingTank_Can.png"], function() {
        let userTank = canvasbg.Sprite("/sprites/tank.png");
        let cannon = canvasbg.Sprite("/sprites/tank_cannon.png");
        // put in location
        userTank.move(startX, startY);
        cannon.move(startX, startY);
        // update it
        userTank.scale(1.25);
        cannon.scale(1.25);

        userTank.update();
        cannon.update();
        user = userTank;
        user.lastFire = Date.now();
        uCannon = cannon;
        ready = true;

        for(let i in enemyLoc) {
            //console.log(i);
            let cur = enemyLoc[i];
            createStationaryTank(cur[1], cur[0]);
        }

        for (let i in dumbStart) {
            let cur = dumbStart[i];
            const tank = createDumbTank(cur[1], cur[0]);
            addRoute(tank);
        }
        
        for (let i in pathOfPath) {
            createSamePathTank(pathOfPath[i]);
        }

        for (let i in homingStart) {
            let cur = homingStart[i];
            const tank = createHomingTank(cur[1], cur[0]);
            addRoute(tank);
        }
        
        // now loading screen
        three = canvasbg.Sprite("/sprites/one.png");
        two = canvasbg.Sprite("/sprites/two.png");
        one = canvasbg.Sprite("/sprites/three.png");

        // load pause
        pauseSprite = canvasbg.Sprite("/sprites/pause_blank.png");
        pauseSprite.move(375, 275);
        pauseSprite.update();

        window.requestAnimationFrame(oneM);

    });

}


function createStationaryTank(row, col) {
    //let space = canvasbg.Sprite("/sprites/tank_space.png");
    let tank = canvasbg.Sprite("/sprites/imm_tank.png");

    //space.move(col*TILE_SIZE, row*TILE_SIZE);
    tank.move(col*TILE_SIZE, row*TILE_SIZE);

    //space.update();
    tank.update();
    tank.lastFire = Date.now();
    tank.tankType = "s";
    console.log(tank);
    collideable.push(tank);
    nonTrav.push(tank);
    statEnemies.push(tank);
    allEnemies.push(tank);
}


function createDumbTank(row, col) {
    //let space = canvasbg.Sprite("/sprites/tank_space.png");
    let tank = canvasbg.Sprite("/sprites/dumbTank.png");
    let can = canvasbg.Sprite("/sprites/dumbTank_Can.png");
    //space.move(col*TILE_SIZE, row*TILE_SIZE);
    tank.move(col*TILE_SIZE + 11, row*TILE_SIZE + 11);
    can.move(col*TILE_SIZE + 11, row*TILE_SIZE + 11);
    //space.update();
    tank.update();
    can.update();
    console.log(tank);
    tank.startX = tank.x;
    tank.startY = tank.y;
    tank.lastFire = Date.now();
    tank.cannon = can;
    collideable.push(tank);
    nonTrav.push(tank);
    dumbEnemies.push(tank);
    tank.tankType = "d";
    allEnemies.push(tank);
    return tank;
}

function createHomingTank(row, col) {
    //let space = canvasbg.Sprite("/sprites/tank_space.png");
    let tank = canvasbg.Sprite("/sprites/homingTank.png");
    let can = canvasbg.Sprite("/sprites/homingTank_Can.png");
    //space.move(col*TILE_SIZE, row*TILE_SIZE);
    tank.move(col*TILE_SIZE + 11, row*TILE_SIZE + 11);
    can.move(col*TILE_SIZE + 11, row*TILE_SIZE + 11);
    //space.update();
    tank.update();
    can.update();
    console.log(tank);
    tank.startX = tank.x;
    tank.startY = tank.y;
    tank.lastFire = Date.now();
    tank.cannon = can;
    collideable.push(tank);
    nonTrav.push(tank);
    homingEnemies.push(tank);
    tank.tankType = "h";
    allEnemies.push(tank);
    return tank;
}

function createSamePathTank(pair){

	let row = pair[0][1];
	let col = pair[0][0];
	let goalRow = pair[1][1];
	let goalCol = pair[1][0];
    let tank = canvasbg.Sprite("/sprites/pathTank.png");
    let can = canvasbg.Sprite("/sprites/pathTank_Can.png");

    tank.move(col*TILE_SIZE + 11, row*TILE_SIZE + 11);
    can.move(col*TILE_SIZE + 11, row*TILE_SIZE + 11);
    //space.update();
    tank.update();
    can.update();
    tank.startX = tank.x;
    tank.startY = tank.y;
    tank.lastFire = Date.now();
    tank.cannon = can;
    // set these to move to path
    tank.goalRow = goalRow;
    tank.goalCol = goalCol;

    tank.prevRow = row;
    tank.prevCol = col;

    collideable.push(tank);
    nonTrav.push(tank);
    pathEnemies.push(tank);
    tank.tankType = "p";
	allEnemies.push(tank);
}


function oneM() {
    one.move(500,250);
    one.update();
    window.requestAnimationFrame(twoM);
}

function twoM() {
    let now = Date.now();
    while (Date.now() - now < 1000) {
    }
    one.remove();
    two.move(500,250);
    two.update();
    window.requestAnimationFrame(threeM);
}

function threeM() {
    let now = Date.now();
    while (Date.now() - now < 1000) {
    }
    two.remove();
    three.move(500,250);
    three.update();
    window.requestAnimationFrame(main);
}

// retrieve the map then load it.
getMap();


// game loop
let count = 0;
let lastTime;

function forwardByAngle(angRads, speed) {
    let x = speed * Math.cos(angRads);
    let y = speed * Math.sin(angRads);
    return [x,y];
}

function backwardByAngle(angRads, speed) {
    let x = -(speed * Math.cos(angRads));
    let y = -(speed * Math.sin(angRads));
    return [x,y];
}

class Bullet {
    constructor(sprite) {
        this.sprite = sprite;
        this.bounces = 0;
        this.type = 0;
    }
}

function fire(sprite) {
    if (ready && (Date.now() - sprite.lastFire) > 400) {
        let b = canvasbg.Sprite("/sprites/bullet.png");

        // make sure that it is to size
        // put in location
        let direction;
        if (sprite === user) {
            direction = forwardByAngle(uCannon.angle, 25);
            b.move(sprite.x + direction[0], sprite.y + direction[1]);
        } else if (sprite.cannon !== undefined) {

            direction = forwardByAngle(sprite.cannon.angle, 25);
            b.move(sprite.x + (direction[0] * 1.1), sprite.y + (direction[1] * 1.1));
        } else {
            direction = forwardByAngle(sprite.angle, 25);
            b.move((sprite.x + 22) + (direction[0] * 1.1), (sprite.y + 22) + (direction[1] * 1.1));
        }


        if (user === sprite) {
            b.rotate(uCannon.angle);
        } else if (sprite.cannon !== undefined) {
            b.rotate(sprite.cannon.angle);
        } else {
            b.rotate(sprite.angle);
        }
        b.scale(1.7);
        // update it
        b.update();
        // create an object for storage with bullet trajectory
        let bullet = new Bullet(b);
        if (user === sprite ) {
            bullet.movDir = forwardByAngle(uCannon.angle, BULLET_SPEED);
            bullet.type = 1;
        } else if (sprite.tankType === "p") {
            bullet.movDir = forwardByAngle(sprite.cannon.angle, BULLET_SPEED);
            bullet.type = 1;
        } else if (sprite.cannon !== undefined) {
            bullet.movDir = forwardByAngle(sprite.cannon.angle, BULLET_SPEED);
        } else {
            bullet.movDir = forwardByAngle(sprite.angle, BULLET_SPEED);
        }
        bullets.push(bullet);
        sprite.lastFire = Date.now();
    }
}

function findCollisionDirection(x1, y1, x2, y2){
    let left = x2;
    let bottom = y2;
    let right = x2 + TILE_SIZE;
    let top = y2 + TILE_SIZE;
    console.log("coord " + x1 + ", " + y1);
    console.log("X from: " + left + " to " + right + "and Y from: " + bottom + " to " + top);
    
    /*left = Math.abs(left - x1);
    bottom = Math.abs(bottom - y1);
    right = Math.abs(right - x1);
    top = Math.abs(top - y1);*/
    
    /*if(x1 >= left && x1 <= right){
        console.log("vert");
        return 0;
    }else{
        console.log("hori");

        return 1;
    }*/
    left = x1 - left;
    bottom = y1 - bottom;
    right = right - x1;
    top = top - y1;


    let min = Math.min(left, bottom, right, top);

    if(min == bottom || min == top){
         // console.log("vert");

        return 0;

    }else{
        // console.log("hori");

        return 1;
    }
}



function updateBullet() {
    // if game map is loaded
    if (ready) {
        // go through all bullets and check for collisions
        for(let b in bullets) {
            // retrieve bullet from array
            let bullet = bullets[b];

            // get previous (non collided cords)
            let prevX = bullet.sprite.x;
            let prevY = bullet.sprite.y;

            // direction the bullet is moving
            let cord = bullet.movDir;
            bullet.sprite.move(cord[0],cord[1]);
            // if the bullet collides with a wall, remove it
            if (bullet.sprite.collidesWithArray(walls)) {

                let wall = bullet.sprite.collidesWithArray(walls);

                if(bullet.type == 1 && bullet.bounces < 3){
                    let bulletAng = angleBetweenVectors(bullet.movDir, [1,0]);
                    if(bulletAng < 0){
                        bulletAng += 2*Math.PI;
                    }

                    const diff = forwardByAngle(bulletAng, 2);
                    // console.log("diff is " + diff);
                    const newVector = shortenVector(bullet.movDir, 4);
                    let direction = findCollisionDirection(bullet.sprite.x - diff[0], bullet.sprite.y + diff[1], wall.x, wall.y);
                    //let direction = findCollisionDirection(newVector[0], newVector[1], wall.x, wall.y);
                    bullet.bounces++;

                    
                   // console.log("Prev: " + bullet.movDir);
                    let old = [];
                    old[0] =  bullet.movDir[0];
                    old[1] =  bullet.movDir[1];

                    if(direction == 0){
                        bullet.movDir[1] = -bullet.movDir[1];
                    } else {
                        bullet.movDir[0] = -bullet.movDir[0];
                    }
                    bullet.sprite.rotate(angleBetweenVectors(old,bullet.movDir));
                    
                } else {

                    bullet.sprite.remove();
                    bullets.splice(b, 1);
                }
            }
            // otherwise check for collision with other entities (tanks, breakable walls)
            else {
                // may not collide with anything
                let collided = false;
                for (let i in collideable) {
                    // for everything on map that needs handling if bullet hits it
                    if (bullet.sprite.collidesWith(collideable[i])) {
                        // if collides with enemy
                        if (allEnemies.includes(collideable[i])) {
                            console.log(homingEnemies);
                            switch ((collideable[i]).tankType) {
                                case "s":
                                    statEnemies.splice(statEnemies.indexOf(collideable[i]), 1);
                                case "d":
                                    dumbEnemies.splice(dumbEnemies.indexOf(collideable[i]), 1);
                                case "h":
                                    homingEnemies.splice(homingEnemies.indexOf(collideable[i]), 1);
                                case "p":
                                    pathEnemies.splice(pathEnemies.indexOf(collideable[i]), 1);
                            }
                            console.log(homingEnemies);
                            allEnemies.splice(allEnemies.indexOf(collideable[i]), 1);
                            kills++;
                            let ind = nonTrav.indexOf(collideable[i]);
                            if (ind >= 0) {
                                nonTrav.splice(ind, 1);
                            }
                            let explosion = new Explosion(collideable[i]);
                            explosion.sprite.loadImg("/sprites/explo1.png");
                            explosion.sprite.update();
                            explosions.push(explosion);
                            if ((collideable[i]).tankType !== "s") {
                                collideable[i].cannon.remove();

                            }
                            collideable.splice(i, 1);


                            bullet.sprite.remove();
                            bullets.splice(b,1);
                            collided = true;
                            break;
                        }
                        else {
                            let ind = nonTrav.indexOf(collideable[i]);
                            if (ind >= 0) {
                                nonTrav.splice(ind, 1);
                            }
                            collideable[i].loadImg("/sprites/freeSpace.png");
                            collideable[i].update();

                            collideable.splice(i, 1);

                            bullet.sprite.remove();
                            bullets.splice(b,1);
                            collided = true;
                            break;
                        }

                    }
                }
                if (bullet.sprite.collidesWith(user)) {
                    // isGameOver = true;
                }
                if (!collided) {
                    bullet.sprite.update();
                }
            }

        }
    }

}

function shortenVector(v1, shortenValue){
    const x1 = v1[0];
    const y1 = v1[1];
    
    const length = Math.sqrt(Math.pow(x1, 2) + Math.pow(y1, 2));
    let output = [];
    output[0] = x1 - ((x1/length)*shortenValue);
    output[1] = y1 - ((y1/length)*shortenValue);
    return output;

    
}

function angleBetweenVectors(v1, v2){
    const x1 = v1[0];
    const x2 = v2[0];
    const y1 = v1[1];
    const y2 = v2[1];
    return Math.atan2(x1*y2-y1*x2,x1*x2+y1*y2);

}


function checkForWalls(x,y) {
    let row = Math.floor(y/45);
    let col = Math.floor(x/45);
    let uRow = Math.floor(user.y/45);
    let uCol = Math.floor(user.x/45);
    // above the enemy
    if (uRow < row) {
        if (map[row-1][col] !== "w") {
            return true;
        }
    }
    if (uCol < col) {
        if (map[row][col-1] !== "w") {
            return true;
        }
    }
    if (uRow > row) {
        if (map[row+1][col] !== "w") {
            return true;
        }
    }
    if (uCol > col) {
        if (map[row][col+1] !== "w") {
            return true;
        }
    }
}

function enemyLogic(enemy) {
    if (ready) {
        if (user !== undefined && withinSight(enemy.x, enemy.y)) {
            let dx = enemy.x - user.x;
            let dy = enemy.y - user.y;
            rot = Math.atan2(-dy, -dx);
            enemy.setAngle(0);
            enemy.rotate(rot);
            enemy.update();
            fire(enemy);
        } else {
            enemy.rotate(0.02);
            enemy.update();
        }
    }
}

function getBorderingLandTiles(xCoord, yCoord){

    const row = Math.floor(yCoord / 45);
    const col = Math.floor(xCoord / 45);
    let landSpots = [];

    if (map[row - 1][col] === "l"){
        landSpots.push([row - 1, col])
    }
    if (map[row + 1][col] === "l"){
        landSpots.push([row + 1, col])
    }
    if (map[row][col - 1] === "l"){
        landSpots.push([row, col - 1])
    }
    if (map[row][col + 1] === "l"){
        landSpots.push([row, col + 1])
    }
    return landSpots;
}

function checkEndGame() {
    return (statEnemies.length === 0 && dumbEnemies.length === 0 &&
        pathEnemies.length === 0 && homingEnemies.length === 0 && allEnemies.length === 0);
}

function homingHelper(movingEnemy) {
    let userRow = Math.floor(user.y/45);
    let userCol = Math.floor(user.x/45);
    let enemyCol = Math.floor(movingEnemy.x/45);
    let enemyRow = Math.floor(movingEnemy.y/45);

    $.post('/homing', {"userRow": userRow, "representation": represent,
        "userCol": userCol, "enemyRow": enemyRow, "enemyCol": enemyCol}, responseJSON => {
        const respObject = JSON.parse(responseJSON);
        //return [respObject.nextMove.first, respObject.nextMove.second];
        

        console.log((respObject.nextMove.first).toString() + ", " +  (respObject.nextMove.second).toString());

        movingEnemy.nextRow = respObject.nextMove.first;
        movingEnemy.nextCol = respObject.nextMove.second;
        console.log(movingEnemy.nextRow);
        console.log(movingEnemy.nextCol);
        let curRow = Math.floor(movingEnemy.y / 45);
        let curCol = Math.floor(movingEnemy.x / 45);

        if (movingEnemy.nextRow - curRow === 0){
            if (movingEnemy.nextCol - curCol === 1){
                movingEnemy.nextAngle = 0;
            }
            else{
                movingEnemy.nextAngle = 3.1415;
            }
        }
        else if(movingEnemy.nextRow - curRow === 1){
            movingEnemy.nextAngle = 1.5707;
        }
        else{
            movingEnemy.nextAngle = 4.712;
        }

        movingEnemy.startX = movingEnemy.x;
        movingEnemy.startY = movingEnemy.y;
        moveBetweenHoming(movingEnemy);
    });
}

function sameRowCol(pixel_x1, pixel_y1, pixel_x2, pixel_y2){

    return (pixel_x1 == pixel_x2 && pixel_y1 == pixel_y2);
}


function getShortestPathFromTo(fromRow, fromCol, toRow, toCol){
    let route;
    $.post('/homing', {"userRow": toRow, "representation": represent,
            "userCol": toCol, "enemyRow": fromRow, "enemyCol": fromCol}, responseJSON => {
            const respObject = JSON.parse(responseJSON);
            route = respObject.route;


            });

    return route;

}

function getCenter(spriteTank) {
    const width = 15.5;
    const height = 16;
    const angle_rad = (spriteTank.angle) % (2*Math.PI);
    const x = spriteTank.x;
    const y = spriteTank.y;
    var cosa = Math.cos(angle_rad);
    var sina = Math.sin(angle_rad);
    var wp = width/2;
    var hp = height/2;
    return { px: ( x + wp * cosa - hp * sina ),
             py: ( y + wp * sina + hp * cosa ) };
}

function addRoute(movingEnemy){
    let toCol;
    let toRow;
    switch(movingEnemy.tankType){
        case "d":
            toCol = -1;
            toRow = -1;
        break;
        case "h":
            toCol = Math.floor(user.x/45);
            toRow = Math.floor(user.y/45);
        break;
    }
   movingEnemy.loading = true;

 $.post('/homing', {"userRow": toRow, "representation": represent,"userCol": toCol,
  "enemyRow": Math.floor(movingEnemy.y / 45), "enemyCol": Math.floor(movingEnemy.x / 45)}, responseJSON => {
     const respObject = JSON.parse(responseJSON);

     const route =  respObject.route;

     movingEnemy.route = route;
     for(let i = 0; i < route.length; i++){
        if(route[i].first == Math.floor(movingEnemy.y/45) && route[i].second == Math.floor(movingEnemy.x/45)){
            movingEnemy.routeIndex = i;
            console.log("chose " + i);
            break;
        }
     }
            movingEnemy.collided = false;

      movingEnemy.loading = false;

});
}



function movingEnemyLogic(movingEnemy) {
    if (ready) {
        if (user !== undefined && withinSight(movingEnemy.x, movingEnemy.y)) {
            let dx = movingEnemy.cannon.x - user.x;
            let dy = movingEnemy.cannon.y - user.y;
            rot = Math.atan2(-dy, -dx);
            movingEnemy.cannon.setAngle(0);
            movingEnemy.cannon.rotate(rot);
            movingEnemy.cannon.correctAngle = movingEnemy.cannon.angle + rot;
            fire(movingEnemy);
        }

       if(reachedBlock(movingEnemy)){
                movingEnemy.routeIndex += 1;

            if(movingEnemy.collided || (!movingEnemy.loading && movingEnemy.route.length < (movingEnemy.routeIndex + 4))){

                addRoute(movingEnemy);

                 }
                //console.log("iter " + movingEnemy.routeIndex);

            }
        }
        if(movingEnemy.routeIndex != undefined && !movingEnemy.loading){
           moveBetween(movingEnemy);
        }

    }




function reachedBlock(movingEnemy){
    //const center = getCenter(movingEnemy);

    const pix_x_diff = (movingEnemy.x + 8) - ((movingEnemy.route[movingEnemy.routeIndex].second *45)+22.5); //7.5
    const pix_y_diff = (movingEnemy.y + 7.5) - ((movingEnemy.route[movingEnemy.routeIndex].first *45)+22.5); //8
    //console.log("x diff " + pix_x_diff)
     //   console.log("y diff " + pix_y_diff)

   if(Math.abs(pix_x_diff) <= 15 && Math.abs(pix_y_diff) <= 7){
    return true;
    }

    return false;

}

function placeTread(x , y, ang) {
    // first create tread and place it
    let tread = canvasbg.Sprite("/sprites/tTreads.png");
    // make sure that it is to size
    // put in location
    tread.move(x, y);
    tread.rotate(ang);
    // update it
    tread.update();
    //console.log(tread);
    //console.log(user);
    treads.push(tread);
    // remove treads if too many

    if (treads.length > 8) {
        let temp = treads.slice(Math.max(treads.length - 8 , 0));
        for (let i in treads) {
            if (i < treads.length - 8) {
                let tred = treads[i];
                tred.remove();
            }
        }
        for (let i in temp) {
            let tred = temp[i];
            tred.setOpacity(0.20 * i);
            tred.update();
        }
        treads = temp;
    }
}

function userMove() {
    if (wKey) {
        let mov = forwardByAngle(user.angle, USER_SPEED);
        user.move(mov[0], mov[1]);
        uCannon.move(mov[0], mov[1]);
        if (user.collidesWithArray(nonTrav)) {
            // if there is a collision revert back to old location
            user.move(-mov[0], -mov[1]);
            uCannon.move(-mov[0], -mov[1]);
        } else {
            uCannon.update();
            user.update();
            //placeTread(user.x-mov[0], user.y-mov[1], user.angle);
        }
    }
    if (sKey) {
        let mov = backwardByAngle(user.angle, USER_SPEED);
        user.move(mov[0], mov[1]);
        uCannon.move(mov[0], mov[1]);
        if (user.collidesWithArray(nonTrav)) {
            user.move(-mov[0], -mov[1]);
            uCannon.move(-mov[0], -mov[1]);
        } else {
            uCannon.update();
            user.update();
            //placeTread(user.x-mov[0], user.y-mov[1], user.angle);
        }
    }
    if (aKey) {
        user.rotate(-USER_ROT);
        if (user.collidesWithArray(nonTrav)) {
            user.rotate(USER_ROT);
        }
        user.update();
    }
    if (dKey) {
        user.rotate(USER_ROT);
        if (user.collidesWithArray(nonTrav)) {
            user.rotate(-USER_ROT);
        }
        user.update();
    }
    if (ready) {
        let dx = mousX - user.x;
        let dy = mousY - user.y;
        rot = Math.atan2(dy, dx);
        uCannon.setAngle(0);
        uCannon.rotate(rot);
        uCannon.update();
    }
}

function updateExplosions() {
    for(let i in explosions) {
        let explo = explosions[i];
        explo.count += 1;
        if (explo.count > 5 && explo.count <= 10) {
            explo.stage = 2;
            explo.sprite.loadImg("/sprites/explo2.png");
            explo.sprite.update();
        } else if (explo.count > 15 && explo.count <= 20) {
            explo.stage = 3;
            explo.sprite.loadImg("/sprites/explo3.png");
            explo.sprite.update();
        } else if (explo.count > 30) {
            explo.sprite.remove();
            explosions.splice(i, 1);
        }
    }
}


let firstIteration = true;

function displayEndGame() {
    won = "false";
    $('#next').toggle();
    document.getElementById("result").innerHTML = "GAME OVER!";
    $('#endGame').toggle();
    if (playerTwo !== 0) {
        $('#retry').toggle();
    }
    let urlArr = document.URL.split("/");
    let level = parseInt(urlArr[urlArr.length -1]);
    $.post('/endGame', {"kills": kills, "currentTime":globalTime,
        "gameId": level, "survival": survival, "result": won, "userTwo": playerTwo}, responseJSON => {
    });


}

function displayWinGame() {
    won = "true";
    document.getElementById("result").innerHTML = "GAME WON!";
    $('#endGame').toggle();
    let urlArr = document.URL.split("/");
    let level = parseInt(urlArr[urlArr.length -1]);
    console.log(playerTwo);

    if (playerTwo === 0) {
        if (level >= 0 && level <= 19) {

        } else {
            $('#next').toggle();
        }
    } else {
        console.log("hello");
        $('#next').toggle();
        $('#retry').toggle();
    }
    $.post('/endGame', {"kills": kills, "currentTime":globalTime,
        "gameId": level, "survival":survival, "result": won, "userTwo": playerTwo}, responseJSON => {
    });
}

function main() {
    if (isGameOver) {
        displayEndGame();
    }
    else if (winner) {
        displayWinGame();
    } else {
        if (firstIteration) {
            let now1 = Date.now();
            while (Date.now() - now1 < 1000) {
            }
            three.remove();
            startTime = Date.now();
            firstIteration = false;
        }
        let now = Date.now();
        let timeChange = (now - lastTime) / 1000.0;

        // // update all the entities on the screen
        // update(timeChange);
        // // redraw all the objects
        // render();
        //console.log(pause);
        if (!pause) {
            userMove();
            // (Date.now() - lastFire) > 800
            if (space) {
                fire(user);
            }
            updateBullet();
            // check to see if the enemy is alive
            for (let i in statEnemies) {
                enemyLogic(statEnemies[i]);
            }

            for (let i in dumbEnemies) {
                movingEnemyLogic(dumbEnemies[i]);
            }
            for (let i in homingEnemies) {
                movingEnemyLogic(homingEnemies[i]);
            }
            
            for (let i in pathEnemies) {
                movePath(pathEnemies[i]);
            }

            updateExplosions();

            lastTime = now;

            currentTime = updateTime((Date.now() - startTime) - pauseTime);
            count++;
        }
        if(checkEndGame()) {
            winner = true;
        }
        window.requestAnimationFrame(main);



    }
}

$(document).ready(() => {

    // add event listeners for movement of the user tank

    document.addEventListener('keydown', function (e) {
        switch (e.key) {
            case "a":
                aKey = true;
                break;
            case "s":
                sKey = true;
                break;
            case "w":
                wKey = true;
                break;
            case "d":
                dKey = true;
                break;
            case " ":
                space = true;
                break;
            case "p":
                if (pause) {
                    pause = false;
                    let timePaused = (Date.now() - pauseStart);
                    console.log(timePaused);
					pauseTime += timePaused;
                     
                     pauseSprite.loadImg("/sprites/pause_blank.png");
                     pauseSprite.update();
                    
                } else {
                    pause = true;
                    pauseStart = Date.now();
                    pauseSprite.loadImg("/sprites/pause.png");
                    pauseSprite.update();
                }
                break;
        }
    });

    document.addEventListener('keyup', function (e) {
        switch (e.key) {
            case "a":
                aKey = false;
                break;
            case "s":
                sKey = false;
                break;
            case "w":
                wKey = false;
                break;
            case " ":
                space = false;
                break;
            case "d":
                dKey = false;
                break;
        }
    });

    document.addEventListener("mousemove", function(e) {
        mousX = e.clientX;
        mousY = e.clientY;
    });

    let adWidth = (screen.width - 1080).toString();
    console.log(screen.width);
    document.getElementById('sideMenu').setAttribute("style","width:" + adWidth + "px");
});

function movePath(tank) {
	
	//console.log("tank is going from " + tank.prevRow + " , " + tank.prevCol + " to " + tank.goalRow + " , " + tank.goalCol);
	let rot;

    let dx = (tank.goalCol * 45) - tank.x;
    let dy = (tank.goalRow * 45) - tank.y;
    rot = Math.atan2(dy, dx);

    rot = (rot % 6.28);

    tank.angle = rot;


    if (user !== undefined && withinSight(tank.x, tank.y)) {
        let dx = tank.cannon.x - user.x;
        let dy = tank.cannon.y - user.y;
        let canrot = Math.atan2(-dy, -dx);
        tank.cannon.setAngle(0);
        tank.cannon.rotate(canrot);
        tank.cannon.correctAngle = tank.cannon.angle + canrot;
        fire(tank);
    }
    else {

        let mov = forwardByAngle(tank.angle, 1.5);
        tank.move(mov[0], mov[1]);
        tank.cannon.move(mov[0],mov[1]);
        if (tank.collidesWithArray(nonTrav)) {

            tank.move(-mov[0], -mov[1]);
            tank.cannon.move(-mov[0], -mov[1]);
            let tempCol = tank.goalCol;
            let tempRow = tank.goalRow;
            tank.goalCol = tank.prevCol;
            tank.goalRow = tank.prevRow;
            tank.prevCol = tempCol;
            tank.prevRow = tempRow;
        }
        tank.cannon.update();

        if (tank.goalCol === Math.floor((tank.x+8) / 45) && tank.goalRow === Math.floor((tank.y+8) / 45)) {

            let tempCol = tank.goalCol;
            let tempRow = tank.goalRow;
            tank.goalCol = tank.prevCol;
            tank.goalRow = tank.prevRow;
            tank.prevCol = tempCol;
            tank.prevRow = tempRow;
        }
    }
    tank.update();
}


function updateTime(time){
    globalTime = time;
    const totalSeconds = parseInt(time / 1000);
    const seconds = totalSeconds % 60;
    const minutes = parseInt(totalSeconds / 60);

    let timeString = "";
    if (minutes < 10){
        timeString += "0";
    }
    timeString += minutes.toString();
    timeString += ":";
    if (seconds < 10){
        timeString += "0";
    }
    timeString += seconds.toString();
    timeString = "Time : " + timeString;
    // console.log(timeString);
    if (timeString !== document.getElementById("timer").innerHTML) {
        document.getElementById("timer").innerHTML = timeString;
        document.getElementById("time").innerHTML = timeString;

    }

    let killString = "Kills : " + kills.toString();
    if (killString != document.getElementById("kills").innerHTML) {
        document.getElementById("kills").innerHTML = killString;
        document.getElementById("enemyKill").innerHTML = killString;
    }


    //gets time just need to display to user
    return timeString;
}

function enemyDetector(x, y) {
    // get row and col
    let dist = Math.sqrt((user.x - x)*(user.x - x) + (user.y - y)*(user.y - y));
    return dist;
}

function euclidDist(x1, y1, x2, y2) {
    //console.log(x1 + ' ' + y1 + ' ' + x2 + ' ' + y2);
    let dist = Math.sqrt((x1 - x2)*(x1 - x2) + (y1 - y2)*(y1 - y2));
    //console.log(dist);
    return dist;
}

function withinSight(cpuX, cpuY){
    const deltaY = user.y - cpuY;
    const deltaX = user.x - cpuX;
    const distance = enemyDetector(cpuX, cpuY);
    const epsilon = 5;

    const userXTile = Math.floor(parseInt(user.x) / TILE_SIZE);
    const userYTile = Math.floor(parseInt(user.y) / TILE_SIZE);

    let currX = cpuX;
    let currY = cpuY;

    for (let i = 0; i < distance; i = i + epsilon){
        currX += deltaX / (distance / epsilon);
        currY += deltaY / (distance / epsilon);
        const currXTile = Math.floor(currX / TILE_SIZE);
        const currYTile = Math.floor(currY / TILE_SIZE);
        const currTile = map[currYTile][currXTile];

        if (userXTile === currXTile && userYTile === currYTile){
            return true;
        }
        else if(currTile === "u"){
            return false;
        }
    }

    return false;
}

