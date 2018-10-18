var LINE_LENGTH = 100;
var TEXT_SIZE = 25;

var ANG_120 = Math.PI * 2 / 3;
var ANG_90 = Math.PI / 2;
var ANG_60 = ANG_120 / 2;
var ANG_30 = ANG_60 / 2;

function setup() {
  createCanvas(1000, 1000);
  pixelDensity(12.0); // Can cause errors on certain displays
  background(255);
  //draw();
  var molecule = {
    coreCarbons: 3,
    substituents: [
                  
                  [{formula: "", bondCount: 1}],
                  [],
                  [{formula: "OH", bondCount: 1}]

                  ]
  };
  drawMolecule(molecule);

}

function drawLine(angle, length, x0, y0, strokeWeight_=2) {
  smooth();
  strokeWeight(strokeWeight_);

  var delx = Math.cos(angle) * length;
  var dely = Math.sin(angle) * length;
  var x1 = x0 + delx;
  var y1 = y0 + dely;
  line(x0, y0, x1, y1);

  smooth();
  beginShape();
  curveVertex(x0, y0);
  curveVertex(x1, y1);
  endShape();

  return {x: x1, y: y1};
}

function drawText(text_, lineAngle, lineLength, x0, y0, textSize_=25) {
  textSize(textSize_);
  strokeWeight(0);

  var offset = lineLength / 15;
  var delx = Math.cos(lineAngle) * offset;
  var dely = Math.sin(lineAngle) * offset;
  if (dely > 0) {
    dely += textSize_ * 3/5;
  } else if (dely < 0) {
    dely -= textSize_ * 3/5;
  }

  text(text_, x0 + delx, y0 + dely);
}

function drawMolecule(molecule, x0=200, y0=200) {
  var ang = -ANG_30;
  var startPt = {x: x0, y: y0};

  for (var i = 0; i < molecule.coreCarbons; i++) {

    var substituent = molecule.substituents[i];

    startPt = drawLine(ang, LINE_LENGTH, startPt.x, startPt.y);

    for (var j = 0; j < substituent.length; j++) {

      var sub_ang = ANG_90; // Default to substituent going down

      if (i == molecule.coreCarbons-1) { // Substituent on last core carbon
        sub_ang = -ang;
      } else if (ang < 0) { // Substituent goes up
        sub_ang = -sub_ang;
      }

      var subStartPt = drawLine(sub_ang, LINE_LENGTH, startPt.x, startPt.y);
      drawText(substituent[0].formula, sub_ang, LINE_LENGTH, subStartPt.x, subStartPt.y);

    }

    ang = -ang;
  }

}
