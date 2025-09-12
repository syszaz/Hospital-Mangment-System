import api from "./axios";

export const fetchUserProfileByEmail = async (email) => {
  const { data } = await api.get(`/user/profile/${email}`);
  return data;
};
