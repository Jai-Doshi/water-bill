import React, { createContext, useContext, useEffect, useState } from 'react';
import type { AppState, Bill, Person } from '../types';

export interface ToastProps {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
}

interface AppContextProps {
    state: AppState;
    toasts: ToastProps[];
    addPerson: (name: string) => Person;
    updatePerson: (id: string, name: string) => void;
    removePerson: (id: string) => void;
    addBill: (bill: Bill) => void;
    updateBill: (bill: Bill) => void;
    removeBill: (id: string) => void;
    showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
    removeToast: (id: string) => void;
}

const STORAGE_KEY = 'water_bill_pwa_state';

const initialState: AppState = {
    people: [],
    bills: [],
};

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<AppState>(initialState);
    const [isLoaded, setIsLoaded] = useState(false);
    const [toasts, setToasts] = useState<ToastProps[]>([]);

    // Load from LocalStorage
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                setState(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse state', e);
            }
        }
        setIsLoaded(true);
    }, []);

    // Save to LocalStorage
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        }
    }, [state, isLoaded]);

    const addPerson = (name: string) => {
        const newPerson = { id: crypto.randomUUID(), name };
        setState((prev) => ({ ...prev, people: [...prev.people, newPerson] }));
        return newPerson;
    };

    const updatePerson = (id: string, name: string) => {
        setState((prev) => ({
            ...prev,
            people: prev.people.map((p) => (p.id === id ? { ...p, name } : p)),
        }));
    };

    const removePerson = (id: string) => {
        setState((prev) => ({
            ...prev,
            people: prev.people.filter((p) => p.id !== id),
        }));
    };

    const addBill = (bill: Bill) => {
        setState((prev) => ({ ...prev, bills: [bill, ...prev.bills] }));
    };

    const updateBill = (bill: Bill) => {
        setState((prev) => ({
            ...prev,
            bills: prev.bills.map((b) => (b.id === bill.id ? bill : b)),
        }));
    };

    const removeBill = (id: string) => {
        setState((prev) => ({
            ...prev,
            bills: prev.bills.filter((b) => b.id !== id),
        }));
    };

    const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
        const id = crypto.randomUUID();
        setToasts(prev => [...prev, { id, message, type }]);
    };

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <AppContext.Provider
            value={{ state, toasts, addPerson, updatePerson, removePerson, addBill, updateBill, removeBill, showToast, removeToast }}
        >
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};
