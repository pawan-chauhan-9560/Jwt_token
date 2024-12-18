const jwt = require("jsonwebtoken");
const secret = "pawan@333";

const createToken = (user) => {
  const payload = {
    _id: user.id,
    email: user.email,
    role: user.role
  };
  return jwt.sign(payload, secret, { expiresIn: "1d" });
};

const verfiyToken = (token) => {
  if (!token) return null;
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
};

const restticteToLoggedInUser = (roles) => {
    return (req, res, next) => {
      try {
        const token = req.cookies.uid || req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).send({ msg: "Unauthorized" });
  
        // Verify the token
        const decoded = jwt.verify(token, secret);
        if (!roles.includes(decoded.role)) {
          return res.status(403).send({ msg: "Access forbidden: Insufficient permissions" });
        }
        req.user = decoded;
        next();
      } catch (error) {
        console.error("Authorization error:", error);
        return res.status(403).send({ msg: "Invalid or expired token" });
      }
    };
  };
  

module.exports = {
  restticteToLoggedInUser,
  createToken,
  verfiyToken,
};
