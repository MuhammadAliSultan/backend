import { Router } from "express";
import {
  registerUser,
  loginUser,
  logOutUser,
  refreshAccessToken,
  changeCurrentPassword,
  updateProfilePic,
  getCurrentUser,
  updateUserInfo,
  getProfilePic,
   findUserProfile,
   getUserById,
   getUAllUsers,
   blockUser,
   unblockUser,
   getBlockedUsers,
   checkIfBlocked
} from "../controllers/user.controller.js";

import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * Register User
 * Works with or without profilePic
 */
router.post(
  "/register",
  // Only use Multer if a file is provided
  (req, res, next) => {
    if (req.headers["content-type"]?.includes("multipart/form-data")) {
      return upload.fields([{ name: "profilePic", maxCount: 1 }])(req, res, next);
    }
    next();
  },
  registerUser
);

// Login
router.post("/login", loginUser);

// Logout
router.post("/logout", verifyJwt, logOutUser);

// Refresh access token
router.post("/refresh-token", refreshAccessToken);

// Update profile pic
router.patch("/update-profile-pic", verifyJwt, upload.single("profilePic"), updateProfilePic);

// Get current user
router.get("/current-user", verifyJwt, getCurrentUser);

// Update user info
router.patch("/update-user-info", verifyJwt, updateUserInfo);

// Change password
router.post("/change-current-password", verifyJwt, changeCurrentPassword);

// Get profile pic
router.get("/get-profile-pic", verifyJwt, getProfilePic);

router.get("/find-by-userName",verifyJwt,findUserProfile);

router.get("/all-users",verifyJwt,getUAllUsers);

// Block user
router.post("/block/:userId", verifyJwt, blockUser);

// Unblock user
router.post("/unblock/:userId", verifyJwt, unblockUser);

// Get blocked users
router.get("/blocked-users", verifyJwt, getBlockedUsers);

// Check if blocked
router.get("/check-blocked/:userId", verifyJwt, checkIfBlocked);

router.get("/:userId",verifyJwt,getUserById);

export default router;
