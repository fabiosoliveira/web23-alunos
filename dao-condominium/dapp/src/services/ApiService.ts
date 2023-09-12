import axios from "./AxiosConfig";

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

export type ApiResident = {
  wallet: string;
  name: string;
  profile: string;
  phone?: string;
  email?: string;
};

export async function getApiResident(wallet: string) {
  const response = await axios.get<ApiResident>(
    `${API_URL}/residents/${wallet}`
  );

  return response.data;
}

export async function addApiResident(resident: ApiResident) {
  const response = await axios.post<ApiResident>(
    `${API_URL}/residents/`,
    resident
  );

  return response.data;
}

export async function updateApiResident(wallet: string, resident: ApiResident) {
  const response = await axios.patch<ApiResident>(
    `${API_URL}/residents/${wallet}`,
    resident
  );

  return response.data;
}

export async function deletApiResident(wallet: string) {
  await axios.delete<ApiResident>(`${API_URL}/residents/${wallet}`);
}
