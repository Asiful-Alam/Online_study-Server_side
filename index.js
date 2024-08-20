const express = require("express");
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin:[ 
    'http://localhost:5173',
    'https://online-study-2061e.web.app',
    'https://online-study-2061e.firebaseapp.com'
  ],
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

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

// middleware for jwt 
const logger =(req,res,next) => {
  console.log('log info:',req.method,req.url);
  next();
};


const verifyToken=(req,res,next)=>{
  const token=req.cookies?.token;
  // console.log("token in the middleware", token)
  if(!token){
    return res.status(401).send({message:"unauthorized access"});
  }
  jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,decoded)=>{
    if(err){
      return res.status(401).send({message:'unauthorized access'})
    }
    req.user =decoded;
    next()
  })
}

// Connect to MongoDB
async function run() {
  try {
    // await client.connect();
    const assignmentCollection = client
      .db("assignmentDB")
      .collection("assignment");
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
      // console.log('cokkieeeeeesss',req.cookies);
      
      const result = await cursor.toArray();
      res.send(result);
      console.log('cookies',req.cookies);
    });

    //  delete assignment
    app.delete("/assignment/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await assignmentCollection.deleteOne(query);
      res.send(result);
    });
    
    //  update assignment

    app.get("/assignment/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await assignmentCollection.findOne(query);
      res.send(result);
    });

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
          description: updatedItem.description || currrrLoc.description,
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
        const { email, data, conclusion, assignment_id } = req.body;
        const result = await mylistCollection.insertOne({
          email,
          data,
          conclusion,
          assignment_id,
        });
        
        const results = await assignmentCollection.updateOne(
          { _id: ObjectId.createFromHexString(assignment_id) },
          { $set: { type: "PENDING" } }
        );
        res.json({ inserted: result.insertedCount });
        console.log('cookies',req.cookies);
      } catch (error) {
        console.error("Error adding to mylist:", error);
        res.status(500).json({ error: "Failed to add to mylist" });
      }
    });

    app.get("/mylist/:email", logger, verifyToken, async (req, res) => {
      console.log("huhuhuhucokiii",req.user)
      
      const email = req.params.email;
      const query = { email };
      const results = await mylistCollection.find(query).toArray();
      if(req.user.email !== req.params.email){
        return res.status(403).send({message: "forbidden access"})
      }
      
      const assignmentList = results?.map((result) =>
        ObjectId.createFromHexString(result.assignment_id.toString())
      );
      const assignments = await assignmentCollection
        .find({ _id: { $in: assignmentList } })
        .toArray();
      res.send(assignments);
    });
    

    // delete mylist
    app.delete("/mylist/:email", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await mylistCollection.deleteOne(query);
      res.send(result);
    });

    // add all list
    app.get("/all-list", async (req, res) => {
      const results = await assignmentCollection.find().toArray();
      res.send(results);
    });

    // give mark condition
    app.put("/give-mark", async (req, res) => {
      const { assignment_id, given_mark } = req.body;
      const result = await assignmentCollection.updateOne(
        { _id: ObjectId.createFromHexString(assignment_id) },
        { $set: { given_mark: given_mark, type: "MARKED" } }
      );
      res.send({ message: "Document updated successfully" });
    });

    // AUTH RELETED API
    app.post("/jwt",logger, async (req, res) => {
      const user = req.body;
      console.log("user for token", user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });
      res.cookie('token', token,{
        httpOnly: true,
        secure:true,
        sameSite:"none"
      })
      res.send({ success: true});
    });
    // user logout hoile jwt
    app.post('/logout',async(req,res)=>{
        const user=req.body;
       console.log("Logging Out", user);
        res.clearCookie('token',{maxAge:0}).send({success: true});
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
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Close client connection
    // await client.close();
  }
}

run()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port :${port}`);
    });
  })
  .catch(() => {
    console.dir;
  });

// Default route

// Start server