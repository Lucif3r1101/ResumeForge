import admin from "firebase-admin";
import fs from "fs";
import path from "path";

const serviceAccountPath =
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
  path.join(process.cwd(), "servicejson", "service-account.json");

const loadServiceAccount = () => {
  const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (base64) {
    const json = Buffer.from(base64, "base64").toString("utf8");
    return JSON.parse(json);
  }
  if (!fs.existsSync(serviceAccountPath)) {
    throw new Error(`Missing Firebase service account at ${serviceAccountPath}`);
  }
  return JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
};

if (!admin.apps.length) {
  const serviceAccount = loadServiceAccount();
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const firestore = admin.firestore();
export const adminAuth = admin.auth();
