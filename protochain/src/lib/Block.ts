/**
 * Block class
 */
export default class Block {
  index: number;
  hash: string;

  /**
   * Creates a new block
   * @param index The block index in blockchain
   * @param hash The block hash
   */
  constructor(index: number, hash: string) {
    this.hash = hash;
    this.index = index;
  }

  /**
   * Validates the
   * @returns Returns true if the block is valid
   */
  isValid() {
    if (this.hash.trim() === "") return false;

    if (this.index < 1) return false;

    return true;
  }
}
