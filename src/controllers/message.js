const Conversation = require("../models/conversation");
const Message = require("../models/message");
const User = require("../models/user");

exports.sendMessage = async (req,res)=>{
  try{
    const senderId = req.user._id;
    const { receiverId, message, picture } = req.body;

    const sender = await User.findById(senderId);

    if(!sender.friends.includes(receiverId)){
      return res.status(403).json({
        message:"You can only message friends"
      });
    }

    let conversation = await Conversation.findOne({
      members: { $all:[senderId,receiverId] }
    });

    if(!conversation){
      conversation = await Conversation.create({
        members:[senderId,receiverId]
      });
    }

    const newMessage = await Message.create({
      conversation: conversation._id,
      sender: senderId,
      message,
      picture
    });

    res.status(201).json(newMessage);

  }catch(err){
    res.status(500).json({
      message: err.message
    });
  }
};

exports.getConversations = async (req,res)=>{
    try{
      const userId = req.user._id;
  
      const conversations = await Conversation.find({
        members:userId
      }).populate("members","f_name profilePic headline");
  
      res.status(200).json(conversations);
  
    }catch(err){
      res.status(500).json({
        message: err.message
      });
    }
  };

  exports.getMessages = async (req,res)=>{
    try{
      const { conversationId } = req.params;
  
      const messages = await Message.find({
        conversation: conversationId
      }).populate("sender","f_name profilePic");
      res.status(200).json(messages);
  
    }catch(err){
      res.status(500).json({
        message: err.message
      });
    }
  };