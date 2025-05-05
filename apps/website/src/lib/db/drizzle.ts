import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import dotenv from 'dotenv';

dotenv.config();

const postgresUrl = process.env.POSTGRES_UNIX_SOCKET ?
  `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@localhost:5432/${process.env.POSTGRES_DB}` :
  `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`;

export const client = process.env.POSTGRES_UNIX_SOCKET ?
  postgres(postgresUrl, {
    database: process.env.POSTGRES_DB!!,
    user: process.env.POSTGRES_USER!!,
    password: process.env.POSTGRES_PASSWORD!!,
    host: process.env.POSTGRES_UNIX_SOCKET!!,
  }) :
  postgres(postgresUrl, {
    database: process.env.POSTGRES_DB!!,
    user: process.env.POSTGRES_USER!!,
    password: process.env.POSTGRES_PASSWORD!!,
    host: process.env.POSTGRES_HOST!!,
    port: parseInt(process.env.POSTGRES_PORT!!)
  });

export const db = drizzle(client, { schema });
