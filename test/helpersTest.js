const { assert } = require('chai');

const { findUser, urlsForUser } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};
const testDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "randomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "randomID2"}
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUser("user@example.com", testUsers)
    const expectedOutput = {
      id: "userRandomID",
      email: "user@example.com",
      password: "purple-monkey-dinosaur"
    };

    assert.isObject(user);
    assert.hasAllKeys(user, ["id", "email", "password"]);
    assert.deepEqual(user, expectedOutput);
  });

  it('should return false for a non-existent email', function() {
    const user = findUser("non-existent@example.com", testUsers)
    const expectedOutput = false;

    assert.equal(user, expectedOutput);
  });

});


describe('urlsForUser', function() {
  it('should return an empty object if no url exists for user_id', function() {
    const urls = urlsForUser("non-existentID", testDatabase)
    const expectedOutput = {};

    assert.deepEqual(urls, expectedOutput);
  });

  it('should return an object with urls that user made', function() {
    const urls = urlsForUser("randomID", testDatabase)
    const expectedOutput = {
      "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "randomID" }
    };

    assert.deepEqual(urls, expectedOutput);
  });

});