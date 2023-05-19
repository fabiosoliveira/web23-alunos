import Validation from "../Validation";

/**
 * Mocked Transaction class
 */
export default class TransactionInput {
  fromAddress: string;
  amount: number;
  signature: string;
  previousTx: string;

  /**
   * Creates a new TransactionInput
   * @param txInput The tx input data
   * */
  constructor(txInput?: TransactionInput) {
    this.previousTx = txInput?.previousTx || "xyz";
    this.fromAddress = txInput?.fromAddress || "carteiraFrom";
    this.amount = txInput?.amount || 10;
    this.signature = txInput?.signature || "abc";
  }

  /**
   * Signs a message using the provided private key.
   *
   * @param {string} privateKey - The private key to use for signing.
   * @return {void}
   */
  sign(privateKey: string): void {
    this.signature = "abc";
  }

  /**
   * Returns the hash of the transaction data.
   *
   * @return {string} The hash of the transaction data.
   */
  getHash(): string {
    return "abc";
  }

  /**
   * Determines if the transaction is valid.
   *
   * @return {Validation} A validation object representing the result of the validation.
   *                      If the transaction is valid, the object will be empty.
   *                      Otherwise, it will contain a message describing the validation failure.
   */
  isValid(): Validation {
    if (!this.previousTx || !this.signature)
      return new Validation(false, "Signature and previous Tx are required.");

    if (this.amount < 1)
      return new Validation(false, "Amount must be greater than zero.");

    return new Validation();
  }
}
