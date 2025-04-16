// scripts/generate-master-hash.ts
import { encryptPassword } from "./authUtils";

async function generateMasterHash() {
  const masterPassword = process.argv[2]; // Recebe a senha como argumento
  if (!masterPassword) {
    console.error("Usage: ts-node generate-master-hash.ts <master-password>");
    process.exit(1);
  }

  const hash = await encryptPassword(masterPassword);
  console.log("MASTER_PASSWORD_HASH=", hash);
  console.log("\nCopie este valor para seu .env");
}

generateMasterHash().catch(console.error);
