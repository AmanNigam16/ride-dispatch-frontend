import { Navigate, createBrowserRouter } from "react-router-dom";
import { RootLayout } from "./layouts/RootLayout";
import { PublicLayout } from "./layouts/PublicLayout";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { RoleGuard } from "./guards/RoleGuard";
import { LandingPage } from "../features/marketing/LandingPage";
import { LoginPage } from "../features/auth/LoginPage";
import { SignupPage } from "../features/auth/SignupPage";
import { CustomerDashboardPage } from "../features/customer-rides/CustomerDashboardPage";
import { CustomerRideDetailsPage } from "../features/customer-rides/CustomerRideDetailsPage";
import { DriverDashboardPage } from "../features/driver-rides/DriverDashboardPage";
import { DriverRideDetailsPage } from "../features/driver-rides/DriverRideDetailsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <LandingPage />
      },
      {
        element: <PublicLayout />,
        children: [
          {
            path: "login",
            element: <LoginPage />
          },
          {
            path: "signup",
            element: <SignupPage />
          }
        ]
      },
      {
        element: <RoleGuard allowedRoles={["customer"]} />,
        children: [
          {
            element: <DashboardLayout />,
            children: [
              {
                path: "customer",
                element: <CustomerDashboardPage />
              },
              {
                path: "customer/ride/:rideId",
                element: <CustomerRideDetailsPage />
              }
            ]
          }
        ]
      },
      {
        element: <RoleGuard allowedRoles={["driver"]} />,
        children: [
          {
            element: <DashboardLayout />,
            children: [
              {
                path: "driver",
                element: <DriverDashboardPage />
              },
              {
                path: "driver/ride/:rideId",
                element: <DriverRideDetailsPage />
              }
            ]
          }
        ]
      },
      {
        path: "*",
        element: <Navigate to="/" replace />
      }
    ]
  }
]);
