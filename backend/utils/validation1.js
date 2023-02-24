const { validationResult } = require('express-validator');
const handleValidationErrors1 = (req, _res, next) => {
    const validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) {
      const errors = {};
      validationErrors
        .array()
        .forEach(error => errors[error.param] = error.msg);

      const err = Error("Validation Error");
      err.errors = errors;
      err.status = 400;
      err.title = "Validation Error";
      next(err);
    }
    next();
  };

  const handleValidationErrors2 = (req, _res, next) => {
    const validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) {
      const errors = {};
      validationErrors
        .array()
        .forEach(error => errors[error.param] = error.msg);

      const err = Error("Spot couldn't be found");
      err.errors = errors;
      err.status = 404;
      err.title = "Spot couldn't be found";
      next(err);
    }
    next();
  };
  const handleValidationErrors4 = (req, _res, next) => {
    const validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) {
      const errors = {};
      validationErrors
        .array()
        .forEach(error => errors[error.param] = error.msg);

      const err = Error("Validation error");
      err.errors = errors;
      err.status = 404;
      err.title = "Couldn't find a Review with the specified id";
      next(err);
    }
    next();
  };

  const handleValidationErrors3 = (req, _res, next) => {
    const validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) {
      const errors = {};
      validationErrors
        .array()
        .forEach(error => errors[error.param] = error.msg);

      const err = Error("Validation error");
      err.errors = errors;
      err.status = 400;
      err.title = "Validation error";
      next(err);
    }
    next();
  };


  module.exports = {
    handleValidationErrors1,
    handleValidationErrors2,
    handleValidationErrors3,
    handleValidationErrors4
  };
