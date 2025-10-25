# Router Contract

The router is responsible for matching HTTP requests to handlers registered through `set_route`. This document summarizes the runtime contract for maintainers and integrators.

## `process(req, res)` Return Value

`router.process` now returns a structured result object instead of a boolean:

```javascript
const result = router.process(req, res);
// result === {
//   handled: Boolean,      // true when a route handler ran (even if it threw)
//   params: Object|undefined, // route parameters or undefined when none
//   handlerError: Error|undefined // set when the handler threw or failed
// }
```

- `handled: true` indicates a matching route was found and its handler executed.
- `params` mirrors the value assigned to `req.params` when a route supplies parameters.
- `handlerError` captures any exception thrown by the handler. When populated, the router emits an `error` event before applying optional error handlers.

## Not-found Handling

When `routing_tree.get(req.url)` returns `undefined` or a non-function result, the router performs the following steps:

1. Emits a `not-found` event with `{ req, res, meta: { url: req.url } }`.
2. Invokes the configured `handle_not_found(req, res)` callback.
3. Returns `{ handled: false, params: undefined, handlerError: undefined }` by default.

A sensible default is provided that sets the HTTP status to `404`, writes a `Content-Type: text/plain` header (when possible), and ends the response with `"Not Found"`.

You can supply a custom callback via the constructor or setter:

```javascript
const router = new Router({
    handle_not_found(req, res) {
        res.statusCode = 404;
        res.end('Custom page');
    }
});
// or later
router.set_not_found_handler((req, res) => { /* ... */ });
```

## Error Propagation

Route handlers are invoked inside a `try/catch`. If a handler throws:

- `result.handlerError` is set to the thrown error.
- An `error` event is emitted with `{ req, res, params, handler }`.
- An optional `handle_error(err, req, res, params)` callback (constructor or `set_error_handler`) runs to allow custom 500 responses.

Example:

```javascript
const router = new Router({
    handle_error(err, req, res) {
        res.statusCode = 500;
        res.end('Something went wrong');
    }
});

router.on('error', ({ handler, params }) => {
    console.error('Route failed', handler, params);
});
```

## Logging Hooks

The router routes diagnostic messages through a configurable logger instead of direct `console.log` calls. Provide a logger when constructing or via `set_logger`:

```javascript
const router = new Router({
    logger(level, message, meta) {
        myLogger.log({ level, message, ...meta });
    }
});

router.set_logger((level, message, meta) => {
    if (level === 'warn') {
        console.warn('[router]', message, meta);
    }
});
```

The router reports notable events using the following message keys:

- `set_route` (level `debug`) – when a route is registered
- `route_not_found` (level `warn`) – when no route matches a request
- `url_parse_error` (level `error`) – when a request URL cannot be parsed
- `handler_error` (level `error`) – when a handler throws
- `error_handler_failure` (level `error`) – when a custom error handler fails
- `not_found_handler_error` (level `error`) – when a custom 404 handler throws

## Customization Summary

| Concern          | Configuration                                 |
|------------------|-----------------------------------------------|
| Not-found        | `new Router({ handle_not_found })`, `set_not_found_handler` |
| Handler errors   | `new Router({ handle_error })`, `set_error_handler`       |
| Logging          | `new Router({ logger })`, `set_logger`                    |
| Notifications    | `router.on('not-found', listener)` and `router.on('error', listener)` |

Use these hooks to plug in application-specific fallback responders, logging, or error pages without monkey-patching router internals.
