import { refreshSession } from "./refresh-session";

export const refreshAccessToken = async () => {
  const { accessToken } = await refreshSession();
  return accessToken;
};
