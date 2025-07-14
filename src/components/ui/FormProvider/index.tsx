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

const saveToStorage = (data: UserFormData): void => {
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
    const [shouldSaveToStorage, setShouldSaveToStorage] = useState(true);

    // Load data from localStorage on mount
    useEffect(() => {
        const storedData = loadFromStorage();
        setFormData(storedData);
        setIsHydrated(true);
    }, []);

    // Save to localStorage whenever formData changes (after initial hydration)
    useEffect(() => {
        if (isHydrated && shouldSaveToStorage) {
            saveToStorage(formData);
        }
    }, [formData, isHydrated, shouldSaveToStorage]);

    const updateField = useCallback((field: keyof UserFormData, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    }, []);

    const resetForm = useCallback(() => {
        setFormData(initialFormData);
    }, []);

    const clearStorage = useCallback(() => {
        if (typeof window !== 'undefined') {
            try {
                setShouldSaveToStorage(false);
                localStorage.removeItem(FORM_STORAGE_KEY);
                setFormData(initialFormData);
                // Re-enable saving after clearing
                setTimeout(() => setShouldSaveToStorage(true), 0);
            } catch (error) {
                console.warn('Failed to clear form data from localStorage:', error);
                setShouldSaveToStorage(true);
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
        isValid,
    };

    return <UserFormContext.Provider value={value}>{children}</UserFormContext.Provider>;
};
