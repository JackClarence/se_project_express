const router = require("express").Router();
const NotFoundError = require("../errors/not-found-error");
const { loginUser, createUser } = require("../controllers/users");
const { validateUserInfoBody, validateLoginBody } = require("../middlewares/validation");

const userRouter = require("./users");
const clothingItemRouter = require("./clothingItems");

router.use("/users", userRouter);
router.use("/items", clothingItemRouter);
router.post("/signin", validateLoginBody, loginUser);
router.post("/signup", validateUserInfoBody, createUser);
router.use((next) => {
  next(new NotFoundError("Requested resource not found"));
});

module.exports = router;