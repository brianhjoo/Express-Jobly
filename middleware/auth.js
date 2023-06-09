"use strict";

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");


/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers && req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      console.log("token: ", token);
      res.locals.user = jwt.verify(token, SECRET_KEY);
    }
    return next();
  } catch (err) {
    return next();
  }
}

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureLoggedIn(req, res, next) {
  if (!res.locals.user) throw new UnauthorizedError();
  return next();
}

/** Middleware to use when they must be logged in and an admin
 *
 * If not, raise Unauthorized.
 */

function ensureAdmin(req, res, next) {
  const user = res.locals.user;

  if (user && user.isAdmin === true) {
    return next();
  }

  throw new UnauthorizedError();
}

/** Middleware to use to check to see if they are logged in user
 * or is an admin.
 *
 * If not, raise Unauthorized
 */

function ensureLoggedInUserOrAdmin(req, res, next) {
  const loggedInUser = res.locals.user;
  const requestedUser = req.params.username;

  if ((loggedInUser.username === requestedUser) || loggedInUser.isAdmin === true) {
    return next();
  }

  throw new UnauthorizedError();
}



module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureAdmin,
  ensureLoggedInUserOrAdmin,
};
