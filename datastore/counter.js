const fs = require('fs');
const path = require('path');
const sprintf = require('sprintf-js').sprintf;

var counter = 0;

// Private helper functions ////////////////////////////////////////////////////

// Zero padded numbers can only be represented as strings.
// If you don't know what a zero-padded number is, read the
// Wikipedia entry on Leading Zeros and check out some of code links:
// https://www.google.com/search?q=what+is+a+zero+padded+number%3F

const zeroPaddedNumber = (num) => {
  return sprintf('%05d', num);
};

const readCounter = (callback) => {
  fs.readFile(exports.counterFile, (err, fileData) => {
    if (err) {
      callback(null, 0);
    } else {
      callback(null, Number(fileData));
    }
  });
};

const writeCounter = (count, callback) => {
  var counterString = zeroPaddedNumber(count);
  fs.writeFile(exports.counterFile, counterString, (err) => {
    if (err) {
      throw ('error writing counter');
    } else {
      callback(null, counterString);
    }
  });
};


// it('should use error first callback pattern', (done) => {
//   counter.getNextUniqueId((err, id) => {
//     expect(err).to.be.null;
//     expect(id).to.exist;
//     done();
//   });
// });

// Public API - Fix this function //////////////////////////////////////////////

exports.getNextUniqueId = (callback) => {
  readCounter((err, counter) => {
    if (err) {
      // callback(err, undefined)
      callback(err, counter);
    } else {
      writeCounter( counter + 1, (err, counterString) => {
        if (err) {
          throw err;
        } else {
          callback(null, counterString);
        }
      });
    }
  });
};





//get counter from file
//add to it
//send it back

// Configuration -- DO NOT MODIFY //////////////////////////////////////////////

exports.counterFile = path.join(__dirname, 'counter.txt');




// readCounter((err, counter) => {
//   if(err) {
//     // console.log('- - - - - - - - - - - - - - - - - - - - - - - - - - - - readCounter error: ', err);
//     console.log(err)
//     throw err;
//   } else {
//     counter = counter + 1;
//     // console.log('- - - - - - - - - - - - - - - - - - - - - - - - - - - - counter is: ', counter)

//     writeCounter(counter, (err, counter) => {
//       if(err) {
//         // console.log('- - - - - - - - - - - - - - - - - - - - - - - - - - - - writeCounter error: ', err)
//         console.log(err);
//         throw err;
//       } else {
//         // console.log("- - - - - - - - - - - - - - - - - - - - - - - - - - - - writeCounter is done")
//        var id =  zeroPaddedNumber(counter);
//        callback(error, id)
//         // console.log('- - - - - - - - - - - - - - - - - - - - - - - - - - - - counter is: ', counter)
//       }
//     })
//   }
// })

// //get counter from file
// //add to it
// //send it back
