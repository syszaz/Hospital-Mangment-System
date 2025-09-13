import { Doctor } from "../models/Doctor.js";
import { User } from "../models/User.js";

// update user
export const updateUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const { name, email } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "user profile not found" });
    }

    if (!name || !email) {
      return res.status(400).json({ message: "name or email are required" });
    }

    const updateFields = {};
    if (name) updateFields.name = name;
    if (email) updateFields.email = email;

    if (userId !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this user" });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateFields, {
      new: true,
    });

    res.status(200).json({
      message: "user updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// profile by email
export const userProfileByEmail = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ message: "User not found" });

    let doctorProfile = null;
    if (user.role === "doctor") {
      doctorProfile = await Doctor.findOne({ user: user._id });
    }

    res.status(200).json({
      user,
      ...(doctorProfile && { doctorProfile }),
    });
  } catch (error) {
    next(error);
  }
};

