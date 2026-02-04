/**
 * Soil Service - SoilGrids API (ISRIC)
 * REAL DATA ONLY - No fallbacks
 */

export interface SoilData {
  clay: number;
  sand: number;
  silt: number;
  pH: number;
  nitrogen: number;
  organic_carbon: number;
  cec: number; // Cation Exchange Capacity
  bulk_density: number;
}

export async function fetchSoilData(lat: number, lon: number): Promise<SoilData> {
  // SoilGrids REST API - No key required
  const properties = ['clay', 'sand', 'silt', 'phh2o', 'nitrogen', 'soc', 'cec', 'bdod'];
  const depth = '0-5cm';
  const url = `https://rest.isric.org/soilgrids/v2.0/properties/query?lon=${lon}&lat=${lat}&property=${properties.join('&property=')}&depth=${depth}&value=mean`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 86400 } // Cache for 24 hours (soil data doesn't change frequently)
    });

    if (!response.ok) {
      throw new Error(`SoilGrids API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.properties || !data.properties.layers) {
      throw new Error('Invalid response from SoilGrids API');
    }

    const layers = data.properties.layers;

    // Helper to extract mean value from layer
    const getValue = (propName: string): number => {
      const layer = layers.find((l: any) => l.name === propName);
      if (!layer || !layer.depths || !layer.depths[0] || !layer.depths[0].values) {
        throw new Error(`Missing data for property: ${propName}`);
      }
      return layer.depths[0].values.mean;
    };

    return {
      clay: Math.round(getValue('clay') / 10 * 10) / 10, // g/kg to %
      sand: Math.round(getValue('sand') / 10 * 10) / 10,
      silt: Math.round(getValue('silt') / 10 * 10) / 10,
      pH: Math.round(getValue('phh2o') / 10 * 10) / 10, // pH * 10 to pH
      nitrogen: Math.round(getValue('nitrogen') / 100 * 10) / 10, // cg/kg to g/kg
      organic_carbon: Math.round(getValue('soc') / 10 * 10) / 10, // dg/kg to g/kg
      cec: Math.round(getValue('cec') / 10 * 10) / 10, // mmol(c)/kg
      bulk_density: Math.round(getValue('bdod') / 100 * 10) / 10 // cg/cm³ to g/cm³
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch soil data: ${error.message}`);
    }
    throw new Error('Failed to fetch soil data: Unknown error');
  }
}
