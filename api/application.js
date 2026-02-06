import { randomUUID } from "crypto";
import { getDb } from "./_db.js";

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function validateApplication(body) {
  const errors = [];
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { errors: ["Body must be an object."] };
  }

  if (!isNonEmptyString(body.listingId)) errors.push("listingId is required.");
  if (!isNonEmptyString(body.groupId)) errors.push("groupId is required.");
  if (body.applicationId !== undefined && typeof body.applicationId !== "string") {
    errors.push("applicationId must be a string.");
  }

  if (errors.length > 0) return { errors };

  return {
    doc: {
      applicationId: body.applicationId || randomUUID(),
      listingId: body.listingId,
      groupId: body.groupId,
    },
    errors: [],
  };
}

export default async function handler(req, res) {
  const db = await getDb();
  const collection = db.collection("application");

  if (req.method === "GET") {
    const docs = await collection.find({}).limit(100).toArray();
    res.status(200).json(docs);
    return;
  }

  if (req.method === "POST") {
    const { doc, errors } = validateApplication(req.body);
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
