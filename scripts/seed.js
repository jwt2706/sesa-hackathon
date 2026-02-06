import { MongoClient } from "mongodb";
import { randomUUID } from "crypto";
import { faker } from "@faker-js/faker";

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("Missing MONGODB_URI in environment.");
}

const dbName = process.env.MONGODB_DB || "app";

function makeUser({ groupId, landlord }) {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const fullName = `${firstName} ${lastName}`;
  return {
    userId: randomUUID(),
    name: fullName,
    email: faker.internet.email({ firstName, lastName }).toLowerCase(),
    password: "plaintext-for-now",
    phone: faker.phone.number(),
    description: landlord ? "Property owner" : faker.lorem.sentence(),
    profilePicture: faker.image.avatar(),
    groupId,
    landlord,
  };
}

function makeGroup(userIds) {
  return {
    groupId: randomUUID(),
    userIds,
  };
}

function makeListing({ landlordId }) {
  const rentalTypes = ["floor", "basement", "house", "app", "room"];
  const genderOptions = ["male", "female", "any"];
  return {
    listingId: randomUUID(),
    onCampus: faker.datatype.boolean(),
    price: Number(faker.finance.amount({ min: 600, max: 3200, dec: 0 })),
    address: faker.location.streetAddress(),
    bedrooms: faker.number.int({ min: 1, max: 6 }),
    bathrooms: faker.number.int({ min: 1, max: 4 }),
    gender: faker.helpers.arrayElement(genderOptions),
    rentalType: faker.helpers.arrayElement(rentalTypes),
    verified: faker.datatype.boolean(),
    imageUrls: Array.from({ length: faker.number.int({ min: 1, max: 4 }) }, () => faker.image.url()),
    landlordId,
  };
}

function makeApplication({ listingId, groupId }) {
  return {
    applicationId: randomUUID(),
    listingId,
    groupId,
  };
}

function getCounts() {
  const args = process.argv.slice(2);
  const parsed = {
    persons: Number(process.env.SEED_PERSONS || 10),
    groups: Number(process.env.SEED_GROUPS || 3),
    listings: Number(process.env.SEED_LISTINGS || 5),
    applications: Number(process.env.SEED_APPLICATIONS || 8),
  };

  for (const arg of args) {
    const [key, value] = arg.split("=");
    if (key && value && Object.hasOwn(parsed, key)) {
      parsed[key] = Number(value);
    }
  }

  return parsed;
}

async function seed() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  const persons = db.collection("person");
  const groups = db.collection("group");
  const listings = db.collection("listing");
  const applications = db.collection("application");

  await Promise.all([
    persons.deleteMany({}),
    groups.deleteMany({}),
    listings.deleteMany({}),
    applications.deleteMany({}),
  ]);

  const counts = getCounts();

  const landlords = Array.from({ length: Math.max(1, Math.floor(counts.persons * 0.2)) }, () =>
    makeUser({ groupId: null, landlord: true })
  );
  const tenants = Array.from({ length: Math.max(1, counts.persons - landlords.length) }, () =>
    makeUser({ groupId: null, landlord: false })
  );
  const allPersons = [...landlords, ...tenants];

  const groupsData = Array.from({ length: counts.groups }, () => {
    const size = faker.number.int({ min: 2, max: 4 });
    const members = faker.helpers.arrayElements(tenants, size);
    const group = makeGroup(members.map((member) => member.userId));
    for (const member of members) {
      member.groupId = group.groupId;
    }
    return group;
  });

  const listingsData = Array.from({ length: counts.listings }, () => {
    const landlord = faker.helpers.arrayElement(landlords);
    return makeListing({ landlordId: landlord.userId });
  });

  const applicationsData = Array.from({ length: counts.applications }, () => {
    const listing = faker.helpers.arrayElement(listingsData);
    const group = faker.helpers.arrayElement(groupsData);
    return makeApplication({ listingId: listing.listingId, groupId: group.groupId });
  });

  await persons.insertMany(allPersons);
  if (groupsData.length > 0) await groups.insertMany(groupsData);
  if (listingsData.length > 0) await listings.insertMany(listingsData);
  if (applicationsData.length > 0) await applications.insertMany(applicationsData);

  await client.close();

  console.log("Seeded collections:");
  console.log({
    person: allPersons.length,
    group: groupsData.length,
    listing: listingsData.length,
    application: applicationsData.length,
  });
}

seed().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
