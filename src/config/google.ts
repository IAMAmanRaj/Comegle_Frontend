export const GOOGLE_CONFIG = {
  client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  redirect_uri: "http://localhost:5173/auth/callback",
  scope: "openid email profile",
  response_type: "code",
};
