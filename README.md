# 🏦 Equity value - market value ratio crawler

Crawler to get asset's equity quota e compare the current asset's market value. If the difference is below/above a given threshold, a Telegram message is sent.

## 📰 Content

- [🏦 Equity value - market value ratio crawler](#-equity-value---market-value-ratio-crawler)
  - [📰 Content](#-content)
  - [🔧 Setup](#-setup)
    - [☁️ Google Setup](#️-google-setup)
    - [💬 Telegram Setup](#-telegram-setup)
  - [📈 Assets](#-assets)
  - [📚 Usage](#-usage)
  - [🚀 Workflows](#-workflows)
    - [🔄 Daily check](#-daily-check)
  - [📖 Reference](#-reference)

## 🔧 Setup

### ☁️ Google Setup

The assets' market value are taken from this public hub [Google Spreadsheet Hub](https://docs.google.com/spreadsheets/d/12BhxOJb6QTRS1EqLk9PppEg2T6g7yRg-3MQNjDvc4xc).

To get info from Google Spreadsheets, you need a Google token. And to get a Google token, you need a Google project.

Go to your [Google Console](https://console.cloud.google.com/?hl=pt-br) and create a new project. Select your new project and click on `API and services` and select `Library`. Search for `Google Sheets` and enable it.

Once they're active, go back to your [Google Console](https://console.cloud.google.com/?hl=pt-br) and select `Credentials`. Click on the top-middle-ish button-ish `Create credentials` and select `API keys`. Copy the generated key.

### 💬 Telegram Setup

To send messages in Telegram, you need a bot associated with your account, a token for this bot, and a chat to send the messages to.

Search for `botfather` in Telegram and start a conversation entering the requested inputs to create a bot. Copy the bot token generated at the end.

Once the bot is set, send a "hi" to it so a chat is available for it to send a message.

If you want to send this message to multiple people, create a group, add the bot, and send a hi.

Either using private conversations with the bot or using groups, you're going to need the chat ID. To get the chat ID, run the cURL command

```bash
curl https://api.telegram.org/bot<bot_token>/getUpdates
```

Search for `..."chat":{"id":12345...`. That's the chat ID. Groups may have negative chat IDs.

## 📈 Assets

Every asset has a different way of getting the current equity value. They're implemented inside `src/assets`.

List of tracked assets:

- [x]  [JURO11 - Sparta Infra FICF Inc de Inv Infra Renda Fixa CP](https://www.sparta.com.br/sparta-fi-infra/)
- [x]  [CDII11 - Sparta Infra CDI FICFI Infra Renda Fixa CP](https://www.sparta.com.br/sparta-cdii11/)

## 📚 Usage

Run `deno` passing your Google token, your bot's telegram token, and the chat to send the message.

```bash
deno task start \
  --google "AIzxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" \
  --telegram "71xxxxxxxx:AAExxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" \
  --chat "-41xxxxxxxx"
```

## 🚀 Workflows

### [🔄 Daily check](https://github.com/planetsLightningArrester/equity-value-ratio-crawler/actions/workflows/daily-check.yaml)

[![🔄 Daily check](https://github.com/planetsLightningArrester/equity-value-ratio-crawler/actions/workflows/daily-check.yaml/badge.svg)](https://github.com/planetsLightningArrester/equity-value-ratio-crawler/actions/workflows/daily-check.yaml)

The workflow `.github/workflows/daily-check.yaml` runs every 20 min from Monday to Friday checking for updates. The GH secrets `GOOGLE_TOKEN`, `TELEGRAM_TOKEN`, and `TELEGRAM_CHAT_ID` are the tokens passed to the script as arguments.

## 📖 Reference

- [Google Sheets API](https://developers.google.com/sheets/api/)
- [Telegram API Tutorial](https://core.telegram.org/bots/tutorial)
