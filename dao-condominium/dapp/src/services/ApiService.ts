import axios from "axios";

const API_URL = import.meta.env.VITE_APP_API_URL as string;

type LoginRespponse = {
  token: string;
};

export async function doApiLogin(
  wallet: string,
  secret: string,
  timestamp: number
) {
  const response = await axios.post<LoginRespponse>(`${API_URL}/login`, {
    wallet,
    secret,
    timestamp,
  });

  return response.data.token;
}
