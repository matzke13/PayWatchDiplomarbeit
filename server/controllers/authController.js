// controllers/authController.js
import { loginWithGoogle, exchangeAuthCodeForTokens, logout, getUserById } from '../models/authModel.js';
// controllers/userController.js
  
  export const login = async (req, res) => {
    try {
      const { data, error } = await loginWithGoogle();
      if (error) throw error;
  
      res.json({ loginUrl: data.url });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  export const callback = async (req, res) => {
    try {
      const { code } = req.query;
      const { data, error } = await exchangeAuthCodeForTokens(code);
      if (error) throw error;
  
      res.json({ token: data.access_token });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  export const me = (req, res) => {
    try {
      // Da die Middleware bereits den Benutzer setzt, können wir direkt darauf zugreifen
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
  
      res.json({ user: req.user });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  export const logoutUser = async (req, res) => {
    try {
      // Wir verwenden req.user, der von der Middleware bereitgestellt wird
      if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  
      const { error } = await logout(req.user.id); // Passe die logout-Funktion entsprechend an
      if (error) throw error;
  
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  export const getUserByIdC = async (req, res) => {
    const { userId } = req.params;

    try {
        const { data, error } = await getUserById(userId);

        if (error) {
            return res.status(400).json({ error: error.message || 'Fehler beim Abrufen des Benutzers' });
        }

        if (!data) {
            return res.status(404).json({ error: 'Benutzer nicht gefunden' });
        }

        res.json({ user: data });
    } catch (err) {
        res.status(500).json({ error: 'Serverfehler' });
    }
};
