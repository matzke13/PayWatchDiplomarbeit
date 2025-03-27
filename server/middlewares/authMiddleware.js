// middlewares/authMiddleware.js
import { getUserByToken } from '../models/authModel.js';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    console.log('Authorization Header:', authHeader);
    console.log('Extrahierter Token:', token);

    if (!token) {
      console.error('Kein Token vorhanden');
      return res.status(401).json({ error: 'Kein Token vorhanden' });
    }

    const { data: user, error } = await getUserByToken(token);
    console.log('Ergebnis von getUserByToken:', { user, error });

    if (error || !user) {
      console.error('Ungültiger Token oder Fehler beim Abrufen des Benutzers:', error);
      return res.status(403).json({ error: 'Ungültiger Token' });
    }

    console.log('Benutzer in Middleware:', user);
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentifizierungsfehler:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
};
