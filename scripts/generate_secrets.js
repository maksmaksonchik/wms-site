import { randomBytes } from "crypto";

export async function generateSecrets() {
  const generateKey = (length) => {
    return randomBytes(length).toString("base64");
  };

  const secrets = {
    APP_KEYS: Array.from({ length: 4 }, () => generateKey(16)).join(","),
    API_TOKEN_SALT: generateKey(16),
    ADMIN_JWT_SECRET: generateKey(16),
    JWT_SECRET: generateKey(16),
    TRANSFER_TOKEN_SALT: generateKey(16),
    ENCRYPTION_KEY: generateKey(32),
  };

  console.log("\n--- Strapi Secrets ---\n");

  Object.entries(secrets).forEach(([key, value]) => {
    console.log(`${key}=${value}`);
  });

  console.log("\n");
}

if (process.argv[1] && process.argv[1].endsWith("generate_secrets.js")) {
  generateSecrets().catch(console.error);
}
