import crypto from "node:crypto";
import Validation from "./Validation";

/**
 * Transaction Output class
 */
export default class TransactionOutput {
  toAddress: string;
  amount: number;
  tx?: string;

  constructor(txOutput?: TransactionOutput) {
    this.toAddress = txOutput?.toAddress || "";
    this.amount = txOutput?.amount || 0;
    this.tx = txOutput?.tx || "";
  }

  isValid(): Validation {
    if (this.amount < 1) {
      return new Validation(false, "Negative amount.");
    }

    return new Validation();
  }

  getHash(): string {
    const data = this.toAddress + this.amount + this.tx;

    const hash = crypto.createHash("sha256").update(data).digest("hex");
    return hash;
  }
}
