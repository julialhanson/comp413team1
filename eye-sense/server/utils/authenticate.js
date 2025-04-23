import jwt from "jsonwebtoken";

export const authenticateToken = (req, res, next) => {
  const token = req.cookies.token; // Access the token from the cookie

  if (!token) {
    return res.status(401).send("Access denied");
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send("Invalid token");
    }

    req.user = decoded; // Store the decoded user info in the request object
    console.log("req.user:", req.user)
    next();
  });
};
