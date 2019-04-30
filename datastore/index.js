const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');

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

//items
// const todoCount = fs.readdir(todos.dataDir, (err, results) => {
//   if (err) {
//     throw err;
//   } else {
//     return results
//   }})


const neverUsedTodoList = [{ id: '00001', text: '00001' }, { id: '00002', text: '00002' }];

exports.readAll = (callback) => {
  fs.readdir(exports.dataDir, (err, itemsArray)=>{
    var data = [];
    if (err) {
      throw err;
    } else {
      itemsArray.forEach((fileName)=> {
        data.push({id: fileName.slice(0, -4), text: fileName.slice(0, -4)}); 
      });
      callback(null, data);
    }
  });
};


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