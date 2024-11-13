import { request } from "npm:gaxios@6.7.1";
import { google } from "npm:googleapis@135.0.0";
import { color, Print } from "@pla/printaeu";
import { type AssetInfo } from "../financeHub.ts";

/**
 * API to retrieve data of the asset `JURO11 - Sparta Infra FICF Inc de Inv Infra Renda Fixa CP`
 */
export class JURO11 {
  readonly assetName = "JURO11";
  readonly targetRatio = 0.02;
  /** Google Spreadsheet ID to get the asset equity info */
  readonly equityInfoSpreadsheetId = atob(atob("TVUxM09GcGxSREpTTWxrMGFqVjBPWE40U2kxcVNESjJTVTVTYUY5YVFYZ3llbEZ3YjNWTk1EWjRNVzg9"));
  /** Error message logger */
  private readonly err: Print;

  /**
   * Create a JURO11 instance
   * @param googleApiCredentialToken the Google API credential token
   */
  constructor(private readonly googleApiCredentialToken: string) {
    this.err = Print.create();
    this.err.preAppend(`[${color.red}ERRO${color.reset}] [${color.orange}JURO11${color.reset}] `);
    this.err.showDate();
  }

  /**
   * Get the asset's last equity quota date (yyyy-MM-dd) and value
   * @returns a `Promise` that resolves to `[lastEquityQuotaDate: string, lastEquityQuotaValue: number]`. Date is formatted as yyyy-MM-dd
   */
  async getLastAssetEquityQuotaValue(): Promise<[string, number]> {
    const sheets = google.sheets({
      version: "v4",
      auth: this.googleApiCredentialToken,
    });

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: this.equityInfoSpreadsheetId,
      range: "Cota",
    });

    const rows = res.data.values;
    if (!Array.isArray(rows) || rows.length === 0) {
      const message = `the spreadsheet '${this.equityInfoSpreadsheetId}' returned no data\n`;
      this.err.log(message);
      throw new Error(message);
    } else {
      let lastEquityQuotaDate = "";
      let lastEquityQuotaValue = -1;
      for (let i = rows.length - 1; i >= 0; i--) {
        const value = rows[i][4];
        const date = rows[i][1];
        if (typeof value === "string") {
          const quotaCandidate = parseFloat(
            value.replace(".", "").replace(",", "."),
          );
          if (!isNaN(quotaCandidate)) {
            lastEquityQuotaValue = quotaCandidate;
            lastEquityQuotaDate = date;
            break;
          }
        }
      }
      if (lastEquityQuotaValue === -1 || lastEquityQuotaDate === "") {
        const message = "couldn't get the last updated asset value. No fifth column can be converted to a number\n";
        this.err.log(message);
        throw Error(message);
      } else return [lastEquityQuotaDate, lastEquityQuotaValue];
    }
  }

  /**
   * Get the current asset's market value
   * @param assetsInfo infos about the assets
   * @returns a the current market value
   */
  getCurrentMarketValue(assetsInfo: AssetInfo[]): number {
    const asset = assetsInfo.find((a) => a.name === this.assetName);
    if (typeof asset == "undefined") {
      const message = `couldn't find market info for ${this.assetName}\n`;
      this.err.log(message);
      throw new Error(message);
    }
    return asset.marketValue;
  }

  async sendTelegramMessage(
    telegramToken: string,
    chatId: string,
    assetQuotaValue: number,
    marketValue: number,
  ): Promise<void> {
    const ratio = (marketValue - assetQuotaValue) / assetQuotaValue;
    await request({
      method: "POST",
      url: `https://api.telegram.org/bot${telegramToken}/sendMessage`,
      data: {
        chat_id: chatId,
        parse_mode: "MarkdownV2",
        text: `
*Atualizações do preço patrimonial de JURO11*

Valor da cota patrimonial: R$ ${assetQuotaValue.toString().replace(".", ",")}
Preço de mercado: R$ ${marketValue.toString().replace(".", ",")}
Relação Mercado/Cota: *${(ratio * 100).toFixed(1).replace(".", ",").replace("-", "\\-")}%*
      `,
      },
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
