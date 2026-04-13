import "dotenv/config";
import { Client } from "pg";

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  // Migration 1 — add_sirene_vat
  await client.query(`ALTER TABLE "Client" ADD COLUMN IF NOT EXISTS "sireneNumber" TEXT;`);
  await client.query(`ALTER TABLE "Client" ADD COLUMN IF NOT EXISTS "vatNumber" TEXT;`);

  const exists1 = await client.query(
    `SELECT 1 FROM "_prisma_migrations" WHERE migration_name = '20260413090957_add_sirene_vat'`
  );
  if (exists1.rowCount === 0) {
    await client.query(`
      INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
      VALUES (gen_random_uuid()::text, 'manual', now(), '20260413090957_add_sirene_vat', NULL, NULL, now(), 1)
    `);
  }

  // Migration 2 — add_recommendation_channel
  await client.query(`ALTER TYPE "AcquisitionChannel" ADD VALUE IF NOT EXISTS 'RECOMMENDATION';`);

  const exists2 = await client.query(
    `SELECT 1 FROM "_prisma_migrations" WHERE migration_name = '20260413_add_recommendation_channel'`
  );
  if (exists2.rowCount === 0) {
    await client.query(`
      INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
      VALUES (gen_random_uuid()::text, 'manual', now(), '20260413_add_recommendation_channel', NULL, NULL, now(), 1)
    `);
  }

  await client.end();
  console.log("Migrations Neon appliquées.");
}

main().catch((e) => { console.error(e); process.exit(1); });
