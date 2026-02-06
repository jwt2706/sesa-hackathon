import { randomUUID } from "crypto";
import { getDb } from "./_db.js";

function validateGroup(body) {
  const errors = [];
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { errors: ["Body must be an object."] };
  }

  if (body.groupId !== undefined && typeof body.groupId !== "string") errors.push("groupId must be a string.");
  if (body.userIds !== undefined) {
    if (!Array.isArray(body.userIds) || !body.userIds.every((id) => typeof id === "string")) {
      errors.push("userIds must be an array of strings.");
    }
  }

  if (errors.length > 0) return { errors };

  return {
    doc: {
      groupId: body.groupId || randomUUID(),
      userIds: body.userIds || [],
    },
    errors: [],
  };
}

export default async function handler(req, res) {
  const db = await getDb();
  const collection = db.collection("group");

  if (req.method === "GET") {
    const docs = await collection.find({}).limit(100).toArray();
    res.status(200).json(docs);
    return;
  }

  if (req.method === "POST") {
    const { doc, errors } = validateGroup(req.body);
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
