import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createRide, getMyRides } from "../../lib/api/rideApi";
import { queryClient } from "../../app/queryClient";
import { getErrorMessage } from "../../lib/utils/error";
import { useToastStore } from "../../store/toastStore";
import {
  formatRideTimestamp,
  getReferenceLabel,
  isRideActive,
  rideStatusLabels,
  rideStatusTone,
  sortRidesNewestFirst,
  upsertRide
} from "../../lib/utils/ride";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/EmptyState";
import { LocationSearchInput } from "../tracking/LocationSearchInput";
import { PageLoader } from "../../app/components/PageLoader";

function RideCard({ ride, ctaLabel = "Open ride" }) {
  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted">{formatRideTimestamp(ride.createdAt)}</p>
          <h3 className="mt-1 font-display text-2xl font-semibold">
            {ride.pickupLocation}
          </h3>
          <p className="mt-1 text-sm text-muted">to {ride.dropLocation}</p>
        </div>
        <Badge tone={rideStatusTone[ride.status] || "neutral"}>
          {rideStatusLabels[ride.status] || ride.status}
        </Badge>
      </div>
      <div className="grid gap-3 rounded-[22px] bg-surface-2 p-4 text-sm text-muted md:grid-cols-2">
        <p>Driver: {getReferenceLabel(ride.driverId, "Waiting for assignment")}</p>
        <p>Ride ID: {ride._id}</p>
      </div>
      <Link to={`/customer/ride/${ride._id}`}>
        <Button className="w-full" variant="secondary">
          {ctaLabel}
        </Button>
      </Link>
    </Card>
  );
}

export function CustomerDashboardPage() {
  const pushToast = useToastStore((state) => state.pushToast);
  const [pickupQuery, setPickupQuery] = useState("");
  const [dropQuery, setDropQuery] = useState("");
  const [pickupDraft, setPickupDraft] = useState(null);
  const [dropDraft, setDropDraft] = useState(null);

  const ridesQuery = useQuery({
    queryKey: ["rides", "my"],
    queryFn: getMyRides
  });

  const createRideMutation = useMutation({
    mutationFn: createRide,
    onSuccess: (ride) => {
      queryClient.setQueryData(["rides", "my"], (current) =>
        upsertRide(current || [], ride)
      );
      setPickupQuery("");
      setDropQuery("");
      setPickupDraft(null);
      setDropDraft(null);
      pushToast({
        title: "Ride requested",
        description: "Drivers can now see your trip in the live queue.",
        tone: "success"
      });
    },
    onError: (error) => {
      pushToast({
        title: "Ride request failed",
        description: getErrorMessage(error, "Please retry in a moment."),
        tone: "danger"
      });
    }
  });

  const rides = ridesQuery.data || [];
  const activeRides = sortRidesNewestFirst(rides.filter((ride) => isRideActive(ride)));
  const activeRide = activeRides[0] || null;
  const rideHistory = sortRidesNewestFirst(
    rides.filter((ride) => ride.status === "completed")
  );

  if (ridesQuery.isLoading) {
    return <PageLoader message="Loading your ride dashboard..." />;
  }

  function handleCreateRide(event) {
    event.preventDefault();

    const pickupLocation = pickupDraft?.label || pickupQuery.trim();
    const dropLocation = dropDraft?.label || dropQuery.trim();

    if (!pickupLocation || !dropLocation) {
      pushToast({
        title: "Route details missing",
        description: "Add both pickup and dropoff locations before booking.",
        tone: "warning"
      });
      return;
    }

    createRideMutation.mutate({
      pickupLocation,
      dropLocation
    });
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="bg-app text-app">
          <Badge tone="success" className="bg-emerald-400/20 text-emerald-100">
            Customer flow
          </Badge>
          <h1 className="mt-4 font-display text-4xl font-semibold">
            Book a ride and watch dispatch respond in real time.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
            Create a trip request, follow assignment updates, and switch into
            tracking mode the moment a driver accepts your ride.
          </p>
          {activeRide ? (
            <div className="mt-6 rounded-[24px] border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-muted">Current ride</p>
              <p className="mt-1 font-display text-2xl font-semibold">
                {rideStatusLabels[activeRide.status]}
              </p>
              <p className="mt-2 text-sm text-muted">
                {activeRide.pickupLocation} to {activeRide.dropLocation}
              </p>
              <Link className="mt-5 inline-block" to={`/customer/ride/${activeRide._id}`}>
                <Button size="sm">Track current ride</Button>
              </Link>
            </div>
          ) : null}
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-semibold">Request a ride</h2>
              <p className="mt-1 text-sm text-muted">
                Use place suggestions or enter route names manually.
              </p>
            </div>
            <Badge tone="brand">Live queue</Badge>
          </div>
          <form className="mt-5 space-y-4" onSubmit={handleCreateRide}>
            <LocationSearchInput
              label="Pickup location"
              value={pickupQuery}
              placeholder="Airport terminal, railway station, office district"
              onChange={(value) => {
                setPickupQuery(value);
                setPickupDraft(null);
              }}
              onSelect={(place) => {
                setPickupQuery(place.label);
                setPickupDraft(place);
              }}
            />
            <LocationSearchInput
              label="Dropoff location"
              value={dropQuery}
              placeholder="Hotel, campus, neighborhood, city center"
              onChange={(value) => {
                setDropQuery(value);
                setDropDraft(null);
              }}
              onSelect={(place) => {
                setDropQuery(place.label);
                setDropDraft(place);
              }}
            />
            <Button
              className="w-full"
              size="lg"
              type="submit"
              disabled={createRideMutation.isPending}
            >
              {createRideMutation.isPending ? "Submitting ride..." : "Request ride"}
            </Button>
          </form>
        </Card>
      </section>

      {ridesQuery.isError ? (
        <EmptyState
          title="Ride history could not load"
          description={getErrorMessage(
            ridesQuery.error,
            "The ride list request failed. Check the ride service and gateway."
          )}
          action={
            <Button variant="secondary" onClick={() => ridesQuery.refetch()}>
              Retry ride fetch
            </Button>
          }
        />
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-semibold">Active rides</h2>
            <Badge tone={activeRide ? "success" : "neutral"}>
              {activeRides.length ? `${activeRides.length} active` : "None"}
            </Badge>
          </div>
          {activeRides.length ? (
            <div className="grid gap-4">
              {activeRides.map((ride, index) => (
                <RideCard
                  key={ride._id}
                  ride={ride}
                  ctaLabel={index === 0 ? "Open live tracker" : "Open ride"}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No active rides"
              description="Create a ride request above and it will appear here once it enters the dispatch flow."
            />
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-semibold">Ride history</h2>
            <Badge tone="neutral">{rideHistory.length} completed</Badge>
          </div>
          {rideHistory.length ? (
            <div className="grid gap-4">
              {rideHistory.map((ride) => (
                <RideCard key={ride._id} ride={ride} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No completed rides yet"
              description="Completed bookings will collect here with their final status and route details."
            />
          )}
        </div>
      </section>
    </div>
  );
}
