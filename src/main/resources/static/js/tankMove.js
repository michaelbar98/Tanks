// let nextAngle = -1;
// let nextRow = 0;
// let nextCol = 0;

/**
 * A function that moves an enemy tank to a predetermined position
 * @param enemyObj The object of the enemy tank which contains the sprite, along with
 * 			information that explains that destination of the tank.
 */
function moveBetween(enemyObj){
    console.log(enemyObj.route[enemyObj.routeIndex]);
    const route = enemyObj.route;
    const index = enemyObj.routeIndex;
    const curRow = Math.floor(enemyObj.y / 45);
    const curCol = Math.floor(enemyObj.x / 45);
    //console.log("going to " + route[index].first + ", " +  route[index].second);
    /*if (route[index].first - curRow === 0){
     if (route[index].second - curCol === 1){
         enemyObj.nextAngle = 0;
         console.log("right");
       }
      else{
              enemyObj.nextAngle = 3.1415;
              console.log("left");

                          }
      }
              else if(route[index].first - curRow === -1){
            enemyObj.nextAngle = 1.5707;
                 console.log("up");

         }
   else{
          enemyObj.nextAngle = 4.712;
          console.log("down");

             }*/

    const currAngle =  -1* (enemyObj.angle % 6.28);
    const angleDiff = enemyObj.nextAngle - currAngle ;
        console.log("next " + enemyObj.nextAngle);
        console.log("curr " + currAngle)
        console.log("diff " + angleDiff);

    //console.log("start " + currAngle*180/Math.PI)
    //console.log("diff " + angleDiff)

    //console.log("diff " + angleDiff*180/Math.PI)
    //console.log("end " + enemyObj.nextAngle*180/Math.PI)

    let mov;
	//if (Math.abs(currAngle - enemyObj.nextAngle) <= .2) {
        if (angleDiff > 0){
            enemyObj.rotate(-0.02);
             enemyObj.cannon.rotate(-0.02);
        }
        else if(angleDiff < 0){

            enemyObj.rotate(0.02);
             enemyObj.cannon.rotate(0.02);

        }else{

        }

        if(Math.abs(angleDiff) <= .2){
                        mov = forwardByAngle(enemyObj.angle, 2);
                        enemyObj.move(mov[0], mov[1]);
                        enemyObj.cannon.move(mov[0], mov[1]);

                }
    //}


    //mov = forwardByAngle(enemyObj.angle, 2);
    //if (compareEuclid(mov, enemyObj)) {

       // enemyObj.move(mov[0], mov[1]);
       // enemyObj.cannon.move(mov[0], mov[1]);

       //if (enemyObj.collidesWithArray(nonTrav)) {
            //console.log("collided");
            // if there is a collision revert back to old location
            //enemyObj.move(-mov[0], -mov[1]);
            //enemyObj.cannon.move(-mov[0], -mov[1]);
//}
            /*let landSpots = getBorderingLandTiles(enemyObj.x, enemyObj.y);
            const rand = Math.floor(Math.random() * landSpots.length);
            const nextMove = landSpots[rand];
            enemyObj.nextRow = nextMove.y;
            enemyObj.nextCol = nextMove.x;
            let curRow = Math.floor(enemyObj.y / 45);
            let curCol = Math.floor(enemyObj.x / 45);

            if (enemyObj.nextRow - curRow == 0) {
                if (enemyObj.nextCol - curCol == 1) {
                    enemyObj.nextAngle = 0;
                }
                else {
                    enemyObj.nextAngle = 3.1415;
                }
            }
            else if (enemyObj.nextRow - curRow == 1) {
                enemyObj.nextAngle = 1.5707;
            }
            else {
                enemyObj.nextAngle = 4.712;
            }

            enemyObj.startX = enemyObj.x;
            enemyObj.startY = enemyObj.y;

        }*/
    //}
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
    let goalX = (enemy.nextCol * 45) + 22.5;
    let goalY = (enemy.nextRow * 45) + 22.5;

    let curDist = euclidDist(curX, curY, goalX, goalY);
    let potDist = euclidDist(potX, potY, goalX, goalY);

    return (potDist < curDist);
}

function moveBetweenHoming(enemyObj){
    let currAngle = enemyObj.angle % 6.28;
    let angleDiff;
    if (Math.abs(currAngle - enemyObj.nextAngle) < 0.019){
        let mov = forwardByAngle(enemyObj.angle, 2.5);
        enemyObj.move(mov[0], mov[1]);
        if (enemyObj.collidesWithArray(nonTrav)) {
            // if there is a collision revert back to old location
            enemyObj.move(-mov[0], -mov[1]);

            let landSpots = getBorderingLandTiles(enemyObj.x, enemyObj.y);
            const rand = Math.floor(Math.random() * landSpots.length);
            const nextMove = landSpots[rand];
            enemyObj.nextRow = nextMove.y;
            enemyObj.nextCol = nextMove.x;
            let curRow = Math.floor(enemyObj.y / 45);
            let curCol = Math.floor(enemyObj.x / 45);


            enemyObj.startX = enemyObj.x;
            enemyObj.startY = enemyObj.y;

        } else {
            enemyObj.update();
        }
    }
    else {
        //console.log(currAngle, enemyObj.nextAngle);
        if (currAngle > enemyObj.nextAngle){
            enemyObj.rotate(-0.02);
        }
        else{
            enemyObj.rotate(0.02);
        }
    }
    enemyObj.update();
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