const expect = require('chai').expect;
const fs = require('fs');
const path = require('path');

const counter = require('../datastore/counter.js');
const todos = require('../datastore/index.js');

const initializeTestFiles = () => {
  counter.counterFile = path.join(__dirname, './counterTest.txt');
  todos.dataDir = path.join(__dirname, 'testData');
  todos.initialize();
};

const initializeTestCounter = (id = '') => {
  fs.writeFileSync(counter.counterFile, id);
};

const cleanTestDatastore = () => {
  fs.readdirSync(todos.dataDir).forEach(
    todo => fs.unlinkSync(path.join(todos.dataDir, todo))
  );
};

describe('getNextUniqueId', () => {
  before(initializeTestFiles);
  beforeEach(initializeTestCounter);
  beforeEach(cleanTestDatastore);

  it('should use error first callback pattern', (done) => {
    counter.getNextUniqueId((err, id) => {
      expect(err).to.be.null;
      expect(id).to.exist;
      done();
    });
  });

  it('should give an id as a zero padded string', (done) => {
    counter.getNextUniqueId((err, id) => {
      expect(id).to.be.a.string;
      expect(id).to.match(/^0/);
      done();
    });
  });

  it('should give the next id based on the count in the file', (done) => {
    fs.writeFileSync(counter.counterFile, '00025');
    counter.getNextUniqueId((err, id) => {
      expect(id).to.equal('00026');
      done();
    });
  });

  it('should update the counter file with the next value', (done) => {
    fs.writeFileSync(counter.counterFile, '00371');
    counter.getNextUniqueId((err, id) => {
      const counterFileContents = fs.readFileSync(counter.counterFile).toString();
      expect(counterFileContents).to.equal('00372');
      done();
    });
  });

});

describe('todos', () => {
  before(initializeTestFiles);
  beforeEach(initializeTestCounter);
  beforeEach(cleanTestDatastore);

  describe('create', () => {
    it('should create a new file for each todo', (done) => {
      todos.create('todo1', (err, data) => {
        const todoCount = fs.readdirSync(todos.dataDir).length;
        expect(todoCount).to.equal(1);
        todos.create('todo2', (err, data) => {
          expect(fs.readdirSync(todos.dataDir)).to.have.lengthOf(2);
          done();
        });
      });
    });

    it('should use the generated unique id as the filename', (done) => {
      fs.writeFileSync(counter.counterFile, '00142');
      todos.create('buy fireworks', (err, todo) => {
        const todoExists = fs.existsSync(path.join(todos.dataDir, '00143.txt'));
        expect(todoExists).to.be.true;
        done();
      });
    });

    it('should only save todo text contents in file', (done) => {
      const todoText = 'walk the dog';
      todos.create(todoText, (err, todo) => {
        const todoFileContents = fs.readFileSync(path.join(todos.dataDir, `${todo.id}.txt`)).toString();
        expect(todoFileContents).to.equal(todoText);
        done();
      });
    });

    it('should pass a todo object to the callback on success', (done) => {
      const todoText = 'refactor callbacks to promises';
      todos.create(todoText, (err, todo) => {
        expect(todo).to.include({ text: todoText });
        expect(todo).to.have.property('id');
        done();
      });
    });
  });

  describe('readAll', () => {
    it('should return an empty array when there are no todos', (done) => {
      todos.readAll((err, todoList) => {
        expect(err).to.be.null;
        expect(todoList.length).to.equal(0);
        done();
      });
    });

    // Refactor this test when completing `readAll`
    it('should return an array with all saved todos', (done) => {
      const todo1text = 'todo 1';
      const todo2text = 'todo 2';
      const expectedTodoList = [{ id: '00001', text: '00001' }, { id: '00002', text: '00002' }];
      todos.create(todo1text, (err, todo) => {
        todos.create(todo2text, (err, todo) => {
          todos.readAll((err, todoList) => {
            expect(todoList).to.have.lengthOf(2);
            expect(todoList).to.deep.include.members(expectedTodoList, 'NOTE: Text field should use the Id initially');
            done();
          });
        });
      });
    });

  });

  describe('readOne', () => {
    it('should return an error for non-existant todo', (done) => {
      todos.readOne('notAnId', (err, todo) => {
        expect(err).to.exist;
        done();
      });
    });

    it('should find a todo by id', (done) => {
      const todoText = 'buy chocolate';
      todos.create(todoText, (err, createdTodo) => {
        const id = createdTodo.id;
        todos.readOne(id, (err, readTodo) => {
          expect(readTodo).to.deep.equal({ id, text: todoText });
          done();
        });
      });
    });
  });

  describe('update', () => {
    beforeEach((done) => {
      todos.create('original todo', done);
    });

    it('should not change the counter', (done) => {
      todos.update('00001', 'updated todo', (err, todo) => {
        const counterFileContents = fs.readFileSync(counter.counterFile).toString();
        expect(counterFileContents).to.equal('00001');
        done();
      });
    });

    it('should update the todo text for existing todo', (done) => {
      const todoId = '00001';
      const updatedTodoText = 'updated todo';
      todos.update(todoId, updatedTodoText, (err, todo) => {
        const todoFileContents = fs.readFileSync(path.join(todos.dataDir, `${todoId}.txt`)).toString();
        expect(todoFileContents).to.equal(updatedTodoText);
        done();
      });
    });

    it('should not create a new todo for non-existant id', (done) => {
      const initalTodoCount = fs.readdirSync(todos.dataDir).length;
      todos.update('00017', 'bad id', (err, todo) => {
        const currentTodoCount = fs.readdirSync(todos.dataDir).length;
        expect(currentTodoCount).to.equal(initalTodoCount);
        expect(err).to.exist;
        done();
      });
    });
  });

  describe('delete', () => {
    beforeEach((done) => {
      todos.create('delete this todo', done);
    });

    it('should not change the counter', (done) => {
      todos.delete('00001', (err) => {
        const counterFileContents = fs.readFileSync(counter.counterFile).toString();
        expect(counterFileContents).to.equal('00001');
        done();
      });
    });

    it('should delete todo file by id', (done) => {
      todos.delete('00001', (err) => {
        const todoExists = fs.existsSync(path.join(todos.dataDir, '00001.txt'));
        expect(todoExists).to.be.false;
        done();
      });
    });

    it('should return an error for non-existant id', (done) => {
      const initalTodoCount = fs.readdirSync(todos.dataDir).length;
      todos.delete('07829', (err) => {
        const currentTodoCount = fs.readdirSync(todos.dataDir).length;
        expect(currentTodoCount).to.equal(initalTodoCount);
        expect(err).to.exist;
        done();
      });
    });
  });

});