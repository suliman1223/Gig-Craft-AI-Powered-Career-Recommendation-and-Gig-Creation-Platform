import axios from "axios";
import { API_URL } from "../config";

export const uploadResume = async (file) => {
  const formData = new FormData();

  // Must match upload.single("resume")
  formData.append("resume", file);

  const response = await axios.post(
    `${API_URL}/resume/upload`,
    formData,
    {
      withCredentials: true,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};