const router = require("express").Router();
const auth = require("../middlewares/auth");
const { getCurrentUser, updateUser } = require("../controllers/users");
const { validateUserUpdateBody } = require("../middlewares/validation");


router.use(auth);

router.get("/me", getCurrentUser);
router.patch("/me", validateUserUpdateBody, updateUser);

module.exports = router;