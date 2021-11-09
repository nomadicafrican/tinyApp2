const express = require('express');
const { url } = require('inspector');
const app = express();
const PORT = 8000;
const cookieParser = require('cookie-parser')
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(cookieParser());
const { match } = require('assert');
app.use(bodyParser.urlencoded({extended: true}));
const urlDatabase = { 
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': "http://www.google.com"
};
function generateRandomString() {
let array = [1,2,3,'a','v','n','l',0]
let str = ''
while (str.length < 6){
  str += array[Math.floor(Math.random() * 6)]
}
return str
}
app.post("/urls", (req, res) => {
  //console.log('i got here')
  //console.log(generateRandomString())
  //console.log(req.body); 
  const shortURl = generateRandomString()
  const longURL = req.body.longURL
  //const userId = req.session['user_id']
  urlDatabase[shortURl] =  longURL //userId: userId  // Log the POST request body to the console
  console.log(urlDatabase)
  res.redirect(`/urls/${shortURl}`);         // Respond with 'Ok' (we will replace this)
});
app.get("/u/:shortURL", (req, res) => {
  // const longURL = req.body.longURL
  // res.redirect(longURL);
  const shortURL = req.params.shortURL
  const longURL = urlDatabase[shortURL]
  console.log(shortURL, longURL)
  // console.log(req.body.longURL)
  res.redirect(longURL)
});
app.get("/urls", (req, res) => {
  const username = req.cookies['username']
  console.log(req.cookies)
  console.log(username)
  const templateVars = { urls: urlDatabase , username };
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
app.get('/', (req,res)=>{ 
  res.send("hello")
});
app.listen(PORT,()=>{
  console.log(`Example app listening on port ${PORT}`)
})

app.get('/urls.json',(req,res)=>{
  res.json(urlDatabase)
  
})
app.get('/hello',(req,res)=>{
  res.send('<html><body> Hello <b> World </b> </body></html>\n')
})
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});
app.post('/urls/:shortURL/delete', (req,res)=>{
  console.log(req.params.shortURL)
delete urlDatabase[req.params.shortURL]
res.redirect('/urls')
})
app.post('/urls/:shortURL',(req,res)=>{
  const shortURL = req.params.shortURL
  const longURL = req.body.longURL
  urlDatabase[shortURL] = longURL
  res.redirect('/urls')
})
app.post('/login' ,(req,res) =>{
res.cookie('username', req.body.username)
res.redirect('/urls')
})
app.post('/logout',(req,res)=>{
  res.clearCookie('username')
  res.redirect('/urls')
})