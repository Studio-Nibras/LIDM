const jwt = require("jsonwebtoken");

const authenticateUser = (req, res, next) => {
  console.log("AUTH HEADER:");
  console.log(req.headers.authorization);
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authorization header is missing.",
      });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization format.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.decode(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Invalid token.",
      });
    }

    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (err) {
    console.error(err);

    return res.status(401).json({
      success: false,
      message: "Unauthorized.",
    });
  }
};

module.exports = authenticateUser;
