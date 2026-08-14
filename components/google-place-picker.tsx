"use client";

import { useEffect, useRef, useState } from "react";
import "./google-place-picker.css";

type PlaceValues = { venue: string; address: string; mapUrl: string };
type GoogleMapsApi = any;

let mapsApiPromise: Promise<GoogleMapsApi> | undefined;

function loadGoogleMaps(apiKey: string) {
  const google = (window as Window & { google?: GoogleMapsApi }).google;
  if (google?.maps?.places) return Promise.resolve(google);
  if (mapsApiPromise) return mapsApiPromise;

  mapsApiPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places&language=es&region=AR&v=weekly`;
    script.async = true;
    script.dataset.googleMaps = "true";
    script.onload = () => {
      const api = (window as Window & { google?: GoogleMapsApi }).google;
      if (api?.maps?.places) resolve(api);
      else reject(new Error("Google Maps no se pudo inicializar."));
    };
    script.onerror = () => reject(new Error("No pudimos cargar Google Maps."));
    document.head.appendChild(script);
  });

  return mapsApiPromise;
}

function mapUrlFor(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function GooglePlacePicker({ venue, address, mapUrl, onChange }: PlaceValues & { onChange: (values: PlaceValues) => void }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const onChangeRef = useRef(onChange);
  const valuesRef = useRef({ venue, address, mapUrl });
  const [status, setStatus] = useState<"loading" | "ready" | "unavailable">("loading");

  onChangeRef.current = onChange;
  valuesRef.current = { venue, address, mapUrl };

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey || !mapRef.current || !searchRef.current) {
      setStatus("unavailable");
      return;
    }

    let active = true;
    const listeners: Array<{ remove: () => void }> = [];

    void loadGoogleMaps(apiKey).then((google) => {
      if (!active || !mapRef.current || !searchRef.current) return;

      const map = new google.maps.Map(mapRef.current, {
        center: { lat: -34.6037, lng: -58.3816 },
        zoom: 11,
        disableDefaultUI: true,
        zoomControl: true,
        clickableIcons: false,
        gestureHandling: "cooperative",
      });
      const marker = new google.maps.Marker({ map, draggable: true, animation: google.maps.Animation.DROP });
      const geocoder = new google.maps.Geocoder();
      const autocomplete = new google.maps.places.Autocomplete(searchRef.current, { fields: ["name", "formatted_address", "geometry", "url"], componentRestrictions: { country: "ar" } });

      const setLocation = (values: PlaceValues, location?: GoogleMapsApi) => {
        onChangeRef.current(values);
        if (!location) return;
        map.panTo(location);
        map.setZoom(16);
        marker.setPosition(location);
      };

      listeners.push(autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        const selectedAddress = place.formatted_address ?? searchRef.current?.value ?? "";
        const selectedVenue = place.name ?? selectedAddress;
        const query = [selectedVenue, selectedAddress].filter(Boolean).join(", ");
        setLocation({ venue: selectedVenue, address: selectedAddress, mapUrl: place.url ?? mapUrlFor(query) }, place.geometry?.location);
      }));

      const reverseGeocode = (location: GoogleMapsApi) => {
        void geocoder.geocode({ location }).then(({ results }: { results: GoogleMapsApi[] }) => {
          const result = results[0];
          const selectedAddress = result?.formatted_address ?? "";
          setLocation({ venue: selectedAddress, address: selectedAddress, mapUrl: mapUrlFor(selectedAddress) }, location);
        }).catch(() => {
          const coordinates = `${location.lat()},${location.lng()}`;
          setLocation({
            ...valuesRef.current,
            mapUrl: mapUrlFor(coordinates),
          }, location);
        });
      };

      listeners.push(map.addListener("click", (event: { latLng?: GoogleMapsApi }) => { if (event.latLng) reverseGeocode(event.latLng); }));
      listeners.push(marker.addListener("dragend", (event: { latLng?: GoogleMapsApi }) => { if (event.latLng) reverseGeocode(event.latLng); }));
      setStatus("ready");
    }).catch(() => { if (active) setStatus("unavailable"); });

    return () => {
      active = false;
      listeners.forEach((listener) => listener.remove());
    };
  }, []);

  const query = [venue, address].filter(Boolean).join(", ");
  return <section className="placePicker" aria-label="Ubicación del evento"><div className="placePickerIntro"><span className="placePickerIcon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></svg></span><div><b>Elegí la ubicación en el mapa</b><p>Buscá un lugar, hacé clic en el mapa o arrastrá el marcador.</p></div></div><label className="placeSearch"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><circle cx="10.8" cy="10.8" r="5.8" /><path d="m15.2 15.2 4 4" /></svg><input ref={searchRef} placeholder="Buscá salón, dirección o ciudad" autoComplete="off" /></label><div className="placeMap" ref={mapRef}>{status === "loading" && <span>Preparando el mapa…</span>}{status === "unavailable" && <span>No pudimos cargar el mapa. Podés completar los datos manualmente.</span>}</div><div className="placeFields"><label>Lugar<input value={venue} placeholder="Ej.: Casa campo" onChange={(event) => onChange({ venue: event.currentTarget.value, address, mapUrl: mapUrl || mapUrlFor([event.currentTarget.value, address].filter(Boolean).join(", ")) })} /></label><label>Dirección<input value={address} placeholder="Ej.: Av. Libertador 1234, Palermo" onChange={(event) => onChange({ venue, address: event.currentTarget.value, mapUrl: mapUrl || mapUrlFor([venue, event.currentTarget.value].filter(Boolean).join(", ")) })} /></label></div>{mapUrl && <a className="placeMapLink" href={mapUrl} target="_blank" rel="noreferrer">Abrir ubicación en Google Maps <span aria-hidden="true">↗</span></a>}{!mapUrl && query && <p className="placePickerHint">Seleccioná una sugerencia o ubicá el marcador para guardar el enlace de Google Maps.</p>}</section>;
}
