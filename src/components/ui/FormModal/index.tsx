'use client';

import { Dialog, Portal, Button, Field, Input, VStack, HStack, useDisclosure } from '@chakra-ui/react';
import { LuX } from 'react-icons/lu';
import { useUserForm } from '../FormProvider';

// User Form Modal Component
export const UserFormModal: React.FC = () => {
    const { open, onOpen, onClose } = useDisclosure();
    const { formData, updateField, resetForm, isValid } = useUserForm();

    const handleSubmit = () => {
        if (isValid) {
            console.log('Form submitted:', formData);
            // Here you would typically send the data to an API
            alert(`Welcome ${formData.username}! Your job title: ${formData.jobTitle}`);
            resetForm();
            onClose();
        }
    };

    const handleCancel = () => {
        resetForm();
        onClose();
    };

    return (
        <>
            {/* Trigger Button */}
            <Button onClick={onOpen} colorPalette="teal" size="md">
                Get Started
            </Button>

            {/* Modal Dialog */}
            <Dialog.Root open={open} onOpenChange={({ open }) => !open && onClose()} placement="center">
                <Portal>
                    <Dialog.Backdrop />
                    <Dialog.Positioner>
                        <Dialog.Content p={6}>
                            <Dialog.Header pb={6}>
                                <Dialog.Title fontSize="xl" fontWeight="bold">
                                    Get Started
                                </Dialog.Title>
                            </Dialog.Header>
                            <Dialog.CloseTrigger asChild>
                                <Button size="sm" variant="ghost" onClick={() => onClose()}>
                                    <LuX />
                                </Button>
                            </Dialog.CloseTrigger>
                            <Dialog.Body pb={6}>
                                <Field.Root>
                                    <Field.Label>Username</Field.Label>
                                    <Input textIndent={2} placeholder="Username" />
                                </Field.Root>

                                <Field.Root mt={4}>
                                    <Field.Label>Job Title</Field.Label>
                                    <Input textIndent={2} placeholder="Job Title" />
                                </Field.Root>
                            </Dialog.Body>

                            <Dialog.Footer>
                                <Button 
                                    colorPalette="teal" 
                                    size="md" 
                                    py={2} 
                                    px={3} 
                                    mr={2}
                                    disabled={!isValid}
                                >
                                    Save
                                </Button>
                                <Button variant="ghost" size="md" py={2} px={3} onClick={onClose}>
                                    Cancel
                                </Button>
                            </Dialog.Footer>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>
        </>
    );
};

// Separate trigger component that can be used anywhere
export const UserFormTrigger: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    const { open, onOpen, onClose } = useDisclosure();
    const { formData, updateField, resetForm, isValid } = useUserForm();

    const handleSubmit = () => {
        if (isValid) {
            console.log('Form submitted:', formData);
            alert(`Welcome ${formData.username}! Your job title: ${formData.jobTitle}`);
            resetForm();
            onClose();
        } else {
            console.error('Form is invalid');
            alert('Please fill out all fields correctly.');
        }
    };

    const handleCancel = () => {
        resetForm();
        onClose();
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
                                Get Started
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
                                        value={formData.username}
                                        onChange={(e) => updateField('username', e.target.value)}
                                        placeholder="Enter your username"
                                        textIndent={2}
                                    />
                                </Field.Root>

                                <Field.Root>
                                    <Field.Label>Job Title</Field.Label>
                                    <Input
                                        value={formData.jobTitle}
                                        onChange={(e) => updateField('jobTitle', e.target.value)}
                                        placeholder="Enter your job title"
                                        textIndent={2}
                                    />
                                </Field.Root>
                            </VStack>
                        </Dialog.Body>

                        <Dialog.Footer>
                            <Button variant="ghost" size="md" py={2} px={3} onClick={handleCancel}>
                                Cancel
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
                                Save
                            </Button>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Dialog.Root>
        </>
    );
};
