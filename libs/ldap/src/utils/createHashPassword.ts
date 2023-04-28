import * as crypto from "crypto";

export const createHashPassword = (password) => {
  const hash = crypto.createHash('md5').update(password).digest("hex");
  return `{MD5}${Buffer.from(hash, 'hex').toString('base64')}`;
}