import { google } from "npm:googleapis@135.0.0";
import { color, Print } from "@pla/printaeu";

/** Google Spreadsheet with a table on the first column formatted as `|asset code|current market value|` with a header on row `A` */
const googleFinanceHubSpreadsheetId = atob(atob("TVRKQ2FIaFBTbUkyVVZSU1V6RkZjVXhyT1ZCd2NFVm5NbFEyWnpkNVVtY3RNMDFSVG1wRWRtTTBlR00"));

/** Spreadsheet info about an asset */
export interface AssetInfo {
  /** Asset code */
  name: string;
  /** Asset market value */
  marketValue: number;
}

/**
 * Get the current market value of all available assets
 * @param googleApiCredentialToken the Google API credential token
 * @returns a `Promise` that resolves to `AssetInfo[]`
 */
export async function getAllMarketValues(googleApiCredentialToken: string): Promise<AssetInfo[]> {
  /** Error logger */
  const err = Print.create();
  err.preAppend(`[${color.red}ERRO${color.reset}] [${color.orange}HUB${color.reset}] `);
  err.showDate();

  const sheets = google.sheets({ version: "v4", auth: googleApiCredentialToken });

  const res = await sheets.spreadsheets.values.get({ spreadsheetId: googleFinanceHubSpreadsheetId, range: "AssetsPrice" });

  const assets: AssetInfo[] = [];
  const rows = res.data.values;
  if (!Array.isArray(rows) || rows.length === 0) {
    const message = `the spreadsheet '${googleFinanceHubSpreadsheetId}' returned no data\n`;
    err.log(message);
    throw new Error(message);
  } else {
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (typeof row !== "undefined") {
        const name = row[0];
        const value = row[1];
        if (typeof name !== "string" || typeof value !== "string") {
          const message = `unexpected row: '${name}', '${value}'\n`;
          err.log(message);
          throw new Error(message);
        } else {
          const marketValueString = parseFloat(value.replace("R$", "").replace(",", ""));
          if (isNaN(marketValueString)) {
            const message = `unexpected market value: '${marketValueString}'\n`;
            err.log(message);
            throw new Error(message);
          } else {
            assets.push({ name, marketValue: marketValueString });
          }
        }
      }
    }
    if (assets.length === 0) {
      const message = `the spreadsheet '${googleFinanceHubSpreadsheetId}' has no asset information\n`;
      err.log(message);
      throw new Error(message);
    } else return assets;
  }
}
