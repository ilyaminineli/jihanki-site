# Supplemental Japan photo intake — 27 November 2026

**Received:** 27 November 2026  
**Files received in chat:** 10 JPEG photographs  
**Repository media status:** not yet ingested. The original binaries are not currently present under `media/photo/`; therefore this intake does not increase the existing 140-photo catalogue count.

This note preserves the supplied filenames and separates confirmed landmarks from probable or unresolved readings. The files should receive stable `photo-141+` IDs only after their binaries are uploaded and checked for duplicates against the existing archive.

## Photograph-by-photograph review

| Source file | Current identification | Confidence and handling |
| --- | --- | --- |
| `IMG_0777.jpeg` | Traditional temple veranda looking across a planted courtyard and garden | **Possible Genko-an, Kyoto.** The veranda / garden composition is compatible with a temple interior, but this frame does not show Genko-an’s distinctive round and square windows. Keep as a candidate until compared with the later Genko-an photographs. |
| `IMG_0779.jpeg` | Narrow urban street with decorative globe streetlights and illustrated banners | **Kyoto-area context only.** No readable street, shop or neighbourhood name is visible. |
| `IMG_0780.jpeg` | Kinkaku-ji / Golden Pavilion (Rokuon-ji), Kyoto | **Strong landmark match.** The gold-leaf pavilion over its pond is directly recognisable. Link to the confirmed Kyoto temple visit. |
| `IMG_0781.jpeg` | Kyoto road-direction sign | **Named city / directional evidence.** The sign lists Kinkaku-ji (2 km), Kamigamo Shrine (2 km) and Nijo Castle (3 km). It confirms Kyoto context but not the precise junction or camera position. |
| `IMG_0783.jpeg` | Fujisan Dragon Tower, inside Tagonoura Minato Park, Fuji City, Shizuoka | **Strong landmark match.** The distinctive angular, multi-level observation tower matches Fuji City’s official description and park photographs. It is not the wooden lookout associated with the Saiko / Koyodai ridge hike. |
| `IMG_0784.jpeg` | Mount Fuji upper-slope / summit approach | **Strong regional and activity match.** Red volcanic scoria, exposed rock, cloud and mountain safety barriers are consistent with the Fuji climb recorded on 1 August. Do not invent an exact station or trail segment. |
| `IMG_0785.jpeg` | Mount Fuji upper-slope / summit approach | **Strong sequence match** with IMG_0784; the precise position on the mountain is not visible. |
| `IMG_0786.jpeg` | Nighttime row of red torii beside a road | **Unresolved shrine / threshold image.** The torii are visible, but there is no legible shrine name or uniquely identifying landmark. Do not attach it to Fujisan Sengen Shrine or another named shrine yet. |
| `IMG_0787.jpeg` | Large traditional roofed building above a landscaped stone approach | **Architecture only.** The building may be a temple or shrine structure, but the image does not establish its name. Do not label it as Ueno Castle based on roof shape alone. |
| `IMG_0790.jpeg` | Illuminated white castle keep and stone rampart at night | **Castle visit confirmed; individual castle unresolved.** The traveller confirms visits to Osaka Castle and Ueno Castle (Iga-Ueno), but this frame alone is not sufficient to choose between them. Keep it in the Kansai castle review group until compared with the remaining castle photographs. |

## Confirmed place references

- [Fuji City — Fujisan Dragon Tower at Tagonoura Minato Park](https://www.city.fuji.shizuoka.jp/1015059054/p001267.html)
- [Fuji City — Tagonoura Minato Park facilities and map](https://www.city.fuji.shizuoka.jp/1005330000/miryoku/p007434.html)
- [Kyoto Travel — Genko-an Temple](https://kyoto.travel/en/destinations/genkoan-temple/)
- [Kyoto Travel — Kinkaku-ji Temple](https://kyoto.travel/en/destinations/kinkakuji-temple-the-golden-pavilion/)
- [JNTO — Osaka Castle](https://faq.japan-travel.jnto.go.jp/en/spot/1087/)
- [JNTO — Iga Ueno Castle](https://faq.japan-travel.jnto.go.jp/en/spot/1214/)

## Media-ingest checklist

1. Add the ten original JPEGs under `media/photo/photos_from_japan/`, preserving the supplied IMG numbers in their filenames.
2. Compare them against the existing 140 unique catalogue photographs to prevent duplicate records.
3. Add one `photos` record for each genuinely new image, with evidence level and relationships from this review.
4. Rebuild `data/media-manifest.json` with `node scripts/build-media-manifest.mjs`.
5. Run `node scripts/validate-archive.mjs` and `node scripts/build-media-manifest.mjs --check`.

Until those steps are complete, none of these ten files is represented as a published photo record. The archive count remains 140 unique images. This prevents catalogue entries from linking to media that is not actually present in the repository.
