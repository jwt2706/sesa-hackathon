import { randomUUID } from "crypto";
import { getDb } from "./_db.js";

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function validateListing(body) {
  const errors = [];
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { errors: ["Body must be an object."] };
  }

  if (body.listingId !== undefined && typeof body.listingId !== "string") {
    errors.push("listingId must be a string.");
  }
  if (body.onCampus !== undefined && typeof body.onCampus !== "boolean") {
    errors.push("onCampus must be a boolean.");
  }
  if (typeof body.price !== "number") errors.push("price must be a number.");
  if (!isNonEmptyString(body.address)) errors.push("address is required.");
  if (typeof body.bedrooms !== "number") errors.push("bedrooms must be a number.");
  if (typeof body.bathrooms !== "number") errors.push("bathrooms must be a number.");
  if (body.gender !== undefined && typeof body.gender !== "string") {
    errors.push("gender must be a string.");
  }
  if (!isNonEmptyString(body.rentalType)) errors.push("rentalType is required.");
  if (body.verified !== undefined && typeof body.verified !== "boolean") {
    errors.push("verified must be a boolean.");
  }
  if (body.imageUrls !== undefined) {
    if (!Array.isArray(body.imageUrls) || !body.imageUrls.every((url) => typeof url === "string")) {
      errors.push("imageUrls must be an array of strings.");
    }
  }
  if (!isNonEmptyString(body.landlordId)) errors.push("landlordId is required.");

  if (errors.length > 0) return { errors };

  return {
    doc: {
      listingId: body.listingId || randomUUID(),
      onCampus: body.onCampus ?? false,
      price: body.price,
      address: body.address.trim(),
      bedrooms: body.bedrooms,
      bathrooms: body.bathrooms,
      gender: body.gender,
      rentalType: body.rentalType,
      verified: body.verified ?? false,
      imageUrls: body.imageUrls || [],
      landlordId: body.landlordId,
    },
    errors: [],
  };
}

export default async function handler(req, res) {
  const db = await getDb();
  const collection = db.collection("listing");

  if (req.method === "GET") {
    const docs = await collection.find({}).limit(100).toArray();
    res.status(200).json(docs);
    return;
  }

  if (req.method === "POST") {
    const { doc, errors } = validateListing(req.body);
    if (errors.length > 0) {
      res.status(400).json({ errors });
      return;
    }
    const result = await collection.insertOne(doc);
    res.status(201).json({ _id: result.insertedId });
    return;
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end("Method Not Allowed");
}
