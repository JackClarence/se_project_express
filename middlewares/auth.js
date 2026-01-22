const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../utils/config");
const UnauthorizedError = require("../errors/unauthorized-error");

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if ((req.method === "POST" && req.url === "/signin") || (req.method === "POST" && req.url === "/signup") || (req.method === "GET" && req.url === "/items")){
    next();
  } else {
    // console.log(authorization);
    if (!authorization || !authorization.startsWith("Bearer ")){
    next(new UnauthorizedError("Authorization required"));
    }

    const token = authorization.replace("Bearer ", "");
    let payload;

    try {
      payload = jwt.verify(token, JWT_SECRET);
      // console.log("Payload: ", payload);
    } catch (err) {
      next(new UnauthorizedError("Authorization required"));
    }
    req.user = payload;



    next();
  }
  return req.user;
};

