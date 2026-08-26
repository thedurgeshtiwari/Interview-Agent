import jwt from "jsonwebtoken";

const isAuth = async (req, res, next) => {
  try {
    const token =
      req.cookies?.token ||
      req.headers?.authorization?.replace(/^Bearer\s+/i, "") ||
      req.headers?.["x-access-token"];

    if (!token) {
      return res.status(401).json({ message: "No authentication token provided" });
    }

    const verifyToken = jwt.verify(token, process.env.JWT_SECRET);
    if (!verifyToken || !verifyToken.userId) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    req.userId = verifyToken.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: `Authentication error: ${error.message}` });
  }
};

export default isAuth;