export interface Company {
  ceo: string
  name: string
  founded: number
}

export interface Roadster {
  apoapsis_au: number
  details: string
  name: string
}

export interface SpaceXData {
  company: Company
  roadster: Roadster
} 