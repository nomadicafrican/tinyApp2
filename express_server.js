const express = require("express");

const { url } = require("inspector");

const app = express();

const PORT = 8000;

const cookieSession = require("cookie-session");

app.set("view engine", "ejs");

const bodyParser = require("body-parser");

const { checkValidInput, urlsForUser, getUserByEmail } = require("./helpers");

app.use(
  cookieSession({
    name: "session",
    keys: ["anything"],

    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);

const bcrypt = require("bcryptjs");

const { match } = require("assert");

app.use(bodyParser.urlencoded({ extended: true }));

const morgan = require("morgan");

app.use(morgan("dev"));

function generateRandomString() {
  let array = [1, 2, 3, "a", "v", "n", "l", 0];
  let str = "";
  while (str.length < 6) {
    str += array[Math.floor(Math.random() * 6)];
  }
  return str;
}

// DATABASES//
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

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
//DATABASES//

// THE ACTUAL CODE//
app.post("/urls", (req, res) => {
  const shortURl = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURl] = { longURL, userID: req.session.user_id };
  res.redirect(`/urls/${shortURl}`);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

app.get("/urls", (req, res) => {
  const user = users[req.session.user_id];
  if (user) {
    const templateVars = {
      urls: urlsForUser(req.session.user_id, urlDatabase),
      user,
    };
    return res.render("urls_index", templateVars);
  }
  res.render("plslogin");
});

app.get("/urls/new", (req, res) => {
  const user_id = req.session["user_id"];

  if (!user_id) {
    return res.redirect("/urls");
  }
  const user = users[user_id];
  const templateVars = { user };
  res.render("urls_new", templateVars);
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
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.session.user_id],
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (urlDatabase[req.params.shortURL].userID === req.session.user_id) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.status(401).send("not your URL");
  }
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  const currentUser = req.session.user_id;
  const user = users[currentUser];

  if (user.id === currentUser) {
    urlDatabase[shortURL].longURL = longURL;
    return res.redirect("/urls");
  }
  res.redirect("/login");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);

  if (!user) {
    res.status(403).send("Email does not exist");
  }
  if (!bcrypt.compareSync(password, users[user.id].password)) {
    res.status(403).send("wrong password");
  }
  req.session.user_id = user.id;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session.user_id = null;
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

  if (!strings) {
    return res.status(403).send("Pls enter valid information");
  }
  const user = getUserByEmail(email, users);

  if (user) {
    return res.status(403).send("pls enter new email");
  }
  const hashedPassword = bcrypt.hashSync(password, 10);

  users[id] = { id, email, password: hashedPassword };
  req.session.user_id = id;
  res.redirect("/urls");

  res.render("plslogin");
});

app.get("/login", (req, res) => {
  const templateVars = { user: null };
  res.render("urls_login", templateVars);
});
