const Item = require("../models/clothingItem");
const {VALIDATION_ERROR_STATUS_CODE, NOT_FOUND_STATUS_CODE, DEFAULT_ERROR_STATUS_CODE} = require("../utils/errors");

const getClothingItems = (req, res) => {
  Item.find({})
    .then((items) => res.status(200).send(items))
    .catch((err) => {
      console.error(err);
      if(err.name === "DocumentNotFoundError"){
        return res.status(NOT_FOUND_STATUS_CODE).send({ message: err.message });
      }
      return res.status(DEFAULT_ERROR_STATUS_CODE).send({ message: err.message });
    })
};

const createClothingItem = (req, res) => {
  const owner = req.user._id;
  const likes = [];
  const {name, weather, imageUrl} = req.body;

  //triggers validation error, says requires "likes"
  Item.create({name, weather, imageUrl, owner, likes})
    .then((item) => {
      res.status(201).send(item);
      console.log(item);
    })
    .catch((err) => {
      console.error(err);
      if(err.name === "ValidationError"){
        return res.status(VALIDATION_ERROR_STATUS_CODE).send({ message: err.message });
      }
      return res.status(DEFAULT_ERROR_STATUS_CODE).send({ message: err.message });
    })
};

const deleteClothingItem = (req, res) => {


  Item.findByIdAndDelete(req.params.itemId)
    .orFail()
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      console.error(err);
      if(err.name === "DocumentNotFoundError"){
        return res.status(NOT_FOUND_STATUS_CODE).send({ message: err.message });
      } else if( err.name === "CastError"){
        return res.status(VALIDATION_ERROR_STATUS_CODE).send({ message: err.message });
      }
      return res.status(DEFAULT_ERROR_STATUS_CODE).send({ message: err.message });
    })
};

const likeItem = (req, res) => {
  Item.findByIdAndUpdate(
    req.params.itemId,
    { $addToSet: {likes: req.user._id} },
    { new: true }
  ).orFail()
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      console.error(err);
      if(err.name === "DocumentNotFoundError"){
        return res.status(NOT_FOUND_STATUS_CODE).send({ message: err.message });
      } else if( err.name === "CastError"){
        return res.status(VALIDATION_ERROR_STATUS_CODE).send({ message: err.message });
      }
      return res.status(DEFAULT_ERROR_STATUS_CODE).send({ message: err.message });
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
      } else if( err.name === "CastError"){
        return res.status(VALIDATION_ERROR_STATUS_CODE).send({ message: err.message });
      }
      return res.status(DEFAULT_ERROR_STATUS_CODE).send({ message: err.message });
    })
};

module.exports = {getClothingItems, createClothingItem, deleteClothingItem, likeItem, dislikeItem};