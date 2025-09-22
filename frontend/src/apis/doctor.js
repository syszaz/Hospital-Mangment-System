import api from "./axios";

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

export const updateProfessionalInfo = async (id, professionalForm) => {
  try {
    const { data } = await api.put(
      `/doctor/profile/update/${id}`,
      professionalForm
    );
    return data;
  } catch (error) {
    const backendMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Error doctor profile";
    throw new Error(backendMessage);
  }
};

