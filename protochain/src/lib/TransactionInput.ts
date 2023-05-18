import crypto from "node:crypto";
import * as ecc from "tiny-secp256k1";
import { ECPairFactory } from "ecpair";
import Validation from "./Validation";

const ECPair = ECPairFactory(ecc);

/**
 * Transaction class
 */
export default class TransactionInput {
  fromAddress: string;
  amount: number;
  signature: string;

  /**
   * Creates a new TransactionInput
   * @param txInput The tx input data
   * */
  constructor(txInput?: TransactionInput) {
    this.fromAddress = txInput?.fromAddress || "";
    this.amount = txInput?.amount || 0;
    this.signature = txInput?.signature || "";
  }

  /**
   * Signs a message using the provided private key.
   *
   * @param {string} privateKey - The private key to use for signing.
   * @return {void}
   */
  sign(privateKey: string): void {
    this.signature = ECPair.fromPrivateKey(Buffer.from(privateKey, "hex"))
      .sign(Buffer.from(this.getHash(), "hex"))
      .toString("hex");
  }

  /**
   * Returns the hash of the transaction data.
   *
   * @return {string} The hash of the transaction data.
   */
  getHash(): string {
    const data = this.fromAddress + this.amount;
    const hash = crypto.createHash("sha256").update(data).digest("hex");
    return hash;
  }

  /**
   * Determines if the transaction is valid.
   *
   * @return {Validation} A validation object representing the result of the validation.
   *                      If the transaction is valid, the object will be empty.
   *                      Otherwise, it will contain a message describing the validation failure.
   */
  isValid(): Validation {
    if (!this.signature) return new Validation(false, "Signature is required.");

    if (this.amount < 1)
      return new Validation(false, "Amount must be greater than zero.");

    const hash = Buffer.from(this.getHash(), "hex");
    const isValid = ECPair.fromPublicKey(
      Buffer.from(this.fromAddress, "hex")
    ).verify(hash, Buffer.from(this.signature, "hex"));

    return isValid
      ? new Validation()
      : new Validation(false, "Invalid tx input signature.");
  }
}
