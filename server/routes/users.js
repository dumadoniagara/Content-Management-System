var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const Users = require('../models/Users');
const rahasia = 'iniRahasiaYa';
// const x = 'coba';


/* GET users listing. */
router.get('/list', function (req, res) {
  let response = [];
  Users.find({})
    .then(result => {
      response = result.map(item=>{
        return{
          _id : item._id,
          email : item.email,
          password : item.password,
          token : item.token
        }
      })
      res.status(200).json(response);
    })
    .catch(err => {
      res.status(500).json({
        response
      });
    })
})

// ================= POST REGISTER ======================
router.post('/register', function (req, res, next) {
  let { email, password, retypepassword } = req.body;
  let response = {
    message: "",
    data: {},
    token: ""
  }
  if (password == retypepassword) {
    Users.findOne({ email })
      .then(result => {
        if (result) {
          response.message = 'Email already exist';
          console.log(response)
          return res.status(200).json(response);
        } else {
          var token = jwt.sign({ email: email }, rahasia);
          let user = new Users({
            email: email,
            password: password,
            token: token
          })
          user.save()
            .then(data => {
              response.message = "register success";
              response.data.email = email;
              response.token = token;
              res.status(201).json(response);
            })
            .catch(err => {
              console.log(err);
            })
            .catch(err => {
              res.status(500).json({
                error: err
              })
            })
        }
      })
      .catch(err => {
        res.status(500).json({
          error: true,
          message: "error Users find One"
        })
      })
  } else {
    response.message = "password doesn't match";
    res.status(500).json(response);
  }
});




// ================= POST LOGIN ======================
router.post('/login', function (req, res, next) {
  let { email, password } = req.body;
  let response = {
    message: "",
    data: {},
    token: ""
  }
  Users.findOne({ email })
    .then(data => {
      bcrypt.compare(password, data.password)
        .then(isPasswordTrue => {
          if (isPasswordTrue) {
            if (data.token) {
              response.token = data.token;
              response.data.email = email;
              response.message = "Login success!"
              res.status(201).json(response)
            } else {
              const newToken = jwt.sign({ email: data.email }, rahasia)
              Users.updateOne({ email: data.email }, { token: newToken })
                .then(() => {
                  response.token = newToken;
                  response.data.email = data.email;
                  response.message = "Login success!";
                  res.status(201).json(response);
                })
                .catch(err => {
                  response.message = "Update token failed"
                  res.status(200).json(response);
                })
            }
          } else {
            response.message = "Authentication failed";
            res.status(200).json(response);
          }
        })
        .catch(err => {
          response.message = "Authentication failed";
          res.status(500).json(response);
        })
    })
    .catch(err => {
      response.message = "Email doesn't exist"
      res.status(200).json(response);
    })
})

// ================= POST CHECK TOKEN ======================

router.post('/check', function (req, res, next) {
  let token = req.header('Authorization');
  let response = {
    valid: false
  };

  if (typeof token !== undefined) {
    const decoded = jwt.verify(token, rahasia);
    Users.find({ email: decoded.email })
      .then(result => {
        if (result) {
          response.valid = true;
          res.status(200).json(response);
        } else {
          res.status(500).json(response);
        }
      })
      .catch(err => {
        res.status(500).json(response);
      })
  } else {
    res.status(500).json(response);
  }
})

// ================= DESTROY TOKEN ======================
router.get('/logout', function (req, res) {
  let token = req.header('Authorization');
  let response = {
    logout: false
  }
  if (token) {
    const decoded = jwt.verify(token, rahasia);
    Users.findOneAndUpdate({ email: decoded.email }, { token: undefined })
      // .exec() // need a fully-fledged promise, use the .exec() function.
      .then(user => {
        if (user) {
          response.logout = true;
          res.status(200).json(response);
        }
        else {
          res.status(500).json(response);
        }
      })
  } else {
    res.status(500).json(response);
  }
})


module.exports = router;
