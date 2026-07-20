const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema(
    {
      googleId: {
        type: String,
      },
      email: {
        type: String,
        required: true,
        unique: true,
      },
      password: {
        type: String,
      },
      f_name: {
        type: String,
        required: true,
      },
      headline: {
        type: String,
      },
      profilePic: {
        type: String, // URL
        default: "",
      },
      cover_Pic: {
        type: String, // URL
        default: "",
      },
      curr_company: {
        type: String,
        default:"",
      },
      about:{
        type: String,
        default:"",
      },
      curr_location: {
        type: String,
      },
      skills: {
        type: [String],
        default: [],
      },
      experience: [
        {
          designation: {
            type: String,
          },
          companyName: {
            type: String,
          },
          duration: {
            type: String, // e.g. "Jan 2022 - Present"
          },
          location: {
            type: String,
          },
        },
      ],
      friends: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
      ],
      pending_Requests: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
      ],
      resume: {
        type: String, // URL or file path
        default:""
      },
    },
    { timestamps: true }
  );
  
  module.exports = mongoose.model("user", UserSchema);