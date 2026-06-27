#!/usr/bin/env bun
/**
 * Drop all Timeo tables + types in the target database.
 * Usage: bun scripts/reset-db.ts
 *
 * Requires: DATABASE_URL in .env.local (or environment)
 * WARNING: This DELETES ALL DATA. Use only on dev/test databases.
 */
import postgres from "postgres"

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
	console.error("❌ DATABASE_URL is not set")
	process.exit(1)
}

const sql = postgres(databaseUrl, { max: 1 })

const dropStatements = [
	`DROP TABLE IF EXISTS intervention_notes CASCADE`,
	`DROP TABLE IF EXISTS intervention_technicien CASCADE`,
	`DROP TABLE IF EXISTS interventions CASCADE`,
	`DROP TABLE IF EXISTS interlocuteurs CASCADE`,
	`DROP TABLE IF EXISTS clients CASCADE`,
	`DROP TABLE IF EXISTS addresses CASCADE`,
	`DROP TABLE IF EXISTS "session" CASCADE`,
	`DROP TABLE IF EXISTS "account" CASCADE`,
	`DROP TABLE IF EXISTS "verification" CASCADE`,
	`DROP TABLE IF EXISTS "user" CASCADE`,
	`DROP TYPE IF EXISTS user_role CASCADE`,
	`DROP TYPE IF EXISTS availability_status CASCADE`,
	`DROP TYPE IF EXISTS intervention_status CASCADE`,
	`DROP TYPE IF EXISTS intervention_priority CASCADE`,
	`DROP TYPE IF EXISTS intervention_team_role CASCADE`,
]

let successCount = 0
let skipCount = 0

for (const stmt of dropStatements) {
	try {
		await sql.unsafe(stmt)
		successCount++
	} catch (e) {
		const msg = (e as Error).message
		if (msg.includes("does not exist")) {
			skipCount++
		} else {
			console.error(`✗ ${stmt} → ${msg}`)
		}
	}
}

await sql.end()

console.log(`✓ ${successCount} statements dropped, ${skipCount} skipped (already absent)`)
console.log("→ Run `bun run db:push` to recreate the schema")
