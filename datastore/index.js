const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');
const Promise = require('bluebird');

var items = {};

// Public API - Fix these CRUD functions ///////////////////////////////////////


// fs.readdir(todos.dataDir,  )

// exports.create = (text, callback) => {
//   counter.getNextUniqueId((err, counterString) => {
//     if (err) {
//       callback(err);
//     } else {
//       var path = exports.dataDir + '/' + counterString + '.txt';
//       var id = counterString;
//       fs.writeFile(path, text, (err) => {
//         if (err) {
//           console.log('There was a problem writing to file');
//           callback(err);
//         } else {
//           callback(null, {id, text});
//         }
//       });
//     }
//   });
// };

exports.create = (text, callback) => {
  counter.getNextUniqueId((err, id) => {
    if (err) {
      console.log('error getting ID:' + err);
      callback(err);
    } else {
      var todoPath = path.join(exports.dataDir, `${id}.txt`);
      fs.writeFile(todoPath, text, (err) => {
        if (err) {
          callback(err);
        } else {
          callback(null, {id: id, text: text});
        }
      });
    }
  });
};


Promise.promisifyAll(fs);

exports.readAll = (callback) => {
  fs.readdir(exports.dataDir, (err, itemsArray)=>{
    var final = [];
    var results = []; 
    // var data;
    if (err) {
      throw err;
    } else {
      if (itemsArray.length === 0 || undefined ) {
        callback(null, []);
      } else {
        var names = [];
        // var name;
        // var contents;
        for (let i = 0; i < itemsArray.length; i++) {
          var item = itemsArray[i];
          var name = item.slice(0, -4);
          names.push(name);
          var filePath = path.join(exports.dataDir, `${item}`);
          results.push( fs.readFileAsync(filePath, 'utf8')
            .then(function(content) {
              return {id: names[i], text: content};
            })
         
          );
        }
        Promise.all(results)
          .then(results => {
            callback(null, results);
            return;
          });
      }
     

 
      // callback(null, results);



    }
  });
};


// var item = itemsArray[i];
// return Promise.all(item)
//   .then(function(item) {
//     if (item) {
//       var string = item.join('');
//       console.log(string);
//       var name = string.slice(0, -4);
//       console.log('FILE NAME IS', name);
//       console.log('Ilove cofffe');
//       var obj = {};
//       var filePath = path.join(exports.dataDir, `${string}`);
    
//        fs.readFileAsync(filePath, 'utf8')
//         .then(function(contents) {
//           obj.id = name;
//           obj.text = contents;
//           results.push(obj);
//         });
//     } else {
//       console.log(err);
//     }
//   }).done(e => console.log(e))



exports.readOne = (id, callback) => {
  var filePath = path.join(exports.dataDir, `${id}.txt`);
  fs.readFile(filePath, 'utf8', (err, file) => {

    if (!file || err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      callback(null, { id, text: file });
    }
  });
};


exports.update = (id, text, callback) => {
  var filePath = path.join(exports.dataDir, `${id}.txt`);
  fs.unlink(filePath, (err) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      fs.writeFile(filePath, text, (err)=>{
        if (err) {
          console.log('writeFile error: ' + err);
        } else {
          callback(null, {id, text});
        }
      });
      // callback(null, { id, text });
    }
  });
  
};


exports.delete = (id, callback) => {
  var filePath = path.join(exports.dataDir, `${id}.txt`);
  fs.unlink(filePath, (err) => {
    if (err) {
      callback(new Error(`Could not delete with id: ${id}`));
    } else {
      callback();
    }
  });
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data'); 


exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};