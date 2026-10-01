const express = require('express');
const { GoogleGenerativeAI } = require('@google/genai');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.all('/voice', async (req, res) => {
  const userSpeech = req.query.speech || req.body.speech || req.query.val_name;

  if (!userSpeech) {
    return res.send("read=t-שלום, במה אוכל לעזור? תגיד את השאלה בסיום השטיקה.=speech,no,1,7,60,s,s,ALL");
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(`ענה בקצרה ובשפה ברורה שמתאימה להקראה קולית בטלפון: ${userSpeech}`);
    const replyText = result.response.text().replace(/[*#_]/g, '');

    return res.send(`read=t-${replyText}. מה השאלה הבאה?=speech,no,1,7,60,s,s,ALL`);
  } catch (error) {
    console.error(error);
    return res.send("read=t-התרחשה שגיאה בעיבוד הבקשה, אנא נסה שוב.=speech,no,1,7,60,s,s,ALL");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
