/**
 * User Form with Server-Side Validation - Server Side
 * 
 * This server:
 * 1. Renders the form with server-side rendering
 * 2. Publishes validation API endpoints
 * 3. Publishes registration endpoint
 * 4. Handles form submission
 */

const { Server } = require('jsgui3-server');
const jsgui = require('./client');

// Mock user database (for demo purposes)
const userDatabase = [];
const emailBlacklist = ['spam@example.com', 'fake@test.com'];

// Server-side validation function
function validateUser(userData) {
    const errors = {};
    
    // Check for required fields
    if (!userData.firstName || userData.firstName.trim() === '') {
        errors.firstName = 'First name is required';
    } else if (userData.firstName.length < 2 || userData.firstName.length > 50) {
        errors.firstName = 'First name must be 2-50 characters';
    }
    
    if (!userData.lastName || userData.lastName.trim() === '') {
        errors.lastName = 'Last name is required';
    } else if (userData.lastName.length < 2 || userData.lastName.length > 50) {
        errors.lastName = 'Last name must be 2-50 characters';
    }
    
    // Email validation with blacklist check
    if (!userData.email || userData.email.trim() === '') {
        errors.email = 'Email is required';
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userData.email)) {
            errors.email = 'Invalid email address';
        } else if (emailBlacklist.includes(userData.email.toLowerCase())) {
            errors.email = 'This email is not allowed';
        } else if (userDatabase.some(user => user.email === userData.email)) {
            errors.email = 'This email is already registered';
        }
    }
    
    // Website validation
    if (userData.website && userData.website.trim() !== '') {
        try {
            new URL(userData.website);
        } catch {
            errors.website = 'Invalid website URL';
        }
    }
    
    // Terms agreement
    if (!userData.agreeToTerms) {
        errors.agreeToTerms = 'You must agree to the terms';
    }
    
    return {
        valid: Object.keys(errors).length === 0,
        errors
    };
}

// Only run when executed directly
if (require.main === module) {
    const { Demo_UI } = jsgui.controls;
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 52001;
    
    // Create the server
    const server = new Server({
        Ctrl: Demo_UI,
        src_path_client_js: require.resolve('./client.js'),
        debug: true
    });
    
    console.log('Preparing server...');
    console.log('Building client bundle...');
    
    // Wait for server to be ready
    server.on('ready', () => {
        console.log('✓ Server ready');
        console.log('✓ Client bundle built');
        console.log('Publishing API endpoints...');
        
        // Publish validation endpoint
        server.publish('validateUser', (userData) => {
            console.log('Validating user:', userData.email);
            const result = validateUser(userData);
            console.log('Validation result:', result.valid ? 'Valid' : 'Invalid');
            if (!result.valid) {
                console.log('Validation errors:', result.errors);
            }
            return result;
        });
        
        // Publish registration endpoint
        server.publish('register', (userData) => {
            console.log('Registration attempt:', userData.email);
            
            // Validate again on registration
            const validation = validateUser(userData);
            if (!validation.valid) {
                console.log('Registration failed: validation errors');
                return {
                    success: false,
                    error: 'Validation failed: ' + Object.values(validation.errors).join(', ')
                };
            }
            
            // Add to database
            userDatabase.push({
                ...userData,
                registeredAt: new Date().toISOString()
            });
            
            console.log('✓ User registered successfully');
            console.log('Total users:', userDatabase.length);
            
            return {
                success: true,
                message: 'User registered successfully'
            };
        });
        
        // Publish endpoint to get registered users (for debugging)
        server.publish('getUsers', () => {
            return {
                count: userDatabase.length,
                users: userDatabase.map(u => ({
                    name: `${u.firstName} ${u.lastName}`,
                    email: u.email,
                    registeredAt: u.registeredAt
                }))
            };
        });
        
        console.log('✓ API endpoints published:');
        console.log('  - /api/validateUser (POST)');
        console.log('  - /api/register (POST)');
        console.log('  - /api/getUsers (GET/POST)');
        
        // Start the HTTP server
        server.start(port, (err) => {
            if (err) {
                console.error('Failed to start server:', err);
                throw err;
            }
            
            console.log('');
            console.log('================================================');
            console.log('🚀 User Form Example Server Started');
            console.log('================================================');
            console.log('');
            console.log('Open your browser to:');
            console.log(`  http://localhost:${port}`);
            console.log('');
            console.log('Features:');
            console.log('  • Client-side validation on blur');
            console.log('  • Server-side validation before submission');
            console.log('  • Data transformation (capitalize, lowercase)');
            console.log('  • Email blacklist checking');
            console.log('  • Duplicate email detection');
            console.log('');
            console.log('Try these test cases:');
            console.log('  ❌ spam@example.com - Blacklisted email');
            console.log('  ❌ invalid-url - Invalid website URL');
            console.log('  ❌ Empty fields - Required field errors');
            console.log('  ✓ Valid data - Should register successfully');
            console.log('');
            console.log('Debug API:');
            console.log(`  GET http://localhost:${port}/api/getUsers`);
            console.log('');
            console.log('Press Ctrl+C to stop the server');
            console.log('================================================');
            console.log('');
        });
    });
}

module.exports = { server: Server, validateUser };
