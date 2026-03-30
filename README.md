# Ride Dispatch Client

React + Tailwind frontend for the Ride Dispatch System.

## Stack

- React + Vite
- Tailwind CSS
- React Router
- TanStack Query
- Zustand
- Axios
- Socket.IO Client
- Mapbox via `react-map-gl`

## Setup

1. Copy `.env.example` to `.env`
2. Fill in `VITE_MAPBOX_TOKEN`
3. Start the NGINX gateway on `http://localhost:8080`
4. Install dependencies
5. Start the app

```bash
cd client
npm install
npm run dev
```

## Environment Variables

```env
VITE_AUTH_API_BASE=/api/auth
VITE_RIDE_API_BASE=/api/rides
VITE_RIDE_SOCKET_URL=http://localhost:8080
VITE_MAPBOX_TOKEN=your_mapbox_public_token
```

## Local Routing

- Frontend dev server: `http://localhost:5173`
- NGINX gateway: `http://localhost:8080`
- Auth service: `http://localhost:5001`
- Ride service: `http://localhost:5002`

The browser should only talk to the Vite app and the gateway, not directly to the backend service ports.

## Current Frontend Coverage

- Landing page
- Customer signup/login
- Driver signup/login
- Protected customer and driver route groups
- Customer ride booking
- Customer live ride dashboard
- Driver dispatch board
- Driver ride status updates
- Socket-based ride event updates
- Driver location sharing with browser geolocation
- Customer ride tracking screen

## Backend Assumptions Already Reflected In The UI

- Auth uses JWT bearer tokens
- `POST /api/auth/login` returns `{ token }`
- `GET /api/auth/me` returns `{ user }`
- Ride creation expects string `pickupLocation` and `dropLocation`
- Driver location is emitted over Socket.IO using `driver_location`
- Ride updates arrive on `new_ride`, `ride_accepted`, and `ride_status_updated`

## Notes

- Customer tracking joins the assigned driver room because the current ride service emits live driver positions to the driver room id.
- Coordinates are resolved on the frontend through Mapbox because the backend currently stores locations as strings only.
- Once geospatial DB fields are added to the ride service, the map layer can be upgraded without changing the route and dashboard structure.
