import { AsyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/apiError.js"
import {User} from "../models/user.model.js"
import { uploaderOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { emitToRoom } from "../utils/socket.js";
import fs from 'fs'
import jwt from "jsonwebtoken"


const options={
    httpOnly:true,
    secure:false
  }

const generateAccessTokenAndRefreshTokens=async(userId)=>{
  try{
    const user = await User.findById(userId)
  
      const accessToken = await user.generateAccessToken();
      const refreshToken = await user.generateRefreshToken();
     user.refreshToken=refreshToken
     await user.save({validateBeforeSave:false})
     return {accessToken,refreshToken}

  }catch(error){
   throw new ApiError(500,error?.message||"someThing Went wrong")
  }
}







const registerUser = AsyncHandler(async (req, res) => {
  const { userName, email, password, fullName } = req.body;

  // Validate required fields
  if (!fullName || !email || !password || !userName) {
    throw new ApiError(400, "Kindly fill all the fields");
  }

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { userName }]
  });

  if (existingUser) {
    // Cleanup temp file if uploaded
    const profilePicLocalPath = req.files?.profilePic?.[0]?.path;
    if (profilePicLocalPath && fs.existsSync(profilePicLocalPath)) {
      fs.unlinkSync(profilePicLocalPath);
    }

    throw new ApiError(409, "User with email or username already exists");
  }

  // Handle profile picture upload
  const profilePicLocalPath = req.files?.profilePic?.[0]?.path;
  let pathProfilePic = "";

  if (profilePicLocalPath) {
    const uploaded = await uploaderOnCloudinary(profilePicLocalPath);

    pathProfilePic = uploaded|| "";
    // Remove local temp file
    if (fs.existsSync(profilePicLocalPath)) {
      fs.unlinkSync(profilePicLocalPath);
    }
  }

  // Create new user
  const user = await User.create({
    userName: userName.toLowerCase(),
    fullName,
    email,
    password,
    profilePic: pathProfilePic
  });


  // Return user without sensitive info
  const userConfirmation = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!userConfirmation) {
    throw new ApiError(500, "Something went wrong: User not found");
  }

  return res.status(201).json(
    new ApiResponse(200, userConfirmation, "User created successfully")
  );
});






const loginUser=AsyncHandler(async(req,res)=>{
  const {email,password}=req.body
  const isEmail = /\S+@\S+\.\S+/.test(email);
  if(!email){
    throw new ApiError(400,"Please enter your Email or Username")
   }
   let user;
  if(isEmail){
   user=await User.findOne({email});
  
  }
  else{
     user=await User.findOne({userName:email.toLowerCase()});
   
  }
   if(!user){
      throw new ApiError(400,"User not found")
      }
  const passwordVerification=await user.isPasswordCorrect(password)
  if(!passwordVerification){
    throw new ApiError(401,"Incorrect password")
    }
    
    
 const { accessToken, refreshToken } = await generateAccessTokenAndRefreshTokens(user._id);

  const loggedInUser=await User.findById(user._id).select(
    "-password -refreshToken"
  )

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )

});





const logOutUser=AsyncHandler(async(req,res)=>{
  await User.findByIdAndUpdate(req.user._id,
   { $unset:{refreshToken:1}},{new :true}
  )

return res.status(200)
.clearCookie("accessToken", options)
.clearCookie("refreshToken", options)
.json(new ApiResponse(200,{},"User Logged Out Successfully"));

});






const refreshAccessToken = AsyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized Request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(401, "Invalid refresh token");
    }

    const { accessToken, refreshToken } =
      await generateAccessTokenAndRefreshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(200, { accessToken, refreshToken }, "Access Token Refreshed")
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Unauthorized Request");
  }
});






const changeCurrentPassword=AsyncHandler(async(req,res)=>{
  const {oldPassword,newPassword,confirmPassword}=req.body
  if(newPassword!==confirmPassword){
    throw new ApiError(400,"Password and Confirm Password does not match")
  }
  const user=await User.findById(req.user._id)
  const passwordValidation=await user.isPasswordCorrect(oldPassword)
  if(!passwordValidation){
    throw new ApiError(400,"Old Password is incorrect")
  }
  user.password=newPassword
  await user.save(
    {
    validateBeforeSave:false
    }
  )
  return res.status(200)
  .json(new ApiResponse(200,{},"Password Changed Successfully"))
});






const updateUserInfo=AsyncHandler(async(req,res)=>{
  const {fullName,email}=req.body
  if(!fullName||!email){
    throw new ApiError(400,"Please fill all the fields")
  }
      const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email
            }
        },
        {new: true}
        
    ).select("-password")
    return res.status(200)
    .json(new ApiResponse(200,user,"User Info Updated Successfully"))
  
});




const getCurrentUser=AsyncHandler(async(req,res)=>{
  const user=await User.findById(req.user._id).select("-password")
  return res.status(200)
  .json(new ApiResponse(200,user,"User Found"))

});






const updateProfilePic=AsyncHandler(async(req,res)=>{
  const profilePicLocalPath=req.file.path



  if(!profilePicLocalPath){
    throw new ApiError(400,"Please Provide Avatar")
  }
  const profilePicImg= await uploaderOnCloudinary(profilePicLocalPath)

 if (!profilePicImg) {
    throw new ApiError(400, "Profile Pic Upload Failed");
}

  // Step 1: Unset the old value
await User.findByIdAndUpdate(req.user._id, {
  $unset: { profilePic: 1 }
});

// Step 2: Set the new value
const user = await User.findByIdAndUpdate(
  req.user._id,
  { $set: { profilePic: profilePicImg } },
  { new: true }
);


   return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Profile image updated successfully")
    )
});






const getProfilePic=AsyncHandler(async(req,res)=>{
  const user=await User.findById(req.user._id).select("-password")
  return res.status(200)
  .json(new ApiResponse(200,user.profilePic,"User Profile Pic Found"))

});


const findUserProfile=AsyncHandler(async(req,res)=>{
  const {userName}=req.body;
  const user=await User.findOne({userName}).select("-password")
  if(!user){
    return res.status(404).json(new ApiResponse(404,"User Not Found"))
    }
   return res.status(200)
  .json(new ApiResponse(200,user,"User Profile Found"))

});

const getUserById=AsyncHandler(async(req,res)=>{
  const {userId}=req.params;
  const user=await User.findById(userId).select("-password")
  if(!user){
    return res.status(404).json(new ApiResponse(404,"User Not Found"))
    }
   return res.status(200)
  .json(new ApiResponse(200,user,"User Profile Found"))

});

const getUAllUsers=AsyncHandler(async(req,res)=>{
  const users=await User.find({ _id: { $ne: req.user._id } });
    return res.status(200)
  .json(new ApiResponse(200,users,"All Users Fetched Successfully"))
});

const blockUser = AsyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  if (req.user._id.toString() === userId.toString()) {
    throw new ApiError(400, "You cannot block yourself");
  }

  const userToBlock = await User.findById(userId);
  if (!userToBlock) {
    throw new ApiError(404, "User not found");
  }

  const currentUser = await User.findById(req.user._id);
  if (currentUser.blockedUsers.includes(userId)) {
    throw new ApiError(400, "User is already blocked");
  }

  currentUser.blockedUsers.push(userId);
  await currentUser.save();

  // Emit socket event to notify the blocked user
  const roomId = [req.user._id.toString(), userId].sort().join('_');
  emitToRoom(roomId, "user_blocked", {
    blockedUserId: userId,
    blockedBy: req.user._id.toString(),
    message: "You have been blocked by this user. You cannot send messages."
  });

  return res.status(200).json(new ApiResponse(200, null, "User blocked successfully"));
});

const unblockUser = AsyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  const currentUser = await User.findById(req.user._id);
  if (!currentUser.blockedUsers.includes(userId)) {
    throw new ApiError(400, "User is not blocked");
  }

  currentUser.blockedUsers = currentUser.blockedUsers.filter(id => id.toString() !== userId.toString());
  await currentUser.save();

  return res.status(200).json(new ApiResponse(200, null, "User unblocked successfully"));
});

const getBlockedUsers = AsyncHandler(async (req, res) => {
  const currentUser = await User.findById(req.user._id).populate('blockedUsers', 'userName fullName profilePic');
  return res.status(200).json(new ApiResponse(200, currentUser.blockedUsers, "Blocked users fetched successfully"));
});

const checkIfBlocked = AsyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  const targetUser = await User.findById(userId);
  if (!targetUser) {
    throw new ApiError(404, "User not found");
  }

  const isBlocked = targetUser.blockedUsers.includes(req.user._id.toString());

  return res.status(200).json(new ApiResponse(200, { isBlocked }, "Block status checked successfully"));
});


export {
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
}
