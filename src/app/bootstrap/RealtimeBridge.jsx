import { useEffect, useMemo, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { connectSocket, disconnectSocket } from "../../lib/socket/socketClient";
import { getMyRides } from "../../lib/api/rideApi";
import { useAuthStore } from "../../store/authStore";
import { useToastStore } from "../../store/toastStore";
import { useTrackingStore } from "../../store/trackingStore";
import {
  getReferenceId,
  isRideRelevantToUser,
  removeRide,
  rideStatusLabels,
  upsertRide
} from "../../lib/utils/ride";

function updateMyRides(queryClient, ride) {
  queryClient.setQueryData(["rides", "my"], (current) => {
    if (!current) {
      return [ride];
    }

    return upsertRide(current, ride);
  });
}

function updateAvailableRides(queryClient, ride) {
  const rideId = getReferenceId(ride);

  if (ride.status === "requested") {
    queryClient.setQueryData(["rides", "available"], (current) =>
      upsertRide(current || [], ride)
    );
    return;
  }

  queryClient.setQueryData(["rides", "available"], (current) =>
    removeRide(current || [], rideId)
  );
}

export function RealtimeBridge() {
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const bootstrapped = useAuthStore((state) => state.bootstrapped);
  const pushToast = useToastStore((state) => state.pushToast);
  const activeRideRoomRef = useRef(null);

  const ridesQuery = useQuery({
    queryKey: ["rides", "my"],
    queryFn: getMyRides,
    enabled: Boolean(bootstrapped && token && user)
  });

  const activeRideRoom = useMemo(() => {
    const activeRide = (ridesQuery.data || []).find(
      (ride) => ride.status === "accepted" || ride.status === "ongoing"
    );
    const activeRideId = getReferenceId(activeRide);

    return activeRideId ? `ride:${activeRideId}` : null;
  }, [ridesQuery.data]);

  useEffect(() => {
    if (!bootstrapped || !token || !user) {
      activeRideRoomRef.current = null;
      disconnectSocket();
      return;
    }

    const socket = connectSocket();

    const joinSelfRoom = () => {
      socket.emit("join", user.id);

      if (activeRideRoomRef.current) {
        socket.emit("join", activeRideRoomRef.current);
      }
    };

    const handleNewRide = (ride) => {
      if (user.role !== "driver") {
        return;
      }

      updateAvailableRides(queryClient, ride);
      pushToast({
        title: "New ride request",
        description: `${ride.pickupLocation} to ${ride.dropLocation}`,
        tone: "brand"
      });
    };

    const handleRideAccepted = (ride) => {
      updateAvailableRides(queryClient, ride);

      if (isRideRelevantToUser(ride, user)) {
        updateMyRides(queryClient, ride);
        pushToast({
          title: "Ride accepted",
          description:
            user.role === "customer"
              ? "A driver is heading your way."
              : "Ride assigned to your queue.",
          tone: "success"
        });
      }
    };

    const handleRideStatusUpdated = (ride) => {
      updateAvailableRides(queryClient, ride);

      if (isRideRelevantToUser(ride, user)) {
        updateMyRides(queryClient, ride);
        pushToast({
          title: "Ride status updated",
          description: rideStatusLabels[ride.status] || ride.status,
          tone: ride.status === "completed" ? "success" : "accent"
        });
      }
    };

    const handleDriverLocation = (payload) => {
      useTrackingStore.getState().setDriverLocation(payload);
    };

    joinSelfRoom();
    socket.on("connect", joinSelfRoom);
    socket.on("new_ride", handleNewRide);
    socket.on("ride_accepted", handleRideAccepted);
    socket.on("ride_status_updated", handleRideStatusUpdated);
    socket.on("driver_location_update", handleDriverLocation);

    return () => {
      socket.off("connect", joinSelfRoom);
      socket.off("new_ride", handleNewRide);
      socket.off("ride_accepted", handleRideAccepted);
      socket.off("ride_status_updated", handleRideStatusUpdated);
      socket.off("driver_location_update", handleDriverLocation);
    };
  }, [activeRideRoom, bootstrapped, pushToast, queryClient, token, user]);

  useEffect(() => {
    if (!bootstrapped || !token || !user) {
      return;
    }

    const socket = connectSocket();
    const previousRideRoom = activeRideRoomRef.current;

    if (previousRideRoom === activeRideRoom) {
      return;
    }

    if (previousRideRoom) {
      socket.emit("leave", previousRideRoom);
    }

    if (activeRideRoom) {
      socket.emit("join", activeRideRoom);
    }

    activeRideRoomRef.current = activeRideRoom;
  }, [activeRideRoom, bootstrapped, token, user]);

  return null;
}
