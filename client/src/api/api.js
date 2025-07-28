import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Auth0 token interceptor is now handled in AuthContext
// This ensures the token is always fresh and valid

export default API;
