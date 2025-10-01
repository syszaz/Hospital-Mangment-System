import api from "./axios";

export const fullList = async () => {
  try {
    const { data } = await api.get("/admin/full-list");
    return data;
  } catch (error) {
    const backendMessage =
      error?.response?.data?.message ||
      error?.message ||
      "error fetching dashboard list";
    throw new Error(backendMessage);
  }
};
