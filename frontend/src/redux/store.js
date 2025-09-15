import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/auth.js";
import doctorReducer from "./slices/doctorProfile.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    doctorProfile: doctorReducer,
  },
});
