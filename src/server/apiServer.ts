
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import deliveryScheduleService from './deliveryScheduleService';

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/delivery-schedule', deliveryScheduleService);

// Default route
app.get('/', (req, res) => {
  res.send('Delivery Schedule API Server');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
