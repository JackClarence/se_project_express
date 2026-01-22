const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const UnauthorizedError = require("../errors/unauthorized-error");
const ConflictError = require("../errors/conflict-error");
const NotFoundError = require("../errors/not-found-error");
const BadRequestError = require("../errors/bad-request-error");
const {JWT_SECRET} = require("../utils/config");

const getCurrentUser = (req, res, next) => {
  User.findOne({ _id: req.user._id })
    .orFail()
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      console.error(err);
      if (err.name === "DocumentNotFoundError"){
        next(new NotFoundError("User not found"));
      } if( err.name === "CastError"){
        next(new BadRequestError("Invalid data"));
      }
      next(err);
    })
};

const createUser = (req, res, next) => {
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
        next(new BadRequestError("Invalid data"));
      } if(err.name === "MongoServerError"){
        next(new ConflictError("There has been a conflict"));
      }
      next(err);
    })
};

const updateUser = (req, res, next) => {
  const { name, avatar } = req.body;

  User.findOneAndUpdate({ _id: req.user._id }, { name, avatar }, { new: true, runValidators: true })
    .orFail()
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      console.error(err);
      if(err.name === "DocumentNotFoundError"){
        next(new NotFoundError("User not found"));
      } if(err.name === "ValidationError"){
        next(new BadRequestError("Invalid data"));
      }
      next(err);
    })
};

const loginUser = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });
      res.status(200).send({token});
      return token;
    })
    .catch((err) => {
      if(err.name === "Error"){
        next(new BadRequestError("Invalid data"));
      } if(err.message === "Incorrect email or password"){
        next(new UnauthorizedError("You must be authorized"));
      }
      next(err);
    });
};

module.exports = { createUser, getCurrentUser, loginUser, updateUser };