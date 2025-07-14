import { renderHook, act } from '@testing-library/react';
import { UserFormProvider, useUserForm, UserFormData } from '../index';

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};

    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
            store[key] = value.toString();
        },
        removeItem: (key: string) => {
            delete store[key];
        },
        clear: () => {
            store = {};
        },
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

// Test wrapper component
const wrapper = ({ children }: { children: React.ReactNode }) => <UserFormProvider>{children}</UserFormProvider>;

describe('UserFormProvider', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    afterEach(() => {
        localStorage.clear();
    });

    test('should provide initial form data', () => {
        const { result } = renderHook(() => useUserForm(), { wrapper });

        expect(result.current.formData).toEqual({
            username: '',
            jobTitle: '',
        });
        expect(result.current.isValid).toBe(false);
    });

    test('should update form fields', () => {
        const { result } = renderHook(() => useUserForm(), { wrapper });

        act(() => {
            result.current.updateField('username', 'testuser');
        });

        expect(result.current.formData.username).toBe('testuser');
        expect(result.current.isValid).toBe(false); // Still invalid without jobTitle

        act(() => {
            result.current.updateField('jobTitle', 'Developer');
        });

        expect(result.current.formData.jobTitle).toBe('Developer');
        expect(result.current.isValid).toBe(true); // Now valid
    });

    test('should validate form correctly', () => {
        const { result } = renderHook(() => useUserForm(), { wrapper });

        // Empty form should be invalid
        expect(result.current.isValid).toBe(false);

        // Only username filled should be invalid
        act(() => {
            result.current.updateField('username', 'testuser');
        });
        expect(result.current.isValid).toBe(false);

        // Both fields filled should be valid
        act(() => {
            result.current.updateField('jobTitle', 'Developer');
        });
        expect(result.current.isValid).toBe(true);

        // Whitespace-only should be invalid
        act(() => {
            result.current.updateField('username', '   ');
        });
        expect(result.current.isValid).toBe(false);
    });

    test('should reset form data', () => {
        const { result } = renderHook(() => useUserForm(), { wrapper });

        // Set some data
        act(() => {
            result.current.updateField('username', 'testuser');
            result.current.updateField('jobTitle', 'Developer');
        });

        expect(result.current.isValid).toBe(true);

        // Reset form
        act(() => {
            result.current.resetForm();
        });

        expect(result.current.formData).toEqual({
            username: '',
            jobTitle: '',
        });
        expect(result.current.isValid).toBe(false);
    });

    test('should save to localStorage when saveToStorage is called', () => {
        const { result } = renderHook(() => useUserForm(), { wrapper });

        act(() => {
            result.current.updateField('username', 'testuser');
            result.current.saveToStorage(); // Explicitly save
        });

        // Check localStorage was updated
        const stored = localStorage.getItem('userFormData');
        expect(stored).toBeTruthy();
        const parsed = JSON.parse(stored!);
        expect(parsed.username).toBe('testuser');
    });

    test('should not auto-save to localStorage when form data changes', () => {
        const { result } = renderHook(() => useUserForm(), { wrapper });

        act(() => {
            result.current.updateField('username', 'testuser');
        });

        // Check localStorage was NOT automatically updated
        const stored = localStorage.getItem('userFormData');
        expect(stored).toBeNull();
    });

    test('should load from localStorage on initialization', () => {
        // Pre-populate localStorage
        const testData: UserFormData = {
            username: 'storeduser',
            jobTitle: 'Stored Developer',
        };
        localStorage.setItem('userFormData', JSON.stringify(testData));

        const { result } = renderHook(() => useUserForm(), { wrapper });

        // Should load stored data
        expect(result.current.formData).toEqual(testData);
        expect(result.current.isValid).toBe(true);
    });

    test('should clear localStorage', async () => {
        const { result } = renderHook(() => useUserForm(), { wrapper });

        // Set some data and save it
        act(() => {
            result.current.updateField('username', 'testuser');
            result.current.updateField('jobTitle', 'Developer');
            result.current.saveToStorage(); // Explicitly save first
        });

        // Verify data is in localStorage
        expect(localStorage.getItem('userFormData')).toBeTruthy();

        // Clear storage
        act(() => {
            result.current.clearStorage();
        });

        // Verify localStorage is cleared and form is reset
        expect(localStorage.getItem('userFormData')).toBeNull();
        expect(result.current.formData).toEqual({
            username: '',
            jobTitle: '',
        });
    });

    test('should handle localStorage errors gracefully', () => {
        // Mock localStorage to throw errors
        const originalSetItem = localStorage.setItem;
        localStorage.setItem = jest.fn(() => {
            throw new Error('Storage quota exceeded');
        });

        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

        const { result } = renderHook(() => useUserForm(), { wrapper });

        act(() => {
            result.current.updateField('username', 'testuser');
            result.current.saveToStorage(); // Explicitly save to trigger error
        });

        // Should not throw error, but log warning
        expect(consoleSpy).toHaveBeenCalledWith('Failed to save form data to localStorage:', expect.any(Error));

        // Restore original function
        localStorage.setItem = originalSetItem;
        consoleSpy.mockRestore();
    });

    test('should throw error when used outside provider', () => {
        // Suppress console.error for this test
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

        expect(() => {
            renderHook(() => useUserForm());
        }).toThrow('useUserForm must be used within a UserFormProvider');

        consoleSpy.mockRestore();
    });
});
