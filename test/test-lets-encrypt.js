import nock from 'nock';
import request from 'supertest';
import slackin from '../lib/index';

describe('slackin', () => {
  describe('GET /.well-known/acme-challenge/:id', () => {
    beforeEach(() => {
      process.env.LETSENCRYPT_CHALLENGE = 'letsencrypt-challenge';

      nock('https://myorg.slack.com')
        .get('/api/users.list?token=mytoken&presence=1')
        .reply(200, {
          ok: true,
          members: [{}]
        });

      nock('https://myorg.slack.com')
        .get('/api/channels.list?token=mytoken')
        .reply(200, {
          ok: true,
          channels: [{}]
        });

      nock('https://myorg.slack.com')
        .get('/api/team.info?token=mytoken')
        .reply(200, {
          ok: true,
          team: {icon: {}}
        })
    });

    it('returns the contents of the environment variable LETSENCRYPT_CHALLENGE', (done) => {
      let opts = {
        token: 'mytoken',
        org: 'myorg',
        interval: 0
      };

      let app = slackin(opts);
      
      request(app)
        .get('/.well-known/acme-challenge/deadbeef')
        .expect(200, 'letsencrypt-challenge')
        .end(done);
    })
  });
});
