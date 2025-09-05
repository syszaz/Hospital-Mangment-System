import mongoose from "mongoose";

const userSchema  = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    role: {type: String, enum: ["patient", "doctor", "admin"], default: "patient"},
    phone: {type: String, optional: true},
}, {timestamps: true});

export const User = mongoose.model("User", userSchema);