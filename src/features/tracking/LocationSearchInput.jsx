import { useEffect, useState } from "react";
import { hasMapboxToken, searchLocations } from "../../lib/maps/mapbox";
import { Input } from "../../components/ui/Input";

export function LocationSearchInput({
  label,
  value,
  onChange,
  onSelect,
  placeholder
}) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!hasMapboxToken() || !value?.trim() || value.trim().length < 3) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const timer = window.setTimeout(async () => {
      try {
        const nextResults = await searchLocations(value);

        if (!cancelled) {
          setResults(nextResults);
          setOpen(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [value]);

  return (
    <div className="relative">
      <Input
        label={label}
        value={value}
        placeholder={placeholder}
        onFocus={() => setOpen(true)}
        onChange={(event) => onChange(event.target.value)}
        hint={
          hasMapboxToken()
            ? loading
              ? "Searching Mapbox places..."
              : "Start typing and choose a suggested location."
            : "Mapbox token missing, so this field uses manual text entry."
        }
      />
      {hasMapboxToken() && open && results.length ? (
        <div className="absolute z-20 mt-2 w-full rounded-[20px] border border-line bg-white p-2 shadow-panel">
          {results.map((result) => (
            <button
              key={result.id}
              type="button"
              className="block w-full rounded-2xl px-3 py-3 text-left text-sm transition hover:bg-surface-2"
              onMouseDown={(event) => {
                event.preventDefault();
                onSelect(result);
                setOpen(false);
              }}
            >
              {result.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
