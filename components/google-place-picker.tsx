"use client";

import { useEffect, useRef, useState } from "react";
import "./google-place-picker.css";

type PlaceValues = { venue: string; address: string; mapUrl: string };
type PlaceErrors = Partial<Record<"venue" | "venueAddress" | "mapUrl", string>>;
type GoogleMapsApi = any;

let mapsApiPromise: Promise<GoogleMapsApi> | undefined;

function loadGoogleMaps(apiKey: string) {
  const google = (window as Window & { google?: GoogleMapsApi }).google;
  if (google?.maps?.places) return Promise.resolve(google);
  if (mapsApiPromise) return mapsApiPromise;

  mapsApiPromise = new Promise((resolve, reject) => {
    const browserWindow = window as Window & { google?: GoogleMapsApi; __papeletaGoogleMapsReady?: () => void };
    const callbackName = "__papeletaGoogleMapsReady";
    const script = document.createElement("script");
    const timeout = window.setTimeout(() => fail(new Error("Google Maps tardó demasiado en responder.")), 15_000);
    const cleanup = () => {
      window.clearTimeout(timeout);
      delete browserWindow.__papeletaGoogleMapsReady;
    };
    const fail = (error: Error) => {
      cleanup();
      script.remove();
      reject(error);
    };

    browserWindow.__papeletaGoogleMapsReady = () => {
      const api = browserWindow.google;
      if (!api?.maps?.places) return fail(new Error("Google Maps no se pudo inicializar."));
      cleanup();
      resolve(api);
    };
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places&language=es&region=AR&v=weekly&loading=async&callback=${callbackName}`;
    script.async = true;
    script.dataset.googleMaps = "true";
    script.onerror = () => fail(new Error("No pudimos cargar Google Maps."));
    document.head.appendChild(script);
  }).catch((error) => {
    // A transient network or consent failure must not poison every later retry.
    mapsApiPromise = undefined;
    throw error;
  });

  return mapsApiPromise;
}

function mapUrlFor(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function GooglePlacePicker({ venue, address, mapUrl, errors = {}, onChange }: PlaceValues & { errors?: PlaceErrors; onChange: (values: PlaceValues) => void }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const onChangeRef = useRef(onChange);
  const valuesRef = useRef({ venue, address, mapUrl });
  const [status, setStatus] = useState<"loading" | "ready" | "unavailable">("loading");

  useEffect(() => {
    onChangeRef.current = onChange;
    valuesRef.current = { venue, address, mapUrl };
  }, [address, mapUrl, onChange, venue]);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey || !mapRef.current || !searchRef.current) {
      setStatus("unavailable");
      return;
    }

    let active = true;
    const listeners: Array<{ remove: () => void }> = [];
    let map: GoogleMapsApi;
    let marker: GoogleMapsApi;
    let autocomplete: GoogleMapsApi;

    void loadGoogleMaps(apiKey).then((google) => {
      if (!active || !mapRef.current || !searchRef.current) return;

      map = new google.maps.Map(mapRef.current, {
        center: { lat: -34.6037, lng: -58.3816 },
        zoom: 11,
        disableDefaultUI: true,
        zoomControl: true,
        clickableIcons: false,
        gestureHandling: "cooperative",
      });
      marker = new google.maps.Marker({ map, draggable: true, animation: google.maps.Animation.DROP });
      const geocoder = new google.maps.Geocoder();
      autocomplete = new google.maps.places.Autocomplete(searchRef.current, { fields: ["name", "formatted_address", "geometry", "url"], componentRestrictions: { country: "ar" } });

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
          if (!active) return;
          const result = results[0];
          const selectedAddress = result?.formatted_address ?? "";
          const selectedVenue = valuesRef.current.venue.trim() || selectedAddress;
          const query = [selectedVenue, selectedAddress].filter(Boolean).join(", ");
          setLocation({ venue: selectedVenue, address: selectedAddress, mapUrl: mapUrlFor(query) }, location);
        }).catch(() => {
          if (!active) return;
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
      const maps = (window as Window & { google?: GoogleMapsApi }).google?.maps;
      if (maps?.event) {
        if (autocomplete) maps.event.clearInstanceListeners(autocomplete);
        if (marker) maps.event.clearInstanceListeners(marker);
        if (map) maps.event.clearInstanceListeners(map);
      }
      marker?.setMap?.(null);
    };
  }, []);

  const query = [venue, address].filter(Boolean).join(", ");
  return <section className="placePicker" aria-label="Ubicación del evento"><div className="placePickerIntro"><span className="placePickerIcon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></svg></span><div><b>Elegí la ubicación en el mapa</b><p>Buscá un lugar, hacé clic en el mapa o arrastrá el marcador.</p></div></div><label className="placeSearch"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><circle cx="10.8" cy="10.8" r="5.8" /><path d="m15.2 15.2 4 4" /></svg><input ref={searchRef} aria-label="Buscar ubicación en Google Maps" placeholder="Buscá salón, dirección o ciudad" autoComplete="off" /></label><div className="placeMap">{status === "loading" && <span className="placeMapStatus" role="status">Preparando el mapa…</span>}{status === "unavailable" && <span className="placeMapStatus" role="status">No pudimos cargar el mapa. Podés completar los datos manualmente.</span>}<div className="placeMapHost" ref={mapRef} /></div><div className="placeFields"><label className="wizardField"><span className="fieldLabel">Lugar <em>Obligatorio</em></span><input value={venue} aria-invalid={Boolean(errors.venue)} aria-describedby={errors.venue ? "venue-error" : undefined} placeholder="Ej.: Casa campo" onChange={(event) => { const nextVenue = event.currentTarget.value; onChange({ venue: nextVenue, address, mapUrl: mapUrlFor([nextVenue, address].filter(Boolean).join(", ")) }); }} />{errors.venue && <span className="fieldError" id="venue-error">{errors.venue}</span>}</label><label className="wizardField"><span className="fieldLabel">Dirección <em>Obligatorio</em></span><input value={address} aria-invalid={Boolean(errors.venueAddress)} aria-describedby={errors.venueAddress ? "venue-address-error" : undefined} placeholder="Ej.: Av. Libertador 1234, Palermo" onChange={(event) => { const nextAddress = event.currentTarget.value; onChange({ venue, address: nextAddress, mapUrl: mapUrlFor([venue, nextAddress].filter(Boolean).join(", ")) }); }} />{errors.venueAddress && <span className="fieldError" id="venue-address-error">{errors.venueAddress}</span>}</label></div>{mapUrl && <a className="placeMapLink" href={mapUrl} target="_blank" rel="noreferrer">Abrir ubicación en Google Maps <span aria-hidden="true">↗</span></a>}{errors.mapUrl && <p className="fieldError" role="alert">{errors.mapUrl}</p>}{!mapUrl && query && <p className="placePickerHint">Seleccioná una sugerencia o ubicá el marcador para guardar el enlace de Google Maps.</p>}</section>;
}
