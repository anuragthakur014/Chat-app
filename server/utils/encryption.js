const CryptoJS = require("crypto-js");

const SECRET_KEY =
  process.env.CHAT_SECRET ||
  "supersecretkey";

const encryptMessage = (text) => {

  return CryptoJS.AES.encrypt(
    text,
    SECRET_KEY
  ).toString();

};

const decryptMessage = (cipherText) => {

  try {

    const bytes = CryptoJS.AES.decrypt(
      cipherText,
      SECRET_KEY
    );

    return bytes.toString(
      CryptoJS.enc.Utf8
    );

  } catch (error) {

    return cipherText;

  }

};

module.exports = {
  encryptMessage,
  decryptMessage,
};