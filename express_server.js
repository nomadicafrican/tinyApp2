const express = require('express');
const { url } = require('inspector');
const app = express();
const PORT = 8080;
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
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
  console.log(generateRandomString())
  console.log(req.body);  // Log the POST request body to the console
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
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
  const templateVars = { shortURL: req.params.shortURL, longURL: req.params.longURL };
  res.render("urls_show", templateVars);
});