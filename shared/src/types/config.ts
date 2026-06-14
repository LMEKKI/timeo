export interface CompanyConfig {
  companyId: string
  settings: {
    gpsThresholdMeters: number
    snapshotRetentionYears: number
  }
}

export interface SystemConfig {
  id: number
  minRequiredAppVersion: string
  isMaintenanceActive: boolean
}
