import TransactionInput from "./TransactionInput";
import TransactionType from "../TransactionType";
import Validation from "../Validation";
import TransactionOutput from "./TransactionOutput";

/**
 * Mocked Transaction class
 */
export default class Transaction {
  type: TransactionType;
  timestamp: number;
  hash: string;
  txInputs: TransactionInput[] | undefined;
  txOutputs: TransactionOutput[];

  constructor(tx?: Transaction) {
    this.type = tx?.type || TransactionType.REGULAR;
    this.timestamp = tx?.timestamp || Date.now();
    this.txOutputs = tx?.txOutputs || [new TransactionOutput()];
    this.txInputs = tx?.txInputs || [new TransactionInput()];
    this.hash = tx?.hash || this.getHash();
  }

  getHash(): string {
    return "abc";
  }

  isValid(): Validation {
    if (this.timestamp < 1 || !this.hash)
      return new Validation(false, "Invalid mock transaction.");

    return new Validation();
  }
}
