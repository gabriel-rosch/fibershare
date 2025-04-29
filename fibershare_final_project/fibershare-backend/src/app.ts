import cors from 'cors';
import operatorRoutes from './routes/operatorRoutes';

const app = express();

app.use(cors({
  origin: 'http://localhost:3000', // URL do frontend
  credentials: true
}));

// ... código existente ...
app.use('/api/operators', operatorRoutes); 