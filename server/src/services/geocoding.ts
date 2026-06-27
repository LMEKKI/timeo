import { AppError } from "../lib/errors"

const PHOTON_URL = "https://photon.komoot.io/api/"

export type GeocodingResult = {
	latitude: number
	longitude: number
	formattedAddress: string
}

type PhotonFeature = {
	geometry: { coordinates: [number, number] }
	properties: {
		name?: string
		street?: string
		housenumber?: string
		postcode?: string
		city?: string
		country?: string
	}
}

type PhotonResponse = {
	type: "FeatureCollection"
	features: PhotonFeature[]
}

export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
	const url = new URL(PHOTON_URL)
	url.searchParams.set("q", address)
	url.searchParams.set("limit", "1")

	const response = await fetch(url.toString(), {
		headers: { "User-Agent": "Timeo/1.0 (gestion interventions terrain)" },
	})

	if (!response.ok) {
		throw new AppError(502, "INTERNAL_ERROR", "Erreur API Photon")
	}

	const data = (await response.json()) as PhotonResponse
	const feature = data.features[0]
	if (!feature) return null

	const [longitude, latitude] = feature.geometry.coordinates
	const p = feature.properties
	const formattedAddress = [p.housenumber, p.street, p.postcode, p.city, p.country]
		.filter(Boolean)
		.join(", ")

	return {
		latitude,
		longitude,
		formattedAddress: formattedAddress || p.name || address,
	}
}
