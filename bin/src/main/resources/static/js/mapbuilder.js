let TILE_SIZE = 45;
let BOARD_WIDTH = 24;
let BOARD_HEIGHT = 16;
let sel;
let stage = 0;

let userLoc;

let cur;
// wall, user tank
let opt1;
// pot, stationary tank
let opt2;
// breakable, dumb tank
let opt3;
// free, smart tank
let opt4;

// copy of map
let representation;

// set variables for mouse display
let curRow = 0;
let curCol = 0;
let prev;
let offScreen;
const submit = $("#submitLevel");
const finalSubmit = $("#submitLevelFinal");
const idOfMap = $("#idEntry");



// create the Scene object and create the map
let scene = sjs.Scene({w:1305, h:720});
let game = scene.Layer('background', {useCanvas:false, autoClear:true});


// setup the blank map
let map = [];

class Tile {
    constructor(sprite, type) {
        this.sprite = sprite;
        this.type = type;
        this.perWall = false;
    }

}

class Selected {
    constructor(type) {
        this.type = type;
        if(type === "u") {
            this.string = "/sprites/wall.png";
        } else if (type === "p") {
            this.string = "/sprites/pothole.png";
        } else if (type === "b") {
            this.string = "/sprites/breakable.png";
        } else if (type === "l") {
            this.string = "/sprites/freeSpace.png";
        } else if (type === "user") {
            this.string = "/sprites/userTankSelect.png";
        } else if (type === "stat") {
            this.string = "/sprites/statTankSelect.png";
        } else if (type === "dumb") {
            this.string = "/sprites/dumbTankSelect.png";
        }
    }
}


//
for (let row = 0; row < 16; row++) {
    map[row] = [];
    for (let col = 0; col < 24; col++) {
        if (row === 0 || row === 15 || col === 0 || col === 23) {
            map[row][col] = "u";
        } else {
            map[row][col] = "l";
        }
    }
}


let walls = [];


function loadMap() {
    scene.loadImages(["/sprites/userTankSelect.png","/sprites/statTankSelect.png","/sprites/dumbTankSelect.png","/sprites/wall.png",
        "/sprites/freeSpace.png", "/sprites/pothole.png", "/sprites/breakable.png",
        "/sprites/imm_tank.png", "/sprites/tank_space.png", "/sprites/selected.png", "/sprites/menu.png", "/sprites/select.png"], function () {
        // loading map into view
        for (let row = 0; row < 16; row++) {
            for (let col = 0; col < 24; col++) {
                let next;
                if (map[row][col] === "u") {
                    next = game.Sprite("/sprites/wall.png");
                    map[row][col] = new Tile(next, "u");
                    map[row][col].perWall = true;
                } else {
                    next = game.Sprite("/sprites/freeSpace.png");
                    map[row][col] = new Tile(next, "l");
                }
                next.move(col * TILE_SIZE, row * TILE_SIZE);
                next.update();
            }
        }

        // loading menu on the right
        for (let row = 0; row < 16; row++) {
            for (let col = 24; col < 29; col++) {
                let next;
                if (row === 0 || row === 15 || col === 24 || col === 28) {
                    next = game.Sprite("/sprites/wall.png");
                    map[row][col] = new Tile(next, "u");
                } else if (row === 2 && col === 26) {
                    next = game.Sprite("/sprites/wall.png");
                    opt1 = next;
                    cur = opt1;
                    cur.sel = new Selected("u");
                    map[row][col] = new Tile(next, "l");
                    map[row][col - 1 ].sprite.loadImg("/sprites/select.png");
                    map[row][col - 1 ].sprite.update();
                    sel = map[row][col - 1 ].sprite;
                } else if (row === 4 && col === 26) {
                    next = game.Sprite("/sprites/pothole.png");
                    opt2 = next;
                    map[row][col] = new Tile(next, "p");
                } else if (row === 6 && col === 26) {
                    next = game.Sprite("/sprites/breakable.png");
                    opt3 = next;
                    map[row][col] = new Tile(next, "b");
                } else if (row === 8 && col === 26) {
                    next = game.Sprite("/sprites/freeSpace.png");
                    opt4 = next;
                    map[row][col] = new Tile(next, "l");
                }
                else {
                    next = game.Sprite("/sprites/menu.png");
                    map[row][col] = new Tile(next, "l");
                }
                next.move(col * TILE_SIZE, row * TILE_SIZE);
                next.update();
            }
        }
    });

}

    $(document).ready(() => {

		let down = false;


		submit.click(event => {
            representation = "";
            for (let row = 0; row < 16; row++) {
                for (let col = 0; col < 24; col++) {
                    representation += (map[row][col]).type;
                }
            }
            // console.log(idOfMap.val());
            // $.post('/mapBuilderSubmit', {"representation": representation}, responseJSON => {
	        	// 	console.log(responseJSON);
            // });
	        opt1.loadImg("/sprites/userTankSelect.png");
	        opt1.update();
            opt2.loadImg("/sprites/statTankSelect.png");
            opt2.update();
            opt3.loadImg("/sprites/dumbTankSelect.png");
            opt3.update();
            submit.toggle();
            finalSubmit.toggle();
            stage = 1;
            // reset selected block
            sel.loadImg("/sprites/menu.png");
            sel.update();
            map[2][25].sprite.loadImg("/sprites/select.png");
            map[2][25].sprite.update();
            sel = map[2][25].sprite;
            cur = opt1;
            cur.sel = new Selected("user");
		});

		finalSubmit.click(event => {
		    let tanks = getLoTanks();
		    let loc = (userLoc[0]).toString() + "," + (userLoc[1]).toString();
		    console.log(loc);
		    console.log(representation);
            $.post('/mapBuilderSubmit', {"representation": representation,
                "tanks": tanks, "user": loc}, responseJSON => {
                console.log(responseJSON);
            });
        });
		
        document.addEventListener("mousemove", function(e) {
            if (stage === 0) {
                if (down) {
                    if (e.clientY <= 720 && e.clientY >= 0 && e.clientX >= 0 && e.clientX <= 1080){
                        curRow = Math.floor(e.clientY/45);
                        curCol = Math.floor(e.clientX/45);

                        if ((map[curRow][curCol]).perWall === false) {
                            if ((map[curRow][curCol]).type !== cur.sel.type) {
                                map[curRow][curCol].type = cur.sel.type;

                                map[curRow][curCol].sprite.loadImg(cur.sel.string);
                                map[curRow][curCol].sprite.update();
                            }
                        }
                    }
                    offScreen = false;
                }
            }
        });
        
        $(document).mousedown(function() {
		    down = true;
		}).mouseup(function() {
		    down = false;  
		});

        document.addEventListener("click", function(e) {
            //fix this
            if (stage === 1) {
                if (e.clientY <= 720 && e.clientY >= 0 && e.clientX >= 0 && e.clientX <= 1080) {
                    if ((map[curRow][curCol]).perWall === false) {
                        curRow = Math.floor(e.clientY/45);
                        curCol = Math.floor(e.clientX/45);
                        console.log(map[curRow][curCol].type);
                        if (map[curRow][curCol].type !== "p" && map[curRow][curCol].type !== "u"
                            && map[curRow][curCol].type !== "b") {
                            // only allow user to be placed once
                            if (cur.sel.type === "user" && userLoc === undefined) {
                                userLoc = [curRow, curCol];
                            } else if (cur.sel.type === "user") {
                                map[userLoc[0]][userLoc[1]].type = "l";
                                map[userLoc[0]][userLoc[1]].sprite.loadImg("/sprites/freeSpace.png");
                                map[userLoc[0]][userLoc[1]].sprite.update();
                                userLoc = [curRow,curCol];
                            }

                            // if they are replacing the user with land
                            if (map[curRow][curCol].type === "user") {
                                userLoc = undefined;
                            }

                            map[curRow][curCol].type = cur.sel.type;
                            map[curRow][curCol].sprite.loadImg(cur.sel.string);
                            map[curRow][curCol].sprite.update();
                        }
                    }
                }
            }
            if (opt1.isPointIn(e.clientX, e.clientY)) {
                if (cur !== opt1) {
                    sel.loadImg("/sprites/menu.png");
                    sel.update();
                    map[2][25].sprite.loadImg("/sprites/select.png");
                    map[2][25].sprite.update();
                    sel = map[2][25].sprite;
                    cur = opt1;
                    if (stage === 0) {
                        cur.sel = new Selected("u");
                    } else {
                        cur.sel = new Selected("user");
                    }

                }
            }
            if (opt2.isPointIn(e.clientX, e.clientY)) {
                if (opt2 !== opt1) {
                    sel.loadImg("/sprites/menu.png");
                    sel.update();
                    map[4][25].sprite.loadImg("/sprites/select.png");
                    map[4][25].sprite.update();
                    sel = map[4][25].sprite;
                    cur = opt2;
                    if (stage === 0) {
                        cur.sel = new Selected("p");
                    } else {
                        cur.sel = new Selected("stat");
                    }

                }
            }
            if (opt3.isPointIn(e.clientX, e.clientY)) {
                if (opt3 !== opt1) {
                    sel.loadImg("/sprites/menu.png");
                    sel.update();
                    map[6][25].sprite.loadImg("/sprites/select.png");
                    map[6][25].sprite.update();
                    sel = map[6][25].sprite;
                    cur = opt3;
                    if (stage === 0) {
                        cur.sel = new Selected("b");
                    } else {
                        cur.sel = new Selected("dumb");
                    }

                }
            }
            if (opt4.isPointIn(e.clientX, e.clientY)){
            		if (opt4 !== opt1) {
                    sel.loadImg("/sprites/menu.png");
                    sel.update();
                    map[8][25].sprite.loadImg("/sprites/select.png");
                    map[8][25].sprite.update();
                    sel = map[8][25].sprite;
                    cur = opt4;
                    cur.sel = new Selected("l");
                }
            }
            
        });
        loadMap();
        
        main();

    });

function getLoTanks() {
    let loEnemies = "";
    for (let row = 0; row < 16; row++) {
        for (let col = 0; col < 24; col++) {
            if (map[row][col].type === "stat") {
                loEnemies += "s," + row.toString() + "," + col.toString() + "|";
            }
        }
    }
    return loEnemies;
}

function main() {
    

    window.requestAnimationFrame(main);

}
