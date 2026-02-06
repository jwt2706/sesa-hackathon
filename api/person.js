import { randomUUID } from "crypto";
import { getDb } from "./_db.js";

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function validatePerson(body) {
  const errors = [];
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { errors: ["Body must be an object."] };
  }

  if (!isNonEmptyString(body.name)) errors.push("name is required.");
  if (!isNonEmptyString(body.email)) errors.push("email is required.");
  if (!isNonEmptyString(body.password)) errors.push("password is required.");
  if (body.phone !== undefined && typeof body.phone !== "string") errors.push("phone must be a string.");
  if (body.description !== undefined && typeof body.description !== "string") {
    errors.push("description must be a string.");
  }
  if (body.profilePicture !== undefined && typeof body.profilePicture !== "string") {
    errors.push("profilePicture must be a string.");
  }
  if (body.groupId !== undefined && typeof body.groupId !== "string") errors.push("groupId must be a string.");
  if (body.landlord !== undefined && typeof body.landlord !== "boolean") {
    errors.push("landlord must be a boolean.");
  }
  if (body.userId !== undefined && typeof body.userId !== "string") errors.push("userId must be a string.");

  if (errors.length > 0) return { errors };

  return {
    doc: {
      userId: body.userId || randomUUID(),
      name: body.name.trim(),
      email: body.email.trim(),
      password: body.password,
      phone: body.phone,
      description: body.description,
      profilePicture: body.profilePicture,
      groupId: body.groupId,
      landlord: body.landlord ?? false,
    },
    errors: [],
  };
}

export default async function handler(req, res) {
  const db = await getDb();
  const collection = db.collection("person");

  if (req.method === "GET") {
    const docs = await collection.find({}).limit(100).toArray();
    res.status(200).json(docs);
    return;
  }

  if (req.method === "POST") {
    const { doc, errors } = validatePerson(req.body);
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
