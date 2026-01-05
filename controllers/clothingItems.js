const Item = require("../models/clothingItem");
const { VALIDATION_ERROR_STATUS_CODE, NOT_FOUND_STATUS_CODE, DEFAULT_ERROR_STATUS_CODE, FORBIDDEN_ERROR_STATUS_CODE } = require("../utils/errors");

const getClothingItems = (req, res) => {
  Item.find({})
    .then((items) => res.status(200).send(items))
    .catch((err) => {
      console.error(err);
      return res.status(DEFAULT_ERROR_STATUS_CODE).send({ message: "An error has occurred on the server" });
    })
};

const createClothingItem = (req, res) => {
  const owner = req.user._id;
  const likes = [];
  const {name, weather, imageUrl} = req.body;

  Item.create({name, weather, imageUrl, owner, likes})
    .then((item) => {
      res.status(201).send(item);
    })
    .catch((err) => {
      console.error(err);
      if(err.name === "ValidationError"){
        return res.status(VALIDATION_ERROR_STATUS_CODE).send({ message: err.message });
      }
      return res.status(DEFAULT_ERROR_STATUS_CODE).send({ message: "An error has occurred on the server" });
    })
};

const deleteClothingItem = (req, res) => {
  const loggedUser = req.user._id;
  // console.log(loggedUser);
  Item.findById(req.params.itemId)
    .orFail()
    .then((item) => {
      const theOwner = item.owner.toString();
      return theOwner;
    }) .then((owner) => {
        if(loggedUser !== owner){
          return res.status(FORBIDDEN_ERROR_STATUS_CODE).send({ message: "You must be authorized" });
        }
        Item.findByIdAndDelete(req.params.itemId)
          .orFail()
          .then((user) => res.status(200).send(user))
          .catch((err) => {
            console.error(err);
            if(err.name === "DocumentNotFoundError"){
              return res.status(NOT_FOUND_STATUS_CODE).send({ message: err.message });
            } if(err.name === "CastError"){
              return res.status(VALIDATION_ERROR_STATUS_CODE).send({ message: err.message });
            }
            return res.status(DEFAULT_ERROR_STATUS_CODE).send({ message: "An error has occurred on the server" });
          })
        return owner;
    }).catch((err) => {
      console.error(err);
      if( err.name === "CastError"){
        return res.status(VALIDATION_ERROR_STATUS_CODE).send({ message: err.message });
      } if( err.name === "Forbidden"){
        return res.status(FORBIDDEN_ERROR_STATUS_CODE).send({ message: err.message });
      } if(err.name === "DocumentNotFoundError"){
        return res.status(NOT_FOUND_STATUS_CODE).send({ message: err.message });
      }
      return res.status(DEFAULT_ERROR_STATUS_CODE).send({ message: "An error has occurred on the server" });
    })
};

const likeItem = (req, res) => {
  Item.findByIdAndUpdate(
    req.params.itemId,
    { $addToSet: {likes: req.user._id} },
    { new: true }
  ).orFail()
    .then((item) => res.status(200).send(item))
    .catch((err) => {
      console.error(err);
      if(err.name === "DocumentNotFoundError"){
        return res.status(NOT_FOUND_STATUS_CODE).send({ message: err.message });
      } if( err.name === "CastError"){
        return res.status(VALIDATION_ERROR_STATUS_CODE).send({ message: err.message });
      }
      return res.status(DEFAULT_ERROR_STATUS_CODE).send({ message: "An error has occurred on the server" });
    })
};

const dislikeItem = (req, res) => {
  Item.findByIdAndUpdate(
    req.params.itemId,
    { $pull: { likes: req.user._id } },
    { new: true }
  ).orFail()
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      console.error(err);
      if(err.name === "DocumentNotFoundError"){
        return res.status(NOT_FOUND_STATUS_CODE).send({ message: err.message });
      } if( err.name === "CastError"){
        return res.status(VALIDATION_ERROR_STATUS_CODE).send({ message: err.message });
      }
      return res.status(DEFAULT_ERROR_STATUS_CODE).send({ message: "An error has occurred on the server" });
    })
};

module.exports = {getClothingItems, createClothingItem, deleteClothingItem, likeItem, dislikeItem};