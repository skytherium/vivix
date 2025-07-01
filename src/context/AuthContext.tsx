import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface User {
    username: string;
}

interface AuthContextType {
    user: User | null;
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    login: async () => false,
    logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);

    // Загружаем пользователя из localStorage, если есть
    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
    }, []);

    const login = async (username: string, password: string) => {
        try {
            const res = await fetch('http://localhost:4000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (res.ok) {
                const loggedInUser = { username };
                setUser(loggedInUser);
                localStorage.setItem('user', JSON.stringify(loggedInUser)); // Сохраняем данные пользователя
                return true;
            }
        } catch (err) {
            console.error('Ошибка логина:', err);
        }
        return false;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user'); // Удаляем данные пользователя из localStorage
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
