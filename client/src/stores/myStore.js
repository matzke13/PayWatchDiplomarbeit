import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Cookies from 'js-cookie';
import axios from 'axios';

export const useMyStore = defineStore('myStore', () => {
  // Zustände
  const accessToken = ref(Cookies.get('accessToken') || null);
  const userData = ref(Cookies.get('userData') ? JSON.parse(Cookies.get('userData')) : null);
  const users = ref([]);
  const userDetail = ref(null);
  const userCategories = ref([]);
  const transactions = ref([]);

  const router = useRouter();

  // Methode zum Login mit Google
  const loginWithGoogle = async () => {
    try {
      const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
      });
      const data = await response.json();

      if (data.loginUrl) {
        window.location.href = data.loginUrl;
      } else {
        console.error('Keine Login-URL erhalten');
      }
    } catch (error) {
      console.error('Fehler beim Google-Login:', error);
    }
  };

  // Access Token setzen und speichern
  const setAccessToken = (token) => {
    accessToken.value = token;
    Cookies.set('accessToken', token, { expires: 7 });
    console.log('Access Token gespeichert:', accessToken.value);
  };

  // Token aus der URL extrahieren (nach OAuth-Callback)
  const extractTokenFromUrlFragment = () => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const token = params.get('access_token');

    if (token) {
      setAccessToken(token);
      getUserData();
      window.history.replaceState({}, document.title, '/');
      router.push('/home');
    }
  };

  // Benutzerdaten setzen und speichern
  const setUserData = (data) => {
    userData.value = data;
    Cookies.set('userData', JSON.stringify(data), { expires: 7 });
    console.log('Benutzerdaten gespeichert:', userData.value);
  };

  // Benutzerdaten vom Backend abrufen
  const getUserData = async () => {
    try {
      console.log('Access Token beim Abrufen der Benutzerdaten:', accessToken.value);
  
      const response = await fetch('http://localhost:3000/auth/me', {
        headers: {
          Authorization: `Bearer ${accessToken.value}`,
          'Cache-Control': 'no-cache',
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Fehler beim Abrufen der Benutzerdaten:', errorData);
        return;
      }
  
      const data = await response.json();
      console.log('Benutzerdaten erhalten:', data);
      setUserData(data.user);
    } catch (error) {
      console.error('Fehler beim Abrufen der Benutzerdaten:', error);
    }
  };

  // Alle Benutzer abrufen
  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:3000/users', {
        headers: {
          Authorization: `Bearer ${accessToken.value}`,
        },
      });
      users.value = response.data;
      console.log('Benutzer abgerufen:', users.value);
    } catch (error) {
      console.error('Fehler beim Abrufen der Benutzer:', error);
    }
  };

  // Einzelnen Benutzer per ID abrufen
  const fetchUserById = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/auth/user/${userData.value?.id}`, {
        headers: {
          Authorization: `Bearer ${accessToken.value}`,
        },
      });
      userDetail.value = response.data.user;
      console.log('Benutzer (Einzelabruf) erhalten:', userDetail.value);
    } catch (error) {
      console.error('Fehler beim Abrufen des Benutzers:', error);
    }
  };

  // Kategorien des Benutzers abrufen
  const fetchUserCategories = async () => {
    try {
      const userId = userData.value?.id || Cookies.get('userId');
      if (!userId) {
        console.error('User-ID nicht gefunden');
        return;
      }
      const response = await axios.get(`http://localhost:3000/users/categories/${userId}`, {
        headers: {
          Authorization: `Bearer ${accessToken.value}`,
        },
      });
      userCategories.value = response.data;
      console.log('Kategorien abgerufen:', userCategories.value);
    } catch (error) {
      console.error('Fehler beim Abrufen der Kategorien:', error);
    }
  };

  // Benutzerkategorie erstellen
  const createUserCategory = async (categoryData) => {
    try {
      const payload = {
        userId: userData.value?.id,
        ...categoryData,
      };

      const response = await axios.post(
        'http://localhost:3000/users/categories',
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken.value}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('Kategorie erstellt:', response.data);
      return response.data;
    } catch (error) {
      console.error('Fehler beim Erstellen der Kategorie:', error);
      throw error;
    }
  };

  // Transaktion posten
  const postTransaction = async (transactionData) => {
    console.log(userData.value?.id);
    
    try {
      const dataWithUserId = {
        ...transactionData,
        user_id: userData.value?.id,
      };

      const response = await axios.post(
        'http://localhost:3000/users/transactions',
        dataWithUserId,
        {
          headers: {
            Authorization: `Bearer ${accessToken.value}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('Transaktion gepostet:', response.data);
      fetchUserTransactions();
      return response.data;
    } catch (error) {
      console.error('Fehler beim Posten der Transaktion:', error);
      throw error;
    }
  };

  // Benutzertransaktionen abrufen
  const fetchUserTransactions = async () => {
    await fetchUserById();
    try {
      const userId = userData.value?.id;
      const response = await axios.get(`http://localhost:3000/users/transactions/${userId}`, {
        headers: {
          Authorization: `Bearer ${accessToken.value}`,
        },
      });
      transactions.value = response.data;
      console.log('Transaktionen abgerufen:', transactions.value);
    } catch (error) {
      console.error('Fehler beim Abrufen der Transaktionen:', error);
    }
  };

  // Abmelden
  const logout = async () => {
    try {
      if (accessToken.value) {
        const response = await fetch('http://localhost:3000/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken.value}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Fehler beim Abmelden:', errorData.error);
          return;
        }
      }

      accessToken.value = null;
      userData.value = null;
      Cookies.remove('accessToken');
      Cookies.remove('userData');

      router.push('/');
    } catch (error) {
      console.error('Fehler beim Abmelden:', error);
    }
  };

  // Geschützte Inhalte abrufen (optional)
  const getProtectedContent = async () => {
    try {
      const response = await fetch('http://localhost:3000/protected', {
        headers: {
          Authorization: `Bearer ${accessToken.value}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Fehler beim Abrufen geschützter Inhalte:', errorData.error);
        return;
      }

      const data = await response.json();
      console.log('Geschützte Inhalte:', data);
    } catch (error) {
      console.error('Fehler beim Abrufen geschützter Inhalte:', error);
    }
  };

  // Benutzer löschen
  const deleteUser = async () => {
    await fetchUserById();
    try {
      const userId = userData.value?.id;
      const response = await axios.delete(`http://localhost:3000/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${accessToken.value}`,
        },
      });
      console.log('Benutzer gelöscht:', response.data);
      return response.data;
    } catch (error) {
      console.error('Fehler beim Löschen des Benutzers:', error);
      throw error;
    }
  };

  // Kategorie löschen
  const deleteCategory = async (categoryId) => {
    try {
      const response = await axios.delete(`http://localhost:3000/users/categories/${categoryId}`, {
        headers: {
          Authorization: `Bearer ${accessToken.value}`,
        },
      });
      console.log('Kategorie gelöscht:', response.data);
      userCategories.value = userCategories.value.filter(category => category.id !== categoryId);
      return response.data;
    } catch (error) {
      console.error('Fehler beim Löschen der Kategorie:', error);
      throw error;
    }
  };

  // *** NEUE FUNKTION: Route full-process aufrufen ***
  // Diese Funktion sendet ein Bild (als File) per POST-Request an den neuen Endpunkt
  const extractBillbox = async (file) => {

    try {
      await fetchUserById();
      const formData = new FormData();
      formData.append('file', file);
      const userId = userData.value?.id;
      const response = await axios.post(
        'http://localhost:3000/billbox/full-process/' + userId,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${accessToken.value}`,
          },
        }
      );
      console.log('Billbox Full-Process result:', response.data);
      return response.data;
    } catch (error) {
      console.error('Fehler beim Full-Process der Billbox:', error);
      throw error;
    }
  };

  return {
    // Zustände
    accessToken,
    userData,
    users,
    userDetail,
    userCategories,
    transactions,
    
    // Methoden
    loginWithGoogle,
    setAccessToken,
    extractTokenFromUrlFragment,
    setUserData,
    getUserData,
    fetchUsers,
    fetchUserById,
    fetchUserCategories,
    createUserCategory,
    logout,
    getProtectedContent,
    postTransaction,
    fetchUserTransactions,
    deleteUser,
    deleteCategory,
    extractBillbox, // Funktion mit dem neuen Endpunkt
  };
});
