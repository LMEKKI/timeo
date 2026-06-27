export type Coordinates = { latitude: number; longitude: number }

function toRadians(deg: number): number {
	return (deg * Math.PI) / 180
}

export function haversineDistanceKm(a: Coordinates, b: Coordinates): number {
	const R = 6371
	const dLat = toRadians(b.latitude - a.latitude)
	const dLon = toRadians(b.longitude - a.longitude)
	const lat1 = toRadians(a.latitude)
	const lat2 = toRadians(b.latitude)

	const h =
		Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
	return 2 * R * Math.asin(Math.sqrt(h))
}

export type InterventionPoint = {
	id: string
	title: string
	coordinates: Coordinates
	date: string
}

export type ProximityGroup = {
	centerId: string
	interventionIds: string[]
	averageDistanceKm: number
}

export function groupByProximity(
	points: InterventionPoint[],
	maxDistanceKm: number,
): ProximityGroup[] {
	if (points.length < 2) return []

	const visited = new Set<string>()
	const groups: ProximityGroup[] = []

	for (const center of points) {
		if (visited.has(center.id)) continue

		const cluster: InterventionPoint[] = [center]
		visited.add(center.id)

		for (const candidate of points) {
			if (visited.has(candidate.id)) continue
			if (candidate.id === center.id) continue

			const minDistance = Math.min(
				...cluster.map((p) => haversineDistanceKm(p.coordinates, candidate.coordinates)),
			)
			if (minDistance <= maxDistanceKm) {
				cluster.push(candidate)
				visited.add(candidate.id)
			}
		}

		if (cluster.length >= 2) {
			let totalDistance = 0
			for (let i = 0; i < cluster.length; i++) {
				for (let j = i + 1; j < cluster.length; j++) {
					const p = cluster[i]
					const q = cluster[j]
					if (!p || !q) continue
					totalDistance += haversineDistanceKm(p.coordinates, q.coordinates)
				}
			}
			const pairs = (cluster.length * (cluster.length - 1)) / 2
			groups.push({
				centerId: center.id,
				interventionIds: cluster.map((p) => p.id),
				averageDistanceKm: pairs > 0 ? totalDistance / pairs : 0,
			})
		}
	}

	return groups
}
