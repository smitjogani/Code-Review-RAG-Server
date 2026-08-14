import express from 'express';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';

const app = express();
app.use(express.json());
app.use(mongoSanitize());
app.use(xss());

app.get('/health', (req, res) => res.json({ message: "OK" }));

app.listen(5001, () => {
    console.log("Started on 5001");
});
