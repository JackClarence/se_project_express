const Item = require("../models/clothingItem");
const BadRequestError = require("../errors/bad-request-error");
const ForbiddenError = require("../errors/forbidden-error");
const NotFoundError = require("../errors/not-found-error");


const getClothingItems = (req, res, next) => {
  Item.find({})
    .then((items) => res.status(200).send(items))
    .catch((err) => {
      console.error(err);
      // return res.status(DEFAULT_ERROR_STATUS_CODE).send({ message: "An error has occurred on the server" });
      next(err);
    })
};

const createClothingItem = (req, res, next) => {
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
        // return res.status(VALIDATION_ERROR_STATUS_CODE).send({ message: "Invalid data" });
        next(new BadRequestError("The id string is in an invalid format"));
      }
      // return res.status(DEFAULT_ERROR_STATUS_CODE).send({ message: "An error has occurred on the server" });
      next(err);
    })
};

const deleteClothingItem = (req, res, next) => {
  const loggedUser = req.user._id;
  // console.log(loggedUser);
  Item.findById(req.params.itemId)
    .orFail()
    .then((item) => {
      const theOwner = item.owner.toString();
      return theOwner;
    }) .then((owner) => {
        if(loggedUser !== owner){
          next(new ForbiddenError("You must be authorized"));
        }
        Item.findByIdAndDelete(req.params.itemId)
          .orFail()
          .then((user) => res.status(200).send(user))
          .catch((err) => {
            console.error(err);
            if(err.name === "DocumentNotFoundError"){
              next(new NotFoundError("Item not found"));
            } if(err.name === "CastError"){
              next(new BadRequestError("Invalid data"));
            }
            next(err);
          })
        return owner;
    }).catch((err) => {
      console.error(err);
       if( err.name === "CastError"){
        next(new BadRequestError("Invalid data"));
      } if( err.name === "Forbidden"){
        next( new ForbiddenError("You must be authorized"));
      } if(err.name === "DocumentNotFoundError"){
        next( new NotFoundError("Item not found"));
      }
      next(err);
    })
};

const likeItem = (req, res, next) => {
  Item.findByIdAndUpdate(
    req.params.itemId,
    { $addToSet: {likes: req.user._id} },
    { new: true }
  ).orFail()
    .then((item) => res.status(200).send(item))
    .catch((err) => {
      console.error(err);
      if(err.name === "DocumentNotFoundError"){
        next( new NotFoundError("Item not found"));
      } if( err.name === "CastError"){
        next( new BadRequestError("Invalid data"));
      }
      next(err);
    })
};

const dislikeItem = (req, res, next) => {
  Item.findByIdAndUpdate(
    req.params.itemId,
    { $pull: { likes: req.user._id } },
    { new: true }
  ).orFail()
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      console.error(err);
      if(err.name === "DocumentNotFoundError"){
        next( new NotFoundError("Item not found"));
      } if( err.name === "CastError"){
        next( new BadRequestError("Invalid data"));
      }
      next(err);
    })
};

module.exports = {getClothingItems, createClothingItem, deleteClothingItem, likeItem, dislikeItem};