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
    const mylistCollection = client.db("mylistDB").collection("mylist");
   

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

// Get assignment by email
    // app.get("/mylist/:email", async (req, res) => {
    //   try {
    //     const email = req.params.email;
    //     console.log("Fetching locations for email:", email);
    //     const mylist = await mylistCollection
    //       .find({ email: email })
    //       .toArray();
    //     console.log("Fetched locations:", mylist);
    //     res.json(mylist);
    //   } catch (error) {
    //     console.error("Error fetching locations:", error);
    //     res.status(500).json({ error: "Internal server error" });
    //   }
    // });

    // app.get("/mylist/:email", async (req, res) => {
    //   const { email } = req.params;
    //   const result = await mylistCollection.findOne({ email: email });
    //   res.send(result);
    // });
    // Inside your backend code

// Add assignment to mylist
app.post("/mylist", async (req, res) => {
  try {
    const { email, data, conclusion,assignment_id } = req.body;
    const result = await mylistCollection.insertOne({ email, data, conclusion,assignment_id });
    const results = await assignmentCollection.updateOne(
      { _id: ObjectId.createFromHexString(assignment_id) },
      { $set: {type: "PENDING"} }  
  );
    res.json({ inserted: result.insertedCount });
  } catch (error) {
    console.error("Error adding to mylist:", error);
    res.status(500).json({ error: "Failed to add to mylist" });
  }
});


  app.get("/mylist/:email", async (req, res) => {
    const  email  = req.params.email;
    const query={email}
    const results = await mylistCollection.find(query).toArray();
    const assignmentList = results?.map((result)=>ObjectId.createFromHexString(result.assignment_id.toString()))
    const assignments = await assignmentCollection.find({_id:{$in:assignmentList }}).toArray()
    res.send(assignments)
  });

  app.get("/all-list", async (req, res) => {

    const results = await assignmentCollection.find().toArray()

    res.send(results)
  });

  app.put("/give-mark", async (req, res) => {
    const { assignment_id, given_mark } = req.body;
    const result = await assignmentCollection.updateOne(
      { _id: ObjectId.createFromHexString(assignment_id) },
      { $set: {"given_mark":given_mark,type: "MARKED"} }  
  );
  res.send({'message':'Document updated successfully'});

  })

// Route to fetch user's submissions by email
// app.get('/mylist/:email', (req, res) => {
//   const { email } = req.params;
//   // Filter submissions by email
//   const userSubmissions = submissions.filter(submission => submission.email === email);
//   res.status(200).json(userSubmissions);
// });
  // app.get("/mylist/:email", async (req, res) => {
  //   const  email  = req.params.email;
  //   const query={email}
  //   const result = await assignmentCollection.findOne(query).toArray();
  //   res.send(result);
  // });
 
 
  // list all pending
  //   app.get("/bidrequest/:email", async (req, res) => {
  //   const  email  = req.params.email;
  //   const query={email:email}
  //   const result = await assignmentCollection.findOne(query).toArray();
  //   res.send(result);
  // });
    

  

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

