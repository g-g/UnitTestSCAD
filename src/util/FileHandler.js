var fs = require('fs');
var os = require('os');
var execSync = require('child_process').execSync;

function FileHandler() {
  this.scad = 'temp.scad';
  this.stl = 'temp.stl';
  this.svg = 'temp.svg';
}

FileHandler.prototype.executeNodeFiles = function(files) {
  files.forEach(function(file) {
    require(path.resolve(file));
  });
};

FileHandler.prototype.writeScadFile = function(header, setUpText, testText) {
  contents = header + os.EOL;
  if(setUpText !== null) {
    contents += setUpText + os.EOL;
  }
  contents += testText;
  fs.writeFileSync(this.scad, contents);
};

FileHandler.prototype.convert = function(destination) {
  var COMMAND = 'openscad -o ' + destination + ' ' + this.scad;
  return execSync(COMMAND).toString();
};

FileHandler.prototype.convertToStl = function() {
  return this.convert(this.stl);
};

FileHandler.prototype.convertToSvg = function() {
  return this.convert(this.svg);
};

FileHandler.prototype.getOutputLine = function(output) {
  var marker = output.find(function(line) {
    return line.search(new RegExp('UnitTestSCAD')) >= 0;
  });

  return output[output.indexOf(marker) + 1];
};

var getLinesWithVertex = function(contents) {
  return contents.split(os.EOL)
  .filter(function(line) {
    return line.match(/vertex([ ]{1}[0-9]*){3}/);
  });
};

FileHandler.prototype.getVertices = function(contents) {
  return getLinesWithVertex(contents)
  .filter(function(value, index, self) {
    return self.indexOf(value) === index;
  })
  .reduce(function(accumulator, currentValue) {
    // Last three elements should be the co-ordinates, as a string
    var vertex = currentValue.split(' ')
    .slice(-3)
    .map(function(v) {
      return parseInt(v, 10);
    });
    accumulator.push(vertex);
    return accumulator;
  }, []);
};

FileHandler.prototype.countTriangles = function(contents) {
  return contents.split(os.EOL)
  .filter(function(line) {
    return line.match(/endfacet/);
  })
  .length;
};

FileHandler.prototype.cleanUp = function() {
  if(fs.existsSync(this.scad)) {
    fs.unlinkSync(this.scad);
  }
  if(fs.existsSync(this.stl)) {
    fs.unlinkSync(this.stl);
  }
  if(fs.existsSync(this.svg)) {
    fs.unlinkSync(this.svg);
  }
};

module.exports = new FileHandler();