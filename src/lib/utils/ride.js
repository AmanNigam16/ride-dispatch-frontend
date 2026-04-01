export const rideStatusLabels = {
  requested: "Awaiting driver",
  accepted: "Driver assigned",
  ongoing: "Trip in progress",
  completed: "Completed"
};

export const rideStatusTone = {
  requested: "warning",
  accepted: "brand",
  ongoing: "accent",
  completed: "success"
};

export function getReferenceId(value) {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  return value._id || value.id || "";
}

export function isRideActive(ride) {
  return ride && ride.status !== "completed";
}

export function isRideRelevantToUser(ride, user) {
  if (!ride || !user) {
    return false;
  }

  const customerId = getReferenceId(ride.customerId);
  const driverId = getReferenceId(ride.driverId);

  return customerId === user.id || driverId === user.id;
}

export function upsertRide(list = [], ride) {
  const next = Array.isArray(list) ? [...list] : [];
  const index = next.findIndex((item) => getReferenceId(item) === getReferenceId(ride));

  if (index >= 0) {
    next[index] = { ...next[index], ...ride };
    return next;
  }

  return [ride, ...next];
}

export function removeRide(list = [], rideId) {
  return (Array.isArray(list) ? list : []).filter(
    (item) => getReferenceId(item) !== rideId
  );
}

export function sortRidesNewestFirst(list = []) {
  return (Array.isArray(list) ? list : [])
    .map((ride, index) => ({ ride, index }))
    .sort((left, right) => {
      const leftTime = Date.parse(left.ride?.createdAt);
      const rightTime = Date.parse(right.ride?.createdAt);
      const leftValid = Number.isFinite(leftTime);
      const rightValid = Number.isFinite(rightTime);

      if (leftValid && rightValid && leftTime !== rightTime) {
        return rightTime - leftTime;
      }

      if (leftValid !== rightValid) {
        return leftValid ? -1 : 1;
      }

      return left.index - right.index;
    })
    .map(({ ride }) => ride);
}

export function getRidePrimaryParty(ride, role) {
  if (!ride) {
    return "Unknown rider";
  }

  if (role === "customer") {
    return ride.driverId?.name || "Driver pending";
  }

  return ride.customerId?.name || "Customer";
}

export function getReferenceLabel(reference, fallback) {
  if (!reference) {
    return fallback;
  }

  if (typeof reference === "string") {
    return reference;
  }

  return reference.name || reference.email || reference._id || fallback;
}

export function buildStatusAction(ride) {
  if (!ride) {
    return null;
  }

  if (ride.status === "accepted") {
    return { nextStatus: "ongoing", label: "Start trip" };
  }

  if (ride.status === "ongoing") {
    return { nextStatus: "completed", label: "Complete trip" };
  }

  return null;
}

export function formatRideTimestamp(value) {
  if (!value) {
    return "Unknown time";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}
