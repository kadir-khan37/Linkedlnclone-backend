const express = require("express");
const router = express.Router();

const { auth } = require("../../authentication/auth");
const{findUser} = require("../controllers/user");
const{sendFriendRequest} = require("../controllers/user")
const{getFriendsList} = require("../controllers/user")
const{getPendingRequests} = require("../controllers/user")
const{removeFriend} = require("../controllers/user")
const{acceptFriendRequest} = require("../controllers/user");

const {
  register,
  login,
  loginThroughGmail,
  updateUser,
  getProfileById,
  logout
} = require("../controllers/user");

// AUTH ROUTES
router.post("/register", register);

router.post("/login", login);

router.post("/google-login", loginThroughGmail);

// update user
router.put("/update", auth, updateUser);

// get profile by id
router.get("/profile/:id", getProfileById);

// logout
router.get("/logout", auth, logout);

// current logged in user
router.get("/me", auth, (req, res) => {
  res.json({
    user: req.user,
  });
});

router.get('/finduser',auth,findUser)
router.post("/send-request", auth, sendFriendRequest);
router.post("/accept-request", auth, acceptFriendRequest);
router.get("/friends-list", auth, getFriendsList);
router.get("/pending-requests", auth, getPendingRequests);
router.delete("/remove-friend", auth, removeFriend);

module.exports = router;