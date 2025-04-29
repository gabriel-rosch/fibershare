import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import ctoRoutes from './routes/ctoRoutes';
import ctoPortRoutes from './routes/ctoPortRoutes';
import serviceOrderRoutes from './routes/serviceOrderRoutes';
import portServiceOrderRoutes from './routes/portServiceOrderRoutes';
import chatRoutes from './routes/chatRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import operatorRoutes from './routes/operatorRoutes';
// Import other routes as they are created
// import marketplaceRoutes from './routes/marketplaceRoutes'; // Placeholder if needed

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json()); // Parse JSON request bodies

// Routes
app.get('/', (req: Request, res: Response) => {
  res.send('FiberShare Backend API is running!');
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ctos', ctoRoutes);
app.use('/api/ports', ctoPortRoutes); // Mount routes for CTO ports
app.use('/api/service-orders', serviceOrderRoutes);
app.use('/api/port-orders', portServiceOrderRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/operators', operatorRoutes);
// app.use('/api/marketplace', marketplaceRoutes); // Placeholder

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

