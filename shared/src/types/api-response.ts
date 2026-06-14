export type ApiResponse<T = unknown> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string; message?: string }
