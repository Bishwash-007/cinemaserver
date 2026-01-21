import 'dotenv/config';

import { drizzle } from 'drizzle-orm/neon-http';
import { neon, neonConfig } from '@neondatabase/serverless';

const useNeonLocalProxy = process.env.NEON_LOCAL_PROXY === 'true';

if (useNeonLocalProxy) {
  const proxyEndpoint =
    process.env.NEON_LOCAL_HTTP_ENDPOINT ?? 'http://neon-local:5423/sql';
  neonConfig.fetchEndpoint = proxyEndpoint;
  neonConfig.useSecureWebSocket = false;
  neonConfig.poolQueryViaFetch = true;
} else {
  neonConfig.fetchConnectionCache = true;
}

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

const sql = neon(process.env.DATABASE_URL);

const db = drizzle(sql);

export { db, sql };
