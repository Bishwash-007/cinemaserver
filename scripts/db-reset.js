import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const DRY_RUN = !process.argv.includes('--confirm');

const sql = neon(process.env.DATABASE_URL);

const RESET_SQL = /* sql */ `
  DROP SCHEMA public CASCADE;
  CREATE SCHEMA public;
  GRANT ALL ON SCHEMA public TO public;
  DROP SCHEMA IF EXISTS drizzle CASCADE;
`;

if (DRY_RUN) {
  console.log('\n DRY-RUN mode — nothing has been changed.\n');
  console.log('The following SQL would be executed against:');
  console.log(
    `  ${process.env.DATABASE_URL?.replace(/:\/\/[^@]+@/, '://<credentials>@')}\n`
  );
  console.log(RESET_SQL);
  console.log('To apply the reset, run:\n');
  console.log('  node scripts/db-reset.js --confirm\n');
  process.exit(0);
}

console.log('\n Resetting remote database…');

try {
  await sql.transaction([
    sql`DROP SCHEMA public CASCADE`,
    sql`CREATE SCHEMA public`,
    sql`GRANT ALL ON SCHEMA public TO public`,
    sql`DROP SCHEMA IF EXISTS drizzle CASCADE`,
  ]);

  console.log('All tables, types and migration history dropped.');
  console.log('    Run  npm run db:migrate  to apply a fresh migration.\n');
} catch (err) {
  console.error('Reset failed:', err.message);
  process.exit(1);
}
