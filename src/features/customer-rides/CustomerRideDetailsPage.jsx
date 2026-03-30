import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, Navigate, useParams } from "react-router-dom";
import { getMyRides, getRideLiveLocation } from "../../lib/api/rideApi";
import { useTrackingStore } from "../../store/trackingStore";
import {
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
import { useRideMapPoints } from "../tracking/useRideMapPoints";

export function CustomerRideDetailsPage() {
  const { rideId } = useParams();
  const trackedDriverLocation = useTrackingStore((state) => state.driverLocation);
  const lastUpdatedAt = useTrackingStore((state) => state.lastUpdatedAt);
  const getIsLocationStale = useTrackingStore((state) => state.isLocationStale);
  const [, setStaleCheckTick] = useState(0);

  const ridesQuery = useQuery({
    queryKey: ["rides", "my"],
    queryFn: getMyRides
  });

  const ride = (ridesQuery.data || []).find((item) => item._id === rideId);
  const liveLocationQuery = useQuery({
    queryKey: ["rides", "location", rideId],
    queryFn: () => getRideLiveLocation(rideId),
    enabled: Boolean(rideId && ride && ride.status !== "completed"),
    refetchInterval: 3000
  });
  const { pickup, dropoff, loading } = useRideMapPoints(ride);
  const serverLocation = liveLocationQuery.data?.location || null;
  const driverLocation = serverLocation || trackedDriverLocation || null;
  const hasDriverCoordinates =
    driverLocation &&
    Number.isFinite(driverLocation.lat) &&
    Number.isFinite(driverLocation.lng);
  const isLocationStale =
    hasDriverCoordinates && lastUpdatedAt ? getIsLocationStale() : false;

  useEffect(() => {
    if (!lastUpdatedAt) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setStaleCheckTick((tick) => tick + 1);
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [lastUpdatedAt]);

  if (ridesQuery.isLoading) {
    return <PageLoader message="Loading ride details..." />;
  }

  if (!ride) {
    return <Navigate to="/customer" replace />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted">Ride details</p>
          <h1 className="font-display text-4xl font-semibold">{ride.pickupLocation}</h1>
          <p className="mt-2 text-sm text-muted">to {ride.dropLocation}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge tone={rideStatusTone[ride.status] || "neutral"}>
            {rideStatusLabels[ride.status] || ride.status}
          </Badge>
          <Link to="/customer">
            <Button variant="secondary">Back to dashboard</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <RideMap
          title="Live route tracking"
          subtitle="Pickup, dropoff, and live driver position update here when the ride is accepted."
          pickup={pickup}
          dropoff={dropoff}
          driverLocation={driverLocation}
          loading={loading}
        />

        <div className="space-y-6">
          <Card>
            <h2 className="font-display text-2xl font-semibold">Dispatch status</h2>
            <div className="mt-4 space-y-4 text-sm">
              <div className="rounded-[22px] bg-surface-2 p-4">
                <p className="font-semibold text-app">Created</p>
                <p className="mt-1 text-muted">{formatRideTimestamp(ride.createdAt)}</p>
              </div>
              <div className="rounded-[22px] bg-surface-2 p-4">
                <p className="font-semibold text-app">Driver</p>
                <p className="mt-1 text-muted">
                  {getReferenceLabel(
                    ride.driverId,
                    "A driver will appear here once assigned."
                  )}
                </p>
              </div>
              <div className="rounded-[22px] bg-surface-2 p-4">
                <p className="font-semibold text-app">Live location</p>
                <p className="mt-1 text-muted">
                  {hasDriverCoordinates
                    ? `${driverLocation.lat.toFixed(4)}, ${driverLocation.lng.toFixed(4)}`
                    : "Waiting for driver location updates."}
                </p>
                {isLocationStale ? (
                  <p className="mt-2 text-sm text-muted">
                    Driver location paused (showing last known position)
                  </p>
                ) : null}
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="font-display text-2xl font-semibold">What happens next</h2>
            <div className="mt-4 space-y-3 text-sm text-muted">
              <p>1. Your ride appears in the driver dispatch queue immediately.</p>
              <p>2. Once accepted, this page starts showing the driver assignment.</p>
              <p>3. If the driver streams location, the map updates live through Socket.IO.</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
