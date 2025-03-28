const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    // Lấy token từ header, cookie, v.v.
    // Ví dụ token nằm trong header 'Authorization: Bearer <token>'
    const authHeader = req.headers["authorization"] || "";
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Verify
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Gắn user vào request
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }
};
