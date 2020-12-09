const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

//template engine setup
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//HOME PAGE
app.get("/", (req, res) => {
  res.send("Hello!");
});

//TEST WITH JSON STRING
// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

//TEST WITH HTML STRINGS
// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

//display urls database by sending to ejs template file
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});