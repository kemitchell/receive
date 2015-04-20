var docopt = require('docopt').docopt;
var fs = require('fs');
var http = require('http');
var path = require('path');

var handler = require('./handler');
var metadata = require('../package.json');
var usage = fs.readFileSync(
  path.join(path.dirname(fs.realpathSync(__filename)), 'usage.txt')
).toString();

module.exports = function() {
  var options = docopt(usage, {
    help: true,
    version: metadata.version
  });
  var port = options['--port'] || process.env.PORT || 8080;
  var directory = fs.realpathSync(
    options['--directory'] || process.cwd()
  );
  var nameAndVersion = metadata.name + ' version ' + metadata.version;
  http.createServer(handler(nameAndVersion, directory))
    .listen(port, function() {
      console.log(
        nameAndVersion +
        ' listening for uploads to ' + directory +
        ' on port ' + port
      );
    });
};
