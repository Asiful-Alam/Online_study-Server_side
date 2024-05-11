const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uqgpfrz.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Connect to MongoDB
async function run() {
  try {
    await client.connect();

    const assignmentCollection = client.db("assignmentDB").collection("assignment");

    // Routes
    // Add assignment
    app.post("/assignment", async (req, res) => {
      const AddformData = req.body;
      console.log(AddformData);
      const result = await assignmentCollection.insertOne(AddformData);
      res.send(result);
    });
    
    

    // Get all assignment
    app.get("/assignment", async (req, res) => {
      const cursor = assignmentCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

//  delete assignment
    app.delete("/assignment/:id", async (req, res) => {
      const id=req.params.id;
      const query={_id: new ObjectId(id) }
      const result =await assignmentCollection.deleteOne(query);
      res.send(result);
    });
  //  update assignment

    app.get ('/assignment/:id', async (req, res) =>{
      const id = req.params.id;
      const query ={_id: new ObjectId(id)};
      const result = await assignmentCollection.findOne(query); 
      res.send(result);
    })


    // put for updt
    app.put("/assignment/:id", async (req, res) => {
      const id = req.params.id;
      // const email= req.params.email;
      const filter = { _id: new ObjectId(id) };
      const updatedItem = req.body;
      const currrrLoc = await assignmentCollection.findOne(filter);

      const assignment = {
        $set: {
          title: updatedItem.title || currrrLoc.title,
          description:
            updatedItem.description || currrrLoc.description,
            marks: updatedItem.marks || currrrLoc.countrmarksy_name,
            thumbnailUrl: updatedItem.thumbnailUrl || currrrLoc.thumbnailUrl,
            difficultyLevel:
            updatedItem.difficultyLevel || currrrLoc.difficultyLevel,
            dueDate: updatedItem.dueDate || currrrLoc.dueDate,
          
        },
      };
      console.log("db daata", currrrLoc);
      const result = await assignmentCollection.updateOne(filter, assignment);
      res.send(result);
    });
   
  //  mylist
    
  

    
    
    

  

    app.get("/", (req, res) => {
      res.send("study er Server chole!");
    });
    
    // Ping MongoDB deployment
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Close client connection
    // await client.close();
  }
}

run().
then(()=>{
  app.listen(port, () => {
    console.log(`Server is running on port :${port}`);
  });
})
.catch(()=>{console.dir});

// Default route

// Start server

