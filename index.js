import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import userRoute from "./routes/userRoute.js";
import userModel from "./models/userModel.js";
dotenv.config();
const app = express();
import { auth} from "./middlewares/auth.js";
import { Configuration, OpenAIApi } from "openai";

const config = new Configuration({
	apiKey: process.env.apiKey,
});



app.use(express.json({ limit: "30mb", extended: true }))
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(auth);
app.use("/user", userRoute);
const openai = new OpenAIApi(config);
// Function to send a message to the ChatGPT API


async function sendMessage(message,message2) {
  const prompt=message+"."+message2
  const response = await openai.createCompletion({
		model: "text-davinci-003",
		prompt: prompt,
		max_tokens: 2048,
		temperature: 1,
	});

	const parsableJSONresponse = response.data.choices[0].text;
	// const parsedResponse = JSON.parse(parsableJSONresponse);

	// console.log(parsableJSONresponse);
  return parsableJSONresponse
}

app.post('/intro', async (req, res) => {
  const query  = req.body;
  const userId=req.user._id;
  const msg="consider yourself as a interviewer, just provide the rating out of 20 and give output in the form of integer only, no explanation is required,no space spaces or extra character should be outputed"

  try {
    const response = await sendMessage(query.msg,msg);
    var user;

    try {
        user = await userModel.findById(userId);        
    } catch (err) {
        console.log(err);        
    }

    try {
        user = await userModel.findByIdAndUpdate(userId, {intro_score:response });        
    } catch (err) {
        console.log(err);           
    }
    res.status(200).json({msg:"Now you can proceed to coding part"})
  } catch (error) {
    console.error('Search failed:',error );
    res.status(500).json({ error: 'Search failed' });
  }
});

app.post('/checkApproach', async (req, res) => {
  const q = req.body.question;
  const ans=req.body.approach;
  const userId=req.user._id;
  var msg=q.concat("consider yourself as a interviewer, see the correction of the approach and on the basis of it provide the rating out of 10 in the form of integer number strictly no other characters should be present except number, no explanation is required. no space spaces or extra character should be outputed, please output only a number nothing else")
  // console.log(ans);
  try {
    const response = await sendMessage(msg,ans);
    var number = response.match(/\d+/)
    var new_res=parseInt(number[0])
    var user;
    console.log(new_res);
    try {
        user = await userModel.findById(userId);        
    } catch (err) {
        console.log(err);        
    }

    try {
        user = await userModel.findByIdAndUpdate(userId, {approach_score:new_res });        
    } catch (err) {
        console.log(err);           
    }
    res.status(200).json({ reply: new_res });
  } catch (error) {
    console.error('Search failed:',error );
    res.status(500).json({ error: 'Search failed' });
  }
});

app.post('/checkCode', async (req, res) => {
  var q = req.body.question;
  var ans=req.body.approach;
  const userId=req.user._id;
//  console.log(q);
//  console.log(ans);
  var s="consider yourself as a interviewer, see the correction of the code and on the basis of it provide the rating out of 70 in the form of integer number strictly no other characters should be present except number, no explanation is required. no space spaces or extra character should be outputed"
  var new_s=q.concat(s);
  // console.log(new_s);
  try {
    var response = await sendMessage(new_s,ans);
    var result = response.replace(/\r\n/g, '');
    var num = parseInt(result);
    console.log(num);
    var user;
    try {
        user = await userModel.findById(userId);        
    } catch (err) {
        console.log(err);       
    }
    const new_score=num;
    try {
        user = await userModel.findByIdAndUpdate(userId, {coding_score:new_score });        
    } catch (err) {
      console.log(err);           
    }
  } catch (error) {
    console.error('Search failed:', );
    res.status(500).json({ error: 'Search failed' });
  }
});

app.get('/getScore', async (req, res) => {
  const userId=req.user._id;
  var user;
    try {
        user = await userModel.findById(userId);       
        res.status(200).json({name:user.name,intro_score:user.intro_score,approach_score:user.approach_score,coding_score:user.coding_score}); 
    } catch (err) {
        console.log(err);       
    }
});

// Start the server
const PORT = 5000;

mongoose
  .connect(process.env.CONNECTION_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() =>
    app.listen(PORT, () =>
      console.log(`The server is running on port: ${PORT}`)
    )
  )
  .catch((error) => console.log(error.message));
