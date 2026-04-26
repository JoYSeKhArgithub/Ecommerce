import express from 'express';
import cors from 'cors';
import {errorMiddleWare} from '../../../utils/error-handler/error.middleware'
import cookieParser from 'cookie-parser';
import { connectDB, closeDB } from '../../../utils/MongoDb/index';
import logger from '../../../utils/logger/index';
import authRouter from '../src/routes/auth.route'

const app = express();


app.use(
  cors({
    origin: ["http://localhost:3000"],
    allowedHeaders: ["Authorization","Content-Type"],
    credentials: true
  })
)

const MONGO_URI = process.env.DATABASE_URL!;
connectDB(MONGO_URI);

app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send({ message: 'Hello API' });
});

app.use("/api/v1",authRouter)

app.use(errorMiddleWare)

// const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 6001;

const server = app.listen(port, () => {
  logger.debug(`Server is running on port ${port} in ${process.env.NODE_ENV || 'development'} mode`);
});

process.on('SIGINT', async () => {
  await closeDB();
  server.close(() => {
    logger.debug('Server closed');
    process.exit(0);
  });
});
