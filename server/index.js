const {
  client,
  createTables,
  createUser,
  createProduct,
  createFavorite,
  fetchUsers,
  fetchProducts,
  fetchFavorites,
  deleteFavorite,
} = require("./db");

const express = require("express");
const app = express();
app.use(express.json());

app.get("/api/users", async (req, res, next) => {
  try {
    res.send(await fetchUsers());
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/products", async (req, res, next) => {
  try {
    res.send(await fetchProducts());
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/users/:id/favorites", async (req, res, next) => {
  
  try {
    res.send(await fetchFavorites(req.params.id));
  } catch (ex) {
    next(ex);
  }
});

app.post("/api/users/:id/favorites", async (req, res, next) => {
  console.log(req.params.id)
  console.log(req.body.product_id)
  try {
    res
      .status(201)
      .send(
        await createFavorite({
          user_id: req.params.id,
          product_id: req.body.product_id,
        })
      );
  } catch (ex) {
    next(ex);
  }
});

app.delete("/api/users/:userId/favorite/:id", async (req, res, next) => {
  try {
    await deleteFavorite({
    
      user_id: req.params.id,
    });
    res.sendStatus(204);
  } catch (ex) {
    next(ex);
  }
});

const init = async () => {
  console.log("connecting to database");
  await client.connect();
  console.log("connected to database");
  await createTables();
  console.log("tables created");

  const [moe, lucy, ethyl, singing, dancing, juggling, plateSpinning] =
    await Promise.all([
      createUser({ username: "moe", password: "s3cr3t" }),
      createUser({ username: "lucy", password: "s3cr3t!!" }),
      createUser({ username: "ethyl", password: "shhh" }),
      createProduct({ name: "singing" }),
      createProduct({ name: "dancing" }),
      createProduct({ name: "juggling" }),
      createProduct({ name: "plate spinning" }),
    ]);

  console.log(await fetchUsers());
  console.log(await fetchProducts());

  const userFavorite = await Promise.all([
    createFavorite({ user_id: moe.id, product_id: plateSpinning.id }),
    createFavorite({ user_id: moe.id, product_id: juggling.id }),
    createFavorite({ user_id: ethyl.id, product_id: juggling.id }),
    createFavorite({ user_id: lucy.id, product_id: dancing.id }),
  ]);

  console.log(await fetchFavorites(moe.id));
  await deleteFavorite(userFavorite[0].id, moe.id);
  console.log(await fetchFavorites(moe.id));

  console.log(`curl localhost:3000/api/users/${ethyl.id}/createFavorite`);

  console.log(
    `curl -X POST localhost:3000/api/users/${ethyl.id}/createFavorite -d '{"products_id": "${dancing.id}"}' -H 'Content-Type:application/json'`
  );
  console.log(
    `curl -X DELETE localhost:3000/api/users/${ethyl.id}/createFavorite/${userFavorite[3].id}`
  );

  console.log("data seeded");

  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`listening on port ${port}`));
};
init();
