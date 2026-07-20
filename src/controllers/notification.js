const Notification = require("../models/notification");

// Get all notifications for logged-in user
const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const notifications = await Notification.find({
      receiver: userId,
    })
      .populate("sender", "f_name profilePic")
      .populate("postId")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Notifications fetched successfully",
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Failed to get notifications",
      error: error.message,
    });
  }
};

// Mark notification as read
const updateRead = async (req, res) => {
  try {
    const { id } = req.body;

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    if (notification.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    notification.isRead = true;
    await notification.save();

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Failed to update notification",
      error: error.message,
    });
  }
};

// Get unread notifications
const activeNotify = async (req, res) => {
  try {
    const userId = req.user._id;

    const activeNotifications = await Notification.find({
      receiver: userId,
      isRead: false,
    })
      .populate("sender", "f_name profilePic")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      totalActive: activeNotifications.length,
      notifications: activeNotifications,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Failed to get active notifications",
      error: error.message,
    });
  }
};

module.exports = {
  getNotifications,
  updateRead,
  activeNotify,
};