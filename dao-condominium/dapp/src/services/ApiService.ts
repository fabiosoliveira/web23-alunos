import { keccak256, toUtf8Bytes } from "ethers/lib/utils";
import axios from "./AxiosConfig";
import { hasManagerPermissions, hasCounselorPermissions } from "./Web3Service";

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
  if (!hasCounselorPermissions())
    throw new Error("You do not have permission.");

  const response = await axios.post<ApiResident>(
    `${API_URL}/residents/`,
    resident
  );

  return response.data;
}

export async function updateApiResident(wallet: string, resident: ApiResident) {
  if (!hasManagerPermissions()) throw new Error("You do not have permission.");
  const response = await axios.patch<ApiResident>(
    `${API_URL}/residents/${wallet}`,
    resident
  );

  return response.data;
}

export async function deletApiResident(wallet: string) {
  if (!hasManagerPermissions()) throw new Error("You do not have permission.");
  await axios.delete<ApiResident>(`${API_URL}/residents/${wallet}`);
}

export async function uploadTopicFile(topicTitle: string, file: File) {
  if (!hasCounselorPermissions())
    throw new Error("You do not have permission.");

  const hash = keccak256(toUtf8Bytes(topicTitle));
  const formData = new FormData();
  formData.append("file", file);

  await axios.post(`${API_URL}/topicfiles/${hash}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}
