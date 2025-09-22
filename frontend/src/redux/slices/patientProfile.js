import { createSlice } from "@reduxjs/toolkit";

const patientSlice = createSlice({
  name: "patient",
  initialState: {
    profile: null,
  },
  reducers: {
    setPatientProfile: (state, action) => {
      state.profile = action.payload;
    },
    clearPatientProfile: (state) => {
      state.profile = null;
    },
  },
});

export const { setPatientProfile, clearPatientProfile } = patientSlice.actions;
export default patientSlice.reducer;