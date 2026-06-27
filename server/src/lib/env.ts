import { z } from "zod";

const envSchema = z.object({
	DATABASE_URL: z.string().url(),
	BETTER_AUTH_SECRET: z.string().min(32, "BETTER_AUTH_SECRET must be at least 32 characters"),
	BETTER_AUTH_URL: z.string().url(),
	CORS_ORIGIN: z.string().url(),
	PORT: z.coerce.number().int().positive().default(3000),
	NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
	console.error("Invalid environment variables:", z.treeifyError(parsed.error));
	throw new Error("Invalid environment variables");
}

export const env = parsed.data;
