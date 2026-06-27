import { AppError } from "../lib/errors";
import { env } from "../lib/env";

export type GeocodingResult = {
	latitude: number;
	longitude: number;
	formattedAddress: string;
};

type GoogleGeocodingResponse = {
	status: string;
	results: Array<{
		formatted_address: string;
		geometry: { location: { lat: number; lng: number } };
	}>;
};

export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
	const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
	url.searchParams.set("address", address);
	url.searchParams.set("key", env.GOOGLE_MAPS_API_KEY);

	const response = await fetch(url.toString());
	if (!response.ok) {
		throw new AppError(502, "INTERNAL_ERROR", "Erreur API Google Geocoding");
	}

	const data = (await response.json()) as GoogleGeocodingResponse;
	if (data.status !== "OK") return null;

	const first = data.results[0];
	if (!first) return null;

	return {
		latitude: first.geometry.location.lat,
		longitude: first.geometry.location.lng,
		formattedAddress: first.formatted_address,
	};
}
