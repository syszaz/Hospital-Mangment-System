import { User } from "../models/User.js";
import { generateToken } from "../utils/token.js";
import bcrypt from "bcrypt";
import { Patient } from "../models/Patient.js";
import { Doctor } from "../models/Doctor.js";

// signup
export const SignUpUser = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword, role, phone } = req.body;
    if (!name || !email || !password || !confirmPassword || !phone) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characterbrunos",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords does not match",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      phone: req.body.phone || "",
    });

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

// signin
export const SignInUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password || email.length <= 0) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characterbrunos",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: `user with this email ${email} not found`,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = generateToken(user);

    let hasProfile = false;
    let isApproved = false;
    if (user.role === "patient") {
      const profile = await Patient.findOne({ user: user._id });
      hasProfile = !!profile;
    } else if (user.role === "doctor") {
      const profile = await Doctor.findOne({ user: user._id });
      hasProfile = !!profile;
      if (profile) {
        isApproved = profile.isApproved;
      }
    }

    return res.status(201).json({
      success: true,
      message: "User signin successfully",
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        hasProfile,
        isApproved,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};
