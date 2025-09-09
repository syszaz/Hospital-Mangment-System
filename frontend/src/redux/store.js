import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/auth.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});