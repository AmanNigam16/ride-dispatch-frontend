import Map, { Marker } from "react-map-gl";
import { mapboxToken } from "../../lib/api/env";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";

function hasValidCoordinates(point) {
  return (
    point &&
    Number.isFinite(point.lat) &&
    Number.isFinite(point.lng)
  );
}

function getCenter(points) {
  const validPoints = points.filter(hasValidCoordinates);

  if (!validPoints.length) {
    return {
      latitude: 20.5937,
      longitude: 78.9629,
      zoom: 3.5
    };
  }

  const latitude =
    validPoints.reduce((sum, point) => sum + point.lat, 0) / validPoints.length;
  const longitude =
    validPoints.reduce((sum, point) => sum + point.lng, 0) / validPoints.length;

  return {
    latitude,
    longitude,
    zoom: validPoints.length > 1 ? 11 : 13
  };
}

function Pin({ color, label }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="h-4 w-4 rounded-full border-2 border-white shadow"
        style={{ backgroundColor: color }}
      />
      <span className="rounded-full bg-app px-2 py-1 text-[10px] font-semibold text-white">
        {label}
      </span>
    </div>
  );
}

export function RideMap({
  title,
  subtitle,
  pickup,
  dropoff,
  driverLocation,
  loading = false
}) {
  const center = getCenter([pickup, dropoff, driverLocation]);
  const hasValidPickup = hasValidCoordinates(pickup);
  const hasValidDropoff = hasValidCoordinates(dropoff);
  const hasValidDriverLocation = hasValidCoordinates(driverLocation);

  if (!mapboxToken) {
    return (
      <Card className="h-full">
        <div className="flex h-full min-h-[320px] flex-col justify-between rounded-[24px] border border-dashed border-line bg-surface-2 p-5">
          <div>
            <Badge tone="warning">Mapbox token missing</Badge>
            <h3 className="mt-4 font-display text-2xl font-semibold">{title}</h3>
            <p className="mt-2 text-sm text-muted">
              {subtitle || "Add a Mapbox token to unlock the live map view."}
            </p>
          </div>
          <div className="space-y-3 text-sm text-muted">
            <p>Pickup: {pickup?.label || "Route preview unavailable"}</p>
            <p>Dropoff: {dropoff?.label || "Route preview unavailable"}</p>
            <p>
              Driver:{" "}
              {driverLocation ? "Live coordinates received" : "Awaiting location stream"}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-3">
      <div className="mb-3 flex items-start justify-between gap-4 px-2 pt-2">
        <div>
          <h3 className="font-display text-2xl font-semibold">{title}</h3>
          <p className="mt-1 text-sm text-muted">
            {loading
              ? "Resolving map positions from your route..."
              : subtitle || "Follow pickup, dropoff, and live driver movement."}
          </p>
        </div>
        <Badge tone={driverLocation ? "success" : "neutral"}>
          {driverLocation ? "Driver live" : "Static route"}
        </Badge>
      </div>
      <div className="overflow-hidden rounded-[24px]">
        <Map
          key={`${center.latitude}-${center.longitude}-${center.zoom}`}
          initialViewState={center}
          mapboxAccessToken={mapboxToken}
          mapStyle="mapbox://styles/mapbox/light-v11"
          style={{ width: "100%", minHeight: 360 }}
        >
          {hasValidPickup ? (
            <Marker longitude={pickup.lng} latitude={pickup.lat}>
              <Pin color="#1083db" label="Pickup" />
            </Marker>
          ) : null}
          {hasValidDropoff ? (
            <Marker longitude={dropoff.lng} latitude={dropoff.lat}>
              <Pin color="#ff6e40" label="Drop" />
            </Marker>
          ) : null}
          {hasValidDriverLocation ? (
            <Marker longitude={driverLocation.lng} latitude={driverLocation.lat}>
              <Pin color="#1aa165" label="Driver" />
            </Marker>
          ) : null}
        </Map>
      </div>
    </Card>
  );
}
