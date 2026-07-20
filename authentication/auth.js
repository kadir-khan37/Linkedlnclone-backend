const jwt = require("jsonwebtoken");
const User = require("../src/models/user");

exports.auth = async (req, res, next) => {
  try {
    // Get token from cookies OR Authorization header
    const authHeader = req.header("Authorization");

    const token =
      req.cookies.token || authHeader?.split(" ")[1];

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        error: "No token, authorization denied",
      });
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.SECRET_KEY || "somesecret"
    );

    // Find user from decoded token
    const user = await User.findById(decoded.userId).select("-password");

    // If user not found
    if (!user) {
      return res.status(401).json({
        error: "User not found",
      });
    }

    // Attach user to request
    req.user = user;

    next();
  } catch (err) {
    return res.status(401).json({
      error: "Invalid or expired token",
    });
  }
};