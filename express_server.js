const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = 8080; 
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
const users = { 
  "randomID": {
    id: "randomID", 
    email: "user@example.com", 
    password: "1234"
  },
 "randomID2": {
    id: "randomID2", 
    email: "user2@example.com", 
    password: "abcd"
  }
}

//helper function for generating a random 6 character string
const generateRandomString = () => {
  let result = "";
  const possibleChar = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const possibleCharLength = possibleChar.length;
  for (i = 0; i < 6; i++) {
    result += possibleChar[Math.floor(Math.random() * possibleCharLength)];
  }
  return result;
}

//helper function for finding user with email
const findUser = (email) => {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return false;
}

//Middware Declarations
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

//Template Engine Setup
app.set("view engine", "ejs");

//HOME PAGE
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  let userID = req.cookies["userID"];
  const templateVars = {
    urls: urlDatabase,
    user: users[userID]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let userID = req.cookies["userID"];
  const templateVars = { user: users[userID] }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let userID = req.cookies["userID"];
  const templateVars = { 
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[userID]
  };
  res.render("urls_show", templateVars);
});

//redirect to longURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  let userID = req.cookies["userID"];
  const templateVars = { user: users[userID] };
  res.render("register", templateVars);
});

//NEW LOGIN PAGE
app.get("/login", (req, res) => {
  let userID = req.cookies["userID"];
  const templateVars = { user: users[userID] };
  res.render("login", templateVars);
});

//post requests coming from /new
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);       
});

app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let user = findUser(email);

  if (user.email !== email) {
    return res.status(403).send("Email or password is incorrect")
  } 
  if (user.password !== password) {
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
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL]
  res.redirect("/urls");
});

//IN WORKS
app.post("/register", (req, res) => {
  let id = generateRandomString();
  let email = req.body.email;
  let password = req.body.password;

  if (!email || !password) {
    return res.status(400).send("Cannot register without email or password.")
  }

  if (findUser(email)) {
    return res.status(400).send("This email exists.")
  }

  users[id] = {
    id,
    email,
    password
  }

  res.cookie("userID", id);
  res.redirect("/urls");
})


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});