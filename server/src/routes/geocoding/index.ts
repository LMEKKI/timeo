import { z } from "zod"
import { factory } from "../../lib/hono"
import { requireAuth } from "../../middleware/auth"
import { validationError } from "../../lib/errors"

const app = factory.createApp()

const searchSchema = z.object({
  q: z.string().min(1, "Paramètre 'q' requis").max(500),
})

/**
 * GET /api/geocoding/search?q=...
 *
 * Proxy to Google Maps Geocoding API.
 * Returns address predictions matching the query string.
 */
app.get("/search", requireAuth, async (c) => {
  const query = searchSchema.safeParse(c.req.query())
  if (!query.success) {
    return validationError(c, "Paramètre 'q' requis")
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    return c.json(
      {
        success: false,
        error: { code: "CONFIG_ERROR", message: "Geocoding non configuré" },
      },
      500,
    )
  }

  try {
    const url = new URL("https://maps.googleapis.com/maps/api/geocode/json")
    url.searchParams.set("address", query.data.q)
    url.searchParams.set("key", apiKey)
    url.searchParams.set("language", "fr")
    url.searchParams.set("region", "fr")

    const response = await fetch(url.toString())
    const data = await response.json()

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      console.error("Geocoding API error", { status: data.status, error: data.error_message })
      return c.json(
        {
          success: false,
          error: { code: "GEOCODING_ERROR", message: "Erreur de géocodage" },
        },
        502,
      )
    }

    const results = (data.results || []).map((r: { formatted_address: string; geometry: { location: { lat: number; lng: number } } }) => ({
      address: r.formatted_address,
      lat: r.geometry.location.lat,
      lng: r.geometry.location.lng,
    }))

    return c.json({ success: true, data: results }, 200)
  } catch (err) {
    console.error("Geocoding request failed", err)
    return c.json(
      {
        success: false,
        error: { code: "GEOCODING_ERROR", message: "Service de géocodage indisponible" },
      },
      502,
    )
  }
})

export default app
