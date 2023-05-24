import crypto from "node:crypto";
import TransactionType from "./TransactionType";
import Validation from "./Validation";
import TransactionInput from "./TransactionInput";
import TransactionOutput from "./TransactionOutput";
import Blockchain from "./Blockchain";

/**
 * Transaction class
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

    this.txInputs = tx?.txInputs
      ? tx.txInputs.map((txInput) => new TransactionInput(txInput))
      : undefined;

    this.txOutputs = tx?.txOutputs
      ? tx.txOutputs.map((txOutput) => new TransactionOutput(txOutput))
      : [];

    this.hash = tx?.hash || this.getHash();

    this.txOutputs.forEach((txo, index, arr) => {
      arr[index].tx = this.hash;
    });
  }

  getHash(): string {
    const from =
      this.txInputs && this.txInputs.length
        ? this.txInputs.map((txInput) => txInput.signature).join(",")
        : "";

    const to =
      this.txOutputs && this.txOutputs.length
        ? this.txOutputs.map((txInput) => txInput.getHash()).join(",")
        : "";

    const data = this.type + this.timestamp + to + from;

    const hash = crypto.createHash("sha256").update(data).digest("hex");
    return hash;
  }

  getFee(): number {
    let inputSum = 0;
    let outputSum = 0;
    if (this.txInputs && this.txInputs.length) {
      inputSum = this.txInputs
        .map((txInput) => txInput.amount)
        .reduce((a, b) => a + b, 0);

      if (this.txOutputs && this.txOutputs.length) {
        outputSum = this.txOutputs
          .map((txOutput) => txOutput.amount)
          .reduce((a, b) => a + b, 0);
      }

      return inputSum - outputSum;
    }

    return 0;
  }

  isValid(difficulty: number, totalFees: number): Validation {
    if (this.hash !== this.getHash())
      return new Validation(false, "Invalid hash.");

    if (
      !this.txOutputs ||
      !this.txOutputs.length ||
      this.txOutputs.map((txo) => txo.isValid()).some((v) => !v.success)
    )
      return new Validation(false, "Invalid TXO.");

    if (this.txInputs && this.txInputs.length) {
      const validations = this.txInputs
        .map((txInput) => txInput.isValid())
        .filter((v) => !v.success);
      if (validations && validations.length) {
        const messages = validations.map((v) => v.message).join(" ");
        return new Validation(false, `Invalid tx: ${messages}`);
      }

      const inputSum = this.txInputs
        .map((txInput) => txInput.amount)
        .reduce((a, b) => a + b, 0);

      const outputSum = this.txOutputs
        .map((txOutput) => txOutput.amount)
        .reduce((a, b) => a + b, 0);

      if (inputSum < outputSum) {
        return new Validation(
          false,
          "Invalid tx: input amounts must be equals or greater than output amounts."
        );
      }
    }

    if (this.txOutputs.some((txo) => txo.tx !== this.hash))
      return new Validation(false, "Invalid TXO reference hash.");

    if (this.type === TransactionType.FEE) {
      const txo = this.txOutputs[0];
      if (txo.amount > Blockchain.getRewardAmount(difficulty) + totalFees) {
        return new Validation(false, "Invalid tx reward.");
      }
    }

    return new Validation();
  }

  static fromReward(txo: TransactionOutput): Transaction {
    const tx = new Transaction({
      type: TransactionType.FEE,
      txOutputs: [txo],
    } as Transaction);

    tx.hash = tx.getHash();
    tx.txOutputs[0].tx = tx.hash;

    return tx;
  }
}
