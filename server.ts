import express from 'express';
import { getAddressHandler, createUserOpHandler, sendUserOpHandler } from './handlers';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

app.post('/get-address', getAddressHandler);
app.post('/create-userop', createUserOpHandler);
app.post('/send-userop', sendUserOpHandler);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});