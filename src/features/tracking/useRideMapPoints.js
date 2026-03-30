import { useEffect, useState } from "react";
import { geocodeLocationLabel } from "../../lib/maps/mapbox";

export function useRideMapPoints(ride) {
  const [pickup, setPickup] = useState(null);
  const [dropoff, setDropoff] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function resolve() {
      if (!ride?.pickupLocation || !ride?.dropLocation) {
        setPickup(null);
        setDropoff(null);
        return;
      }

      setLoading(true);

      try {
        const [pickupPoint, dropoffPoint] = await Promise.all([
          geocodeLocationLabel(ride.pickupLocation),
          geocodeLocationLabel(ride.dropLocation)
        ]);

        if (!cancelled) {
          setPickup(pickupPoint);
          setDropoff(dropoffPoint);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    resolve();

    return () => {
      cancelled = true;
    };
  }, [ride?.dropLocation, ride?.pickupLocation]);

  return { pickup, dropoff, loading };
}
