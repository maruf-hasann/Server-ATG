const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const port = 3000;

// middle ware
app.use(cors());
app.use(express.json());

// MongoDB Code
const uri =
  "mongodb+srv://atg:Knxq3AiXvu5Ea4KP@cluster0.bmjw9l2.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    client.connect();
    const postCollection = client.db("postDB").collection("posts");
    const usersCollection = client.db("postDB").collection("users");

    app.get("/post", async (req, res) => {
      const result = await postCollection.find().toArray();
      res.send(result);
    });
    app.post("/add-post", async (req, res) => {
      const data = req.body;
      const result = await postCollection.insertOne(data);
      res.send(result);
    });
    // user addd
    app.post("/add-users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "user already exists" });
      }

      //
      console.log(user);
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });
    // Login Verify
    app.post('/login-verify', async (req, res) => {
      const user = req.body
      
     const query = { email: user.email };
      const queryPass = {
        password: user.password,
      };
      const verifyEmail = await usersCollection.find(query).toArray()
      const verifyPass = await usersCollection.find(queryPass).toArray()
      const finalPass = verifyPass[0]?.password;
      const finalEmail = verifyEmail[0]?.email

      if (user.email == finalEmail && user.password == finalPass) {
        res.send({msg:'true'})
      } else {
        res.send({msg:'false'})
      }
      
  
    })

    app.patch('/update-password', async (req, res) => {
      const { allUpdate } = req.body;
        const queryMail = {
          email: allUpdate.email
        }
       const updatePass = {
         $set: {
           password: allUpdate.passwordUpdate,
         },
       };
        const result = await usersCollection.updateOne(queryMail, updatePass);
        res.send(result)
      
    })
    app.patch('/user', async (req, res) => {
  
      const data = req.body;
      const filter = {
        email : data.email
      }
      const updateStatus = {
        $set: {
          status : 'login'
        }
      }
      const result = await usersCollection.updateOne(filter, updateStatus)
      res.send(result)
    })
   


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("server is running now");
});

app.listen(port, () => {
  console.log(` app listening on port ${port}`);
});
