const jwt = require("jsonwebtoken");

const verifyUser = async (req, res, next) => {
  let token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: "auth token not present" });
  token = token.split(" ")[1];

  try {
    const payload = await jwt.verify(token, process.env.SECRET);
    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

const checkAdmin = async (req, res, next) => {
  // Assuming the user object is set in a previous middleware
  let token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: "auth token not present" });
  token = token.split(" ")[1];
  try {
    const payload = await jwt.verify(token, process.env.SECRET);
    console.log(payload);
    req.user = payload;
    const userType = req.user.userType;
    if (userType !== "admin") {
      return res.status(403).json({ error: "Access denied. Only admins are allowed." });
      
    }
    next();
  }
  catch(error){
    res.status(401).json({ error: error.message });
  }



};




module.exports = { verifyUser, checkAdmin };
