import { betterAuth } from "better-auth";
import { admin, username } from "better-auth/plugins";
import { createAccessControl } from "better-auth/plugins/access";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import * as schema from "./db/schema";

const statement = {
	user: ["create", "list", "set-role", "set-password", "ban", "delete"],
	intervention: ["create", "update", "delete", "read"],
} as const;

const ac = createAccessControl(statement);

const chef = ac.newRole({
	user: ["create", "list", "set-password"],
	intervention: ["create", "update", "delete", "read"],
});

const tech = ac.newRole({
	intervention: ["read", "update"],
});

export const auth = betterAuth({
	database: drizzleAdapter(db, { provider: "pg", schema }),
	emailAndPassword: {
		enabled: true,
		autoSignIn: false,
	},
	user: {
		additionalFields: {
			availabilityStatus: {
				type: "string",
				required: false,
				defaultValue: "available",
				input: false,
			},
			mustChangePassword: {
				type: "boolean",
				required: false,
				defaultValue: false,
				input: false,
				returned: true,
			},
		},
	},
	session: {
		expiresIn: 60 * 60 * 24 * 7,
		updateAge: 60 * 60 * 24,
	},
	trustedOrigins: process.env.CORS_ORIGIN ? [process.env.CORS_ORIGIN] : [],
	plugins: [
		admin({ ac, roles: { chef, tech }, defaultRole: "tech", adminRoles: ["chef"] }),
		username(),
	],
});
