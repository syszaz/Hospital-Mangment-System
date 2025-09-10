import api from "./axios";

export const createPatientProfile = async (formData) => {
  try {
    const response = await api.post("/patient/create-profile", formData);
    return response.data;
  } catch (error) {
    const backendMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Error creating patient profile";

    throw new Error(backendMessage);
  }
};

export const createDoctorProfile = async (formData) => {
  try {
    const response = await api.post("/doctor/create-profile", formData);
    return response.data;
  } catch (error) {
    const backendMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Error creating doctor profile";

    throw new Error(backendMessage);
  }
};
