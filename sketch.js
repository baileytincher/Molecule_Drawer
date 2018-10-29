var LINE_LENGTH = 100;
var TEXT_SIZE = 25;

var ANG_120 = Math.PI * 2 / 3;
var ANG_90 = Math.PI / 2;
var ANG_60 = ANG_120 / 2;
var ANG_30 = ANG_60 / 2;

var molecules_ = [];
var index = 0;

function setup() {
  createCanvas(1000, 500);
  setupCanvas();

}

function setupCanvas() {
  clear();
  stroke(0);
  background(255);

}

/** Accepts a json molecule object and draws it accordingly.
*
*   Expects a json object of the form
    {
      coreCarbons: unsigned,
      substituents: [
        [{ formula: string, bondCount: unsigned, chainLength: unsigned }],
        ...,
        ]

      ],
      cyclic: bool
    }
*/
function loadMolecules(theData) {
  var molecule = JSON.parse(theData);

  setupCanvas();

  if (molecule.cyclic) {
    drawCyclicMolecule(molecule);

  } else {
    drawLinearMolecule(molecule);
  
  }

}

/** Custom function to draw a line on the screen.
*   returns a point object of the line's end point.
*/
function drawLine(angle, length, x0, y0, strokeWeight_ = 2) {
  smooth();
  strokeWeight(strokeWeight_);

  // Compute end points
  var delx = Math.cos(angle) * length;
  var dely = Math.sin(angle) * length;
  var x1 = x0 + delx;
  var y1 = y0 + dely;
  line(x0, y0, x1, y1);

  // Draw lines
  smooth();
  beginShape();
  curveVertex(x0, y0);
  curveVertex(x1, y1);
  endShape();

  return { x: x1, y: y1 };
}

/** Custom function to add the chemical formula to the screen.
*/
function drawText(text_, lineAngle, lineLength, x0, y0, textSize_ = 25) {
  textSize(textSize_);
  strokeWeight(0);

  // Calculations to offset text from line
  var offset = lineLength / 20;
  var delx = Math.cos(lineAngle) * offset;
  var dely = Math.sin(lineAngle) * offset;

  // Improve by making this scale with the angle
  if (dely > 0) {
    dely += textSize_ * 3 / 4;
  } else if (dely < 0) {
    dely -= textSize_ * 1 / 4;
  }

  // Text is left justified instead of center
  if (delx < 0) {
    delx -= text_.length * textSize_ * 3 / 4;

    // If perpendicular to x axis
  } else if (Math.abs(delx) < .001 && text_ != "OH") { // Can't use delx == 0 due to approx vals
    delx -= text_.length / 3 * textSize_;

  }

  text(text_, x0 + delx, y0 + dely);
}

/** Draws a double bond on the canvas.
*   returns the end point of the double bond.
*/
function drawDoubleBond(angle, length, x0, y0, strokeWeight_ = 2) {
  // Sines and cosines necessary to stagger second line properly
  var delx = Math.sin(angle) * 6;
  var dely = -Math.cos(angle) * 6;
  var newEndPt = drawLine(angle, length, x0, y0, strokeWeight_);

  // Offset line to be the double bond
  //drawLine(angle, length * 9 / 10, x0 + delx, y0 + dely, strokeWeight_);
  line(x0 + delx, y0 + dely, newEndPt.x + delx, newEndPt.y + dely);

  // Draws standard line down center and returns its end points
  return newEndPt;

}

function drawAlcohol(angle, lineLength, x0, y0) {
  var subStartPt = drawLine(angle, lineLength, x0, y0);

  var text_ = "OH";
  if (Math.cos(lineAngle) < 0) {
    text_ = "HO";
  }

  drawText(text_, angle, lineLength, x0, y0);

}

function drawHalogens(formulas, coreBonds, angle, lineLength, x0, y0) {
  var num = formulas.length;
  var offset;
  var startAng;
  if (num == 1) {
    offset = 0;
    startAng = angle;

  } else if (num == 2) {
    if (coreBonds == 0) {
      offset = 2*ANG_90;
      startAng = angle;

    } else if (coreBonds == 1) {
      offset = ANG_120;
      startAng = angle;

    } else if (coreBonds == 2) {
      offset = 2/3 * ANG_120;
      startAng = angle - offset/2;

    }

  } else if (num == 3) {
    if (coreBonds == 0) {
      offset = ANG_120;
      startAng = angle;

    } else if (coreBonds == 1) {
      offset = 2/3 * ANG_120;
      startAng = angle - offset/2;
    }

  } else if (num == 4) {
    offset = ANG_90;
    startAng = angle;

  }

  for (var i = 0; i < num; i++) {
    var textStartPt = drawLine(startAng, lineLength, x0, y0);
    drawText(formulas[i].formula, startAng, lineLength, textStartPt.x, textStartPt.y);
    startAng += offset;

  }
}

function drawCarbonyl(angle, lineLength, x0, y0) {
  var subStartPt = drawDoubleBond(angle, lineLength, x0, y0);
  drawText("O", angle, lineLength, x0, y0);

}

function drawSubstituents(substituents, bondCount, angle, lineLength, x0, y0) {
  switch(substituents[0].type) { //@TODO: FIX THIS TO BE MODULAR FOR MULT TYPES OF SUBS
    case "CARBONYL": 
      drawCarbonyl(angle, lineLength, x0, y0);

    case "ALCOHOL":
      drawAlcohol(angle, lineLength, x0, y0);

    case "HALOGEN":
      drawHalogens(substituents, bondCount, angle, lineLength, x0, y0);

    case "ALKYL":
      drawLinearChain(substituents.chainLength, angle, lineLength, x0, y0);

    default:
      stroke(5, 5, 255); //Denote error
      drawLinearChain(1, angle, lineLength, x0, y0);
      stroke(0);
  }

}

/** Draws an alkyl substituent on the canvas
*   with the desired chain length.
*/
function drawLinearChain(chainLength, angle, lineLength, x0, y0) {
  var startPt = { x: x0, y: y0 };
  var ang = angle;

  for (var i = 0; i < chainLength; i++) {
    startPt = drawLine(ang, lineLength, startPt.x, startPt.y);
    ang = (i % 2) == 0 ? ang - ANG_60 : ang + ANG_60;

  }

  stroke(0);

}

/** Draws a "linear" molecule on the screen.
*   Expects a JSON object of the form described by
*   loadMolecule().
*/
function drawLinearMolecule(molecule, x0 = 150, y0 = 200) {
  var ang = -ANG_30;
  var startPt = { x: x0, y: y0 };


  for (var i = 0; i < molecule.coreCarbons; i++) {

    var substituent = molecule.substituents[i];
    var sub_ang = ANG_90; // Default to substituent going down

    for (var j = 0; j < substituent.length; j++) {

      if (substituent[j] != null) {
        if (j == 0) {
          if (i == molecule.coreCarbons - 1) { // Substituent on first/last core carbon
            sub_ang = ang;
          } else if (i == 0) {
            sub_ang = ANG_90;
          } else if (ang > 0) { // Substituent goes up
            sub_ang = -sub_ang;
          }
        } else {
          sub_ang += ANG_120;
          if (sub_ang == ang) {
            sub_ang += ANG_120
          }
        }


        if (substituent[j].chainLength > 0) {
          drawLinearChain(substituent[j].chainLength, sub_ang, LINE_LENGTH, startPt.x, startPt.y);

        } else {
          var subEndPt;
          if (substituent[j].bondCount > 1) {
            subEndPt = drawDoubleBond(sub_ang, LINE_LENGTH, startPt.x, startPt.y);

          } else {
            subEndPt = drawLine(sub_ang, LINE_LENGTH, startPt.x, startPt.y);

          }

          drawText(substituent[j].formula, sub_ang, LINE_LENGTH, subEndPt.x, subEndPt.y);

        }

      }

    }
    if (i != molecule.coreCarbons - 1) {
      startPt = drawLine(ang, LINE_LENGTH, startPt.x, startPt.y);
      ang = -ang;
    }

  }

}

/** Draws a "cyclic" molecule on the screen.
*   Expects a JSON object of the form described by
*   loadMolecule().
*/
function drawCyclicMolecule(molecule, x0 = 200, y0 = 200) {
  var ang = 0;
  var startPt = { x: x0, y: y0 };

  var del_ang = 2 * Math.PI / molecule.coreCarbons;

  for (var i = 0; i < molecule.coreCarbons; i++) {
    var sub_ang;
    drawSubstituents(molecule.substituents, 2, sub_ang, lineLength, startPt.x, startPt.y);
    startPt = drawLine(ang, LINE_LENGTH, startPt.x, startPt.y);
    ang += del_ang;
  }

}


/** Simple molecule test cases*/
function drawTestMol() {
  setupCanvas();

  var mol = {
    coreCarbons: 4,
    substituents: [
      [{ formula: "OH", bondCount: 1, chainLength: 0 }, { formula: "OH", bondCount: 1, chainLength: 0 }],
      [{ formula: "O", bondCount: 2, chainLength: 0 }],
      [{ formula: "O", bondCount: 2, chainLength: 0 }],
      [{ formula: "OH", bondCount: 1, chainLength: 0 }]

    ],
    cyclic: false
  };

  drawLinearMolecule(mol);

    stroke(0);
    line(20, 20, 50, 50);

}

  // var linearMolecule = {
  //   coreCarbons: 5,
  //   substituents: [
  //     [],
  //     [{ formula: "", bondCount: 1, chainLength: 1 }],
  //     [],
  //     [],
  //     [{ formula: "O", bondCount: 2, chainLength: 0 },
  //       { formula: "OH", bondCount: 1, chainLength: 0 }
  //     ]

  //   ],
  //   cyclic: false
  // };
  // var linearMolecule = {
  //   coreCarbons: 4,
  //   substituents: [
  //     [{ formula: "OH", bondCount: 1, chainLength: 0 }],
  //     [{ formula: "Br", bondCount: 1, chainLength: 0 }],
  //     [{ formula: "Cl", bondCount: 1, chainLength: 0 }],
  //     [{ formula: "F", bondCount: 1, chainLength: 0 }]

  //   ],
  //   cyclic: false
  // };
  // var linearMolecule = {
  //   coreCarbons: 3,
  //   substituents: [
  //     [],
  //     [],
  //     [{ formula: "O", bondCount: 2, chainLength: 0 }]

  //   ],
  //   cyclic: false
  // };
  // linearMolecule = {
  //   coreCarbons: 4,
  //   substituents: [
  //     [{ formula: "OH", bondCount: 1, chainLength: 0 }, { formula: "OH", bondCount: 1, chainLength: 0 }],
  //     [{ formula: "O", bondCount: 2, chainLength: 0 }],
  //     [{ formula: "O", bondCount: 2, chainLength: 0 }],
  //     [{ formula: "OH", bondCount: 1, chainLength: 0 }]

  //   ],
  //   cyclic: false
  // };
  // var linearMolecule = {
  //   coreCarbons: 3,
  //   substituents: [
  //     [],
  //     [{ formula: "", bondCount: 2, chainLength: 7 }],
  //     [{ formula: "", bondCount: 2, chainLength: 6 }]

  //   ],
  //   cyclic: false
  // };
