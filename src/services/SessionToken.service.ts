import { JwtPayload, sign, verify } from 'jsonwebtoken';
import moment from 'moment';

export class SessionTokenService {
  protected _secret: string;
  protected _expiresIn: string;
  protected _payload: string | JwtPayload;
  protected _TokenService: string;

  constructor(secret: string, expiresIn: string, payload: object = {}) {
    this.buildSecret(secret);
    this.buildExpiresIn(expiresIn);
    this.buildPayload(payload);
  }

  buildSecret(value: string): SessionTokenService {
    this._secret = value;
    return this;
  }

  buildExpiresIn(value: string): SessionTokenService {
    this._expiresIn = value;
    return this;
  }

  buildPayload(value: any): SessionTokenService {
    this._payload = {
      ...value,
      ...{ generatedAt: moment().toDate().getMilliseconds() },
    };
    return this;
  }

  buildTokenService(value: string): SessionTokenService {
    this._TokenService = value;
    return this;
  }

  getSecret(): string {
    return this._secret;
  }

  getExpiresIn(): string {
    return this._expiresIn;
  }

  getPayload(): string | JwtPayload {
    return this._payload;
  }

  getTokenService(): string {
    return this._TokenService;
  }

  sign(): string {
    this._TokenService = sign(this.getPayload(), this.getSecret(), {
      expiresIn: this.getExpiresIn(),
    });
    return this.getTokenService();
  }

  verify(): string | JwtPayload {
    this._payload = verify(this.getTokenService(), this.getSecret());
    return this.getPayload();
  }
}
