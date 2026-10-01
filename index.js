const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.all('/voice', async (req, res) => {
    // קליטת הדיבור מהמשתמש (תמיכה גם ב-query וגם ב-body)
    const userSpeech = req.query.speech || req.body.speech || req.query.text || req.body.text;

    if (!userSpeech) {
        // בקשת הקלט מהמשתמש בצורה תקינה לימות המשיח
        return res.send("read=t-אנא אמרו את בקשתכם לאחר הביפ, ולאחר מכן הקישו סולמית. /speech,6,L,m,s");
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(userSpeech);
        const replyText = result.response.text();

        // ניקוי תוים מיוחדים שעלולים לשבור את הקידוד בטלפון
        const cleanReply = replyText.replace(/[\r\n]+/g, ' ').trim();

        // החזרת התשובה לימות המשיח להקראה למשתמש
        return res.send(`read=t-${cleanReply}=,`);
    } catch (error) {
        console.error(error);
        return res.send("read=t-אירעה שגיאה בעיבוד הבקשה, נסה שוב.");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
