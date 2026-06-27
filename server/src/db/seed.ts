import { eq } from "drizzle-orm";
import { auth } from "../auth";
import { db } from "./index";
import { user } from "./schema/better-auth";

const CHEF_USERNAME = process.env.SEED_CHEF_USERNAME ?? "chef";
const CHEF_PASSWORD = process.env.SEED_CHEF_PASSWORD ?? "ChangeMeImmediately123!";
const CHEF_NAME = process.env.SEED_CHEF_NAME ?? "Chef par défaut";
const CHEF_EMAIL = process.env.SEED_CHEF_EMAIL ?? "chef@timeo.local";

async function seed() {
	const existing = await db.select().from(user).limit(1);
	if (existing.length > 0) {
		console.log("Users already exist, skipping seed.");
		return;
	}

	const result = await auth.api.signUpEmail({
		body: {
			email: CHEF_EMAIL,
			password: CHEF_PASSWORD,
			name: CHEF_NAME,
			username: CHEF_USERNAME,
		},
	});

	if (!result.user) {
		throw new Error("Failed to create chef user");
	}

	await db
		.update(user)
		.set({ role: "chef", mustChangePassword: true })
		.where(eq(user.id, result.user.id));

	console.log(`✓ Chef créé : ${CHEF_USERNAME} (${CHEF_EMAIL})`);
	console.log(`⚠ Mot de passe provisoire : ${CHEF_PASSWORD}`);
	console.log("→ Changez-le après la première connexion.");
}

seed()
	.then(() => process.exit(0))
	.catch((err) => {
		console.error("Seed failed:", err);
		process.exit(1);
	});
