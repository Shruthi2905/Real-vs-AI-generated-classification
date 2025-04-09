import { openDB } from 'idb';
import bcrypt from 'bcryptjs';

const dbName = 'userAuth';
const storeName = 'users';

const initDB = async () => {
  const db = await openDB(dbName, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(storeName)) {
        const store = db.createObjectStore(storeName, { keyPath: 'email' });
        store.createIndex('resetToken', 'resetToken', { unique: false });
      }
    },
  });
  return db;
};

export interface User {
  email: string;
  password: string;
  resetToken?: string;
  resetTokenExpires?: number;
}

export const createUser = async (email: string, password: string): Promise<User | null> => {
  try {
    const db = await initDB();
    
    // Check if user already exists
    const existingUser = await db.get(storeName, email);
    if (existingUser) {
      return null;
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user: User = {
      email,
      password: hashedPassword,
    };
    
    await db.put(storeName, user);
    return user;
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
};

export const verifyUser = async (email: string, password: string): Promise<User | null> => {
  try {
    const db = await initDB();
    const user = await db.get(storeName, email);
    
    if (user && await bcrypt.compare(password, user.password)) {
      return user;
    }
    return null;
  } catch (error) {
    console.error('Error verifying user:', error);
    return null;
  }
};

export const setResetToken = async (email: string): Promise<string | null> => {
  try {
    const db = await initDB();
    
    // First check if the user exists
    const user = await db.get(storeName, email);
    console.log('Found user:', user); // Debug log
    
    if (!user) {
      console.log('No user found for email:', email); // Debug log
      return null;
    }
    
    const token = Math.random().toString(36).substring(2, 15) + 
                 Math.random().toString(36).substring(2, 15);
    const expires = Date.now() + (60 * 60 * 1000); // 1 hour from now
    
    const updatedUser = {
      ...user,
      resetToken: token,
      resetTokenExpires: expires,
    };
    
    await db.put(storeName, updatedUser);
    console.log('Updated user with token:', updatedUser); // Debug log
    return token;
  } catch (error) {
    console.error('Error setting reset token:', error);
    return null;
  }
};

export const verifyResetToken = async (token: string): Promise<string | null> => {
  try {
    const db = await initDB();
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const users = await store.getAll();
    
    const user = users.find(u => 
      u.resetToken === token && 
      u.resetTokenExpires && 
      u.resetTokenExpires > Date.now()
    );
    
    return user ? user.email : null;
  } catch (error) {
    console.error('Error verifying reset token:', error);
    return null;
  }
};

export const resetPassword = async (token: string, newPassword: string): Promise<boolean> => {
  try {
    const db = await initDB();
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const users = await store.getAll();
    
    const user = users.find(u => 
      u.resetToken === token && 
      u.resetTokenExpires && 
      u.resetTokenExpires > Date.now()
    );
    
    if (!user) return false;
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUser = {
      ...user,
      password: hashedPassword,
      resetToken: undefined,
      resetTokenExpires: undefined,
    };
    
    await store.put(updatedUser);
    return true;
  } catch (error) {
    console.error('Error resetting password:', error);
    return false;
  }
};