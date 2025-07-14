'use client';

import { Dialog, Portal, Button, Field, Input, VStack, HStack, useDisclosure } from '@chakra-ui/react';
import { LuX } from 'react-icons/lu';
import { useState, useEffect } from 'react';
import { useUserForm } from '../../providers/FormProvider';

// Separate trigger component that can be used anywhere
export const UserFormTrigger: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    const { open, onOpen, onClose } = useDisclosure();
    const { formData, updateField, resetForm, saveToStorage, clearStorage } = useUserForm();

    // Local state for form inputs
    const [localUsername, setLocalUsername] = useState('');
    const [localJobTitle, setLocalJobTitle] = useState('');

    // Load form data into local state when modal opens
    useEffect(() => {
        if (open) {
            setLocalUsername(formData.username);
            setLocalJobTitle(formData.jobTitle);
        }
    }, [open, formData.username, formData.jobTitle]);

    // Check if user has saved data (for view vs create mode)
    // Consider it view mode if there's saved data OR if the user has filled both fields
    const [hasSavedData, setHasSavedData] = useState(false);

    useEffect(() => {
        // Check if there's saved data in localStorage
        const savedData = localStorage.getItem('userFormData');
        setHasSavedData(!!savedData);
    }, [formData, open]); // Re-check when formData changes or modal opens

    // Check if both local fields are filled (user is editing)
    const hasLocalData = localUsername.trim() !== '' && localJobTitle.trim() !== '';

    const isViewMode = hasSavedData;

    // Local validation
    const isValid = localUsername.trim() !== '' && localJobTitle.trim() !== '';

    const handleSubmit = () => {
        if (isValid) {
            // Save the local data directly to storage and update global state
            const dataToSave = { username: localUsername, jobTitle: localJobTitle };
            saveToStorage(dataToSave);

            console.log('Form submitted:', dataToSave);
            onClose();
        } else {
            console.error('Form is invalid');
            alert('Please fill out all fields correctly.');
        }
    };

    const handleClearData = () => {
        clearStorage(); // This removes data from localStorage and resets global state
        setLocalUsername(''); // Reset local state
        setLocalJobTitle(''); // Reset local state
    };

    const handleCancel = () => {
        // Reset local state to match global state
        setLocalUsername(formData.username);
        setLocalJobTitle(formData.jobTitle);
        onClose();
        resetForm();
    };

    return (
        <>
            {/* Custom trigger - use children  */}
            <div onClick={onOpen} style={{ cursor: 'pointer' }}>
                {children}
            </div>

            {/* Modal Dialog */}
            <Dialog.Root open={open} onOpenChange={({ open }) => !open && onClose()} placement="center">
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content p={6}>
                        <Dialog.Header pb={6}>
                            <Dialog.Title fontSize="xl" fontWeight="bold">
                                {isViewMode ? 'User Profile' : 'Get Started'}
                            </Dialog.Title>
                        </Dialog.Header>

                        <Dialog.CloseTrigger asChild>
                            <Button size="sm" variant="ghost" position="absolute" top={4} right={4} onClick={onClose}>
                                <LuX />
                            </Button>
                        </Dialog.CloseTrigger>

                        <Dialog.Body pb={6}>
                            <VStack gap={4} align="stretch">
                                <Field.Root>
                                    <Field.Label>Username</Field.Label>
                                    <Input
                                        value={localUsername}
                                        onChange={(e) => setLocalUsername(e.target.value)}
                                        placeholder="Enter your username"
                                        textIndent={2}
                                    />
                                </Field.Root>

                                <Field.Root>
                                    <Field.Label>Job Title</Field.Label>
                                    <Input
                                        value={localJobTitle}
                                        onChange={(e) => setLocalJobTitle(e.target.value)}
                                        placeholder="Enter your job title"
                                        textIndent={2}
                                    />
                                </Field.Root>
                            </VStack>
                        </Dialog.Body>

                        <Dialog.Footer>
                            {isViewMode && (
                                <Button colorPalette="red" size="md" py={2} px={3} onClick={handleClearData}>
                                    Clear Data
                                </Button>
                            )}
                            <Button variant="ghost" size="md" py={2} px={3} onClick={handleCancel}>
                                {isViewMode ? 'Close' : 'Cancel'}
                            </Button>
                            <Button
                                colorPalette="teal"
                                size="md"
                                py={2}
                                px={3}
                                mr={2}
                                onClick={handleSubmit}
                                disabled={!isValid}
                            >
                                {isViewMode ? 'Update' : 'Save'}
                            </Button>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Dialog.Root>
        </>
    );
};
