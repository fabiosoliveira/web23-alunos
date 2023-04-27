import Block from "./Block";

/**
 * Blockchain class
 */
export default class Blockchain {
  blocks: Block[];

  /**
   * Creates a new blockchain
   */
  constructor() {
    this.blocks = [new Block(0, "genesis")];
  }
}
