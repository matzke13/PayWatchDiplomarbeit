import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export const loginWithGoogle = async () => {
  return await supabase.auth.signInWithOAuth({ provider: 'google' });
};

export const exchangeAuthCodeForTokens = async (code) => {
  return await supabase.auth.exchangeAuthCodeForTokens(code);
};

export const getUserByToken = async (token) => {
  try {
    console.log('Token in getUserByToken:', token);

    const { data, error } = await supabase.auth.getUser(token);
    console.log('Ergebnis von supabase.auth.getUser:', { data, error });

    if (error || !data) {
      console.error('Fehler beim Abrufen des Benutzers:', error);
      return { error: error || 'Benutzer nicht gefunden' };
    }

    return { data: data.user };
  } catch (err) {
    console.error('Fehler in getUserByToken:', err);
    return { error: err };
  }
};

export const logout = async (token) => {
  return await supabase.auth.signOut(token);
};

export const getUserById = async (userId) => {
  try {
      const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('user_id', userId)
          .single();

      if (error) {
          return { error };
      }

      return { data };
  } catch (err) {
      return { error: err.message };
  }
};