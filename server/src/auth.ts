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

const vercelPreviewUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined;

export const auth = betterAuth({
	baseURL: {
		allowedHosts: ["*.vercel.app", "localhost:3000", "localhost:5173"],
		fallback: process.env.BETTER_AUTH_URL,
		protocol: process.env.NODE_ENV === "production" ? "https" : "http",
	},
	advanced: {
		trustedProxyHeaders: true,
	},
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
	trustedOrigins: [process.env.CORS_ORIGIN, vercelPreviewUrl].filter((origin): origin is string =>
		Boolean(origin),
	),
	plugins: [
		admin({ ac, roles: { chef, tech }, defaultRole: "tech", adminRoles: ["chef"] }),
		username(),
	],
});
