const express = require('express');
const cors=require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const app=express();
const port=process.env.PORT || 5000;


// middleware

app.use(cors());
app.use(express.json());

// zW9qgr8LJjJcYS1v

// online-study





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uqgpfrz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
console.log(uri)    
// const uri = "mongodb+srv://online-study:zW9qgr8LJjJcYS1v@cluster0.uqgpfrz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
   
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req, res) => {

    res.send('Welcome to online study portal')
})




app.listen(port,()=>{
    console.log(`coffee server listening on port:${port}`)
})