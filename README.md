# UOttaLive Housing Platform

UOttaLive is a student housing platform built for matching students and landlords around campus. Students can search listings, filter by amenities, and use a distance-based map filter to find places near their preferred location. Landlords can upload listings with multiple images, review applications, and manage their listings.

## Stack

- Vite + React + TypeScript
- Tailwind CSS (custom dark glass UI)
- Supabase (auth, database, and storage)
- Leaflet + OpenStreetMap (map + radius filter)
- React Icons

## How It Works

- Auth uses Supabase; user roles (student vs landlord) are stored in the `profiles` table.
- Listings live in Supabase and include multiple image URLs stored in Supabase Storage.
- The distance filter geocodes an address on the client and filters listings by radius using Leaflet + Nominatim.

## Running Locally

```bash
npm install
npm run dev
```

## Notes

- Create a Supabase Storage bucket named `listings` for image uploads.
- Ensure storage policies allow landlords to upload and users to read listing images.
