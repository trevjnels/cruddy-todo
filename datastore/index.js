const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');

var items = {};

// Public API - Fix these CRUD functions ///////////////////////////////////////


// fs.readdir(todos.dataDir,  )

exports.create = (text, callback) => {
  counter.getNextUniqueId((err, id) => {
    if (err) {
      console.log('error getting ID:' + err);
      throw (err);
    } else {
      items[id] = text;
    
      var todoPath = path.join(exports.dataDir, `${id}.txt`);
      
      fs.writeFile(todoPath, text, (err) => {
        if(err) {
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
  var keys = Object.keys(items);
  var keysLength = keys.length;

  if (keysLength === 0) {
    return [];
  }

  var data = _.map(items, function(text, id) {
    return { id: id, text: id };

    // { '00001': { text: 'feed dog' }, '00002': {  text: 'buy food' }}
  });
    
  callback(null, data);
  
};

exports.readOne = (id, callback) => {
  var text = items[id];
  if (!text) {
    callback(new Error(`No item with id: ${id}`));
  } else {
    callback(null, { id, text });
  }
};

exports.update = (id, text, callback) => {
  var item = items[id];
  if (!item) {
    callback(new Error(`No item with id: ${id}`));
  } else {
    items[id] = text;
    callback(null, { id, text });
  }
};

exports.delete = (id, callback) => {
  var item = items[id];
  delete items[id];
  if (!item) {
    // report an error if item not found
    callback(new Error(`No item with id: ${id}`));
  } else {
    callback();
  }
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data'); // ${id}.text
// cruddyApp/datastore/data

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
