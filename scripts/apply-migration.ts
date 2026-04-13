import "dotenv/config";
import { Client } from "pg";

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  // Créer les enums
  await client.query(`DO $$ BEGIN CREATE TYPE "ClientStatus" AS ENUM ('PROSPECT', 'EN_COURS', 'CLIENT'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
  await client.query(`DO $$ BEGIN CREATE TYPE "ShippingStatus" AS ENUM ('NOT_SHIPPED', 'FIRST_SHIPPING', 'SHIPPED'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);

  // Supprimer jobTitle, ajouter les nouvelles colonnes avec défaut temporaire
  await client.query(`ALTER TABLE "Client" DROP COLUMN IF EXISTS "jobTitle";`);
  await client.query(`ALTER TABLE "Client" ADD COLUMN IF NOT EXISTS "amazonStoreName" TEXT;`);
  await client.query(`ALTER TABLE "Client" ADD COLUMN IF NOT EXISTS "clientStatus" "ClientStatus" NOT NULL DEFAULT 'PROSPECT';`);
  await client.query(`ALTER TABLE "Client" ADD COLUMN IF NOT EXISTS "shippingStatus" "ShippingStatus" NOT NULL DEFAULT 'NOT_SHIPPED';`);

  // Supprimer les défauts (la colonne reste NOT NULL, juste plus de défaut auto)
  await client.query(`ALTER TABLE "Client" ALTER COLUMN "clientStatus" DROP DEFAULT;`);
  await client.query(`ALTER TABLE "Client" ALTER COLUMN "shippingStatus" DROP DEFAULT;`);

  // Marquer la migration comme appliquée
  const exists = await client.query(
    `SELECT 1 FROM "_prisma_migrations" WHERE migration_name = '20260413090414_add_client_and_shipping_status'`
  );
  if (exists.rowCount === 0) {
    await client.query(`
      INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
      VALUES (gen_random_uuid()::text, 'manual', now(), '20260413090414_add_client_and_shipping_status', NULL, NULL, now(), 1)
    `);
  }

  await client.end();
  console.log("Migration Neon appliquée avec succès.");
}

main().catch((e) => { console.error(e); process.exit(1); });
