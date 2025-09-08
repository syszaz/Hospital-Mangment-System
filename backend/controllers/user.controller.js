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

// profile
export const userProfile = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      success: true,
      message: "User profile fetched successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};
