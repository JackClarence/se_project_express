const router = require("express").Router();
const auth = require("../middlewares/auth");
const {getClothingItems, createClothingItem, deleteClothingItem, likeItem, dislikeItem} = require("../controllers/clothingItems");
const {validateItemBody, validateID} = require("../middlewares/validation");

router.get("/", getClothingItems);

router.use(auth);

router.post("/", validateItemBody, createClothingItem);
router.delete("/:itemId", validateID, deleteClothingItem);
router.put("/:itemId/likes", validateID, likeItem);
router.delete("/:itemId/likes", validateID, dislikeItem);

module.exports = router;