import { authHttp } from "./http";

export async function signup(payload) {
  const response = await authHttp.post("/signup", payload);
  return response.data;
}

export async function login(payload) {
  const response = await authHttp.post("/login", payload);
  return response.data;
}

export async function getMe() {
  const response = await authHttp.get("/me");
  return response.data.user;
}

export async function getMeWithToken(token) {
  const response = await authHttp.get("/me", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return response.data.user;
}
