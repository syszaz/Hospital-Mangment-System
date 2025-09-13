import api from "./axios";

export const fetchUserProfileByEmail = async (email) => {
  try {
    const { data } = await api.get(`/user/profile/${email}`);
    return data;
  } catch (error) {
    const backendMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Error fetching today's revenue";

    throw new Error(backendMessage);
  }
};

export const updatePersonalInfo = async (id, personalForm) => {
  try {
    const { data } = await api.put(`/user/update/${id}`, personalForm);
    return data;
  } catch (error) {
    const backendMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Error fetching today's revenue";

    throw new Error(backendMessage);
  }
};
