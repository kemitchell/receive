var Busboy = require('busboy');
var Entities = new require('html-entities');
var fs = require('fs');
var path = require('path');

var entities = new Entities.Html5Entities();
var encode = entities.encode.bind(entities);

var BOOTSTRAP_CSS =
  '//maxcdn.bootstrapcdn.com/bootstrap/3.3.4/css/bootstrap.min.css';

module.exports = function(nameAndVersion, directory) {
  var fieldMeta = {};
  var destinationPathMeta;
  return function(request, response) {
    if (request.method === 'POST') {
      request.pipe(
        new Busboy({headers: request.headers})
          .on('file', function(fieldName, file, fileName) {
            var destinationPath = path.join(directory, fileName);
            destinationPathMeta = destinationPath + '.json';
            console.log('Writing ' + destinationPath);
            file.pipe(fs.createWriteStream(destinationPath));
          })
          .on('field', function(fieldname, val, fieldnameTruncated, valTruncated) {
            fieldMeta[fieldname] = val;
          })
          .on('finish', function() {
            response.statusCode = 302;
            response.setHeader('Location', '/');
            response.end();
            if(Object.keys(fieldMeta).length > 0) {
              fs.writeFile(destinationPathMeta, JSON.stringify(fieldMeta), function(err) {
                if (err) {
                  return console.log(err);
                }
                console.log('Written ' + destinationPathMeta);
              });
            }
          })
      );
    } else if (request.method === 'GET') {
      response.statusCode = 200;
      response.end(
        '<!DOCTYPE html>' +
        '<html>' +
        '  <head>' +
        '    <link rel=stylesheet href="' + BOOTSTRAP_CSS + '">' +
        '  </head>' +
        '  <body>' +
        '    <div class=container>' +
        '      <div class=page-header>' +
        '        <h1>' + nameAndVersion + '</h1>' +
        '      </div>' +
        '      <div class=row>' +
        '        <div class=col-sm-6>' +
        '          <h2>Upload a file</h2>' +
        '          <form class=form-inline' +
        '                method=POST' +
        '                enctype="multipart/form-data">' +
        '            <input type=file name=file class=form-control>' +
        '            <button type=submit class="btn btn-default">' +
        '              Upload File' +
        '            </button>' +
        '          </form>' +
        '        </div>' +
        '        <div class=col-sm-6>' +
        '          <h2>Files in ' + directory + '</h2>' +
        '          <ul>' +
                     fs.readdirSync(directory)
                       .map(function(fileName) {
                         return '<li>' + encode(fileName) + '</li>';
                       })
                       .join('') +
        '          </ul>' +
        '        </div>' +
        '      </div>' +
        '    </div>' +
        '  </body>' +
        '</html>'
      );
    }
  };
};
