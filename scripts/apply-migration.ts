import "dotenv/config";
import { Client } from "pg";

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  await client.query(`ALTER TABLE "Client" ADD COLUMN IF NOT EXISTS "sireneNumber" TEXT;`);
  await client.query(`ALTER TABLE "Client" ADD COLUMN IF NOT EXISTS "vatNumber" TEXT;`);

  const exists = await client.query(
    `SELECT 1 FROM "_prisma_migrations" WHERE migration_name = '20260413090957_add_sirene_vat'`
  );
  if (exists.rowCount === 0) {
    await client.query(`
      INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
      VALUES (gen_random_uuid()::text, 'manual', now(), '20260413090957_add_sirene_vat', NULL, NULL, now(), 1)
    `);
  }

  await client.end();
  console.log("Migration Neon appliquée.");
}

main().catch((e) => { console.error(e); process.exit(1); });
