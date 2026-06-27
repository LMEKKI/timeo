import { HTTPException } from "hono/http-exception";
import type { ContentfulStatusCode } from "hono/utils/http-status";

export const ErrorCode = {
	VALIDATION_ERROR: "VALIDATION_ERROR",
	UNAUTHORIZED: "UNAUTHORIZED",
	FORBIDDEN: "FORBIDDEN",
	NOT_FOUND: "NOT_FOUND",
	CONFLICT: "CONFLICT",
	INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

export class AppError extends HTTPException {
	constructor(
		status: ContentfulStatusCode,
		public code: ErrorCode,
		message: string,
		public field?: string,
	) {
		super(status, { message });
	}
}

export const handleError = (err: unknown): {
	status: ContentfulStatusCode;
	body: { error: { code: ErrorCode | string; message: string; field?: string } };
} => {
	if (err instanceof AppError) {
		return {
			status: err.status,
			body: {
				error: {
					code: err.code,
					message: err.message,
					...(err.field ? { field: err.field } : {}),
				},
			},
		};
	}
	if (err instanceof HTTPException) {
		return {
			status: err.status,
			body: { error: { code: "HTTP_EXCEPTION", message: err.message } },
		};
	}
	console.error("Unexpected error:", err);
	return {
		status: 500,
		body: { error: { code: "INTERNAL_ERROR", message: "Erreur serveur. Réessayez." } },
	};
};
