const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.all('/voice', async (req, res) => {
  const userSpeech = req.query.speech || req.body.speech || req.query.val_name;

  if (!userSpeech) {
    // זיהוי דיבור: מסיים בלחיצה על # או אחרי 2 שניות של שקט (20 עשיריות שניה)
    return res.send("read=t-שלום, במה אוכל לעזור? דבר ובסיום הקש סולמית או המתן שתי שניות.=speech,no,1,7,20,s,s,ALL,no,no,no,no,yes,no,no");
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(`ענה בקצרה ובשפה ברורה שמתאימה להקראה קולית בטלפון: ${userSpeech}`);
    const replyText = result.response.text().replace(/[*#_]/g, '');

    // מענה והנחיה לשאלה הבאה - סיום ב-# או ב-2 שניות שקט
    return res.send(`read=t-${replyText}. מה השאלה הבאה?=speech,no,1,7,20,s,s,ALL,no,no,no,no,yes,no,no`);
  } catch (error) {
    console.error(error);
    return res.send("read=t-התרחשה שגיאה בעיבוד הבקשה, אנא נסה שוב.=speech,no,1,7,20,s,s,ALL,no,no,no,no,yes,no,no");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
