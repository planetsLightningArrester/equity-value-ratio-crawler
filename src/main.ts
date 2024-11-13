import { program } from "npm:commander@12.1.0";
import { color, Print } from "@pla/printaeu";
import { JURO11 } from "./assets/juro11.ts";
import { CDII11 } from "./assets/cdii11.ts";
import { getAllMarketValues } from "./financeHub.ts";

/**
 * Main routine
 */
async function main(): Promise<void> {
  program
    .name("equity-value-ratio-crawler")
    .description("Crawl equity quota/value ratio and send Telegram messages")
    .requiredOption("-g, --google <credential>", "Google API Credential Token")
    .requiredOption("-t, --telegram <token>", "Telegram chat token")
    .requiredOption("-c, --chat <id>", "Telegram chat ID")
    .parse();

  const googleCredential: string = program.opts().google;
  const telegramToken: string = program.opts().telegram;
  const chatId: string = program.opts().chat;

  const assets: Array<JURO11 | CDII11> = [
    new JURO11(googleCredential),
    new CDII11(googleCredential),
  ];

  const info = Print.create();
  info.preAppend(`[${color.cyan}INFO${color.reset}] `);
  info.showDate();
  const err = Print.create();
  err.preAppend(`[${color.red}ERRO${color.reset}] `);
  err.showDate();

  info.log("💰 Getting the current market values");
  const assetsInfo = await getAllMarketValues(googleCredential);

  info.log("🏊 Crawling for equity quota value");
  for await (const asset of assets) {
    const [assetEquityQuotaDate, assetEquityQuotaValue] = await asset.getLastAssetEquityQuotaValue();
    info.log(`🏦 [${asset.assetName}] Equity quota value: R$ ${assetEquityQuotaValue.toString().replace(".", ",")} (${assetEquityQuotaDate})`);
    const assetMarketValue = asset.getCurrentMarketValue(assetsInfo);
    info.log(`💰 [${asset.assetName}] Market value: R$ ${assetMarketValue.toString().replace(".", ",")}`);
    const ratio = (assetMarketValue - assetEquityQuotaValue) / assetEquityQuotaValue;
    if (ratio < asset.targetRatio) {
      info.log(`📈 Market/equity quota ratio less than ${asset.targetRatio * 100}% (${(ratio * 100).toFixed(1)}%). Sending notification`);
      await asset.sendTelegramMessage(telegramToken, chatId, assetEquityQuotaValue, assetMarketValue);
    } else {
      info.log(`📈 [${asset.assetName}] Market/equity quota ratio greater than ${asset.targetRatio * 100}% (${(ratio * 100).toFixed(1)}%)`);
    }
  }

  info.log("🏁 Script is done");
}

main().catch(console.log);
