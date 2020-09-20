import mongoose from 'mongoose';
import { app } from './app';

const PORT = process.env.PORT || 3000;

const start = async () => {
    console.log('Delivery service starting...');

    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI must be defined');
    }

    await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true
    });
    console.log('Delivery Service: Connected to MongoDB!!!')

    app.listen(PORT, () => {
        console.log(`Delivery Service: Listening on port: ${PORT}!`)
    });

};

start();