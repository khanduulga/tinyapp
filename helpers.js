/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~HELPER FUNCTIONS~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
//generates a random 6 character string
const generateRandomString = () => {
  let result = "";
  const possibleChar = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const possibleCharLength = possibleChar.length;
  for (let i = 0; i < 6; i++) {
    result += possibleChar[Math.floor(Math.random() * possibleCharLength)];
  }
  return result;
};

//finds user object from user dababase with email false if not
const findUser = (email, database) => {
  for (const user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return false;
};

//returns the URLs where the userID is equal to the given id
const urlsForUser = (id, database) => {
  let result = {};
  for (const url in database) {
    if (database[url].userID === id) {
      result[url] = database[url];
    }
  }
  return result;
};


module.exports = { generateRandomString, findUser, urlsForUser };