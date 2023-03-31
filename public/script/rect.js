$(document).ready(function () {

    let canvas = document.getElementById('myCanvas');
    let nbrColorElement = document.getElementById('nbrColors')
    let baseStitchQty = $('#baseStitches').val();
    let nbrColors = nbrColorElement.value;
    let rowCount = $('#rowCount').val();
    let color1 = document.getElementById('color1').value;
    let color2 = document.getElementById('color2').value;
    let color3 = document.getElementById('color3').value;
    let color4 = document.getElementById('color4').value;

    let stitchWidth = canvas.width / baseStitchQty;
    let stitchHeight = canvas.height / rowCount;

    let randomize = false;
    const randomThreshold = .5;

    let geoPattern = false;
    const multFactor = 3;

    // hard to drop down onto first row or two
    let startRow = 3;  // cant land on rows 0 or 1

    // show numbers on stitches.  Useful for debugging
    let showNbrs = false;

    let colors = [];
    switch (nbrColors) {
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

    // start in lower left corner
    originX = 0;
    originY = canvas.height;
  
    // compute maxiumum number of stitches that will fit
    let rows = [];
    let stitches = [];

    if (canvas.getContext) {
        var ctx = canvas.getContext('2d');
        constructStitches();
        drawChain();

      //  if (randomize) {
      //      createRandomPattern();
      //  }

      //  if (geoPattern) {
      //      createGeoPattern();
      //  }
      //  drawAllStitches();
      //  writeRowDetails();
    }

    nbrColorElement.addEventListener('change', (e) => {
        console.log('changed');
        renderColorPickers();
    });

    canvas.addEventListener('click', (e) => {
        const pos = {
            x: e.clientX,
            y: e.clientY
        };

        const canvasPos = toCanvasCoords(pos.x, pos.y, 1);

        stitches.forEach(stitch => {
            if (isIntersect(canvasPos, stitch)) {
                attemptDropDown(stitch);
                drawAllStitches();
                writeRoundDetails();
            }
        })
    });

    function createRandomPattern() {
        stitches.forEach(stitch => {
            if (Math.random() < randomThreshold) {
                attemptDropDown(stitch);
            }
        })

    }

    function createGeoPattern() {
        stitches.forEach(stitch => {
            if (stitch.id % multFactor == 0) {
                attemptDropDown(stitch);
            }
        })
    }
    function constructStitches() {
        let c = document.getElementById("myCanvas");
        let ctx = c.getContext("2d");



        // constant for all stitches
        let id = 0;
        let currColor = 0;
        console.log('stitchw ' + stitchWidth);
        console.log('stitchH ' + stitchHeight);
        for (let j = 0; j < rowCount; j++) {

            let currentRow = {
                id: j,
                humanId: j + 1,
                baseColor: colors[currColor],
            }
            rows.push(currentRow);

            let currentY = ctx.height - (j * stitchHeight);

            for (let i = 0; i < baseStitchQty; i++) {

                let currentX = i * stitchWidth;

                // determine the lower stitch that it will build upon
                // increment: account for the extra stitch 
//                let nbrOfStitchesFromFirstStitch = id - currentRound.firstStitchNbr + 1;
//                let increment = nbrOfStitchesFromFirstStitch * (1 / (j + 1));

                // drop down stitch = current stitch number + the number of stitches around + 
                // the incremental amount to increase the stitch count for the next row
           

                // find the 'grandmother' of the stitch.  this is the stitch that this stitch would drop down to
                // we just found the parentStitchId, which is this stitch's mother.  So just need to get the parentStitchId of the parentStitchId.
                let grandparentStitchId = id - 2 * baseStitchQty;

                stitches.push({
                    x: currentX,
                    y: currentY,
                    id: id,
                    currColor: colors[currColor],
                    rowId: j,
                    parentStitchId: getParent(id),
                    grandparentStitchId: getParent(getParent(id)),
                    isDropDown: false,
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
        let parentId = childId - baseStitchQty;
        if (parentId < 0) parentId = null;
        return parentId;
    }

    function getBaseColor(rowId) {
        let baseColor;
        rows.forEach(row => {
            if (row.id == rowId) {
                baseColor = row.baseColor;
            }
        })
        return baseColor;
    }

    function drawAllStitches() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        stitches.forEach(stitch => {
            // draw a little oval behind the stitch to indicate the base color of that round
            //ctx.fillStyle = getBaseColor(stitch.roundId);
            //ctx.beginPath();
            //ctx.rect(stitch.x, stitch.y, stitchWidth, stitchHeight/2);
            //ctx.stroke();
            //ctx.fill();

            ctx.fillStyle = stitch.currColor;

            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            ctx.lineWidth = 1;
            if (stitch.isIncrease) ctx.lineWidth = 8;

            // x and y parameters describe the middle of the ellipse
            ctx.beginPath();
            ctx.rect(stitch.x, stitch.y, stitchWidth, stitchHeight);
            ctx.stroke();
            ctx.fill();

            ctx.lineWidth = 1;



            // draw the line to its connected stitch
            if (stitch.grandparentStitchId >= 0 && stitch.isDropDown) {
                let toPos = getIdCoords(stitch.grandparentStitchId);
                ctx.beginPath();
                ctx.moveTo(stitch.x, stitch.y);
                ctx.lineTo(toPos.x, toPos.y);
                ctx.stroke();
            }

            let currRow = getRow(stitch);

 //           if (stitch.id == currRow.firstStitchNbr) {
 //               ctx.strokeText(currRound.humanId, stitch.x, stitch.y);
 //           }
            if (showNbrs) ctx.strokeText(stitch.id, stitch.x, stitch.y);

            if (stitch.isDropDown) {
                ctx.strokeText('X', stitch.x, stitch.y);
            }


        })
    }

    function getIdCoords(id) {
        let pos;

        stitches.forEach(stitch => {
            if (stitch.id == id) {
                pos = {
                    x: stitch.x,
                    y: stitch.y
                };
            }
        })
        return pos;
    };

    function drawChain() {
        let c = document.getElementById("myCanvas");
        let ctx = c.getContext("2d");

        ctx.fillStyle = "rgba(255, 255, 255, 0.125)";

        console.log('drawing chain');
        for (let i = 0; i < baseStitchQty; i++) {
            ctx.beginPath();
            console.log(i * stitchWidth);
            console.log(ctx.Height - stitchHeight);
            console.log(stitchWidth);
            console.log(stitchHeight);
            ctx.rect(i * stitchWidth, ctx.Height - stitchHeight, stitchWidth, stitchHeight);
            ctx.stroke();
        }



    }

    function isIntersect(point, stitch) {
        if (Math.pow(point.x - stitch.x, 2) / Math.pow(stitch.radiusX, 2) + Math.pow(point.y - stitch.y, 2) / Math.pow(stitch.radiusY, 2) < 1)
            return true;
        else
            return false;
    }


    function attemptDropDown(stitch) {

        // cannot drop down from first row
        if (stitch.round < startRound) {
            console.log('stitch is in first two rounds.  Cannot dropdown.');
            return;
        }

        // cannot dropp down if already dropped upon
        if (stitch.currColor != getBaseColor(stitch.roundId)) {
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
                if (ddBool && (stitch.currColor != getBaseColor(stitch.roundId))) {
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

    function getRow(stitch) {
        let foundRow;

        rows.forEach(row => {
            if (stitch.rowId == row.id)
                foundRow = row;
        })
        return foundRow;
    }

    function toCanvasCoords(pageX, pageY, scale) {
        let rect = canvas.getBoundingClientRect();
        pos = {
            x: (pageX - rect.left) / scale,
            y: (pageY - rect.top) / scale
        }
        return pos;
    }

    function printCanvas() {
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

        printWin.document.addEventListener('load', function () {
            printWin.focus();
            printWin.print();
            printWin.document.close();
            printWin.close();
        }, true);
    }

    /*
    function lineAtAngle(x1, y1, length, angle, canvas) {
        canvas.moveTo(x1, y1);
        x2 = x1 + Math.cos(angle) * length;
        y2 = y1 + Math.sin(angle) * length;
        canvas.lineTo(x2, y2);
        canvas.stroke();
    }
    */

    function writeRowDetails() {
        rows.forEach(row => {
            addRowDetail(row);
        })
    }
    function addRowDetail(row) {
        // clear last instructions
        removeRowDetail(row);

        // generate instructions
        let rowInstr = "";

        let currInstr = "";
        let prevInstr = " ";
        let instrCount = 0;
        stitches.forEach(stitch => {
            // only look at stitches in this round
            if (stitch.rowId != row.id) {
                return;
            }

            // new batch of instructions
            let currInstr = stitch.writtenInstruction;
            if (currInstr == prevInstr) {
                // increment the count and move on
                instrCount++;
            } else {
                // write what we know
                if (instrCount > 0) rowInstr = rowInstr + ", " + instrCount + " x " + prevInstr;
                // set up for next batch
                prevInstr = currInstr;
                instrCount = 1;
            }
        })

        //write the last instruction
        rowInstr = rowInstr + ", " + instrCount + " x " + prevInstr;
        //trim off the leading comma
        rowInstr = rowInstr.substring(2);

        // add intro text
        rowInstr = "R" + row.humanId + " (" + row.stitchCount + " stitches): " + rowInstr;

        // build instruction row as: row 
        // figure out color div definition
        var colorDiv = document.createElement('div');
        colorDiv.className = 'box inline';
        colorDiv.style.backgroundColor = round.baseColor;


        var ul = document.getElementById("rowsList");

        var li = document.createElement("li");
        let roundId = 'row' + row.id;
        li.setAttribute('id', rowId);
        li.appendChild(colorDiv);
        li.appendChild(document.createTextNode(rowInstr));
        ul.appendChild(li);

        $('#' + rowId).addClass('list-group-item');
    }

    function removeRowDetail(row) {
        var ul = document.getElementById("rowsList");
        var li = document.getElementById('row' + row.id);
        // ul won't exist first time through the code
        if (li) ul.removeChild(li);
    }

    function resizeCanvas(canvas) {
        var parent = canvas.parentElement;

        canvas.width = parent.offsetWidth;
        canvas.height = "auto";
    }

    function renderColorPickers() {
        // color 1 always rendered
        // color 2 always rendered

        console.log('current nbr colors: ' + nbrColorElement)
        if (nbrColorElement.value < 3) {
            $('#color3').addClass('isHidden');
            $('#color3label').addClass('isHidden');
            $('#color4').addClass('isHidden');
            $('#color4label').addClass('isHidden');
        } else if (nbrColorElement.value < 4) {
            $('#color3').removeClass('isHidden');
            $('#color3label').removeClass('isHidden');
            $('#color4').addClass('isHidden');
            $('#color4label').addClass('isHidden');
        } else {
            $('#color3').removeClass('isHidden');
            $('#color3label').removeClass('isHidden');
            $('#color4').removeClass('isHidden');
            $('#color4label').removeClass('isHidden');
        }

    }


}); //document ready
