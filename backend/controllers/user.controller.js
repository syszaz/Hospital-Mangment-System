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
      return res
        .status(400)
        .json({ message: "name or email are required" });
    }

    const updateFields = {};
    if (name) updateFields.name = name;
    if (email) updateFields.email = email;

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
    const user = await User.findById(id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};
