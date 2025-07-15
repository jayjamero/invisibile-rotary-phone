/**
 * Data Masking Demo for GraphQL Security
 * This file demonstrates the comprehensive data masking functionality
 */

import {
    DataMasker,
    maskResponseData,
    maskVariablesForLogging,
    maskQueryForLogging,
    createAuditLogData,
    sanitizeErrorMessage,
} from '../src/lib/security/graphql-security';

import {
    createSecureVariables,
    maskGraphQLResponse,
    createMaskedVariables,
    logSecureGraphQLOperation,
} from '../src/lib/security/secure-query-utils';

import { GET_CHARACTERS } from '../src/lib/graphql/queries';

// Demo: Creating a custom data masker
console.log('=== Data Masking Demo ===\n');

// 1. Custom Data Masker Configuration
const customMasker = new DataMasker({
    enableMasking: true,
    maskSensitiveFields: true,
    logSafeMode: true,
    maskingPattern: '###',
    sensitiveFields: ['id', 'created', 'dimension'],
    partialMaskingFields: ['name', 'image'],
});

// 2. Sample GraphQL Response Data
const sampleResponse = {
    characters: {
        info: {
            count: 826,
            pages: 42,
            next: 'https://rickandmortyapi.com/api/character/?page=2',
            prev: null,
        },
        results: [
            {
                id: '1',
                name: 'Rick Sanchez',
                status: 'Alive',
                species: 'Human',
                type: '',
                gender: 'Male',
                origin: {
                    id: '1',
                    name: 'Earth (C-137)',
                    type: 'Planet',
                    dimension: 'Dimension C-137',
                },
                location: {
                    id: '20',
                    name: 'Earth (Replacement Dimension)',
                    type: 'Planet',
                    dimension: 'Replacement Dimension',
                    created: '2017-11-04T18:48:46.250Z',
                },
                image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
                episode: [
                    {
                        id: '1',
                        name: 'Pilot',
                        air_date: 'December 2, 2013',
                        episode: 'S01E01',
                        created: '2017-11-10T12:56:33.798Z',
                    },
                ],
                created: '2017-11-04T18:48:46.250Z',
            },
        ],
    },
};

// 3. Sample Variables
const sampleVariables = {
    page: 1,
    filter: {
        name: 'Rick',
        status: 'Alive',
        species: 'Human',
        dimension: 'C-137',
    },
};

console.log('1. Original Response Data:');
console.log(JSON.stringify(sampleResponse, null, 2));

console.log('\n2. Masked Response Data (Production Mode):');
const maskedResponse = customMasker.maskResponseData(sampleResponse);
console.log(JSON.stringify(maskedResponse, null, 2));

console.log('\n3. Original Variables:');
console.log(JSON.stringify(sampleVariables, null, 2));

console.log('\n4. Masked Variables for Logging:');
const maskedVariables = customMasker.maskVariables(sampleVariables);
console.log(JSON.stringify(maskedVariables, null, 2));

console.log('\n5. Audit-Safe Data (Sensitive Fields Removed):');
const auditSafeData = customMasker.createAuditLogData(sampleResponse);
console.log(JSON.stringify(auditSafeData, null, 2));

console.log('\n6. Masked Query for Logging:');
const maskedQuery = customMasker.maskQueryForLogging(GET_CHARACTERS);
console.log(maskedQuery);

console.log('\n7. Error Message Masking:');
const sampleError = new Error('GraphQL error: Character with ID 123456 not found in dimension C-137');
const maskedError = customMasker.maskErrorMessage(sampleError);
console.log('Original:', sampleError.message);
console.log('Masked:', maskedError);

console.log('\n8. Global Masking Functions Usage:');

// Using global functions
const globalMasked = maskResponseData(sampleResponse);
const globalMaskedVars = maskVariablesForLogging(sampleVariables);
const globalAuditData = createAuditLogData(sampleResponse);

console.log('Global masked response keys:', Object.keys(globalMasked));
console.log('Global masked variables keys:', Object.keys(globalMaskedVars));
console.log('Global audit data keys:', Object.keys(globalAuditData));

console.log('\n9. Secure Query Utils Integration:');

// Using secure query utils
const secureVars = createSecureVariables(sampleVariables);
const maskedVarsForLog = createMaskedVariables(sampleVariables);
const maskedResponseUtil = maskGraphQLResponse(sampleResponse, true);

console.log('Secure variables created');
console.log('Masked variables for logging created');
console.log('Response masked using utility function');

console.log('\n=== Demo Complete ===');
console.log('\nKey Features Demonstrated:');
console.log('✅ Custom DataMasker configuration');
console.log('✅ Response data masking with field-specific rules');
console.log('✅ Variable masking for safe logging');
console.log('✅ Audit-safe data creation (sensitive field removal)');
console.log('✅ GraphQL query masking for logs');
console.log('✅ Error message sanitization with data masking');
console.log('✅ Global utility functions for easy integration');
console.log('✅ Secure query utilities with masking support');

export { customMasker, sampleResponse, sampleVariables };
