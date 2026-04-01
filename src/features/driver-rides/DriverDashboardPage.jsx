import { useMutation, useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  acceptRide,
  getAvailableRides,
  getMyRides,
  updateRideStatus
} from "../../lib/api/rideApi";
import { queryClient } from "../../app/queryClient";
import { useToastStore } from "../../store/toastStore";
import {
  buildStatusAction,
  formatRideTimestamp,
  getReferenceLabel,
  isRideActive,
  rideStatusLabels,
  rideStatusTone,
  sortRidesNewestFirst,
  upsertRide
} from "../../lib/utils/ride";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { PageLoader } from "../../app/components/PageLoader";

function DispatchRideCard({ ride, onAccept, accepting }) {
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
        <Badge tone="warning">Requested</Badge>
      </div>
      <div className="rounded-[22px] bg-surface-2 p-4 text-sm text-muted">
        Customer: {getReferenceLabel(ride.customerId, "Unknown customer")}
      </div>
      <Button className="w-full" onClick={() => onAccept(ride._id)} disabled={accepting}>
        {accepting ? "Accepting..." : "Accept ride"}
      </Button>
    </Card>
  );
}

function ActiveRideCard({ ride }) {
  const statusAction = buildStatusAction(ride);

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
      <div className="rounded-[22px] bg-surface-2 p-4 text-sm text-muted">
        <p>Customer: {getReferenceLabel(ride.customerId, "Unknown customer")}</p>
        <p className="mt-2">Ride ID: {ride._id}</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link to={`/driver/ride/${ride._id}`}>
          <Button variant="secondary">Open ride workspace</Button>
        </Link>
        {statusAction ? <Badge tone="accent">{statusAction.label}</Badge> : null}
      </div>
    </Card>
  );
}

export function DriverDashboardPage() {
  const pushToast = useToastStore((state) => state.pushToast);

  const availableRidesQuery = useQuery({
    queryKey: ["rides", "available"],
    queryFn: getAvailableRides
  });

  const myRidesQuery = useQuery({
    queryKey: ["rides", "my"],
    queryFn: getMyRides
  });

  const acceptRideMutation = useMutation({
    mutationFn: acceptRide,
    onSuccess: (ride) => {
      queryClient.setQueryData(["rides", "my"], (current) =>
        upsertRide(current || [], ride)
      );
      queryClient.setQueryData(["rides", "available"], (current = []) =>
        current.filter((item) => item._id !== ride._id)
      );
      pushToast({
        title: "Ride accepted",
        description: "The trip is now in your active queue.",
        tone: "success"
      });
    },
    onError: (error) => {
      pushToast({
        title: "Could not accept ride",
        description:
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Another driver may have taken it first.",
        tone: "danger"
      });
    }
  });

  const statusMutation = useMutation({
    mutationFn: updateRideStatus,
    onSuccess: (ride) => {
      queryClient.setQueryData(["rides", "my"], (current) =>
        upsertRide(current || [], ride)
      );
      pushToast({
        title: "Status updated",
        description: `Ride is now ${rideStatusLabels[ride.status]}.`,
        tone: "success"
      });
    }
  });

  const activeRides = sortRidesNewestFirst(
    (myRidesQuery.data || []).filter((ride) => isRideActive(ride))
  );
  const activeRide = activeRides[0] || null;
  const statusAction = buildStatusAction(activeRide);

  if (availableRidesQuery.isLoading || myRidesQuery.isLoading) {
    return <PageLoader message="Loading driver dispatch board..." />;
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="bg-app text-app">
          <Badge tone="accent" className="bg-orange-400/20 text-orange-100">
            Driver flow
          </Badge>
          <h1 className="mt-4 font-display text-4xl font-semibold">
            Manage the live dispatch board and move rides through completion.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
            New customer rides arrive here live. Accept one, update its status,
            and open the ride view to start GPS location sharing.
          </p>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-semibold">Current ride</h2>
              <p className="mt-1 text-sm text-muted">
                Your next status action is always one tap away.
              </p>
            </div>
            <Badge tone={activeRide ? rideStatusTone[activeRide.status] : "neutral"}>
              {activeRide ? rideStatusLabels[activeRide.status] : "Idle"}
            </Badge>
          </div>
          {activeRide ? (
            <div className="mt-5 space-y-4">
              <div className="rounded-[22px] bg-surface-2 p-4 text-sm text-muted">
                <p className="font-semibold text-app">{activeRide.pickupLocation}</p>
                <p className="mt-1">to {activeRide.dropLocation}</p>
                <p className="mt-3">
                  Customer: {getReferenceLabel(activeRide.customerId, "Unknown customer")}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link to={`/driver/ride/${activeRide._id}`}>
                  <Button variant="secondary">Open ride workspace</Button>
                </Link>
                {statusAction ? (
                  <Button
                    onClick={() =>
                      statusMutation.mutate({
                        rideId: activeRide._id,
                        status: statusAction.nextStatus
                      })
                    }
                    disabled={statusMutation.isPending}
                  >
                    {statusMutation.isPending ? "Updating..." : statusAction.label}
                  </Button>
                ) : null}
              </div>
            </div>
          ) : (
            <EmptyState
              title="No active ride"
              description="Accept a ride from the dispatch board to start driving and streaming your live position."
            />
          )}
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-semibold">All active rides</h2>
          <Badge tone={activeRides.length ? "accent" : "neutral"}>
            {activeRides.length ? `${activeRides.length} active` : "None"}
          </Badge>
        </div>
        {activeRides.length ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {activeRides.map((ride) => (
              <ActiveRideCard key={ride._id} ride={ride} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No active rides"
            description="Accepted and ongoing rides will stay visible here until they are completed."
          />
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-semibold">Dispatch board</h2>
          <Badge tone="warning">{(availableRidesQuery.data || []).length} waiting</Badge>
        </div>
        {availableRidesQuery.isError ? (
          <EmptyState
            title="Dispatch board could not load"
            description={
              availableRidesQuery.error?.response?.data?.message ||
              availableRidesQuery.error?.message ||
              "The driver ride list request failed. Check the gateway and ride service."
            }
            action={
              <Button variant="secondary" onClick={() => availableRidesQuery.refetch()}>
                Retry dispatch fetch
              </Button>
            }
          />
        ) : null}
        {!availableRidesQuery.isError && availableRidesQuery.data?.length ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {availableRidesQuery.data.map((ride) => (
              <DispatchRideCard
                key={ride._id}
                ride={ride}
                onAccept={(rideId) => acceptRideMutation.mutate(rideId)}
                accepting={acceptRideMutation.isPending}
              />
            ))}
          </div>
        ) : null}
        {!availableRidesQuery.isError && !availableRidesQuery.data?.length ? (
          <EmptyState
            title="Dispatch board is clear"
            description="New requested rides will appear here instantly through the socket feed."
          />
        ) : null}
      </section>
    </div>
  );
}
