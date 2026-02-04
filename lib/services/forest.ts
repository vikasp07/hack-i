/**
 * Forest Service - Global Forest Watch API
 * REAL DATA ONLY - No fallbacks
 */

export interface ForestData {
  forest_cover: number;
  tree_cover_loss: number;
  alerts: number;
  deforestation_rate: number;
  protected_areas: boolean;
}

export async function fetchForestData(lat: number, lon: number): Promise<ForestData> {
  const apiKey = process.env.GFW_API_KEY;

  if (!apiKey) {
    throw new Error('GFW_API_KEY is not configured. Please add it to .env file.');
  }

  try {
    // Fetch tree cover density
    const coverUrl = `https://data-api.globalforestwatch.org/dataset/umd_tree_cover_density_2000/latest/query?sql=SELECT tcd_2000 FROM data WHERE ST_Intersects(ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Point","coordinates":[${lon},${lat}]}'),4326), geom) LIMIT 1`;
    
    const coverResponse = await fetch(coverUrl, {
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      next: { revalidate: 86400 } // Cache for 24 hours
    });

    if (!coverResponse.ok) {
      throw new Error(`GFW API error: ${coverResponse.statusText}`);
    }

    const coverData = await coverResponse.json();
    
    if (!coverData.data || coverData.data.length === 0) {
      throw new Error('No forest cover data available for this location');
    }

    const forestCover = coverData.data[0].tcd_2000 || 0;

    // Fetch tree cover loss (2001-2023)
    const lossUrl = `https://data-api.globalforestwatch.org/dataset/umd_tree_cover_loss/latest/query?sql=SELECT SUM(area__ha) as loss_area FROM data WHERE ST_Intersects(ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Point","coordinates":[${lon},${lat}]}'),4326), geom) AND umd_tree_cover_density_2000__threshold >= 30`;

    const lossResponse = await fetch(lossUrl, {
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      next: { revalidate: 86400 }
    });

    let treeCoverLoss = 0;
    if (lossResponse.ok) {
      const lossData = await lossResponse.json();
      treeCoverLoss = lossData.data?.[0]?.loss_area || 0;
    }

    // Fetch GLAD alerts (recent deforestation)
    const alertsUrl = `https://data-api.globalforestwatch.org/dataset/umd_glad_landsat_alerts/latest/query?sql=SELECT COUNT(*) as alert_count FROM data WHERE ST_DWithin(ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Point","coordinates":[${lon},${lat}]}'),4326), geom, 0.1) AND alert__date >= CURRENT_DATE - INTERVAL '90 days'`;

    const alertsResponse = await fetch(alertsUrl, {
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    let alerts = 0;
    if (alertsResponse.ok) {
      const alertsData = await alertsResponse.json();
      alerts = alertsData.data?.[0]?.alert_count || 0;
    }

    // Calculate deforestation rate (simplified)
    const deforestationRate = treeCoverLoss > 0 ? Math.round((treeCoverLoss / 23) * 100) / 100 : 0;

    return {
      forest_cover: Math.min(100, Math.max(0, Math.round(forestCover * 10) / 10)),
      tree_cover_loss: Math.round(treeCoverLoss * 10) / 10,
      alerts: alerts,
      deforestation_rate: deforestationRate,
      protected_areas: false // Would need additional API call
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch forest data: ${error.message}`);
    }
    throw new Error('Failed to fetch forest data: Unknown error');
  }
}
