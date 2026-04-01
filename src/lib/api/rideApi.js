import { rideHttp } from "./http";

export async function createRide(payload) {
  const response = await rideHttp.post("", payload);
  return response.data;
}

export async function getMyRides() {
  const response = await rideHttp.get("/my");
  return response.data;
}

export async function getAvailableRides() {
  const response = await rideHttp.get("/available");
  return response.data;
}

export async function acceptRide(rideId) {
  const response = await rideHttp.post("/accept", { rideId });
  return response.data;
}

export async function updateRideStatus({ rideId, status }) {
  const response = await rideHttp.post("/status", { rideId, status });
  return response.data;
}

export async function getRideLiveLocation(rideId) {
  const response = await rideHttp.get(`/${rideId}/location`);
  return response.data;
}
