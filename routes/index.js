const router = require("express").Router();
const { NOT_FOUND_STATUS_CODE } = require("../utils/errors");
const { loginUser, createUser } = require("../controllers/users");

const userRouter = require("./users");
const clothingItemRouter = require("./clothingItems");

router.use("/users", userRouter);
router.use("/items", clothingItemRouter);
router.post("/signin", loginUser);
router.post("/signup", createUser);
router.use((req, res) => {
  res.status(NOT_FOUND_STATUS_CODE)
    .send({ message: 'Requested resource not found'});
});

module.exports = router;