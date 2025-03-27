import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';

import usersRoute from './routes/userAndTRouter.js'; //USER UND TRANSAKTIONEN
import authRoute from './routes/authRouter.js';
import recurringTransactions from './routes/recurringTRouter.js'; //WIEDERHOLENDE TRANSAKTIONEN
import budgetRoute from './routes/budgetRouter.js';
import billboxRoute from './routes/router.js';


dotenv.config();

const dirname = path.resolve();

const app = express();

app.use(morgan('dev'));
app.use(cors());

app.use(express.static(path.join(dirname, '/public')));

app.use(express.json());

app.use('/users', usersRoute);
app.use('/auth', authRoute);
app.use('/recTrans', recurringTransactions);
app.use('/budget', budgetRoute);
app.use('/billbox', billboxRoute);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server is running on port ${PORT} 🚀`));