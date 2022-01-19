const express = require("express");

const { url } = require("inspector");

const app = express();

const PORT = 8080;

const cookieSession = require("cookie-session");

app.set("view engine", "ejs");

const bodyParser = require("body-parser");

const {
  checkValidInput,
  urlsForUser,
  getUserByEmail,
  generateRandomString,
} = require("./helpers");

app.use(
  cookieSession({
    name: "session",
    keys: ["anything"],

    maxAge: 24 * 60 * 60 * 1000,
  })
);

const bcrypt = require("bcryptjs");

const { match } = require("assert");

app.use(bodyParser.urlencoded({ extended: true }));

const morgan = require("morgan");

app.use(morgan("dev"));

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

app.get("/urls", (req, res) => {
  const user = users[req.session.user_id];
  if (user) {
    const templateVars = {
      urls: urlsForUser(req.session.user_id, urlDatabase),
      user: user,
    };
    res.render("urls_index", templateVars);
  } else {
    res.render("plslogin");
  }
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const currentUser = req.session.user_id;
  if (!currentUser) {
    res.redirect("/register");
  }
  const longURL = urlDatabase[shortURL].longURL;
  if (!longURL) {
    return res.status(404).send("URL does not exist");
  }
  if (!longURL.startsWith("http")) {
    res.redirect("http://" + longURL);
  } else {
    res.redirect(longURL);
  }
});

app.get("/urls/new", (req, res) => {
  const user_id = req.session.user_id;

  if (!user_id) {
    return res.redirect("/urls");
  }
  const user = users[user_id];
  const templateVars = { user };
  res.render("urls_new", templateVars);
});

app.get("/", (req, res) => {
  res.render("plslogin");
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
  const userID = req.session.user_id;
  if (!userID) {
    res.redirect("/");
  }
  const longURL = urlDatabase[req.params.shortURL].longURL;
  const userUrls = urlsForUser(userID, urlDatabase);
  const templateVars = {
    urlDatabase,
    longURL,
    userUrls,
    shortURL: req.params.shortURL,
    user: users[userID],
  };

  if (urlDatabase[req.params.shortURL].userID !== userID) {
    res.send("Please try again!!");
  } else {
    res.render("urls_show", templateVars);
  }
});

app.get("/register", (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  if (req.session.user_id) {
    res.redirect("/urls");
  }
  res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  }
  const templateVars = { user: users[req.session.user_id] };
  res.render("urls_login", templateVars);
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
  const currentUser = req.session.user_id;
  if (!currentUser) {
    res.redirect("/login");
  }
  if (currentUser && currentUser === urlDatabase[shortURL].userID) {
    urlDatabase[shortURL].longURL = req.body.longURL;
    res.redirect("/urls");
  } else {
    const error = "Please login.";
    res.send(error);
  }
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
  req.session = null; // deletes cookies from browser
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(); // uses function generateRandomString to give random string.
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = { longURL: longURL, userID: req.session.user_id };
  res.redirect(`/urls`);
});

app.post("/register", (req, res) => {
  const email = req.body.email; // the email typed in by user
  const password = req.body.password; // the password typed in by user
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
});
