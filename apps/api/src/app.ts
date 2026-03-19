import express from 'express';
import type { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes       from './modules/auth/auth.routes';
import clientsRoutes    from './modules/clients/clients.routes';
import productsRoutes   from './modules/products/products.routes';
import invoicesRoutes   from './modules/invoices/invoices.routes';
import quotesRoutes     from './modules/quotes/quotes.routes';
import paymentsRoutes   from './modules/payments/payments.routes';
import accountingRoutes from './modules/accounting/accounting.routes';
import settingsRoutes   from './modules/settings/settings.routes';

export const app: Express = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/api/auth',       authRoutes);
app.use('/api/clients',    clientsRoutes);
app.use('/api/products',   productsRoutes);
app.use('/api/invoices',   invoicesRoutes);
app.use('/api/quotes',     quotesRoutes);
app.use('/api/payments',   paymentsRoutes);
app.use('/api/accounting', accountingRoutes);
app.use('/api/settings',  settingsRoutes);
app.use('/uploads', express.static('uploads'));

app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});