const express = require("express");
const { url } = require("inspector");
const app = express();
const PORT = 8000;
const cookieParser = require("cookie-parser");
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(cookieParser());
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

//HELPER FUNCTIONS//
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

const urlsForUser = (id) => {
  const obj = {};
  for (const shortURL in urlDatabase) {
    if (id === urlDatabase[shortURL].userID) {
      obj[shortURL] = urlDatabase[shortURL];
    }
  }
  console.log("obj", obj);
  console.log(urlDatabase);
  return obj;
};
//HELPER FUNCTIONS END

app.post("/urls", (req, res) => {
  const shortURl = generateRandomString();
  const longURL = req.body.longURL;
  //const userId = req.session['user_id']
  // urlDatabase[shortURl] = longURL; // Log the POST request body to the console
  urlDatabase[shortURl] = { longURL, userID: req.cookies.user_id };
  //console.log(urlDatabase)
  res.redirect(`/urls/${shortURl}`); // Respond with 'Ok' (we will replace this)
});
app.get("/u/:shortURL", (req, res) => {
  // const longURL = req.body.longURL
  // res.redirect(longURL);
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  //console.log(shortURL, longURL)
  // console.log(req.body.longURL)
  res.redirect(longURL);
});
app.get("/urls", (req, res) => {
  const user = users[req.cookies.user_id];
  //console.log("urlDatabase", urlDatabase);
  // console.log(req.cookies)
  //console.log(username)
  //console.log(user, req.cookies.user_id);
  if (user) {
    const templateVars = { urls: urlsForUser(req.cookies.user_id), user };
    return res.render("urls_index", templateVars);
  }
  res.render("plslogin");
});

app.get("/urls/new", (req, res) => {
  const user_id = req.cookies["user_id"];
  //console.log("user_id", user_id);
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
    user: users[req.cookies.user_id],
  };
  res.render("urls_show", templateVars);
});
app.post("/urls/:shortURL/delete", (req, res) => {
  //console.log(req.params.shortURL)\
  //console.log("cookie", req.cookies.user_id);
  if (urlDatabase[req.params.shortURL].userID === req.cookies.user_id) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.status(401).send("not your URL");
  }
});
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  const currentUser = req.cookies.user_id;
  const user = users[currentUser];

  if (user.user_id === currentUser) {
    urlDatabase[shortURL].longURL = longURL;
    return res.redirect("/urls");
  }
  res.redirect("/login");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email);
  //console.log(users[user.id]);
  if (!user) {
    res.status(403).send("Email does not exist");
  }
  if (!bcrypt.compareSync(password, users[user.id].password)) {
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
  if (!strings) {
    return res.status(403).send("Pls enter valid information");
  }
  const user = getUserByEmail(email);

  if (user) {
    return res.status(403).send("pls enter new email");
  }
  const hashedPassword = bcrypt.hashSync(password, 10);
  //console.log("hashhed pass", hashedPassword);

  users[id] = { id, email, password: hashedPassword };
  res.cookie("user_id", id);
  res.redirect("/urls");

  res.render("plslogin");
});
app.get("/login", (req, res) => {
  const templateVars = { user: null };
  res.render("urls_login", templateVars);
});
