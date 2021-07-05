/* eslint-disable new-cap */
import aesJs from 'aes-js';

import PKCS7 from './PKCS7';

export default class Crypto {
  private static readonly GENERIC_KEY = 'a3K8Bx%2r8Y7#xDh';

  public static decrypt(pack: string): string {
    const aesEcb = new aesJs.ModeOfOperation.ecb(Buffer.from(this.GENERIC_KEY));
    const decryptedBytes = aesEcb.decrypt(Buffer.from(pack, 'base64'));

    return Buffer.from(PKCS7.removePad(Buffer.from(decryptedBytes))).toString(
      'utf-8'
    );
  }

  public static encrypt(pack: { [key: string]: any } | string) {
    const aesEcb = new aesJs.ModeOfOperation.ecb(Buffer.from(this.GENERIC_KEY));
    const encryptedBytes = aesEcb.encrypt(
      Buffer.from(
        PKCS7.pad(
          Buffer.from(typeof pack === 'string' ? pack : JSON.stringify(pack))
        )
      )
    );

    return Buffer.from(encryptedBytes).toString('base64');
  }
}
