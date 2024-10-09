# Racle météo

This service cleverly transforms weather web pages into a usable (and free!) rest API. It uses [accuweather](https://accuweather.com) and/or [foreca](https://foreca.com) under the hood.

## Install

Deploy a [Cloudflare Worker](https://developers.cloudflare.com/workers/) to start using your own racle-meteo. You do not need any API key. Migrating to another cloud provider or your own server will remove the automatic location, meaning the `lat` and `lon` will be required.

## Use

Define a weather provider to start using the API.

### Parameters

| Parameter | Type                | Required   | Description                                                                                                                                   |
| --------- | ------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| provider  | accuweather, foreca | required   | Choose the weather provider. By default returns all available data, see "data".                                                               |
| lat       | string              | optional\* | Location latitude. \* Required when migrating from CF workers                                                                                 |
| lon       | string              | optional\* | Location longitude. \* Required when migrating from CF workers                                                                                |
| lang      | string              | optional   | English by default. Some languages are only available on accuweather, see language list below. Incorrect `lang` does not fallback to english. |
| unit      | C, F                | optional   | Useful for accuweather or when using "simple" data. Foreca always returns celsius and farenheit.                                              |
| data      | all, simple         | optional   | Select "all" to retrieve all the data from the provider's webpage. "simple" returns only data available for all providers. "all" by default.  |

### Languages available

| code  | name                    | foreca | accuweather |
| ----- | ----------------------- | ------ | ----------- |
| en    | English                 | true   | true        |
| es    | Español                 | true   | true        |
| fr    | Français                | true   | true        |
| da    | Dansk                   | true   | true        |
| pt-pt | Português               |        | true        |
| nl    | Nederlands              | true   | true        |
| no    | Norsk                   |        | true        |
| it    | Italiano                | true   | true        |
| de    | Deutsch                 | true   | true        |
| sv    | Svenska                 | true   | true        |
| fi    | Suomi                   |        | true        |
| zh-hk | 中文 (HK)               |        | true        |
| zh-cn | 中文 (SIM)              |        | true        |
| zh-tw | 中文 (Taiwan)           |        | true        |
| es-ar | Español (Argentina)     |        | true        |
| es-mx | Español (Latin America) |        | true        |
| sk    | Slovenčinu              | true   | true        |
| ro    | Romana                  | true   | true        |
| cs    | Čeština                 | true   | true        |
| hu    | Magyar                  | true   | true        |
| pl    | Polski                  | true   | true        |
| ca    | Català                  |        | true        |
| pt-br | Português (Brazil)      |        | true        |
| hi    | हिन्दी                  |        | true        |
| ru    | русский                 | true   | true        |
| ar    | عربي                    |        | true        |
| el    | Ελληνικά                | true   | true        |
| en-gb | English (UK)            |        | true        |
| ja    | 日本語                  |        | true        |
| ko    | 한국어                  |        | true        |
| tr    | TÜRKÇE                  |        | true        |
| fr-ca | Français (Canada)       |        | true        |
| he    | עברית                   |        | true        |
| sl    | Slovenski               |        | true        |
| uk    | Українське              | true   | true        |
| id    | Bahasa Indonesia        |        | true        |
| bg    | български               | true   | true        |
| et    | Eesti keeles            | true   | true        |
| hr    | Hrvatski                | true   | true        |
| kk    | Қазақша                 |        | true        |
| lt    | Lietuvių                |        | true        |
| lv    | Latviski                | true   | true        |
| mk    | Македонски              |        | true        |
| ms    | Bahasa Melayu           |        | true        |
| tl    | Tagalog                 |        | true        |
| sr    | Srpski                  |        | true        |
| th    | ไทย                     |        | true        |
| vi    | Tiếng Việt              |        | true        |
| fa    | فارسی                   |        | true        |
| bn    | বাংলা                   |        | true        |
| bs    | bosanski                |        | true        |
| is    | íslenska                |        | true        |
| sw    | Kiswahili               |        | true        |
| ur    | اُردُو                  |        | true        |
| sr-me | Crnogorski              |        | true        |
| uz    | Oʻzbekcha               |        | true        |
| az    | Azərbaycanca            |        | true        |
| ta    | தமிழ்                   |        | true        |
| gu    | ગુજરાતી                 |        | true        |
| kn    | ಕನ್ನಡ                   |        | true        |
| te    | తెలుగు                  |        | true        |
| mr    | मराठी                   |        | true        |
| pa    | ਪੰਜਾਬੀ                  |        | true        |
| my    | မြန်မာဘာသာ              |        | true        |
