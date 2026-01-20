

const errorHandler = (err, req, res, next) => {
  console.error(err);
  if(!err.statusCode){
    err.statusCode = 500;
  };
  res.status(err.statusCode).send({ message: err.message });
};

module.exports = errorHandler;