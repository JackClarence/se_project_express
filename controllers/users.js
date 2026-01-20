const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const UnauthorizedError = require("../middlewares/errors/unauthorized-error");
const ConflictError = require("../middlewares/errors/conflict-error");
const NotFoundError = require("../middlewares/errors/not-found-error");
const BadRequestError = require("../middlewares/errors/bad-request-error");
const {JWT_SECRET} = require("../utils/config");

const getCurrentUser = (req, res, next) => {
  // console.log(req.user);
  User.findOne({ _id: req.user._id })
    .orFail()
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      console.error(err);
      if (err.name === "DocumentNotFoundError"){
        // return res.status(NOT_FOUND_STATUS_CODE).send({ message: "User not found" });
        next(new NotFoundError("User not found"));
      } if( err.name === "CastError"){
        // return res.status(VALIDATION_ERROR_STATUS_CODE).send({ message: "Invalid data" });
        next(new BadRequestError("Invalid data"));
      }
      // return res.status(DEFAULT_ERROR_STATUS_CODE).send({ message: "An error has occurred on the server" });
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
        // return res.status(VALIDATION_ERROR_STATUS_CODE).send({ message: "Invalid data" });
        next(new BadRequestError("Invalid data"));
      } if(err.name === "MongoServerError"){
        // return res.status(CONFLICT_ERROR_STATUS_CODE).send({ message: "There has been a conflict" });
        next(new ConflictError("There has been a conflict"));
      }
      // return res.status(DEFAULT_ERROR_STATUS_CODE).send({ message: "An error has occurred on the server" });
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
        // return res.status(NOT_FOUND_STATUS_CODE).send({ message: "User not found" });
        next(new NotFoundError("User not found"));
      } if(err.name === "ValidationError"){
        // return res.status(VALIDATION_ERROR_STATUS_CODE).send({ message: "Invalid data" });
        next(new BadRequestError("Invalid data"));
      }
      // return res.status(DEFAULT_ERROR_STATUS_CODE).send({ message: "An error has occurred on the server" });
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
      // console.log({token});
      return token;
    })
    .catch((err) => {
      // console.log(err.message);
      if(err.name === "Error"){
        // return res.status(VALIDATION_ERROR_STATUS_CODE).send({ message: "Invalid data" });
        next(new BadRequestError("Invalid data"));
      } if(err.message === "Incorrect email or password"){
        // return res.status(UNAUTHORIZED_ERROR_STATUS_CODE).send({ message: "You must be authorized" });
        next(new UnauthorizedError("You must be authorized"));
      }
      // return res.status(DEFAULT_ERROR_STATUS_CODE).send({ message: "An error has occurred on the server" });
      next(err);
    });
};

module.exports = { createUser, getCurrentUser, loginUser, updateUser };