import nock from 'nock';
import request from 'supertest';
import slackin from '../lib/index';

describe('slackin', () => {
  describe('POST /invite', () => {
    let opts = {
      token: 'mytoken',
      org: 'myorg',
      interval: 0
    };

    beforeEach(function() {
      // runs once before the first test in this block
      nock(`https://${opts.org}.slack.com`)
        .get('/api/users.list?token=mytoken&presence=1')
        .reply(200, {
          ok: true,
          members: [{}]
        });

      nock(`https://${opts.org}.slack.com`)
        .get('/api/channels.list?token=mytoken')
        .reply(200, {
          ok: true,
          channels: [{}]
        });

      nock(`https://${opts.org}.slack.com`)
        .get('/api/team.info?token=mytoken')
        .reply(200, {
          ok: true,
          team: {icon: {}}
        })
    });

    it("returns success for a successful invite", (done) => {

      // TODO simplify mocking
      nock(`https://${opts.org}.slack.com`)
        .post('/api/users.admin.invite')
        .reply(200, { ok: true });

      let app = slackin(opts);

      request(app)
        .post('/invite')
        .send({ email: 'foo@example.com' })
        .expect('Content-Type', /json/)
        .expect(200, { msg: 'WOOT. Check your email!' })
        .end(done);
    });

    it("returns success for a successful invite for unrecognized ibm address", (done) => {

      // TODO simplify mocking
      nock(`https://${opts.org}.slack.com`)
        .post('/api/users.admin.invite')
        .reply(200, { ok: true });

      let app = slackin(opts);

      request(app)
        .post('/invite')
        .send({ email: 'foo@unk.ibm.com' })
        .expect('Content-Type', /json/)
        .expect(200, { msg: 'WOOT. Check your email!' })
        .end(done);
    });

    it("returns a message for ibm.com", (done) => {
      let app = slackin(opts);

      request(app)
        .post('/invite')
        .send({ email: 'foo@ibm.com' })
        .expect('Content-Type', /json/)
        .expect(303, { msg: 'IBMers should join the slack team directly. Redirecting... ', redirectUrl: 'https://gameontext.slack.com/signup' })
        .end(done);
    });

    it("returns a message for us.ibm.com", (done) => {
      let app = slackin(opts);

      request(app)
        .post('/invite')
        .send({ email: 'foo@us.ibm.com' })
        .expect('Content-Type', /json/)
        .expect(303, { msg: 'IBMers should join the slack team directly. Redirecting... ', redirectUrl: 'https://gameontext.slack.com/signup' })
        .end(done);

    });

    it("returns a message for uk.ibm.com", (done) => {
      let app = slackin(opts);

      request(app)
        .post('/invite')
        .send({ email: 'foo@uk.ibm.com' })
        .expect('Content-Type', /json/)
        .expect(303, { msg: 'IBMers should join the slack team directly. Redirecting... ', redirectUrl: 'https://gameontext.slack.com/signup' })
        .end(done);
    });

    it("returns a failure for a failure message", (done) => {

      nock(`https://${opts.org}.slack.com`)
        .post('/api/users.admin.invite')
        .reply(200, {
          ok: false,
          error: 'Unknown error, please open a github issue: <a href="https://github.com/gameontext/gameon/issues">https://github.com/gameontext/gameon/issues</a>'
        });

      let app = slackin(opts);

      request(app)
        .post('/invite')
        .send({ email: 'foo@example.com' })
        .expect('Content-Type', /json/)
        .expect(400, { msg: 'Unknown error, please open a github issue: <a href="https://github.com/gameontext/gameon/issues">https://github.com/gameontext/gameon/issues</a>' })
        .end(done);
    });
  });

});
