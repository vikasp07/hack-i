/**
 * Species Service - GBIF API
 * REAL DATA ONLY - No fallbacks
 */

export interface SpeciesObservation {
  scientificName: string;
  commonName?: string;
  kingdom: string;
  family?: string;
  count: number;
}

export interface SpeciesData {
  total_observations: number;
  unique_species: number;
  observations: SpeciesObservation[];
  plant_species: string[];
  tree_species: string[];
}

export async function fetchSpeciesData(lat: number, lon: number, radiusKm: number = 50): Promise<SpeciesData> {
  // GBIF Occurrence API - No key required
  const radius = radiusKm * 1000; // Convert to meters
  const url = `https://api.gbif.org/v1/occurrence/search?decimalLatitude=${lat}&decimalLongitude=${lon}&radius=${radius}&limit=300&basisOfRecord=HUMAN_OBSERVATION&basisOfRecord=OBSERVATION&hasCoordinate=true&hasGeospatialIssue=false`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 604800 } // Cache for 7 days
    });

    if (!response.ok) {
      throw new Error(`GBIF API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      throw new Error('No species observations found in this area. Try increasing the search radius.');
    }

    // Process observations
    const speciesMap = new Map<string, SpeciesObservation>();

    data.results.forEach((result: any) => {
      if (!result.scientificName) return;

      const key = result.scientificName;
      if (speciesMap.has(key)) {
        const existing = speciesMap.get(key)!;
        existing.count++;
      } else {
        speciesMap.set(key, {
          scientificName: result.scientificName,
          commonName: result.vernacularName,
          kingdom: result.kingdom || 'Unknown',
          family: result.family,
          count: 1
        });
      }
    });

    const observations = Array.from(speciesMap.values())
      .sort((a, b) => b.count - a.count);

    // Filter plant species
    const plantSpecies = observations
      .filter(obs => obs.kingdom === 'Plantae')
      .map(obs => obs.scientificName);

    // Filter tree species (families commonly containing trees)
    const treeFamilies = [
      'Fabaceae', 'Dipterocarpaceae', 'Fagaceae', 'Pinaceae', 
      'Moraceae', 'Meliaceae', 'Anacardiaceae', 'Myrtaceae',
      'Lauraceae', 'Sapindaceae', 'Malvaceae', 'Combretaceae'
    ];
    
    const treeSpecies = observations
      .filter(obs => 
        obs.kingdom === 'Plantae' && 
        obs.family && 
        treeFamilies.includes(obs.family)
      )
      .map(obs => obs.scientificName);

    return {
      total_observations: data.count,
      unique_species: observations.length,
      observations: observations.slice(0, 50), // Top 50
      plant_species: plantSpecies.slice(0, 30),
      tree_species: treeSpecies.slice(0, 20)
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch species data: ${error.message}`);
    }
    throw new Error('Failed to fetch species data: Unknown error');
  }
}
