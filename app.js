require('dotenv').config();
var mongoose = require('mongoose');
const express = require('express');
const path = require('path');
const app = express();
// mongoose.connect('mongodb://127.0.0.1:27017/quakApp');

// mongoose.connect('mongodb://127.0.0.1:27017/quakApp')
//   .then(() => {
//     console.log('MongoDB connected successfully');
//   })
//   .catch((err) => {
//     console.error('MongoDB connection failed:', err);
//   });

 if (process.env.MONGO_URI) {
   mongoose.connect(process.env.MONGO_URI)
     .then(() => console.log("MongoDB connected"))
     .catch(err => console.error("Mongo error:", err));
 } else {
   console.log("MONGO_URI not found, skipping DB connection");
 }

//const app = require('express')();
const http = require('http').Server(app);


 app.use('/public', express.static(path.join(__dirname, 'public')));

 const multer = require('multer');
 const { storage } = require('./cloudinaryConfig');

 app.set('view engine', 'ejs');
 app.set('views', path.join(__dirname, 'views'));
//app.use(express.static(path.join(__dirname, 'public')));

const userRoute = require('./routes/userRoute');
const User = require('./models/userModel');
const Chat = require('./models/chatModel');
const Notification = require('./models/notificationModel');
const docusign = require("docusign-esign");
const axios = require("axios");
const { GoogleGenAI } = require('@google/genai');

app.use('/',userRoute);
app.get('/',function(req,res){
    res.send("Running");
});

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

  async function getGeminiReply(message) {

      try {

          const response = await ai.models.generateContent({
              model: "gemini-3.6-flash",
              contents: `
              You are a dating app user chatting with a potential match.

              Personality:
              Attractive, playful, confident, warm and slightly flirty.

              Rules:
              - Reply naturally like a real person.
              - Keep it short, one sentence.
              - Be playful and charming.
              - Use light flirting when appropriate.
              - Use emojis naturally.
              - Do not sound like an AI.
              - Do not be vulgar or sexually explicit.

                User message:
                ${message}
                `
          });

          console.log("Gemini Response:", response.text);

          return response.text;

      } catch (error) {

          console.error("Gemini Error:", error);

          return null;
      }
  }
    //  getGeminiReply("hi");
//code for socket.io
    const io = require('socket.io')(http);
    app.set('io', io); 
    var usp = io.of('/user-namespace');

    usp.on('connection',async function(socket){
    console.log("User Connected");
    var userId = socket.handshake.auth.token;
    socket.join(userId); 
    await User.findByIdAndUpdate({_id:userId}, {$set:{is_online:'1'} });
    //user broadcast online status
    socket.broadcast.emit('getOnlineUser', {user_id:userId});
    socket.on('disconnect', async function(){
        console.log("User Disconnected");
        var userId = socket.handshake.auth.token;
        await User.findByIdAndUpdate({_id:userId}, {$set:{is_online:'0'} });
        //user broadcast offline status
        socket.broadcast.emit('getOflineUser', {user_id:userId});
    });
    //chating implementation
    // socket.on('newChat', function(data){
    //     socket.broadcast.emit('loadNewChat', data);
    // });
    socket.on('newChat', async function(data) {

    try {

        // Normal message receiver ko bhejo
        socket.broadcast.emit('loadNewChat', data);

        // Receiver ka record nikalo
        const receiver = await User.findById(data.receiver_id);

        console.log("Receiver:", receiver?.name);
        console.log("Is AI:", receiver?.is_ai);

        // -------------------------------
        // AI USER
        // -------------------------------
        if (receiver && receiver.is_ai === true) {

            console.log("🤖 AI USER FOUND");

            // Gemini reply
            const aiReply = await getGeminiReply(data.message);

            console.log("🤖 Gemini Reply:", aiReply);

            if (!aiReply) {
                return;
            }

            // -------------------------------
            // SAVE AI MESSAGE IN DATABASE
            // -------------------------------

            const aiMessage = new Chat({
                sender_id: data.receiver_id, // AI user
                receiver_id: data.sender_id, // Real user
                message: aiReply,
                is_read: 0
            });

            const savedAiMessage = await aiMessage.save();

            console.log("🤖 AI MESSAGE SAVED:", savedAiMessage._id);

            // -------------------------------
            // SEND AI MESSAGE TO REAL USER
            // -------------------------------

            usp.to(data.sender_id.toString()).emit(
                'loadNewChat',
                savedAiMessage
            );

        } else {
            console.log("👤 Real User - Gemini nahi chalega");
        }

    } catch (error) {

        console.error("AI Chat Error:", error);

    }

});
    //updated code
    socket.on('user-typing',function(receiver_id){
        socket.broadcast.emit('user-typing-res',receiver_id,);
    });
    socket.on('user-not-typing',function(receiver_id){
        socket.broadcast.emit('user-not-typing-res',receiver_id);
    });
    //chat for get old chat
    socket.on('existsChat', async function(data){
       await Chat.updateMany({sender_id:data.receiver_id,receiver_id:data.sender_id,is_read: 1}, {$set:{is_read:'0'} });
        var chats = await Chat.find({ $or: [
            { sender_id:data.sender_id, receiver_id:data.receiver_id},
            { sender_id:data.receiver_id, receiver_id:data.sender_id}

        ]});
        var userName = data.userName
        var userImg = data.userImg
        socket.emit('loaChats',{chats:chats},{userName:userName},{userImg:userImg});
    });
    //chat deleted
    socket.on('chatDeleted',function(id){
        socket.broadcast.emit('chatMessageDeleted',id);
    });
    //code for get reveiver record
    socket.on('receiverRecord',function(id){
        socket.broadcast.emit('chatMessageDeleted',id);
    });
    //end code for get reveiver record
    socket.on('notifyLikedUser', async ({ notify_user_id, receiver_id }) => {
        console.log('notify_user_id', notify_user_id);
        const notificationCount = await Notification.countDocuments({
            user_id: new mongoose.Types.ObjectId(notify_user_id),
            is_read: false,
        });
        const userData = await User.findById(notify_user_id).lean();
        socket.broadcast.emit('notifyUser-res', notify_user_id, notificationCount);
    });
});
//end code for socket.io

//code for docsign
app.get("/auth", (req, res) => {
    const authUrl = `${process.env.DOCUSIGN_BASE_URL}/oauth/auth?response_type=code&scope=signature&client_id=${process.env.DOCUSIGN_CLIENT_ID}&redirect_uri=${process.env.DOCUSIGN_REDIRECT_URI}`;
    res.redirect(authUrl);
  });
  
  // Step 2: Callback (DocuSign sends code here)
  app.get("/callback", async (req, res) => {
    const code = req.query.code;
  
    try {
      const response = await axios.post(
        `${process.env.DOCUSIGN_BASE_URL}/oauth/token`,
        new URLSearchParams({
          grant_type: "authorization_code",
          code,
          client_id: process.env.DOCUSIGN_CLIENT_ID,
          client_secret: process.env.DOCUSIGN_CLIENT_SECRET,
          redirect_uri: process.env.DOCUSIGN_REDIRECT_URI,
        }),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );
  
      const { access_token } = response.data;
      res.json({ access_token });
    } catch (error) {
      console.error(error.response?.data || error.message);
      res.status(400).send(error.response?.data || error.message);
    }
  });
  
  // Step 3: Example API call to send an envelope
  app.post("/send-envelope", async (req, res) => {
    const { access_token } = req.body;
  
    try {
      const apiClient = new docusign.ApiClient();
      apiClient.setBasePath("https://demo.docusign.net/restapi");
      apiClient.addDefaultHeader("Authorization", "Bearer " + access_token);
  
      const envelopesApi = new docusign.EnvelopesApi(apiClient);
  
      const envelopeDefinition = new docusign.EnvelopeDefinition();
      envelopeDefinition.emailSubject = "Please sign this document";
      envelopeDefinition.status = "sent";
  
      // Add document (Base64)
      const document = new docusign.Document();
      document.documentBase64 = Buffer.from("Hello, please sign this doc").toString("base64");
      document.name = "TestDoc.txt";
      document.fileExtension = "txt";
      document.documentId = "1";
      envelopeDefinition.documents = [document];
  
      // Add recipient
      const signer = new docusign.Signer();
      signer.email = "vishal01singh03@gmail.com";
      signer.name = "Vishal Singh";
      signer.recipientId = "1";
      signer.routingOrder = "1";
  
      // Signature tab (where recipient signs)
      const signHere = new docusign.SignHere();
      signHere.documentId = "1";
      signHere.pageNumber = "1";
      signHere.recipientId = "1";
      signHere.xPosition = "100";
      signHere.yPosition = "150";
  
      const tabs = new docusign.Tabs();
      tabs.signHereTabs = [signHere];
      signer.tabs = tabs;
  
      envelopeDefinition.recipients = new docusign.Recipients();
      envelopeDefinition.recipients.signers = [signer];
  
      const results = await envelopesApi.createEnvelope(process.env.DOCUSIGN_ACCOUNT_ID, { envelopeDefinition });
      res.json(results);
    } catch (err) {
      console.error(err);
      res.status(500).send(err);
    }
  });
//end code for docusign
const PORT = process.env.PORT || 3000;
//console.log('port from env',PORT);
http.listen(PORT, function(){
    console.log('server is running on 3000 port...')
});