const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");

const app = express();
const PORT = 8080;
const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "randomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "randomID2"}
};
const users = {
  "randomID": {
    id: "randomID",
    email: "user@example.com",
    hashedPassword: bcrypt.hashSync("1234", 10)
  },
  "randomID2": {
    id: "randomID2",
    email: "user2@example.com",
    hashedPassword: bcrypt.hashSync("abcd", 10)
  }
};

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
const findUser = (email) => {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return false;
};

//returns the URLs where the userID is equal to the given id
const urlsForUser = (id) => {
  let result = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      result[url] = urlDatabase[url];
    }
  }
  return result;
};

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~SETUP~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

//Middware Declarations
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

//Template Engine Setup
app.set("view engine", "ejs");

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~PATHS~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
//GET

//HOME PAGE
app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/urls", (req, res) => {
  let userID = req.cookies["userID"];
  let userURLs = urlsForUser(userID);
  
  if (!userID) {
    res.redirect("/login");
    return;
  }

  const templateVars = {
    urls: userURLs,
    user: users[userID]
  };

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let userID = req.cookies["userID"];
  
  if (!userID) {
    res.redirect("/login");
    return;
  }
  
  const templateVars = { user: users[userID] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const userID = req.cookies["userID"];
  const shortURL = req.params.shortURL;

  if (!userID) {
    res.redirect("/login");
    return;
  }
  if (!urlDatabase[shortURL]) {
    return res.status(404).send("No such link exists.");
  }
  
  const longURL = urlDatabase[shortURL]["longURL"];

  const templateVars = {
    shortURL,
    longURL,
    user: users[userID]
  };
  res.render("urls_show", templateVars);
});

//redirect to longURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]["longURL"];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  let userID = req.cookies["userID"];
  const templateVars = { user: users[userID] };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  let userID = req.cookies["userID"];
  const templateVars = { user: users[userID] };
  res.render("login", templateVars);
});


//POST

//post requests coming from /new
app.post("/urls", (req, res) => {
  const userID = req.cookies["userID"];
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  //may need to check if the request is coming from a logged in user
  urlDatabase[shortURL] = {
    longURL,
    userID
  };

  res.redirect(`/urls/${shortURL}`);
});

app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let user = findUser(email);

  if (user.email !== email) {
    return res.status(403).send("Email or password is incorrect");
  }

  if (!bcrypt.compareSync(password, user.hashedPassword)) {
    return res.status(403).send("Incorrect password or email, please try again.");
  }

  res.cookie("userID", user.id);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("userID");
  res.redirect(`/urls`);
});

app.post("/urls/:shortURL", (req, res) => {
  const userID = req.cookies["userID"];
  const shortURL = req.params.shortURL;
  if (!urlsForUser(userID)[shortURL]) {
    res.redirect("/login");
    return;
  }
  urlDatabase[shortURL]["longURL"] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.cookies["userID"];
  const shortURL = req.params.shortURL;
  if (!urlsForUser(userID)[shortURL]) {
    res.redirect("/login");
    return;
  }

  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (!email || !password) {
    return res.status(400).send("Cannot register without email or password.");
  }

  if (findUser(email)) {
    return res.status(400).send("This email exists.");
  }

  users[id] = {
    id,
    email,
    hashedPassword
  };

  res.cookie("userID", id);
  res.redirect("/urls");
});


//LISTEN
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});