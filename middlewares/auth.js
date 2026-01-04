const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../utils/config");
const { UNAUTHORIZED_ERROR_STATUS_CODE } = require("../utils/errors");

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if ((req.method === "POST" && req.url === "/signin") || (req.method === "POST" && req.url === "/signup") || (req.method === "GET" && req.url === "/items")){
    next();
  } else {
    //console.log(authorization);
    if (!authorization || !authorization.startsWith("Bearer ")){
    return res.status(UNAUTHORIZED_ERROR_STATUS_CODE).send({ message: "Authorization required" });
    }

    const token = authorization.replace("Bearer ", "");
    let payload;

    try {
      payload = jwt.verify(token, JWT_SECRET);
      //console.log("Payload: ", payload);
    } catch (err) {
      return res.status(UNAUTHORIZED_ERROR_STATUS_CODE).send({ message: "Authorization required" });
    }
    req.user = payload;

    next();
  }
};

