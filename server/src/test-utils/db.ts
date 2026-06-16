import { PGlite } from "@electric-sql/pglite"
import { drizzle } from "drizzle-orm/pglite"
import * as schema from "../db/schema"

let client: PGlite | null = null

export async function createTestDb() {
  if (!client) {
    client = new PGlite()
  }
  const db = drizzle(client, { schema })
  return { db, client }
}

export async function closeTestDb(): Promise<void> {
  if (client) {
    await client.close()
    client = null
  }
}
