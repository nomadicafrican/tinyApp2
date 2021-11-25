//HELPER FUNCTIONS//
const checkValidInput = (email, password) => {
  if (email === "" || password === "") {
    return false;
  }
  return true;
};
const getUserByEmail = (email, database) => {
  if (database) {
    for (const user in database) {
      if (email === database[user].email) {
        return database[user];
      }
    }
  }
  return undefined;
};

const urlsForUser = (id, database) => {
  const obj = {};
  for (const shortURL in database) {
    if (id === database[shortURL].userID) {
      obj[shortURL] = database[shortURL];
    }
  }
  // console.log("obj", obj);
  // console.log(urlDatabase);
  return obj;
};
function generateRandomString() {
  let array = [1, 2, 3, "a", "v", "n", "l", 0];
  let str = "";
  while (str.length < 8) {
    str += array[Math.floor(Math.random() * 8)];
  }
  return str;
}
//HELPER FUNCTIONS END

module.exports = {
  checkValidInput,
  urlsForUser,
  getUserByEmail,
  generateRandomString,
};
