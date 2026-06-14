import { Hono } from "hono";
import { cors } from "hono/cors";
import { errorHandler } from "./middleware/error";

export const app = new Hono()

.use(cors())

.onError(errorHandler)

.get("/", (c) => {
	return c.text("Hello Hono!");
})

.get("/health", (c) => {
	return c.json({ success: true, message: "Timeo API is running" });
});

export default app;