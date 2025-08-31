// middlewares/auth.middleware.js
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { AsyncHandler } from "../utils/asyncHandler.js";

export const verifyJwt = AsyncHandler(async (req, res, next) => {
//  console.log("Retrieving token...");
  const token =
    req.cookies?.accessToken ||
    (req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null);

  //console.log("Token retrieved:", token);
  if (!token) {
    throw new ApiError(401, "Access token missing");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw new ApiError(401, "Access token expired");
    }
    throw new ApiError(401, "Invalid access token");
  }

  const user = await User.findById(decoded._id).select("-password -refreshToken");
  if (!user) {
    throw new ApiError(401, "User not found or token invalid");
  }

  req.user = user;
  next();
});
