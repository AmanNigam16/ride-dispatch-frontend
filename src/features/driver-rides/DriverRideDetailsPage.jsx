import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, Navigate, useParams } from "react-router-dom";
import { getMyRides, updateRideStatus } from "../../lib/api/rideApi";
import { queryClient } from "../../app/queryClient";
import { useToastStore } from "../../store/toastStore";
import { useTrackingStore } from "../../store/trackingStore";
import {
  buildStatusAction,
  formatRideTimestamp,
  getReferenceLabel,
  rideStatusLabels,
  rideStatusTone
} from "../../lib/utils/ride";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { PageLoader } from "../../app/components/PageLoader";
import { RideMap } from "../tracking/RideMap";
import { useDriverLocationSharing } from "../tracking/useDriverLocationSharing";
import { useRideMapPoints } from "../tracking/useRideMapPoints";

export function DriverRideDetailsPage() {
  const { rideId } = useParams();
  const pushToast = useToastStore((state) => state.pushToast);
  const driverLocation = useTrackingStore((state) => state.driverLocation);
  const hasDriverCoordinates =
    driverLocation &&
    Number.isFinite(driverLocation.lat) &&
    Number.isFinite(driverLocation.lng);

  const ridesQuery = useQuery({
    queryKey: ["rides", "my"],
    queryFn: getMyRides
  });

  const ride = (ridesQuery.data || []).find((item) => item._id === rideId);
  const { pickup, dropoff, loading } = useRideMapPoints(ride);
  const statusAction = buildStatusAction(ride);

  const statusMutation = useMutation({
    mutationFn: updateRideStatus,
    onSuccess: (updatedRide) => {
      queryClient.setQueryData(["rides", "my"], (current = []) =>
        current.map((item) => (item._id === updatedRide._id ? updatedRide : item))
      );
      pushToast({
        title: "Ride updated",
        description: `Trip is now ${rideStatusLabels[updatedRide.status]}.`,
        tone: "success"
      });
    }
  });

  const {
    isSharing,
    sharingState,
    sharingError,
    startSharing,
    stopSharing
  } = useDriverLocationSharing(ride);

  if (ridesQuery.isLoading) {
    return <PageLoader message="Loading driver ride workspace..." />;
  }

  if (!ride) {
    return <Navigate to="/driver" replace />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted">Driver workspace</p>
          <h1 className="font-display text-4xl font-semibold">{ride.pickupLocation}</h1>
          <p className="mt-2 text-sm text-muted">to {ride.dropLocation}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge tone={rideStatusTone[ride.status] || "neutral"}>
            {rideStatusLabels[ride.status] || ride.status}
          </Badge>
          <Link to="/driver">
            <Button variant="secondary">Back to board</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <RideMap
          title="Active route map"
          subtitle="Start location sharing to stream your position to the customer view."
          pickup={pickup}
          dropoff={dropoff}
          driverLocation={driverLocation}
          loading={loading}
        />

        <div className="space-y-6">
          <Card>
            <h2 className="font-display text-2xl font-semibold">Trip controls</h2>
            <div className="mt-4 space-y-4">
              <div className="rounded-[22px] bg-surface-2 p-4 text-sm">
                <p className="font-semibold text-app">Customer</p>
                <p className="mt-1 text-muted">
                  {getReferenceLabel(ride.customerId, "Unknown customer")}
                </p>
                <p className="mt-1 text-muted">Ride ID: {ride._id}</p>
              </div>
              <div className="rounded-[22px] bg-surface-2 p-4 text-sm">
                <p className="font-semibold text-app">Created</p>
                <p className="mt-1 text-muted">{formatRideTimestamp(ride.createdAt)}</p>
              </div>
              {statusAction ? (
                <Button
                  className="w-full"
                  onClick={() =>
                    statusMutation.mutate({
                      rideId: ride._id,
                      status: statusAction.nextStatus
                    })
                  }
                  disabled={statusMutation.isPending}
                >
                  {statusMutation.isPending ? "Updating..." : statusAction.label}
                </Button>
              ) : (
                <Badge tone="success">This ride is complete</Badge>
              )}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-semibold">Live tracking</h2>
                <p className="mt-1 text-sm text-muted">
                  Stream your GPS position every five seconds during an active ride.
                </p>
              </div>
              <Badge tone={isSharing ? "success" : "neutral"}>{sharingState}</Badge>
            </div>
            <div className="mt-4 space-y-4">
              <div className="rounded-[22px] bg-surface-2 p-4 text-sm text-muted">
                <p>
                  Latest coordinates:{" "}
                  {hasDriverCoordinates
                    ? `${driverLocation.lat.toFixed(4)}, ${driverLocation.lng.toFixed(4)}`
                    : "Not shared yet"}
                </p>
              </div>
              {sharingError ? <p className="text-sm text-danger">{sharingError}</p> : null}
              <div className="flex gap-3">
                {!isSharing ? (
                  <Button className="flex-1" onClick={startSharing}>
                    Start sharing
                  </Button>
                ) : (
                  <Button className="flex-1" variant="danger" onClick={stopSharing}>
                    Stop sharing
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
