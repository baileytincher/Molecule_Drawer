var LINE_LENGTH = 100;
var TEXT_SIZE = 25;

var ANG_120 = Math.PI * 2 / 3;
var ANG_90 = Math.PI / 2;
var ANG_60 = ANG_120 / 2;
var ANG_30 = ANG_60 / 2;

var _molecules = [];
var linearMolecule

function setup() {
  createCanvas(1000, 1000);
  //pixelDensity(12.0); // Can cause errors on certain displays
  background(255);
  //draw();
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
  var linearMolecule = {
    coreCarbons: 3,
    substituents: [
      [],
      [{ formula: "", bondCount: 2, chainLength: 7 }],
      [{ formula: "", bondCount: 2, chainLength: 6 }]

    ],
    cyclic: false
  };
  loadMolecules('Output.json');
  drawLinearMolecule(_molecules[0]);

  // var cyclicMolecule = {
  //   coreCarbons: 3,
  //   substituents: [

  //     [{ formula: "", bondCount: 1 }],
  //     [],
  //     [{ formula: "OH", bondCount: 1 }]

  //   ],
  //   cyclic: true
  // };
  console.log(linearMolecule);
  //drawCyclicMolecule(cyclicMolecule);

}

function loadMolecules(file) {
  var molecules = JSON.parse('{"substituents":[[null,null,null,null],[{"bondCount":1,"chainLength":0,"formula":"OH"},null,null,null],[{"bondCount":2,"chainLength":0,"formula":"O"},null,null,null]],"cyclic":false,"coreCarbons":3}');
  _molecules.push(molecules);
}

// Returns end points of line drawn
function drawLine(angle, length, x0, y0, strokeWeight_ = 2) {
  console.log("hi");
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

  if (Math.cos(lineAngle) < 0 && text_ == "OH") {
    text_ = "HO"
  }

  text(text_, x0 + delx, y0 + dely);
}

// Returns end points of center-line drawn
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

function drawLinearChain(chainLength, angle, lineLength, x0, y0) {
  var startPt = { x: x0, y: y0 };
  var ang = angle;

  stroke(5, 255, 5);

  for (var i = 0; i < chainLength; i++) {
    startPt = drawLine(ang, lineLength, startPt.x, startPt.y);

    if (angle == ANG_90 || angle == -ANG_90 * 3) {
      ang = (i % 2 == 0) ? ANG_30 : -ANG_30;

    } else if (angle == -ANG_90 || angle == ANG_90 * 3) {
      ang = (i % 2 == 0) ? -ANG_30 : ANG_30;

    } else if (angle == -ANG_30) {
      ang = (i % 2 == 0) ? ANG_30 : -ANG_30;

    } else {
      ang = ((i % 2 == 0) ? -ANG_30 : ANG_30);
    }
  }

  stroke(0);

}

function drawLinearMolecule(molecule, x0 = 200, y0 = 200) {
  var ang = -ANG_30;
  var startPt = { x: x0, y: y0 };

  for (var i = 0; i < molecule.coreCarbons; i++) {

    var substituent = molecule.substituents[i];
    var sub_ang = ANG_90; // Default to substituent going down

    for (var j = 0; j < substituent.length; j++) {

      if (substituent[j] != null) {
        console.log(j);
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



        if (i != molecule.coreCarbons - 1) {
          startPt = drawLine(ang, LINE_LENGTH, startPt.x, startPt.y);
          ang = -ang;
        }
      }

    }

  }

}

function drawCyclicMolecule(molecule, x0 = 200, y0 = 200) {
  var ang = 0;
  var startPt = { x: x0, y: y0 };

  var del_ang = 2 * Math.PI / molecule.coreCarbons;

  for (var i = 0; i < molecule.coreCarbons; i++) {
    startPt = drawLine(ang, LINE_LENGTH, startPt.x, startPt.y);
    ang += del_ang;
  }

}