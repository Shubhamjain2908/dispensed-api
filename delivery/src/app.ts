import { errorHandler, NotFoundError } from '@tickethub/common';
import { json } from 'body-parser';
import express from 'express';
import 'express-async-errors';
import { deliveryRouter } from './routes/deliver';

const app = express();
app.set('trust proxy', true);
app.use(json());

app.use(deliveryRouter);

app.all('*', async (req, res) => {
    throw new NotFoundError();
});

app.use(errorHandler);

export { app };

