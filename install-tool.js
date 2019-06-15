var osRuntimes = require('./os-runtimes');

var http = require('http');
var fs = require('fs');
var colors = require('colors');
var path = require('path');
var shell = require('shelljs');
var AdmZip = require('adm-zip');
var os = require('os');
var homeDir = os.homedir();

var runtime = osRuntimes[os.platform()];
var toolName = process.argv[2] || 'bam';
var requestFileName = `bamtoolkit-${toolName}-${runtime}.zip`;

var tmpDir = path.resolve(homeDir, ".bam", "tmp");
var binDir = path.resolve(homeDir, ".bam", "toolkit", toolName);
var downloadPath = path.resolve(tmpDir, requestFileName);

if(!fs.existsSync(tmpDir)){
  shell.mkdir('-p', tmpDir);
}

if(!fs.existsSync(binDir)){
  shell.mkdir('-p', binDir);
}

var download = function(url, dest, cb) {
  var file = fs.createWriteStream(dest);
  var request = http.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      file.close(cb);  // close() is async, call cb after close completes.
    });
  }).on('error', function(err) { // Handle errors
    fs.unlink(dest); // Delete the file async. (But we don't check the result)
    if (cb) cb(err.message);
  });
};

var unzip = function(path, extractTo){
  console.log(`unzipping ${path} to ${extractTo}`.cyan);
  var zip = new AdmZip(path);  
  zip.extractAllTo(extractTo, true);
}

console.log(`downloading ${toolName}`);
download(`http://bamapps.net/download?fileName=${requestFileName}`, downloadPath, function(){
    console.log(`file downloaded to ${downloadPath}`.green);
    unzip(downloadPath, binDir);
    console.log(`unzipping complete`.green);
    console.log(`deleting file ${downloadPath}`.cyan);
    shell.rm(downloadPath);
    console.log(`delete complete`.green);
    console.log(`set tool path with: 'source set-tool-path.sh ${toolName}'`)
});