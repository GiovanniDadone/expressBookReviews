const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();
const SECRET_KEY = "your_secret_key"; // Replace with an environment variable in production

app.use(express.json());

// Session setup
app.use("/customer", session({
    secret: "fingerprint_customer", // Secret used to sign the session ID cookie
    resave: true, // Forces the session to be saved back to the session store
    saveUninitialized: true // Forces a session that is new but not modified to be saved to the store
}));

// Authentication middleware
app.use("/customer/auth/*", function auth(req, res, next) {
  // Get token from request headers
  const token = req.headers['authorization']?.split(" ")[1]; // "Bearer <token>"

  if (!token) {
    return res.status(403).json({ message: "Access denied, no token provided." });
  }

  // Verify the token
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token." });
    }

    // Attach user info to request (optional, based on your requirements)
    req.user = decoded;
    next();
  });
});

// Example login route for generating JWT
app.post('/login', (req, res) => {
  // Dummy user for testing; replace with your actual user authentication logic
  const user = { id: 1 }; // Assume a user object with an ID
  const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1h' });
  res.json({ token });
});

const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running on port", PORT));
