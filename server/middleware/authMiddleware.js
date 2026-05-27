const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
  try {

    console.log("HEADERS:", req.headers);

    const authHeader = req.headers.authorization;

    console.log("AUTH HEADER:", authHeader);

    if (!authHeader) {
      return res.status(401).json({
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    console.log("TOKEN:", token);

    if (!token) {
      return res.status(401).json({
        message: "Invalid token",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    console.log("DECODED:", decoded);

    req.userId = decoded.id;

    next();

  } catch (error) {

    console.log("JWT ERROR:", error);

    res.status(401).json({
      message: "Unauthorized",
    });
  }
};

module.exports = authMiddleware;