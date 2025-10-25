const { expect } = require('chai');
const Router = require('../../router/router');

describe('Router 404 handling', () => {
    it('invokes the default not-found handler and emits diagnostics', () => {
        const router = new Router();
        let not_found_payload;
        router.on('not-found', (payload) => {
            not_found_payload = payload;
        });

        const req = { url: '/missing' };
        const res = {
            statusCode: 200,
            headersSent: false,
            writableEnded: false,
            headers: {},
            setHeader(name, value) {
                this.headers[name] = value;
            },
            end(body) {
                this.writableEnded = true;
                this.body = body;
            }
        };

        const result = router.process(req, res);

        expect(result.handled).to.equal(false);
        expect(result.handlerError).to.equal(undefined);
        expect(result.params).to.equal(undefined);
        expect(res.statusCode).to.equal(404);
        expect(res.writableEnded).to.equal(true);
        expect(res.body).to.equal('Not Found');
        expect(not_found_payload).to.be.an('object');
        expect(not_found_payload.meta).to.be.an('object');
        expect(not_found_payload.meta.url).to.equal('/missing');
    });
});
