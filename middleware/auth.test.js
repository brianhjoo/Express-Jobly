"use strict";

const jwt = require("jsonwebtoken");
const { UnauthorizedError } = require("../expressError");
const {
  authenticateJWT,
  ensureLoggedIn,
  ensureAdmin,
  ensureLoggedInUserOrAdmin,
} = require("./auth");


const { SECRET_KEY } = require("../config");
const testJwt = jwt.sign({ username: "test", isAdmin: false }, SECRET_KEY);
const badJwt = jwt.sign({ username: "test", isAdmin: false }, "wrong");
const testAdminJwt = jwt.sign({ username: "testAdmin", isAdmin: true }, SECRET_KEY);

function next(err) {
  if (err) throw new Error("Got error from middleware");
}

describe("authenticateJWT", function () {
  test("works: via header", function () {
    const req = { headers: { authorization: `Bearer ${testJwt}` } };
    const res = { locals: {} };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({
      user: {
        iat: expect.any(Number),
        username: "test",
        isAdmin: false,
      },
    });
  });

  test("works: no header", function () {
    const req = {};
    const res = { locals: {} };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({});
  });

  test("works: invalid token", function () {
    const req = { headers: { authorization: `Bearer ${badJwt}` } };
    const res = { locals: {} };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({});
  });
});


describe("ensureLoggedIn", function () {
  test("works", function () {
    const req = {};
    const res = { locals: { user: { username: "test" } } };
    ensureLoggedIn(req, res, next);
  });

  test("unauth if no login", function () {
    const req = {};
    const res = { locals: {} };
    expect(() => ensureLoggedIn(req, res, next)).toThrowError();
  });
});

describe("ensureAdmin", function () {
  test("works", function () {
    const req = { headers: { authorization: `Bearer ${testAdminJwt}` } };
    const res = { locals: { user: { username: "testAdmin", isAdmin: true }}}
    ensureAdmin(req, res, next);
  });

  test("unauth if no login", function () {
    const req = {};
    const res = { locals: {} };
    expect(() => ensureAdmin(req, res, next)).toThrowError();
  });

})


describe("ensureLoggedInUserOrAdmin", function () {
  test("works for admin", function () {
    const req = { params: { authorization: `Bearer ${testAdminJwt}` } };
    const res = { locals: { user: { username: "testAdmin", isAdmin: true }}}
    ensureLoggedInUserOrAdmin(req, res, next);
  });

  test("works for logged in user", function () {
    const req = { params: { authorization: `Bearer ${testJwt}` } };
    const res = { locals: { user: { username: "test", isAdmin: false }}}
    ensureLoggedInUserOrAdmin(req, res, next);
  });

  test("unauth if no login", function () {
    const req = {};
    const res = { locals: {} };
    expect(() => ensureLoggedInUserOrAdmin(req, res, next)).toThrowError();
  });
})
