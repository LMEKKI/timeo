export interface Company {
  id: string // UUIDv7
  name: string
  createdAt: Date
}

export interface Branch {
  id: string // UUIDv7
  companyId: string // FK → Company
  name: string
  latitude: number
  longitude: number
  createdAt: Date
}
