# GraphQL Security Implementation

This document outlines the comprehensive security measures implemented to protect GraphQL requests in the Rick and Morty Character Explorer application.

## 🔐 Security Features Implemented

### 1. Data Masking & Privacy Protection
- **Comprehensive Data Masking**: Automatic masking of sensitive data fields
- **Configurable Masking Rules**: Flexible masking levels (sensitive vs partial)
- **Field-Level Security**: Granular control over individual field masking
- **Production-Safe Defaults**: Conservative masking in production environments

### 2. Query Validation & Analysis
- **Query Depth Limiting**: Prevents deeply nested queries that could cause DoS attacks
- **Query Complexity Analysis**: Analyzes and limits query complexity to prevent resource exhaustion
- **Query Structure Validation**: Validates GraphQL query structure before execution
- **Safe Query Filtering**: Blocks potentially unsafe query patterns

### 3. Secure Apollo Hooks
- **useSecureQuery**: Drop-in replacement for useQuery with built-in security
- **useSecureLazyQuery**: Secure lazy query execution with validation
- **useSecureMutation**: Secure mutations with data masking
- **useGraphQLAuditLogger**: Comprehensive audit logging utilities

### 4. Audit Logging & Monitoring
- **Operation Logging**: Detailed logging of all GraphQL operations
- **Security Event Tracking**: Logs security-related events and violations
- **Production Monitoring**: Comprehensive audit trails for production environments
- **Configurable Logging Levels**: Environment-specific logging configurations

### 5. Error Handling & Information Disclosure Prevention
- **Error Message Sanitization**: Sanitizes error messages to prevent information disclosure
- **Development vs Production**: Different error verbosity levels for development and production
- **Secure Error Boundary**: Catches and handles React/GraphQL errors gracefully
- **Safe Error Responses**: Prevents sensitive information leakage through errors

### 6. Network Security
- **Request Timeout**: Prevents hanging requests that could cause resource exhaustion
- **Secure Headers**: Implements security headers for all HTTP requests
- **HTTPS Enforcement**: Configured for HTTPS-only in production

### 7. Content Security Policy (CSP)
- **Strict CSP Rules**: Prevents XSS attacks through strict content security policies
- **Resource Origin Control**: Controls which resources can be loaded from which origins
- **Script Execution Control**: Limits inline script execution

## 📁 Security File Structure

```
src/lib/security/
├── graphql-security.ts         # Core security utilities and DataMasker class
├── secure-query-utils.ts       # Secure query utility functions
├── secure-apollo-hooks.ts      # Secure Apollo Client hooks
└── __test__/
    ├── graphql-security.test.ts
    ├── secure-query-utils.test.ts
    └── secure-apollo-hooks.test.tsx

src/components/security/
└── SecureErrorBoundary.tsx     # Error boundary component

middleware.ts                   # Next.js security middleware
.env.local                     # Environment configuration
.env.example                   # Environment variable template
```

## 🛠️ Implementation Details

### Environment Configuration

```bash
# Security Configuration
NEXT_PUBLIC_MAX_QUERY_DEPTH=10
NEXT_PUBLIC_MAX_QUERY_COMPLEXITY=1000
NEXT_PUBLIC_REQUEST_TIMEOUT=10000
NEXT_PUBLIC_RATE_LIMIT=60
```

### Usage Examples

#### Secure GraphQL Hooks
```typescript
// Using secure hooks with built-in validation
const { data, loading, error } = useCharacters(page, filter);
// Automatically includes:
// - Query validation
// - Rate limiting
// - Input sanitization
// - Error handling
```

#### Manual Security Validation
```typescript
import { validateQuery, sanitizeVariables, checkRateLimit } from '@/lib/security/graphql-security';

// Validate query before execution
const validation = validateQuery(MY_QUERY);
if (!validation.valid) {
  console.warn('Query validation failed:', validation.errors);
}

// Check rate limiting
const rateLimitCheck = checkRateLimit();
if (!rateLimitCheck.allowed) {
  // Handle rate limiting
}

// Sanitize variables
const cleanVariables = sanitizeVariables(userInput);
```

### Error Boundary Usage
```typescript
// Wrap components with secure error handling
<SecureErrorBoundary>
  <MyComponent />
</SecureErrorBoundary>
```

## 🔒 Security Measures by Category

### A. Authentication & Authorization
- ✅ Secure headers implementation
- ✅ Request validation
- ✅ Rate limiting
- ⚠️ No user authentication (public API)

### B. Input Validation
- ✅ GraphQL variable sanitization
- ✅ Query structure validation
- ✅ Parameter bounds checking
- ✅ Type safety enforcement

### C. Output Security
- ✅ Error message sanitization
- ✅ Information disclosure prevention
- ✅ Development vs production error handling
- ✅ Secure error boundaries

### D. Network Security
- ✅ Request timeouts
- ✅ Secure HTTP headers
- ✅ Content Security Policy
- ✅ HTTPS enforcement (production)

### E. DoS Protection
- ✅ Query depth limiting
- ✅ Query complexity analysis
- ✅ Rate limiting
- ✅ Request timeout protection

## 🚀 Security Best Practices

### 1. Query Design
- Use fragments to avoid deeply nested queries
- Implement pagination for large data sets
- Limit the scope of queries to necessary data only

### 2. Error Handling
- Never expose internal error details in production
- Log errors securely for debugging
- Provide user-friendly error messages

### 3. Rate Limiting
- Set appropriate rate limits based on use case
- Implement exponential backoff for failed requests
- Provide clear feedback to users about rate limits

### 4. Monitoring
- Monitor query complexity and depth
- Track rate limit violations
- Log security-related events

## 🧪 Testing Security

The security implementation includes tests that verify:

1. **Query Validation**: Tests for depth and complexity limits
2. **Rate Limiting**: Tests for rate limit enforcement
3. **Input Sanitization**: Tests for variable sanitization
4. **Error Handling**: Tests for secure error message handling

## 📊 Security Metrics

The implementation tracks the following security metrics:

- Query depth and complexity scores
- Rate limit violations per client
- Failed validation attempts
- Error frequency and types

## 🔄 Security Updates

To maintain security:

1. **Regular Updates**: Keep dependencies updated
2. **Security Audits**: Regular code security reviews
3. **Monitoring**: Monitor for security-related issues
4. **Testing**: Continuous security testing

## 📝 Configuration

### Next.js Security Headers

The application includes comprehensive security headers:

```typescript
// Security headers in next.config.ts
{
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-XSS-Protection': '1; mode=block',
}
```

### Content Security Policy

Strict CSP implementation:
- Prevents XSS attacks
- Controls resource loading
- Limits script execution
- Enforces HTTPS

This security implementation provides comprehensive protection against common GraphQL security vulnerabilities while maintaining usability and performance.
