import { useEffect, useRef, useState } from "react";
import { connectSocket } from "../../lib/socket/socketClient";
import { useAuthStore } from "../../store/authStore";
import { useTrackingStore } from "../../store/trackingStore";

export function useDriverLocationSharing(ride) {
  const user = useAuthStore((state) => state.user);
  const sharingState = useTrackingStore((state) => state.sharingState);
  const sharingError = useTrackingStore((state) => state.sharingError);
  const setDriverLocation = useTrackingStore((state) => state.setDriverLocation);
  const setSharingState = useTrackingStore((state) => state.setSharingState);
  const setSharingError = useTrackingStore((state) => state.setSharingError);

  const intervalRef = useRef(null);
  const [isSharing, setIsSharing] = useState(false);

  function stopSharing() {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsSharing(false);
    setSharingState("idle");
  }

  function publishLocation() {
    if (!navigator.onLine) {
      setSharingError("You are offline, so live tracking is paused.");
      setSharingState("paused");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const payload = {
          rideId: ride?._id,
          driverId: user.id,
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        setDriverLocation(payload);
        connectSocket().emit("driver_location", payload);
        setSharingError("");
        setSharingState("sharing");
      },
      (error) => {
        const message =
          error.code === error.PERMISSION_DENIED
            ? "Location permission was denied."
            : "Unable to fetch your current location.";

        setSharingError(message);
        setSharingState("error");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }

  function startSharing() {
    if (!ride || ride.status === "completed") {
      setSharingError("Location sharing is only available during an active ride.");
      return;
    }

    if (!navigator.geolocation) {
      setSharingError("This browser does not support geolocation.");
      setSharingState("error");
      return;
    }

    setSharingError("");
    setSharingState("requesting");
    setIsSharing(true);
    publishLocation();
    intervalRef.current = window.setInterval(publishLocation, 5000);
  }

  useEffect(() => {
    if (ride?.status === "completed" && isSharing) {
      stopSharing();
    }
  }, [isSharing, ride?.status]);

  useEffect(() => {
    return () => {
      stopSharing();
    };
  }, []);

  return {
    isSharing,
    sharingState,
    sharingError,
    startSharing,
    stopSharing
  };
}
