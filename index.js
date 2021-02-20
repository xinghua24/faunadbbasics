const app = require("express")();

const faunadb = require("faunadb");

// FQL functions
const {
  Ref,
  Paginate,
  Get,
  Match,
  Select,
  Index,
  Create,
  Collection,
  Join,
  Call,
  Function: Fn,
} = faunadb.query;

const client = new faunadb.Client({
  secret: "SECRET_KEY",
  queryTimeout: 2000,
});

app.get("/tweet/:id", async (req, res) => {
  let doc = null;
  try {
    doc = await client.query(Get(Ref(Collection("tweets"), req.params.id)));
  } catch (e) {
    console.error(e);
  }
  res.send(doc);
});

app.post("/tweet", async (req, res) => {
  const data = {
    user: Call(Fn("getUser"), "fireship_dev"),
    text: "Hola Mundo!",
  };
  let doc = null;
  try {
    doc = await client.query(Create(Collection("tweets"), { data }));
  } catch (e) {
    console.error(e);
  }
  res.send(doc);
});

app.get("/tweet", async (req, res) => {
  let doc = null;
  try {
    doc = await client.query(
      Paginate(
        Match(Index("tweets_by_user"), Call(Fn("getUser"), "fireship_dev"))
      )
    );
  } catch (e) {
    console.error(e);
  }
  res.send(doc);
});

app.post("/relationship", async (req, res) => {
  const data = {
    follower: Call(Fn("getUser"), "bob"),
    followee: Call(Fn("getUser"), "fireship_dev"),
  };
  let doc = null;
  try {
    doc = await client.query(Create(Collection("relationships"), { data }));
  } catch (e) {
    console.error(e);
  }
  res.send(doc);
});

app.get("/feed", async (req, res) => {
  let docs = null;
  try {
    docs = await client.query(
      Paginate(
        Join(
          Match(Index("followees_by_follower"), Call(Fn("getUser"), "bob")),
          Index("tweets_by_user")
        )
      )
    );
  } catch (e) {
    console.error(e);
  }
  res.send(docs);
});

app.listen(5000, () => {
  console.log("API listening on http://localhost:5000");
});
