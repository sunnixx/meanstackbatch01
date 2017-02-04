const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const monk = require('monk');
const multer = require('multer');
const bcrypt = require('bcrypt-nodejs')

const app = express();
const upload = multer({dest: 'uploads/'})
var user = '';

//Database Established
var url = 'localhost:27017/meanstack';
var db = monk(url);
var collection = db.get('document');

//Middleware
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//Template Engine
//app.set('views',__dirname + '/views');
app.set('view engine','ejs');

//Routes
app.get('/',function(req,res){
  res.render('index',{user:user});
})

app.get('/login',function(req,res){
  res.render('login',{err:''});
});

app.post('/login',function(req,res,next){
  //Fetch Username and password
  collection.findOne({name: req.body.username}).then((docs) => {
    //Compare password
    bcrypt.compare(req.body.password, docs.password, function(err, response){
      if(err) return next(err);

      if(response == true){
        user = req.body.username;
        res.redirect('/');
      }else{
        res.render('login',{err: 'Username or password is incorrect'});
      }
    });
  }).catch((err) => {
    res.send(err);
  });
});

app.get('/signup',function(req,res){
  res.render('signup');
});

app.post('/signup',upload.single('avatar'),function(req,res,next){
  //Fetch password and Encrypt
  var pass = req.body.password;
  bcrypt.hash(pass, null, null, function(err, hash){
    if(err) return next(err);

    //Database insert
    collection.insert([{
      name: req.body.username,
      password: hash,
      path: req.file.path
    }]).catch((err) => {
      console.log('The error is: ' + err);
    }).then(() => {
      res.redirect('/login');
    });
  });
});

//Database Connection
db.then(() => {
  console.log('Our database is currently running');
}).catch((err) => {
  console.log('The error is: ' + err);
});

//Server Connection
app.listen(3000, function(req,res){
  console.log('The server is running on port 3000');
});
