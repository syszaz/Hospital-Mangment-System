import api from "./axios";

export const getMe = async () => {
  const { data } = await api.get("/auth/get-me");
  
  return data.user;
};
