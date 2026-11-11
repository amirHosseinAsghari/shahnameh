# شاهنامه

A reader for Ferdowsi's Shahnameh in Persian blue and white: Nastaliq and simple typefaces, day/night themes, blur page transitions, and paintings from historical Shahnameh manuscripts.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # prerenders every page of every story (~5,300 pages)
```

- Text: [Ganjoor](https://ganjoor.net/ferdousi/shahname). It is already in `public/stories/` and `src/data/index.json`; to re-download it, delete those and run `npx tsx scripts/fetch-shahnameh.ts`.
- Paintings: folios from the Shah Tahmasp Shahnameh (Tabriz, c. 1525) and an Ilkhanid Shahnameh (c. 1330–40), from The Met's Open Access collection (public domain). They are in `public/art/` and `src/data/art.json`; `npx tsx scripts/fetch-art.ts` re-downloads them, and the story-to-painting mapping is in that script.
- Pages are fixed (10 beyts per page, a heading counts as 2), so `/sohrab/7` is a stable address. See `src/lib/shahnameh.ts`.
- Keys: → next page, ← previous page, Home / End. On phones, swipe left for the next page.
