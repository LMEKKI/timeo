import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import * as schema from "./db/schema"
import { company, branch, userProfile, permission, jobType, formTemplate, workflowConfig } from "./db/schema"
import { job, jobAssignment } from "./db/schema/job"
import { customer } from "./db/schema/customer"

async function seed() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    console.error("DATABASE_URL is required")
    process.exit(1)
  }
  const pgClient = postgres(connectionString)
  const db = drizzle(pgClient, { schema })

  const auth = betterAuth({
    database: drizzleAdapter(db as any, { provider: "pg" }),
    emailAndPassword: { enabled: true },
  })

  console.log("🌱 Seeding database...")

  // 1. Company
  const [comp] = await db.insert(company).values({
    id: "company-1",
    name: "Timeo Demo",
    createdAt: new Date(),
  }).returning()
  if (!comp) throw new Error("Failed to create company")
  console.log("  ✓ Company created")

  // 2. Branch
  const [branch1] = await db.insert(branch).values({
    id: "branch-1",
    companyId: comp.id,
    name: "Paris Centre",
    latitude: 48.8566,
    longitude: 2.3522,
    createdAt: new Date(),
  }).returning()
  if (!branch1) throw new Error("Failed to create branch")
  console.log("  ✓ Branch created")

  // 3. Auth users + profiles
  const userData = [
    { email: "admin@timeo.app", password: "admin123", name: "Admin", role: "GLOBAL_ADMIN" as const },
    { email: "tech1@timeo.app", password: "tech12345", name: "Jean Tech", role: "FIELD_TECHNICIAN" as const },
    { email: "tech2@timeo.app", password: "tech12345", name: "Marie Tech", role: "FIELD_TECHNICIAN" as const },
  ]

  for (const u of userData) {
    const result = await auth.api.signUpEmail({
      body: { email: u.email, password: u.password, name: u.name },
    })
    if (!result) throw new Error(`Failed to create user ${u.email}`)

    await db.insert(userProfile).values({
      id: result.user.id,
      authProviderId: result.user.id,
      branchId: branch1.id,
      firstName: u.name,
      lastName: "",
      email: u.email,
      isDeleted: false,
    })

    await db.insert(permission).values({
      id: crypto.randomUUID(),
      userProfileId: result.user.id,
      role: u.role,
    })

    console.log(`  ✓ User ${u.email} (${u.role})`)
  }

  // 4. Customer
  const [cust] = await db.insert(customer).values({
    id: "customer-1",
    branchId: branch1.id,
    name: "SARL Dupont",
    billingAddress: "12 Rue de Paris, 75001 Paris",
    isDeleted: false,
  }).returning()
  if (!cust) throw new Error("Failed to create customer")
  console.log("  ✓ Customer created")

  // 5. Job Type + Form Template + Workflow Config
  const [jt] = await db.insert(jobType).values({
    id: "jobtype-1",
    companyId: comp.id,
    name: "Maintenance standard",
    estimatedDurationMinutes: 120,
  }).returning()
  if (!jt) throw new Error("Failed to create job type")

  await db.insert(formTemplate).values({
    id: "formtemplate-1",
    jobTypeId: jt.id,
    version: 1,
    title: "Checklist maintenance",
    questionSchema: {},
    isActive: true,
  })

  await db.insert(workflowConfig).values({
    id: "wf-1",
    jobTypeId: jt.id,
    engineType: "standard",
    approvalRequired: true,
  })
  console.log("  ✓ Job type + Form + Workflow created")

  // 6. Jobs at various statuses
  const techUsers = await db.select().from(userProfile).limit(2)
  const jobs = [
    { id: "job-1", status: "SCHEDULED" as const, scheduledAt: new Date(Date.now() + 3600000) },
    { id: "job-2", status: "SCHEDULED" as const, scheduledAt: new Date(Date.now() + 7200000) },
    { id: "job-3", status: "EN_ROUTE" as const, scheduledAt: new Date(Date.now() - 3600000) },
    { id: "job-4", status: "IN_PROGRESS" as const, scheduledAt: new Date(Date.now() - 7200000) },
    { id: "job-5", status: "COMPLETED" as const, scheduledAt: new Date(Date.now() - 86400000) },
  ]

  for (const j of jobs) {
    await db.insert(job).values({
      id: j.id,
      branchId: branch1.id,
      jobTypeId: jt.id,
      formTemplateId: "formtemplate-1",
      customerId: cust.id,
      status: j.status,
      version: 0,
      scheduledStartAt: j.scheduledAt,
      createdAt: j.scheduledAt,
    })

    if (techUsers.length > 0 && techUsers[0]) {
      await db.insert(jobAssignment).values({
        jobId: j.id,
        userProfileId: techUsers[0].id,
        isPrimary: true,
      })
    }
  }
  console.log("  ✓ 5 jobs created")

  await pgClient.end()
  console.log("✅ Seed complete!")
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err)
  process.exit(1)
})
