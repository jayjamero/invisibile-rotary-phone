'use client';

import { Dialog, Button, Field, Input, VStack, useDisclosure, Alert } from '@chakra-ui/react';
import { LuX, LuInfo } from 'react-icons/lu';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUserForm } from '../../providers/FormProvider';

// Separate trigger component that can be used anywhere
export const UserFormTrigger: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    const { open, onOpen, onClose } = useDisclosure();
    const { formData, resetForm, saveToStorage, clearStorage } = useUserForm();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Local state for form inputs
    const [localUsername, setLocalUsername] = useState('');
    const [localJobTitle, setLocalJobTitle] = useState('');
    const [showValidationAlert, setShowValidationAlert] = useState(true);

    // Load form data into local state when modal opens
    useEffect(() => {
        if (open) {
            setLocalUsername(formData.username);
            setLocalJobTitle(formData.jobTitle);
            setShowValidationAlert(true); // Reset alert when modal opens
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

    const isViewMode = hasSavedData;

    // Local validation
    const isValid = localUsername.trim() !== '' && localJobTitle.trim() !== '';

    // Helper function to remove openModal from URL
    const removeOpenModalFromURL = () => {
        const currentParams = new URLSearchParams(searchParams.toString());
        if (currentParams.has('openModal')) {
            currentParams.delete('openModal');
            const newUrl = currentParams.toString()
                ? `${window.location.pathname}?${currentParams.toString()}`
                : window.location.pathname;
            router.replace(newUrl);
        }
    };

    const handleSubmit = () => {
        if (isValid) {
            // Save the local data directly to storage and update global state
            const dataToSave = { username: localUsername, jobTitle: localJobTitle };
            saveToStorage(dataToSave);

            console.log('Form submitted:', dataToSave);
            setShowValidationAlert(false); // Hide any validation alert
            removeOpenModalFromURL(); // Remove openModal from URL
            onClose();
        } else {
            console.error('Form is invalid');
            setShowValidationAlert(true);
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
        setShowValidationAlert(false); // Hide alert when canceling
        removeOpenModalFromURL(); // Remove openModal from URL
        onClose();
        resetForm();
    };

    return (
        <>
            {/* Custom trigger - use children  */}
            <div
                onClick={onOpen}
                style={{ cursor: 'pointer' }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onOpen();
                    }
                }}
                aria-label="Open user profile form"
            >
                {children}
            </div>

            {/* Modal Dialog */}
            <Dialog.Root open={open} onOpenChange={({ open }) => !open && handleCancel()} placement="center">
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content
                        p={6}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="form-modal-title"
                        aria-describedby="form-modal-description"
                    >
                        <Dialog.Header pb={6}>
                            <Dialog.Title fontSize="xl" fontWeight="bold" id="form-modal-title">
                                {isViewMode ? 'User Profile' : 'Get Started'}
                            </Dialog.Title>
                        </Dialog.Header>

                        <Dialog.CloseTrigger asChild>
                            <Button
                                size="sm"
                                variant="ghost"
                                position="absolute"
                                top={4}
                                right={4}
                                onClick={handleCancel}
                                aria-label="Close form modal"
                                _focus={{
                                    outline: '2px solid',
                                    outlineColor: 'blue.500',
                                    outlineOffset: '2px',
                                }}
                            >
                                <LuX aria-hidden="true" />
                            </Button>
                        </Dialog.CloseTrigger>

                        <Dialog.Body pb={6}>
                            <div id="form-modal-description" className="sr-only">
                                {isViewMode
                                    ? 'Update your profile information including username and job title'
                                    : 'Create your profile by entering your username and job title'}
                            </div>
                            <VStack
                                gap={4}
                                align="stretch"
                                as="form"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSubmit();
                                }}
                            >
                                <Field.Root>
                                    <Field.Label htmlFor="username-input">Username</Field.Label>
                                    <Input
                                        id="username-input"
                                        value={localUsername}
                                        onChange={(e) => {
                                            setLocalUsername(e.target.value);
                                            if (showValidationAlert) setShowValidationAlert(false);
                                        }}
                                        placeholder="Enter your username"
                                        textIndent={2}
                                        required
                                        aria-describedby="username-hint"
                                        _focus={{
                                            outline: '2px solid',
                                            outlineColor: 'blue.500',
                                            outlineOffset: '2px',
                                        }}
                                    />
                                    <div id="username-hint" className="sr-only">
                                        Username is required and should be unique to identify your profile
                                    </div>
                                    {!localUsername.trim() && <Field.ErrorText>Username is required</Field.ErrorText>}
                                </Field.Root>

                                <Field.Root>
                                    <Field.Label htmlFor="job-title-input">Job Title</Field.Label>
                                    <Input
                                        id="job-title-input"
                                        value={localJobTitle}
                                        onChange={(e) => {
                                            setLocalJobTitle(e.target.value);
                                            if (showValidationAlert) setShowValidationAlert(false);
                                        }}
                                        placeholder="Enter your job title"
                                        textIndent={2}
                                        required
                                        aria-describedby="job-title-hint"
                                        _focus={{
                                            outline: '2px solid',
                                            outlineColor: 'blue.500',
                                            outlineOffset: '2px',
                                        }}
                                    />
                                    <div id="job-title-hint" className="sr-only">
                                        Job title describes your current professional role
                                    </div>
                                    {!localJobTitle.trim() && <Field.ErrorText>Job title is required</Field.ErrorText>}
                                </Field.Root>
                            </VStack>

                            {/* Validation Alert */}
                            {showValidationAlert && (
                                <Alert.Root status="error" mt={4} p={4}>
                                    <Alert.Indicator>
                                        <LuInfo />
                                    </Alert.Indicator>
                                    <Alert.Content>
                                        <Alert.Title>Validation Error</Alert.Title>
                                        <Alert.Description>
                                            Please fill out all fields correctly before submitting.
                                        </Alert.Description>
                                    </Alert.Content>
                                </Alert.Root>
                            )}
                        </Dialog.Body>

                        <Dialog.Footer>
                            {isViewMode && (
                                <Button
                                    colorPalette="red"
                                    size="md"
                                    py={2}
                                    px={3}
                                    onClick={handleClearData}
                                    aria-label="Clear all profile data permanently"
                                    _focus={{
                                        outline: '2px solid',
                                        outlineColor: 'red.500',
                                        outlineOffset: '2px',
                                    }}
                                >
                                    Clear Data
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="md"
                                py={2}
                                px={3}
                                onClick={handleCancel}
                                aria-label={
                                    isViewMode ? 'Close profile form without saving changes' : 'Cancel profile creation'
                                }
                                _focus={{
                                    outline: '2px solid',
                                    outlineColor: 'blue.500',
                                    outlineOffset: '2px',
                                }}
                            >
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
                                aria-label={isViewMode ? 'Update profile information' : 'Save new profile'}
                                _focus={{
                                    outline: '2px solid',
                                    outlineColor: 'teal.500',
                                    outlineOffset: '2px',
                                }}
                                _disabled={{
                                    opacity: 0.5,
                                    cursor: 'not-allowed',
                                }}
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
