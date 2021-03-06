// let nextAngle = -1;
// let nextRow = 0;
// let nextCol = 0;



function getFixedAngle(angle){

    return (angle + Math.PI) % (Math.PI*2) - (Math.PI)

}

function getRandomTile(sprite){
    const row = Math.floor(sprite.y/45);
    const col = Math.floor(sprite.x/45);


}


function getSpeed(angle){
    return (2.00679* Math.pow(0.104099, Math.abs(angle)));
}



/**
 * A function that moves an enemy tank to a predetermined position
 * @param enemyObj The object of the enemy tank which contains the sprite, along with
 * 			information that explains that destination of the tank.
 */


function moveBetween(enemyObj){
    let route;
    let index;
    if(enemyObj.route[enemyObj.routeIndex] == undefined){
        route = getBorderingLandTiles(enemyObj.x, enemyObj.y);
         index = Math.floor(Math.random() * route.length);
        console.log("error");
    }else{
        route = enemyObj.route;
        index = enemyObj.routeIndex;
    }

    //console.log("index " + index);
    //    console.log("size " + route.length);


    const curRow = Math.floor(enemyObj.y / TILE_SIZE);
    const curCol = Math.floor(enemyObj.x / TILE_SIZE);
      const center = [];
        center[0] =  enemyObj.x + 7.5;
        center[1] = enemyObj.y + 8;
    let xFixer = 0;
    let yFixer = 0;

    if (route[index].first - curRow === 0){
                         if (route[index].second - curCol === 1){
                             enemyObj.nextAngle = 0;
                              const upDiff = center[1] - (route[index].first *TILE_SIZE);
                              yFixer = (22.5 - upDiff);
                                                       }
                          else if (route[index].second - curCol === -1){
                                  enemyObj.nextAngle = 3.1415;

                                const upDiff = center[1] - (route[index].first *TILE_SIZE);
                              yFixer = (22.5 - upDiff);

                                              }
                          }
                                  else if(route[index].first - curRow === -1){
                                enemyObj.nextAngle = 1.5707;
                                const leftDiff = center[0] - (route[index].second *TILE_SIZE);
                                xFixer = (22.5 - leftDiff);



                             }
                       else{
                              enemyObj.nextAngle = 4.712;
                               const leftDiff = center[0] - (route[index].second *TILE_SIZE);
                              xFixer = (22.5 - leftDiff);

                                 }

       //console.log("from " + curRow + ", " + curCol + " to " + route[index].first + ", " +  route[index].second + ", " + enemyObj.nextAngle);


    //console.log("next " + enemyObj.nextAngle);
    //console.log("next tile  is " + index);
    const currAngle =  -1* (enemyObj.angle % 6.28);
    let angleDiff;
      if(getFixedAngle(currAngle) < Math.PI*-1){
            const mycurr = (2*Math.PI + getFixedAngle(currAngle));
            angleDiff = mycurr - enemyObj.nextAngle;
      }else{
            const mycurr = getFixedAngle(currAngle);
            angleDiff = mycurr - enemyObj.nextAngle;
            if(angleDiff < -1*Math.PI){
               angleDiff = 2*Math.PI + angleDiff;
            }
      }

    let mov;
        if (angleDiff < 0){
            enemyObj.rotate(-0.04);
            enemyObj.cannon.rotate(-0.04);
        }
        else if(angleDiff > 0){
            enemyObj.rotate(0.04);
             enemyObj.cannon.rotate(0.04);
        }
            mov = forwardByAngle(enemyObj.angle, getSpeed(angleDiff));
            enemyObj.move(mov[0] + (xFixer/10), mov[1] + (yFixer/10));
            enemyObj.cannon.move(mov[0] + (xFixer/10), mov[1] + (yFixer/10));


       if (enemyObj.collidesWithArray(nonTrav)) {
            for (let i in collideable) {
                        if (enemyObj.collidesWith(collideable[i])) {

                            if (collideable[i].isBreakable) {
                               enemyObj.cannon.setAngle(0);
                               enemyObj.cannon.rotate(enemyObj.angle);
                               fire(enemyObj);
                               enemyObj.move(-1*(mov[0] + (xFixer/10)), -1 *(mov[1] + (yFixer/10)));
                               enemyObj.cannon.move(-1*(mov[0] + (xFixer/10)), -1*(mov[1] + (yFixer/10)));
                               break;
                            }
                        }
                    }
            }
    enemyObj.update();
    enemyObj.cannon.update();

}

function dijkstraPost(){

}


function compareEuclid(potMov, enemy) {
    let curX = enemy.x;
    let curY = enemy.y;
    let potX = enemy.x + potMov[0];
    let potY = enemy.y + potMov[1];
    let goalX = (enemy.nextCol * TILE_SIZE) + (TILE_SIZE/2);
    let goalY = (enemy.nextRow * TILE_SIZE) + (TILE_SIZE/2);

    let curDist = euclidDist(curX, curY, goalX, goalY);
    let potDist = euclidDist(potX, potY, goalX, goalY);

    return (potDist < curDist);
}



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