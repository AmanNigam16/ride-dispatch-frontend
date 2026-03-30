import { Outlet } from "react-router-dom";
import { AuthBootstrap } from "../bootstrap/AuthBootstrap";
import { RealtimeBridge } from "../bootstrap/RealtimeBridge";
import { ToastViewport } from "../../components/ui/ToastViewport";

export function RootLayout() {
  return (
    <>
      <AuthBootstrap />
      <RealtimeBridge />
      <ToastViewport />
      <Outlet />
    </>
  );
}
