import crypto from "node:crypto";
import TransactionType from "./TransactionType";
import Validation from "./Validation";
import TransactionInput from "./TransactionInput";

/**
 * Transaction class
 */
export default class Transaction {
  type: TransactionType;
  timestamp: number;
  hash: string;
  txInput: TransactionInput | undefined;
  to: string;

  constructor(tx?: Transaction) {
    this.type = tx?.type || TransactionType.REGULAR;
    this.timestamp = tx?.timestamp || Date.now();
    this.to = tx?.to || "";
    this.txInput = tx?.txInput ? new TransactionInput(tx.txInput) : undefined;
    this.hash = tx?.hash || this.getHash();
  }

  getHash(): string {
    const from = this.txInput ? this.txInput.getHash() : "";
    const data = this.type + this.timestamp + this.to + from;

    const hash = crypto.createHash("sha256").update(data).digest("hex");
    return hash;
  }

  isValid(): Validation {
    if (this.hash !== this.getHash())
      return new Validation(false, "Invalid hash.");

    if (!this.to) return new Validation(false, "Invalid to.");

    if (this.txInput) {
      const validation = this.txInput.isValid();
      if (!validation.success) {
        return new Validation(false, `Invalid tx: ${validation.message}`);
      }
    }

    return new Validation();
  }
}
