const bcrypt = require("bcryptjs");
const User = require("../models/user");
const Notification = require("../models/notification");
const Conversation = require("../models/conversation");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const cookieOptions = {
  httpOnly: true,
  secure: false,
  sameSite: "lax",
};


// ================= GOOGLE LOGIN =================
const loginThroughGmail = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        message: "Token is required",
      });
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, given_name, email_verified } = payload;

    if (!email_verified) {
      return res.status(400).json({
        message: "Email not verified",
      });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        email,
        f_name: given_name,
        password: null,
      });
    }

    const webtoken = jwt.sign(
      { userId: user._id },
      process.env.SECRET_KEY || "somesecret",
      { expiresIn: "7d" }
    );

    res.cookie("token", webtoken, cookieOptions);

    res.status(200).json({
      message: "Login through Gmail successful",
      token: webtoken,
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Google login failed",
      error: error.message,
    });
  }
};


// ================= REGISTER =================
const register = async (req, res) => {
  try {
    const {
      email,
      password,
      f_name,
      headline,
      curr_company,
      curr_location,
      profilePic,
      cover_Pic,
      about,
      skills,
    } = req.body;

    if (!email || !password || !f_name) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      f_name,
      headline: headline || "",
      curr_company: curr_company || "",
      curr_location: curr_location || "",
      profilePic: profilePic || "",
      cover_Pic: cover_Pic || "",
      about: about || "",
      skills: skills || [],
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};


// ================= LOGIN =================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.SECRET_KEY || "somesecret",
      { expiresIn: "7d" }
    );

    res.cookie("token", token, cookieOptions);

    res.status(200).json({
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


// ================= UPDATE USER =================
const updateUser = async (req, res) => {
  try {
    const isExist = await User.findById(req.user._id);

    if (!isExist) {
      return res.status(404).json({
        message: "User not exist",
      });
    }

    const updateData = await User.findByIdAndUpdate(
      req.user._id,
      req.body,
      { new: true }
    );

    return res.status(200).json({
      message: "User updated successfully",
      user: updateData,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


// ================= GET PROFILE =================
const getProfileById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "User profile fetched successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


// ================= LOGOUT =================
const logout = async (req, res) => {
  try {
    res.cookie("token", "", {
      maxAge: 0,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    return res.status(200).json({
      message: "Logout successful",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


// ================= SEARCH USER =================
const findUser = async (req, res) => {
  try {
    const { search } = req.query;

    const users = await User.find({
      $or: [
        { f_name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    }).select("-password");

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ================= SEND FRIEND REQUEST =================
const sendFriendRequest = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { userId } = req.query;

    if (senderId.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: "You cannot send request to yourself",
      });
    }

    const sender = await User.findById(senderId);
    const receiver = await User.findById(userId);

    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (receiver.friends.includes(senderId)) {
      return res.status(400).json({
        success: false,
        message: "Already connected",
      });
    }

    if (receiver.pending_Requests.includes(senderId)) {
      return res.status(400).json({
        success: false,
        message: "Friend request already sent",
      });
    }

    receiver.pending_Requests.push(senderId);
    await receiver.save();

    await Notification.create({
      sender: senderId,
      receiver: userId,
      content: `${sender.f_name} sent you a friend request`,
      type: "friendRequest",
    });

    res.status(200).json({
      success: true,
      message: "Friend request sent successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ================= ACCEPT FRIEND REQUEST =================
const acceptFriendRequest = async (req, res) => {
  try {
    const receiverId = req.user._id;
    const { senderId } = req.query;

    const receiver = await User.findById(receiverId);
    const sender = await User.findById(senderId);

    if (!receiver || !sender) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!receiver.pending_Requests.includes(senderId)) {
      return res.status(400).json({
        success: false,
        message: "No pending request found",
      });
    }

    // Remove pending request
    receiver.pending_Requests = receiver.pending_Requests.filter(
      (id) => id.toString() !== senderId
    );

    // Add both users as friends
    if (!receiver.friends.includes(senderId)) {
      receiver.friends.push(senderId);
    }

    if (!sender.friends.includes(receiverId)) {
      sender.friends.push(receiverId);
    }

    await receiver.save();
    await sender.save();

    // Create conversation automatically
    let conversation = await Conversation.findOne({
      members: { $all: [receiverId, senderId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        members: [receiverId, senderId],
      });
    }

    // Delete old notification
    await Notification.findOneAndDelete({
      sender: senderId,
      receiver: receiverId,
      type: "friendRequest",
    });

    // Create new notification
    await Notification.create({
      sender: receiverId,
      receiver: senderId,
      content: `${receiver.f_name} accepted your friend request`,
      type: "friendRequest",
    });

    return res.status(200).json({
      success: true,
      message: "Friend request accepted successfully",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= FRIENDS LIST =================
const getFriendsList = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "friends",
      "-password"
    );

    res.status(200).json({
      success: true,
      friends: user.friends,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ================= PENDING REQUESTS =================
const getPendingRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "pending_Requests",
      "-password"
    );

    res.status(200).json({
      success: true,
      pendingRequests: user.pending_Requests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ================= REMOVE FRIEND =================
const removeFriend = async (req, res) => {
  try {
    const userId = req.user._id;
    const { friendId } = req.query;

    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    user.friends = user.friends.filter(
      (id) => id.toString() !== friendId
    );

    friend.friends = friend.friends.filter(
      (id) => id.toString() !== userId.toString()
    );

    await user.save();
    await friend.save();

    res.status(200).json({
      success: true,
      message: "Friend removed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


module.exports = {
  register,
  login,
  loginThroughGmail,
  updateUser,
  getProfileById,
  logout,
  sendFriendRequest,
  findUser,
  acceptFriendRequest,
  getFriendsList,
  getPendingRequests,
  removeFriend,
};