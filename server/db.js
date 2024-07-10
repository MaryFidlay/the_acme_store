const pg = require("pg");
const client = new pg.Client(
  process.env.DATABASE_URL || "postgres://localhost/the_acme_store"
);
const uuid = require("uuid");
const bcrypt = require("bcrypt");

const createTables = async () => {
  const SQL = `
      DROP TABLE IF EXISTS users CASCADE;
      DROP TABLE IF EXISTS products CASCADE;
      DROP TABLE IF EXISTS favorite CASCADE;

      CREATE TABLE users(
        id UUID PRIMARY KEY,
        username VARCHAR(20) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL
      );
      CREATE TABLE products(
        id UUID PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE
      );
      CREATE TABLE favorite(
        id UUID PRIMARY KEY,
        product_id UUID REFERENCES products(id) NOT NULL,
        user_id UUID REFERENCES users(id) NOT NULL,
        CONSTRAINT unique_user_id_product_id UNIQUE (user_id, product_id)
      );
    `;
  await client.query(SQL);
};

const createProduct = async ({ name }) => {
  const SQL = `
      INSERT INTO products (id, name) VALUES($1, $2) RETURNING *
    `;
  const response = await client.query(SQL, [uuid.v4(), name]);
  return response.rows[0];
};

const createUser = async ({ username, password }) => {
  const SQL = `
      INSERT INTO users(id, username, password) VALUES($1, $2, $3) RETURNING *
    `;
  const response = await client.query(SQL, [
    uuid.v4(),
    username,
    await bcrypt.hash(password, 5),
  ]);
  return response.rows[0];
};

const fetchUsers = async () => {
  const SQL = `
      SELECT * FROM users
    `;
  const response = await client.query(SQL);
  return response.rows;
};

const fetchProducts = async () => {
  const SQL = `
      SELECT * FROM products;
    `;
  const response = await client.query(SQL);
  return response.rows;
};

const createFavorite = async ({ product_id, user_id }) => {
  const SQL = `
      INSERT INTO favorite(id, product_id, user_id) VALUES($1, $2, $3) RETURNING *
    `;
    console.log(product_id)
    console.log(user_id)
  const response = await client.query(SQL, [uuid.v4(), product_id, user_id]);
  return response.rows[0];
};

const fetchFavorites = async (user_id) => {
  const SQL = `
      SELECT * FROM favorite
      WHERE user_id = $1
    `;
  const response = await client.query(SQL, [user_id]);
  console.log(response.rows)
  return response.rows;
};

const deleteFavorite = async ({ id, user_id }) => {
  const SQL = `
      DELETE FROM favorite
      WHERE id = $1 AND user_id = $2
    `;
  await client.query(SQL, [id, user_id]);
};

module.exports = {
  client,
  createTables,
  createUser,
  createProduct,
  createFavorite,
  fetchUsers,
  fetchProducts,
  fetchFavorites,
  deleteFavorite,
};
