import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const brandsTable = sqliteTable('brands_table', {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
});

export const modelsTable = sqliteTable('models_table', {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  brandId: int().references(() => brandsTable.id),
});
