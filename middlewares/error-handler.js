

const errorHandler = (err, req, res, next) => {
  console.error(err);
  let statusCode;
  if(!err.statusCode){
    statusCode = 500;
  } else{
    ({ statusCode } = err);
  };
  res.status(statusCode).send({ message: err.message });
};

module.exports = errorHandler;