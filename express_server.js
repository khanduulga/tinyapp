const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const methodOverride = require("method-override");
const bcrypt = require("bcrypt");
const { generateRandomString, findUser, urlsForUser } = require("./helpers");

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

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~SETUP~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

//Middware Declarations
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: "session",
  keys: ["key1"],
  secret: "You will never crack this"
}));
// method override POST having ?_method=DELETE
app.use(methodOverride('_method'))

//Template Engine Setup
app.set("view engine", "ejs");

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~PATHS~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
//GET

//HOME PAGE
app.get("/", (req, res) => {
  const userID = req.session.user_id;

  if (!userID) {
    res.redirect("/login");
    return;
  }

  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  const userURLs = urlsForUser(userID, urlDatabase);
  
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
  const userID = req.session.user_id;
  
  if (!userID) {
    res.redirect("/login");
    return;
  }
  
  const templateVars = { user: users[userID] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const userID = req.session.user_id;
  const shortURL = req.params.shortURL;

  if (!userID) {
    res.redirect("/login");
    return;
  }
  if (!urlDatabase[shortURL]) {
    return res.status(404).send("No such link exists.");
  }
  if (!urlsForUser(userID, urlDatabase)[shortURL]) {
    return res.status(401).send("Access denied! Please login with appropriate account.");
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
  const shortURL = req.params.shortURL;

  if (!urlDatabase[shortURL]) {
    return res.status(404).send("No such link exists.");
  }

  const longURL = urlDatabase[req.params.shortURL]["longURL"];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const userID = req.session.user_id;

  if (userID) {
    res.redirect("/urls");
    return;
  }

  const templateVars = { user: users[userID] };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  const userID = req.session.user_id;

  if (userID) {
    res.redirect("/urls");
    return;
  }

  const templateVars = { user: users[userID] };
  res.render("login", templateVars);
});


//POST

//post requests coming from /new
app.post("/urls", (req, res) => {
  const userID = req.session.user_id;

  if (!userID) {
    return res.status(401).send("Access denied! Please login with appropriate account.");
  }

  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = {
    longURL,
    userID
  };

  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL", (req, res) => {
  const userID = req.session.user_id;
  const shortURL = req.params.shortURL;

  if (!userID) {
    return res.status(401).send("Access denied! Please login with appropriate account.");
  }

  if (!urlsForUser(userID, urlDatabase)[shortURL]) {
    return res.status(401).send("Access denied! Please login with appropriate account.");
  }

  urlDatabase[shortURL]["longURL"] = req.body.longURL;
  res.redirect("/urls");
});

//NEW RESTful path
app.delete("/urls/:shortURL", (req, res) => {
  const userID = req.session.user_id;
  const shortURL = req.params.shortURL;

  if (!userID) {
    return res.status(401).send("Access denied! Please login with appropriate account.");
  }

  if (!urlsForUser(userID, urlDatabase)[shortURL]) {
    return res.status(401).send("Access denied! Please login with appropriate account.");
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = findUser(email, users);

  if (user.email !== email || !bcrypt.compareSync(password, user.hashedPassword)) {
    return res.status(403).send("Incorrect password or email, please try again.");
  }

  req.session.user_id = user.id;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(`/urls`);
});


app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (!email || !password) {
    return res.status(400).send("Cannot register without email or password.");
  }

  if (findUser(email, users)) {
    return res.status(400).send("This email already exists.");
  }

  users[id] = {
    id,
    email,
    hashedPassword
  };

  req.session.user_id = id;
  res.redirect("/urls");
});


//LISTEN
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});