const User = require("../models/user");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const {VALIDATION_ERROR_STATUS_CODE, NOT_FOUND_STATUS_CODE, DEFAULT_ERROR_STATUS_CODE, CONFLICT_ERROR_STATUS_CODE, UNAUTHORIZED_ERROR_STATUS_CODE} = require("../utils/errors");
const {JWT_SECRET} = require("../utils/config");

const getCurrentUser = (req, res) => {
  console.log(req.user);
  User.findOne({ _id: req.user._id })
    .orFail()
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      console.error(err);
      if (err.name === "DocumentNotFoundError"){
        return res.status(NOT_FOUND_STATUS_CODE).send({ message: err.message });
      } if( err.name === "CastError"){
        return res.status(VALIDATION_ERROR_STATUS_CODE).send({ message: err.message });
      }
      return res.status(DEFAULT_ERROR_STATUS_CODE).send({ message: err.message });
    })
};

const createUser = (req, res) => {
  const { name, avatar, email, password } = req.body;

  bcrypt.hash(password, 8)
  .then(hash => User.create({ name, avatar, email, password: hash }))
    .then((user) => {
      const safeUser = user.toObject();
      delete safeUser.password;
      res.status(201).send(safeUser);
    })
    .catch((err) => {
      console.error(err);
      if(err.name === "ValidationError"){
        return res.status(VALIDATION_ERROR_STATUS_CODE).send({ message: err.message });
      } if(err.name === "MongoServerError"){
        return res.status(CONFLICT_ERROR_STATUS_CODE).send({ message: err.message });
      }
      return res.status(DEFAULT_ERROR_STATUS_CODE).send({ message: err.message });
    })
};

const updateUser = (req, res) => {
  const { name, avatar } = req.body;

  User.findOneAndUpdate({ _id: req.user._id }, { name, avatar }, { new: true, runValidators: true })
    .orFail()
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      console.error(err);
      if(err.name === "DocumentNotFoundError"){
        return res.status(NOT_FOUND_STATUS_CODE).send({ message: err.message });
      } if(err.name === "ValidationError"){
        return res.status(VALIDATION_ERROR_STATUS_CODE).send({ message: err.message });
      }
      return res.status(DEFAULT_ERROR_STATUS_CODE).send({ message: err.message });
    })
};

const loginUser = (req, res) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });
      res.status(200).send({token});
      //console.log({token});
      return token;
    })
    .catch((err) => {
      console.log(err.message);
      if(err.name === "Error"){
        return res.status(VALIDATION_ERROR_STATUS_CODE).send({ message: err.message });
      } if(err.message === "Incorrect email or password"){
        return res.status(UNAUTHORIZED_ERROR_STATUS_CODE).send({ message: err.message });
      }
      return res.status(DEFAULT_ERROR_STATUS_CODE).send({ message: err.message });
    });
};

module.exports = { createUser, getCurrentUser, loginUser, updateUser };