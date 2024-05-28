require('dotenv').config();
var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const secretKeyEnv = process.env.SECRET_KEY;
const expiresInEnv = process.env.TOKEN_EXPIRATION;

const authorize = (req, res, next) => {
  const authorization = req.headers.authorization;
  let token = null;
  const secretKey = "Fiorentina"; 

  // retrieve token
  if (authorization && authorization.split(" ").length === 2) {
      token = authorization.split(" ")[1];
  } else {
      res.status(401).json({ error: true, message: "Unauthorized user" });
      return;
  }

  // verify JWT and check expiration date
  try {
      const decoded = jwt.verify(token, secretKeyEnv);
      if (decoded.exp < Math.floor(Date.now() / 1000)) {
          res.status(401).json({ error: true, message: "Token has expired!" });
          return;
      }
      // Attach user info to the request object
      req.user = decoded;
      next();
  } catch (e) {
      res.status(401).json({ error: true, message: "Token is not valid!" });
  }
};

// Register user
router.post("/register", async function(req, res, next) {
  const { email, password, displayname, dateofbirth, gender } = req.body;

  if (!email || !password || !displayname || !dateofbirth || !gender) {
    return res.status(400).json({
      error: true,
      message: "some data is missing"
    });
  }

  try {
    const users = await req.db.from("users").select("*").where("email", "=", email);
    
    if (users.length > 0) {
      return res.status(409).json({
        error: true,
        message: "User already exists"
      });
    }

    // Insert user into DB
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    await req.db.from("users").insert({ password: hash, displayname, dateofbirth, gender, email});

    res.status(201).json({ success: true, message: "User created" });
  } catch (err) {
    console.error("Database error: ", err);
    res.status(500).json({ error: true, message: "Database error", details: err.message });
  }
});

// Login 
router.post("/login", async function(req, res, next) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: true,
      message: "Email or password is missing"
    });
  }

  try {
    const users = await req.db.from("users").select("*").where("email", "=", email);

    if (users.length === 0) {
      return res.status(404).json({
        error: true,
        message: "User not found"
      });
    }

    const user = users[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({
        error: true,
        message: "Passwords do not match"
      });
    }

    // Create and return JWT token
    const exp = Math.floor(Date.now() / 1000) + parseInt(expiresInEnv);
    const token = jwt.sign({ email: user.email, userId: user.id, exp }, secretKeyEnv);

    res.json({ token_type: "Bearer", token, expires_in: exp, user: { id: user.id, email: user.email, displayname: user.displayname } });
  } catch (err) {
    console.error("Database error: ", err);
    res.status(500).json({ error: true, message: "Database error", details: err.message });
  }
});

//module.exports = router;
module.exports = { router, authorize };





/* GET users listing. */
router.get('/' , async (req, res) => {
  try {
    const users = await req.db.from("user").select("displayname", "email");
    res.json({ error: false, users });
  } catch (error) {
    res.json({ error: true, message: error });
  }
});



module.exports = router;
