# Suggested Unit Tests for jsgui3-html Server

Based on the failing examples and analysis of the server API assumptions, here are specific unit tests that should be written for the server-side functionality.

## 1. Server Class Core Functionality

### Server Constructor Tests
```javascript
describe('Server Constructor', () => {
    it('should accept valid Ctrl parameter', () => {
        const MockCtrl = class extends Control {};
        const server = new Server({ Ctrl: MockCtrl });
        expect(server.Ctrl).toBe(MockCtrl);
    });
    
    it('should throw error for invalid Ctrl parameter', () => {
        expect(() => new Server({ Ctrl: 'invalid' })).toThrow();
        expect(() => new Server({ Ctrl: null })).toThrow();
    });
    
    it('should accept valid src_path_client_js', () => {
        const validPath = path.resolve(__dirname, './fixtures/client.js');
        const MockCtrl = class extends Control {};
        const server = new Server({ 
            Ctrl: MockCtrl, 
            src_path_client_js: validPath 
        });
        expect(server.src_path_client_js).toBe(validPath);
    });
    
    it('should throw error for non-existent client file', () => {
        const MockCtrl = class extends Control {};
        expect(() => new Server({ 
            Ctrl: MockCtrl, 
            src_path_client_js: '/non/existent/file.js' 
        })).toThrow();
    });
    
    it('should handle debug flag correctly', () => {
        const MockCtrl = class extends Control {};
        const server = new Server({ Ctrl: MockCtrl, debug: true });
        expect(server.debug).toBe(true);
    });
});
```

### Server Lifecycle Tests
```javascript
describe('Server Lifecycle', () => {
    let server;
    
    beforeEach(() => {
        const MockCtrl = class extends Control {};
        server = new Server({ 
            Ctrl: MockCtrl,
            src_path_client_js: path.resolve(__dirname, './fixtures/client.js')
        });
    });
    
    it('should emit ready event after successful bundle build', (done) => {
        server.on('ready', () => {
            done();
        });
        // Server should auto-start bundling
    });
    
    it('should start HTTP server on specified port', (done) => {
        server.on('ready', () => {
            server.start(0, (err, actualPort) => {
                expect(err).toBeNull();
                expect(typeof actualPort).toBe('number');
                server.stop(done);
            });
        });
    });
    
    it('should handle port already in use error', (done) => {
        // Start a dummy server on a port first
        const dummyServer = require('http').createServer();
        dummyServer.listen(0, () => {
            const port = dummyServer.address().port;
            
            server.on('ready', () => {
                server.start(port, (err) => {
                    expect(err).toBeTruthy();
                    expect(err.code).toBe('EADDRINUSE');
                    dummyServer.close(done);
                });
            });
        });
    });
});
```

## 2. Client Bundle Building Tests

### Bundle Process Tests
```javascript
describe('Client Bundle Building', () => {
    it('should successfully bundle simple client file', (done) => {
        const clientCode = `
            const { Control } = require('jsgui3-html');
            class TestCtrl extends Control {}
            module.exports = { TestCtrl };
        `;
        
        const clientPath = path.join(__dirname, 'temp_client.js');
        fs.writeFileSync(clientPath, clientCode);
        
        const server = new Server({
            Ctrl: require(clientPath).TestCtrl,
            src_path_client_js: clientPath
        });
        
        server.on('ready', () => {
            expect(server.clientBundle).toBeTruthy();
            expect(server.cssBundle).toBeTruthy();
            fs.unlinkSync(clientPath);
            done();
        });
        
        server.on('error', (err) => {
            fs.unlinkSync(clientPath);
            done(err);
        });
    });
    
    it('should handle client file with syntax errors', (done) => {
        const invalidClientCode = `
            const { Control } = require('jsgui3-html');
            class TestCtrl extends Control {
                constructor() {
                    // Missing super() call - syntax error
                }
            }
            module.exports = { TestCtrl };
        `;
        
        const clientPath = path.join(__dirname, 'invalid_client.js');
        fs.writeFileSync(clientPath, invalidClientCode);
        
        const server = new Server({
            Ctrl: class extends Control {},
            src_path_client_js: clientPath
        });
        
        server.on('error', (err) => {
            expect(err).toBeTruthy();
            fs.unlinkSync(clientPath);
            done();
        });
        
        server.on('ready', () => {
            fs.unlinkSync(clientPath);
            done(new Error('Should have failed with syntax error'));
        });
    });
    
    it('should extract CSS from control classes', (done) => {
        const clientCode = `
            const { Control } = require('jsgui3-html');
            class TestCtrl extends Control {}
            TestCtrl.css = '.test { color: red; }';
            module.exports = { TestCtrl };
        `;
        
        const clientPath = path.join(__dirname, 'css_client.js');
        fs.writeFileSync(clientPath, clientCode);
        
        const server = new Server({
            Ctrl: require(clientPath).TestCtrl,
            src_path_client_js: clientPath
        });
        
        server.on('ready', () => {
            expect(server.cssBundle).toContain('.test { color: red; }');
            fs.unlinkSync(clientPath);
            done();
        });
    });
});
```

## 3. Server-Side Rendering Tests

### Control Rendering Tests
```javascript
describe('Server-Side Rendering', () => {
    it('should render simple control to HTML', () => {
        class SimpleCtrl extends Control {
            constructor(spec) {
                super(spec);
                this.add('Hello World');
            }
        }
        
        const server = new Server({ Ctrl: SimpleCtrl });
        const html = server.renderControl();
        
        expect(html).toContain('Hello World');
        expect(html).toMatch(/<[^>]+>Hello World<\/[^>]+>/);
    });
    
    it('should handle control with CSS classes', () => {
        class StyledCtrl extends Control {
            constructor(spec) {
                super(spec);
                this.add_class('test-class');
                this.add('Styled Content');
            }
        }
        
        const server = new Server({ Ctrl: StyledCtrl });
        const html = server.renderControl();
        
        expect(html).toContain('test-class');
        expect(html).toContain('Styled Content');
    });
    
    it('should handle nested controls', () => {
        class ParentCtrl extends Control {
            constructor(spec) {
                super(spec);
                const child = new Control({ context: this.context });
                child.add('Child Content');
                this.add(child);
            }
        }
        
        const server = new Server({ Ctrl: ParentCtrl });
        const html = server.renderControl();
        
        expect(html).toContain('Child Content');
    });
    
    it('should handle controls with data binding', () => {
        class DataCtrl extends Data_Model_View_Model_Control {
            constructor(spec) {
                super(spec);
                this.model = new Data_Object({ text: 'Bound Text' });
                
                const display = new Control({ context: this.context });
                this.bind('text', this.model, null, display);
                this.add(display);
            }
        }
        
        const server = new Server({ Ctrl: DataCtrl });
        const html = server.renderControl();
        
        expect(html).toContain('Bound Text');
    });
});
```

### NYI Implementation Tests
```javascript
describe('NYI Implementation Detection', () => {
    it('should catch and report NYI errors during rendering', () => {
        class NYICtrl extends Control {
            constructor(spec) {
                super(spec);
                // Trigger a known NYI path
                this.someNYIMethod();
            }
            
            someNYIMethod() {
                throw 'NYI';
            }
        }
        
        const server = new Server({ Ctrl: NYICtrl });
        
        expect(() => server.renderControl()).toThrow(/NYI/);
    });
    
    it('should provide helpful error messages for NYI features', () => {
        class NYICtrl extends Control {
            constructor(spec) {
                super(spec);
                throw 'NYI - Feature not implemented';
            }
        }
        
        const server = new Server({ Ctrl: NYICtrl });
        
        try {
            server.renderControl();
            fail('Should have thrown NYI error');
        } catch (err) {
            expect(err.message || err).toContain('NYI');
            expect(err.message || err).toContain('Feature not implemented');
        }
    });
});
```

## 4. HTTP Routing Tests

### Static Asset Serving Tests
```javascript
describe('HTTP Routing', () => {
    let server;
    let httpServer;
    
    beforeEach((done) => {
        const MockCtrl = class extends Control {};
        server = new Server({ 
            Ctrl: MockCtrl,
            src_path_client_js: path.resolve(__dirname, './fixtures/client.js')
        });
        
        server.on('ready', () => {
            server.start(0, (err, port) => {
                if (err) return done(err);
                httpServer = { port };
                done();
            });
        });
    });
    
    afterEach((done) => {
        if (server) {
            server.stop(done);
        } else {
            done();
        }
    });
    
    it('should serve main page at /', (done) => {
        request(`http://localhost:${httpServer.port}/`)
            .expect(200)
            .expect('Content-Type', /html/)
            .end(done);
    });
    
    it('should serve client bundle at /js/js.js', (done) => {
        request(`http://localhost:${httpServer.port}/js/js.js`)
            .expect(200)
            .expect('Content-Type', /javascript/)
            .end(done);
    });
    
    it('should serve CSS bundle at /css/css.css', (done) => {
        request(`http://localhost:${httpServer.port}/css/css.css`)
            .expect(200)
            .expect('Content-Type', /css/)
            .end(done);
    });
    
    it('should handle missing routes gracefully', (done) => {
        request(`http://localhost:${httpServer.port}/nonexistent`)
            .expect(404)
            .end(done);
    });
    
    it('should handle favicon.ico requests', (done) => {
        // Should not cause server errors
        request(`http://localhost:${httpServer.port}/favicon.ico`)
            .end((err, res) => {
                // Don't care about status, just that it doesn't crash
                done();
            });
    });
});
```

## 5. Context and DOM Abstraction Tests

### Context Tests
```javascript
describe('Context Handling', () => {
    it('should provide consistent context across controls', () => {
        class ContextTestCtrl extends Control {
            constructor(spec) {
                super(spec);
                this.child = new Control({ context: this.context });
                this.add(this.child);
            }
        }
        
        const server = new Server({ Ctrl: ContextTestCtrl });
        const ctrl = new ContextTestCtrl({ context: server.createContext() });
        
        expect(ctrl.context).toBeTruthy();
        expect(ctrl.child.context).toBe(ctrl.context);
    });
    
    it('should handle server-side DOM abstraction', () => {
        class DOMTestCtrl extends Control {
            constructor(spec) {
                super(spec);
                this.add_class('test-class');
                this.dom.attributes.id = 'test-id';
            }
        }
        
        const server = new Server({ Ctrl: DOMTestCtrl });
        const html = server.renderControl();
        
        expect(html).toContain('class="test-class"');
        expect(html).toContain('id="test-id"');
    });
});
```

## 6. Error Handling and Recovery Tests

### Error Recovery Tests
```javascript
describe('Error Handling', () => {
    it('should recover from non-critical control errors', () => {
        class FlakyCtrl extends Control {
            constructor(spec) {
                super(spec);
                try {
                    this.riskyOperation();
                } catch (err) {
                    this.add('Fallback content');
                }
            }
            
            riskyOperation() {
                throw new Error('Non-critical error');
            }
        }
        
        const server = new Server({ Ctrl: FlakyCtrl });
        const html = server.renderControl();
        
        expect(html).toContain('Fallback content');
    });
    
    it('should propagate critical errors', () => {
        class CriticalErrorCtrl extends Control {
            constructor(spec) {
                super(spec);
                throw new Error('Critical error');
            }
        }
        
        const server = new Server({ Ctrl: CriticalErrorCtrl });
        
        expect(() => server.renderControl()).toThrow('Critical error');
    });
});
```

## 7. Control Dependencies Tests

### Control Loading Tests
```javascript
describe('Control Dependencies', () => {
    it('should load required controls from controls.js', () => {
        const controls = require('../controls/controls.js');
        
        // Test that common controls exist
        expect(controls.Control).toBeTruthy();
        expect(controls.Button).toBeTruthy();
        
        // Test that they can be instantiated
        const button = new controls.Button({ 
            context: mockContext(),
            label: 'Test Button'
        });
        expect(button).toBeTruthy();
    });
    
    it('should handle missing control dependencies gracefully', () => {
        // Mock a missing control
        const originalRequire = require;
        require = jest.fn().mockImplementation((path) => {
            if (path.includes('NonExistentControl')) {
                throw new Error('Module not found');
            }
            return originalRequire(path);
        });
        
        class DependentCtrl extends Control {
            constructor(spec) {
                super(spec);
                try {
                    const MissingCtrl = require('./NonExistentControl');
                    this.add(new MissingCtrl({ context: this.context }));
                } catch (err) {
                    this.add('Control not available');
                }
            }
        }
        
        const server = new Server({ Ctrl: DependentCtrl });
        const html = server.renderControl();
        
        expect(html).toContain('Control not available');
        
        require = originalRequire;
    });
});
```

## 8. Memory and Performance Tests

### Memory Leak Tests
```javascript
describe('Memory Management', () => {
    it('should not leak memory during multiple renders', () => {
        class SimpleCtrl extends Control {
            constructor(spec) {
                super(spec);
                this.add('Test content');
            }
        }
        
        const server = new Server({ Ctrl: SimpleCtrl });
        
        const initialMemory = process.memoryUsage().heapUsed;
        
        // Render many times
        for (let i = 0; i < 1000; i++) {
            server.renderControl();
        }
        
        global.gc && global.gc(); // Force garbage collection if available
        
        const finalMemory = process.memoryUsage().heapUsed;
        const memoryIncrease = finalMemory - initialMemory;
        
        // Memory increase should be reasonable (less than 10MB for 1000 renders)
        expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });
});
```

## Test File Structure

```
test/
├── server/
│   ├── server-constructor.test.js
│   ├── server-lifecycle.test.js
│   ├── bundle-building.test.js
│   ├── server-rendering.test.js
│   ├── http-routing.test.js
│   ├── context-handling.test.js
│   ├── error-handling.test.js
│   ├── control-dependencies.test.js
│   └── performance.test.js
├── fixtures/
│   ├── simple-client.js
│   ├── complex-client.js
│   └── invalid-client.js
└── helpers/
    ├── mock-context.js
    ├── test-server.js
    └── memory-utils.js
```

## Required Test Dependencies

```json
{
  "devDependencies": {
    "jest": "^29.0.0",
    "supertest": "^6.0.0",
    "puppeteer": "^19.0.0",
    "mock-fs": "^5.0.0"
  }
}
```

## Test Runner Configuration

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js', '**/test/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
  testTimeout: 30000, // Allow time for server startup
  maxWorkers: 1 // Prevent port conflicts
};
```

These unit tests would help identify:

1. **NYI Implementation Gaps**: Tests would fail where "NYI" errors occur
2. **Control Dependency Issues**: Missing or broken control dependencies 
3. **Server Lifecycle Problems**: Issues with bundling, starting, stopping
4. **Rendering Failures**: Problems with server-side HTML generation
5. **Memory Leaks**: Performance issues during long-running operation
6. **Error Propagation**: Whether errors are handled gracefully vs crashing

The tests would provide a safety net for AI code generation and help identify exactly where the server implementation needs work.