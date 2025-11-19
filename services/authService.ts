// services/authService.ts
import type { User } from '../types';

const USERS_KEY = 'auth_users';
const SESSION_KEY = 'auth_session';

// --- User Management ---

const getUsers = (): (User & { passwordHash: string })[] => {
    try {
        const users = localStorage.getItem(USERS_KEY);
        if (users) {
            return JSON.parse(users);
        }
    } catch (e) {
        console.error("Failed to parse users from localStorage", e);
    }
    return [];
};

const saveUsers = (users: (User & { passwordHash: string })[]): void => {
    try {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    } catch (e) {
        console.error("Failed to save users to localStorage", e);
    }
};

// --- Session Management ---

export const getCurrentUser = (): User | null => {
    try {
        const session = sessionStorage.getItem(SESSION_KEY);
        if (session) {
            return JSON.parse(session);
        }
    } catch (e) {
        console.error("Failed to parse session from sessionStorage", e);
    }
    return null;
};

const createSession = (user: User): void => {
    try {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } catch (e) {
        console.error("Failed to create session in sessionStorage", e);
    }
};

const clearSession = (): void => {
    try {
        sessionStorage.removeItem(SESSION_KEY);
    } catch (e) {
        console.error("Failed to clear session from sessionStorage", e);
    }
};

// --- Public API ---

/**
 * Signs up a new user.
 * @returns The new user object if successful, or an error message string.
 */
export const signUp = async (email: string, password: string, phone: string): Promise<User | string> => {
    const users = getUsers();
    const normalizedEmail = email.toLowerCase().trim();

    if (users.some(u => u.email === normalizedEmail)) {
        return 'userExists';
    }

    // In a real app, you'd use a library like bcrypt.
    // This is a simple simulation and is NOT secure.
    const passwordHash = `hashed_${password}`; 
    const newUser: User & { passwordHash: string } = {
        id: `user_${Date.now()}`,
        email: normalizedEmail,
        phone,
        status: 'pending',
        passwordHash,
    };

    saveUsers([...users, newUser]);
    
    const { passwordHash: _, ...userWithoutPassword } = newUser;
    // Do not create a session, user must be approved first.
    return userWithoutPassword;
};

/**
 * Logs in a user.
 * @returns The user object if successful, or an error message string.
 */
export const login = async (email: string, pass: string): Promise<User | string> => {
    const users = getUsers();
    const normalizedEmail = email.toLowerCase().trim();
    
    const user = users.find(u => u.email === normalizedEmail);
    const passwordHash = `hashed_${pass}`;

    // Special case for the admin user
    if (normalizedEmail === 'sserdarb@gmail.com' && pass === (localStorage.getItem('adminPassword') || 'Tuba@2015Tuana')) {
        const adminUser: User = { id: 'admin', email: 'sserdarb@gmail.com', phone: '', status: 'approved' };
        createSession(adminUser);
        return adminUser;
    }

    if (user && user.passwordHash === passwordHash) {
        if (user.status === 'pending') {
            return 'accountPending';
        }
        const { passwordHash: _, ...userWithoutPassword } = user;
        createSession(userWithoutPassword);
        return userWithoutPassword;
    }

    return 'invalidCredentials';
};

/**
 * Gets all registered users (for admin panel).
 */
export const getAllUsers = (): User[] => {
    const users = getUsers();
    return users.map(({ passwordHash, ...userWithoutPassword }) => userWithoutPassword);
};

/**
 * Approves a user's account.
 */
export const approveUser = (userId: string): void => {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
        users[userIndex].status = 'approved';
        saveUsers(users);
    }
};


/**
 * Logs out the current user.
 */
export const logout = (): void => {
    clearSession();
};

/**
 * Simulates sending a password reset link.
 * @returns A generic success message.
 */
export const requestPasswordReset = async (email: string): Promise<string> => {
    const users = getUsers();
    const normalizedEmail = email.toLowerCase().trim();
    const userExists = users.some(u => u.email === normalizedEmail);

    if (userExists) {
        // In a real app, this would trigger an email service.
        console.log(`Password reset link would be sent to: ${normalizedEmail}`);
    } else {
        // We don't want to reveal if an email is registered or not.
        console.log(`Password reset requested for non-existent user: ${normalizedEmail}`);
    }

    // Always return a success message to prevent user enumeration.
    return 'resetPasswordSuccess';
};
