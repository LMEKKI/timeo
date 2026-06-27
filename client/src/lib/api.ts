import { hc } from "hono/client"
import type { AppType } from "server"

type ApiResponse = { ok: boolean; json: () => Promise<{ data: unknown }> }
type IdArg = { param: { id: string } }
type JsonArg = { param?: { id: string }; json: unknown }
type ListArg = { query?: Record<string, string> }

export type RpcClient = {
	api: {
		clients: {
			$get: (args?: ListArg) => Promise<ApiResponse>
			$post: (args: { json: unknown }) => Promise<ApiResponse>
			":id": {
				$get: (args: IdArg) => Promise<ApiResponse>
				$patch: (args: IdArg & { json: unknown }) => Promise<ApiResponse>
				$delete: (args: IdArg) => Promise<ApiResponse>
				interlocuteurs: {
					$post: (args: IdArg & { json: unknown }) => Promise<ApiResponse>
				}
			}
		}
		interventions: {
			$get: (args?: ListArg) => Promise<ApiResponse>
			$post: (args: { json: unknown }) => Promise<ApiResponse>
			":id": {
				$get: (args: IdArg) => Promise<ApiResponse>
				$patch: (args: IdArg & { json: unknown }) => Promise<ApiResponse>
				$delete: (args: IdArg) => Promise<ApiResponse>
				transition: { $post: (args: JsonArg) => Promise<ApiResponse> }
				assign: { $post: (args: JsonArg) => Promise<ApiResponse> }
				notes: { $post: (args: JsonArg) => Promise<ApiResponse> }
			}
		}
		users: {
			$get: () => Promise<ApiResponse>
			$post: (args: { json: unknown }) => Promise<ApiResponse>
		}
		dashboard: {
			stats: { $get: () => Promise<ApiResponse> }
			activity: { $get: () => Promise<ApiResponse> }
		}
	}
}

export const api = hc<AppType>(import.meta.env.VITE_API_URL ?? "http://localhost:3000", {
	init: { credentials: "include" },
}) as unknown as RpcClient
