import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/auth.js";
import doctorReducer from "./slices/doctorProfile.js";
import patientReducer from "./slices/patientProfile.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    doctorProfile: doctorReducer,
    patientProfile: patientReducer,
  },
});
