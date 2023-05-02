import * as crypto from "crypto";
import Validation from "./Validation";
/**
 * Block class
 */
export default class Block {
  index: number;
  timestamp: number;
  hash: string;
  previousHash: string;
  data: string;

  /**
   * Creates a new block
   * @param block The block data
   */
  constructor(block?: Block) {
    this.index = block?.index || 0;
    this.timestamp = block?.timestamp || Date.now();
    this.previousHash = block?.previousHash || "";
    this.data = block?.data || "";
    this.hash = block?.hash || this.getHash();
  }

  getHash(): string {
    const data = this.index + this.data + this.timestamp + this.previousHash;
    const hash = crypto.createHash("sha256").update(data).digest("hex");
    return hash;
  }

  /**
   * Validates the
   * @returns Returns true if the block is valid
   */
  isValid(previousHash: string, previousIndex: number) {
    if (previousIndex !== this.index - 1)
      return new Validation(false, "Invalid index.");
    if (this.hash !== this.getHash())
      return new Validation(false, "Invalid hash.");
    if (!this.data) return new Validation(false, "Invalid data.");
    if (this.timestamp < 1) return new Validation(false, "Invalid timestamp.");
    if (this.previousHash !== previousHash)
      return new Validation(false, "Invalid previous hash.");

    return new Validation();
  }
}
