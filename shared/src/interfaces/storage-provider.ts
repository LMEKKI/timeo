export interface UploadResult {
  key: string
  url: string
}

export interface IStorageProvider {
  upload(key: string, data: Uint8Array, mimeType?: string): Promise<UploadResult>
  getSignedUrl(key: string, expiresInSeconds?: number): Promise<string>
  delete(key: string): Promise<void>
  copy(sourceKey: string, destKey: string): Promise<string>
}
