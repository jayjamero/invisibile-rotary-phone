'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

// Form data interface
export interface UserFormData {
    username: string;
    jobTitle: string;
}

// Initial form state
const initialFormData: UserFormData = {
    username: '',
    jobTitle: '',
};

// Local storage key
const FORM_STORAGE_KEY = 'userFormData';

// Helper functions for local storage
const loadFromStorage = (): UserFormData => {
    if (typeof window === 'undefined') return initialFormData;

    try {
        const stored = localStorage.getItem(FORM_STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            return {
                username: parsed.username || '',
                jobTitle: parsed.jobTitle || '',
            };
        }
    } catch (error) {
        console.warn('Failed to load form data from localStorage:', error);
    }
    return initialFormData;
};

const saveDataToStorage = (data: UserFormData): void => {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.warn('Failed to save form data to localStorage:', error);
    }
};

// Form context type
interface UserFormContextType {
    formData: UserFormData;
    updateField: (field: keyof UserFormData, value: string) => void;
    resetForm: () => void;
    clearStorage: () => void;
    saveToStorage: (data?: UserFormData) => void;
    isValid: boolean;
}

// Create context
const UserFormContext = createContext<UserFormContextType | undefined>(undefined);

// Hook to use form context
export const useUserForm = () => {
    const context = useContext(UserFormContext);
    if (!context) {
        throw new Error('useUserForm must be used within a UserFormProvider');
    }
    return context;
};

// Form provider component
interface UserFormProviderProps {
    children: ReactNode;
}

export const UserFormProvider: React.FC<UserFormProviderProps> = ({ children }) => {
    const [formData, setFormData] = useState<UserFormData>(initialFormData);
    const [isHydrated, setIsHydrated] = useState(false);

    // Load data from localStorage on mount
    useEffect(() => {
        const storedData = loadFromStorage();
        setFormData(storedData);
        setIsHydrated(true);
    }, []);

    // Remove automatic saving - only save when explicitly called
    const updateField = useCallback((field: keyof UserFormData, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    }, []);

    const resetForm = useCallback(() => {
        setFormData(initialFormData);
    }, []);

    const saveToStorage = useCallback((data?: UserFormData) => {
        if (typeof window !== 'undefined') {
            try {
                if (data) {
                    // Save the provided data and update state
                    saveDataToStorage(data);
                    setFormData(data);
                } else {
                    // Save current state data
                    setFormData((currentData) => {
                        saveDataToStorage(currentData);
                        return currentData;
                    });
                }
            } catch (error) {
                console.warn('Failed to save form data to localStorage:', error);
            }
        }
    }, []);

    const clearStorage = useCallback(() => {
        if (typeof window !== 'undefined') {
            try {
                localStorage.removeItem(FORM_STORAGE_KEY);
                setFormData(initialFormData);
            } catch (error) {
                console.warn('Failed to clear form data from localStorage:', error);
            }
        }
    }, []);

    // Basic validation - check if both required fields are filled
    const isValid = formData.username.trim() !== '' && formData.jobTitle.trim() !== '';

    const value: UserFormContextType = {
        formData,
        updateField,
        resetForm,
        clearStorage,
        saveToStorage,
        isValid,
    };

    return <UserFormContext.Provider value={value}>{children}</UserFormContext.Provider>;
};
