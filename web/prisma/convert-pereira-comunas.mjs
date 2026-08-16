/**
 * One-off conversion: Pereira's official comuna boundaries, published by
 * the Alcaldía's own GIS portal (mapas-pereira.opendata.arcgis.com, item
 * 36474e8eba2f4d49a4701d31c782251c, "Comunas del municipio de Pereira" --
 * public, data published 2017, last updated 2019). Downloaded as a
 * Shapefile (the portal's only offered format for this item; no live
 * GeoJSON/FeatureServer endpoint exists for it).
 *
 * Reprojects from the shapefile's native CRS (MAGNA-SIRGAS / Colombia Oeste,
 * a projected meters-based system -- see Comunas.prj) to WGS84 lat/lng,
 * which MapLibre/GeoJSON require. The proj4 definition below is built
 * directly from Comunas.prj's own parameters rather than assuming an EPSG
 * code, so it stays correct even if re-run against a shapefile from a
 * slightly different Colombian projection zone.
 *
 * Run once via `node prisma/convert-pereira-comunas.mjs` after downloading
 * and unzipping the shapefile into _pereira_comunas_extract/ (source .shp/
 * .dbf/.prj files are NOT committed -- one-time download, only the
 * converted output at public/data/comunas-{divipolaCode}.geojson is
 * checked in, named for reuse by other cities' boundary files later).
 * Source: https://mapas-pereira.opendata.arcgis.com/datasets/36474e8eba2f4d49a4701d31c782251c
 * (item id 36474e8eba2f4d49a4701d31c782251c, public, "No License Provided"
 * -- Colombian municipal open data published under the transparency law,
 * not a formal reuse license; attributed here and in the map's legend).
 */
import { open } from "shapefile";
import proj4 from "proj4";
import { writeFileSync } from "fs";

const SOURCE_CRS =
  "+proj=tmerc +lat_0=4.596200416666666 +lon_0=-77.07750791666666 +k=1 +x_0=1000000 +y_0=1000000 +ellps=GRS80 +units=m +no_defs";
const projection = proj4(SOURCE_CRS, "WGS84");

function reprojectCoords(coords) {
  if (typeof coords[0] === "number") {
    const [lng, lat] = projection.forward(coords);
    return [Math.round(lng * 1e6) / 1e6, Math.round(lat * 1e6) / 1e6];
  }
  return coords.map(reprojectCoords);
}

async function main() {
  const source = await open("_pereira_comunas_extract/Comunas.shp", "_pereira_comunas_extract/Comunas.dbf");
  const features = [];
  let result = await source.read();
  while (!result.done) {
    const feature = result.value;
    features.push({
      type: "Feature",
      properties: feature.properties,
      geometry: {
        type: feature.geometry.type,
        coordinates: reprojectCoords(feature.geometry.coordinates),
      },
    });
    result = await source.read();
  }

  console.log(`${features.length} comuna features converted`);
  console.log("Sample properties:", features[0]?.properties);

  const geojson = { type: "FeatureCollection", features };
  writeFileSync("public/data/comunas-66001.geojson", JSON.stringify(geojson));
  console.log("Written to public/data/comunas-66001.geojson");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
