import { describe, it, expect, afterAll } from "bun:test"
import { createTestDb, closeTestDb } from "./db"

describe("PGLite test DB", () => {
  afterAll(async () => {
    await closeTestDb()
  })

  it("should create a database connection", async () => {
    const { db } = await createTestDb()
    expect(db).toBeDefined()
  })

  it("should run a query", async () => {
    const { db } = await createTestDb()
    const result = await db.execute("SELECT 1 as val")
    expect(result).toBeDefined()
  })
})
