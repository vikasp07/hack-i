export interface Coordinates {
  lat: number
  lng: number
}

export interface Metrics {
  health_score: number
  ndvi_current: number
  soil_ph: number
  moisture_index: number
  lst_temp: number
  aqi: number
  forest_cover: number
  carbon_sequestration: number
}

export interface HistoryEntry {
  month: string
  ndvi: number
  rainfall: number
  temperature: number
  moisture: number
}

export interface Species {
  name: string
  type: 'Native' | 'Exotic' | 'Hybrid'
  suitability: number
  waterRequirement: 'Low' | 'Medium' | 'High'
  carbonCapture: number
  description: string
  droughtTolerance: number
  mineralSensitivity: number
}

export interface SoilProfile {
  ph: number
  nitrogen: number
  phosphorus: number
  potassium: number
  organicMatter: number
  texture: string
}

export interface Alert {
  id: string
  type: 'warning' | 'critical' | 'info'
  message: string
  timestamp: string
}

export interface HeatmapCell {
  lat: number
  lng: number
  ndvi: number
  moisture: number
  temperature: number
  composite: number
}

export interface NDVIAnalysis {
  cells: HeatmapCell[]
  optimalZones: HeatmapCell[]
  affectedMetric: 'moisture' | 'temperature' | 'both'
  correlationStrength: number
}

export interface CalamityScenario {
  type: 'drought' | 'flood' | 'mineral_depletion' | 'heat_wave' | 'frost' | 'pest_outbreak'
  severity: number // 0-100
  duration: number // weeks
  affectedArea: number // percentage
}

export interface SimulationResult {
  scenario: CalamityScenario
  speciesImpact: {
    species: Species
    survivalRate: number
    growthImpact: number
    recoveryTime: number // weeks
  }[]
  metricsImpact: {
    ndvi: number
    moisture: number
    soilHealth: number
    carbonCapture: number
  }
  recommendations: string[]
}

export interface PredictionData {
  timeframe: string
  ndviPrediction: number
  confidenceInterval: [number, number]
  riskFactors: {
    factor: string
    probability: number
    impact: 'low' | 'medium' | 'high'
  }[]
  optimalActions: string[]
}

export interface ApiResponse {
  status: 'success' | 'error' | 'loading'
  coordinates: Coordinates
  metrics: Metrics
  history: HistoryEntry[]
  species: Species[]
  soilProfile: SoilProfile
  alerts: Alert[]
  ndviAnalysis?: NDVIAnalysis
  predictions?: PredictionData[]
}
