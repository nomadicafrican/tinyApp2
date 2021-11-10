const express = require("express");
const { url } = require("inspector");
const app = express();
const PORT = 8000;
const cookieParser = require("cookie-parser");
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(cookieParser());
const { match } = require("assert");
app.use(bodyParser.urlencoded({ extended: true }));
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};
function generateRandomString() {
  let array = [1, 2, 3, "a", "v", "n", "l", 0];
  let str = "";
  while (str.length < 6) {
    str += array[Math.floor(Math.random() * 6)];
  }
  return str;
}

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};
const checkValidInput = (email, password) => {
  if (email === "" || password === "") {
    return false;
  }
  return true;
};
const getUserByEmail = (email) => {
  for (const user in users) {
    //console.log(user);
    if (email === users[user].email) {
      return users[user];
    }
  }
  return null;
};

const checkPassword = (user, password) => {
  return user.password === password;
};

app.post("/urls", (req, res) => {
  //console.log('i got here')
  //console.log(generateRandomString())
  //console.log(req.body);
  const shortURl = generateRandomString();
  const longURL = req.body.longURL;
  //const userId = req.session['user_id']
  urlDatabase[shortURl] = longURL; //userId: userId  // Log the POST request body to the console
  //console.log(urlDatabase)
  res.redirect(`/urls/${shortURl}`); // Respond with 'Ok' (we will replace this)
});
app.get("/u/:shortURL", (req, res) => {
  // const longURL = req.body.longURL
  // res.redirect(longURL);
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  //console.log(shortURL, longURL)
  // console.log(req.body.longURL)
  res.redirect(longURL);
});
app.get("/urls", (req, res) => {
  const user = users[req.cookies.user_id];
  // console.log(req.cookies)
  //console.log(username)
  const templateVars = { urls: urlDatabase, user };
  res.render("urls_index", templateVars);
});
app.get("/new", (req, res) => {
  const templateVars = { user: users[req.cookies.user_id] };
  res.render("urls_new");
});
app.get("/", (req, res) => {
  res.send("hello");
});
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body> Hello <b> World </b> </body></html>\n");
});
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies.user_id],
  };
  res.render("urls_show", templateVars);
});
app.post("/urls/:shortURL/delete", (req, res) => {
  //console.log(req.params.shortURL)
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email);
  if (!user) {
    res.status(403).send("Email does not exist");
  }
  const checkThePassword = checkPassword(user, password);
  if (!checkThePassword) {
    res.status(403).send("wrong password");
  }
  res.cookie("user_id", user.id);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});
app.get("/register", (req, res) => {
  const templateVars = { user: null };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const id = generateRandomString();
  const strings = checkValidInput(email, password);
  //console.log(email, password)
  //console.log(strings)
  if (!strings) {
    return res.status(403).send("Pls enter valid information");
  }
  const user = getUserByEmail(email);
  //console.log(user)
  if (user) {
    return res.status(403).send("pls enter new email");
  }
  users[id] = { id, email, password };
  res.cookie("user_id", id);
  res.redirect("/urls");
});
app.get("/login", (req, res) => {
  const templateVars = { user: null };
  res.render("urls_login", templateVars);
});
