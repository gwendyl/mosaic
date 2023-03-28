// idea:  implement mirror feature
// need to implement writing of instructions

// show stitch count for each row somehow
// should not be able to drop down into the middle of another drop down

// create a key that explains:
// drop down lines
// x 
//increase stitch formatting
// base color ring

let canvas = document.getElementById('myCanvas');
let baseStitchQty = document.getElementById('baseStitches').value;
let nbrColors =  document.getElementById('nbrColors').value;
let bigR = document.getElementById('stitchSize').value;
let color1 = document.getElementById('color1').value;
let color2 = document.getElementById('color2').value;
let color3 = document.getElementById('color3').value;
let color4 = document.getElementById('color4').value;
// bigR = 10;

let randomize = false;
const randomThreshold = .5;

let geoPattern = false;
const multFactor = 3;

// hard to drop down onto first circle or two
let startRound = 3;  // cant land on rounds 0 or 1

// show numbers on stitches.  Useful for debugging
let showNbrs = false;

let colors = [];
switch(nbrColors) {
  case "2":
    colors = [color2, color1];
    break;
  case "3":
    colors = [color2, color1, color3];
    break;
  case "4":
    colors = [color2, color1, color3, color4];
    break;
  default:
    colors = [color2, color1];
  }

originX = canvas.width / 2;
originY = canvas.height/2;
let radiusX = bigR * .6;
let radiusY = bigR;

// compute maxiumum number of stitches that will fit
let rndCount = Math.min(canvas.width / (4*bigR) - 1, canvas.height / (4*bigR) - 1);
let rounds = [];
let stitches=[];

if(canvas.getContext) 
{
  var ctx = canvas.getContext('2d');
  drawStartingCircle();
  constructStitches();

  if (randomize) {
    createRandomPattern();
  }

  if (geoPattern) {
    createGeoPattern();
  }
  drawAllStitches();
  writeRoundDetails();
}

function createRandomPattern() {
  stitches.forEach(stitch => {
    if (Math.random() < randomThreshold) {
      attemptDropDown(stitch);
    }
  })

}

function createGeoPattern() {
  stitches.forEach(stitch => {
    if(stitch.id % multFactor == 0) {
      attemptDropDown(stitch);
    }
  })
}
function constructStitches() {
  let c = document.getElementById("myCanvas");
  let ctx = c.getContext("2d");

  

  // constant for all stitches
  let startAngle = 0;
  let endAngle = 2*Math.PI;
  let startingX = originX;
  let id = 0;
  let currColor = 0;

  for(let j=0;j<rndCount;j++){
    
    let currentRound = {
      id: j,
      stitchCount: baseStitchQty*(j+1),
      baseColor: colors[currColor],
      firstStitchNbr: id
    }
    rounds.push(currentRound);

    let theta = (2*Math.PI/currentRound.stitchCount);
    let startingY = originY + 2*radiusY*(j+1);
    for(let i=0;i<currentRound.stitchCount; i++){
      // coordinates of the center of the ellipse
      // so rotating around a circle that has a radius of (bigR + radiusY)
      //newXCoord = originX + i*(bigR+radiusY)*Math.(theta);
      //newYCoord = originY + 2*radiusY + i*(bigR+radiusY)*Math.cos(theta);



      let newX = Math.cos(i*theta) * (startingX - originX) - Math.sin(i*theta) * (startingY-originY) + originX;
      let newY = Math.sin(i*theta) * (startingX - originX) + Math.cos(i*theta) * (startingY-originY) + originY;


      // determine the lower stitch that it will build upon
      // increment: account for the extra stitch 
      let nbrOfStitchesFromFirstStitch = id - currentRound.firstStitchNbr + 1;
      let increment = nbrOfStitchesFromFirstStitch * (1/(j+1));
        
      // drop down stitch = current stitch number + the number of stitches around + 
      // the incremental amount to increase the stitch count for the next row
      var parentStitchId;
      let rawStitchNbr = id - j * baseStitchQty - increment;
      if(j>0) parentStitchId = Math.round(rawStitchNbr);


      let isIncrease = false;
      if(Math.floor(rawStitchNbr) == rawStitchNbr) isIncrease = true;

      // find the 'grandmother' of the stitch.  this is the stitch that this stitch would drop down to
      // we just found the parentStitchId, which is this stitch's mother.  So just need to get the parentStitchId of the parentStitchId.
      let grandparentStitchId = getParent(parentStitchId);

      stitches.push({
        x: newX,
        y: newY,
        radiusX: radiusX,
        radiusY: radiusY,
        theta: theta*i,
        startAngle: startAngle,
        endAngle: endAngle,
        id: id,
        currColor: colors[currColor],
        roundId: j,
        parentStitchId: parentStitchId,
        grandparentStitchId: grandparentStitchId,
        isDropDown: false,
        isIncrease: isIncrease,
        writtenInstruction: "blsc"
      });
      // prep for next cycle
      id++;
    }
  
    currColor++;
    if (currColor >= colors.length) currColor = 0;
  }
}

function getParent(childId) {
  let parentStitchId;
  stitches.forEach(stitch => {
    if(stitch.id == childId) {
      parentStitchId = stitch.parentStitchId;
    }
  })
  return parentStitchId;
}

function getBaseColor(roundId) {
  let baseColor;
  rounds.forEach(round => {
    if (round.id == roundId) {
      baseColor = round.baseColor;
    }
  })
  return baseColor;
}

function drawAllStitches() {
   ctx.clearRect(0, 0, canvas.width, canvas.height);

  stitches.forEach(stitch => {
    // draw a little oval behind the stitch to indicate the base color of that round
    ctx.fillStyle = getBaseColor(stitch.roundId);
    ctx.beginPath();
    ctx.ellipse(stitch.x, stitch.y, stitch.radiusY, stitch.radiusX/2, stitch.theta, stitch.startAngle, stitch.endAngle);
    ctx.stroke();
    ctx.fill();
    
    ctx.fillStyle = stitch.currColor;

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.lineWidth = 1;
    if(stitch.isIncrease) ctx.lineWidth = 8;

    // x and y parameters describe the middle of the ellipse
    ctx.beginPath();
    ctx.ellipse(stitch.x, stitch.y, stitch.radiusX, stitch.radiusY, stitch.theta, stitch.startAngle, stitch.endAngle);
    ctx.stroke();
    ctx.fill();
   
    ctx.lineWidth = 1;
    


    // draw the line to its connected stitch
    if (stitch.grandparentStitchId >=0 && stitch.isDropDown) {
      let toPos = getIdCoords(stitch.grandparentStitchId);
      ctx.beginPath();
      ctx.moveTo(stitch.x, stitch.y);
      ctx.lineTo(toPos.x, toPos.y);
      ctx.stroke();  
    }
    
    if (showNbrs) ctx.strokeText(stitch.id, stitch.x, stitch.y);

    if (stitch.isDropDown) {
      ctx.strokeText('X', stitch.x, stitch.y);
    }

   
  })
}

function getIdCoords(id) {
  let pos;

  stitches.forEach(stitch => {
    if(stitch.id == id) {
      pos = {
        x: stitch.x,
        y: stitch.y
      };
    }
  })
  return pos;
};

function drawStartingCircle() {
  let c = document.getElementById("myCanvas");
  let ctx = c.getContext("2d");

  ctx.fillStyle = "rgba(255, 255, 255, 0.125)";
  
  ctx.beginPath();
  ctx.ellipse(originX, originY, bigR, bigR, 0, 0, 2*Math.PI);
  ctx.stroke();
    

}

function isIntersect(point, stitch) {
  if ( Math.pow(point.x - stitch.x, 2) / Math.pow(stitch.radiusX, 2)  +  Math.pow(point.y - stitch.y,2)/Math.pow(stitch.radiusY,2) < 1)
    return true;
  else
    return false;
}

canvas.addEventListener('click', (e) => {
  const pos = {
    x: e.clientX,
    y: e.clientY
  };
 
  const canvasPos = toCanvasCoords(pos.x, pos.y, 1);
 
  stitches.forEach(stitch => {
    if (isIntersect(canvasPos,stitch)) {
      attemptDropDown(stitch);
      drawAllStitches();
      writeRoundDetails();
    }
   })
});

function attemptDropDown(stitch) {

        // cannot drop down from first row
        if(stitch.round < startRound) {
          console.log('stitch is in first two rounds.  Cannot dropdown.');
          return;
        }
  
        // cannot dropp down if already dropped upon
        if(stitch.currColor != getBaseColor(stitch.roundId)) {
          console.log('stitch is already dropped upon.  Cannot dropdown.');
          return;
        }
        // if already a dd, clear 
        if (colorLowerStitch(stitch, !stitch.isDropDown)) {
          stitch.isDropDown = !stitch.isDropDown;
          stitch.writtenInstruction = "dddc"
        };  
}


function colorLowerStitch(sourceStitch, ddBool) {
        let success = false;
        let newColor = getBaseColor(sourceStitch.roundId);
        stitches.forEach(stitch => {
          if (stitch.id == sourceStitch.parentStitchId) {
            if (stitch.isDropDown) {
              // cannot drop down on another drop down
              console.log('drop down stitch not available because is itself a dropdown');
              success = false;
              return success;
            }

            //cannot be dropped on if already dropped on by another stitch
            if(ddBool && (stitch.currColor != getBaseColor(stitch.roundId))) {
              console.log('drop down stitch not available because already dropped on');
              success = false;
              return success;
            }
            if (ddBool) stitch.currColor = newColor;
            else stitch.currColor = stitch.baseColor;
            success = true;
          }
        })
        return success;
}


function toCanvasCoords(pageX, pageY, scale) {
  let rect = canvas.getBoundingClientRect();
  pos = {
    x: (pageX - rect.left) / scale,
    y: (pageY - rect.top) / scale
  }
  return pos;
}

// function firstStitchNbr (round){
//   let stitchNbr = 0;
//   for(let i=0; i<round; i++) {
//     stitchNbr += (i+1)*baseStitchQty;
//   }
//   return stitchNbr;
// }

function printCanvas()  
{ 
  const dataUrl = document.getElementById('myCanvas').toDataURL(); 

  let windowContent = '<!DOCTYPE html>';
  windowContent += '<html>';
  windowContent += '<head><title>Print canvas</title></head>';
  windowContent += '<body>';
  windowContent += '<img src="' + dataUrl + '">';
  windowContent += '</body>';
  windowContent += '</html>';
  
  const printWin = window.open('', '', 'width=' + screen.availWidth + ',height=' + screen.availHeight);
  printWin.document.open();
  printWin.document.write(windowContent); 
  
  printWin.document.addEventListener('load', function() {
      printWin.focus();
      printWin.print();
      printWin.document.close();
      printWin.close();            
  }, true);
}

function lineAtAngle(x1, y1, length, angle, canvas) {    
  canvas.moveTo(x1, y1);  
  x2 = x1 + Math.cos(angle ) * length;	 
  y2 = y1 + Math.sin(angle ) * length;	   
  canvas.lineTo(x2, y2);       
  canvas.stroke();
}

function writeRoundDetails(){
  rounds.forEach(round => {
    addRoundDetail(round);
  })
}
function addRoundDetail(round){
  // clear last instructions
   removeRoundDetail(round);

  // generate instructions
  let roundInstr = "";

  let currInstr = "";
  let prevInstr = " ";
  let instrCount = 0;
  stitches.forEach(stitch => {
    // only look at stitches in this round
    if (stitch.roundId != round.id) {
      return;
    }

    // new batch of instructions
    let currInstr = stitch.writtenInstruction;
    console.log('curr ' + currInstr + ' prev '+prevInstr);
    if (currInstr == prevInstr) {
      // increment the count and move on
      instrCount++;
      console.log('  count' + instrCount);
    } else {
      // write what we know
      if (instrCount > 0) roundInstr = roundInstr + ", " + instrCount + " x " + prevInstr;
      console.log('  ' + roundInstr);
      // set up for next batch
      prevInstr = currInstr;
      instrCount = 1;
    }
  })
  //write the last instruction
  roundInstr = roundInstr + ", " + instrCount + " x " + prevInstr;
  //trim off the leading comma
  roundInstr = roundInstr.substring(2);

  // add intro text
  roundInstr = "R" + round.id + " (" + round.stitchCount + " stitches): " + roundInstr;

  var ul = document.getElementById("roundsList");

  var li = document.createElement("li");
  li.setAttribute('id','round'+round.id);
  li.appendChild(document.createTextNode(roundInstr));
  ul.appendChild(li);
}

function removeRoundDetail(round){
  var ul = document.getElementById("roundsList");
  console.log('ul:');
  console.log(ul);

  var li = document.getElementById('round'+round.id);
  console.log('li:');
  console.log(li);
  // ul won't exist first time through the code
  if(li) ul.removeChild(li);
}