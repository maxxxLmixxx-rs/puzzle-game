interface Randomize {
  generator: (size: number) => Generator<number[][]>
}

class RandomMatrixCreator implements Randomize {

  private errors = 
  (errorNumber: number): never => {
    switch (errorNumber) {
      case 1: throw new Error('Size is not integer value');
      case 2: throw new Error('Wrong size number: 3 <= size <= 8');
      default: throw new Error();
    }
  }

  private MIN = 3;
  private MAX = 8;

  private _size: number;
  constructor(size: number = 3) {
    this.size = size;
  }

  get size() {
    return this._size;
  }

  set size(num) {
    if (!Number.isInteger(num)) this.errors(1);
    if (num < this.MIN || num > this.MAX) this.errors(2);
    this._size = num;
  }

  /**
   * @number matrix size: 0 <= size <= 8
   * @description return matrix with random positioned values: from [0] to [size ** 2 - 1]
   */

  generator(number: number = this.size) {
    this.size = number;
    let generator = function* () {
      while (true) {
        yield this.mxCreator();
      }};
    return generator.call(this);
  }

  /**
   * @description return randomized matrix with values: from [0] to [size ** 2 - 1]
   */

  private mxCreator(): number[][] {
    let numberGenerator = this.numberGenerator();
    return Array.from({length: this.size}).map(_ => {
      return Array.from({length: this.size}).map(_ => {
        return numberGenerator.next().value;
      });
    });
  }

  /**
   * @description create Generator that returns random number except all previous
   */

  private numberGenerator(): Generator<number> {
    let generator = function* () {
      let numbers = Array.from({length: this.size ** 2})
      .map((_, ix) => ix);
      while (numbers.length) {
        let ix = Math.floor(Math.random() * numbers.length);
        yield numbers.splice(ix, 1)[0];
      }}; 
    return generator.call(this);
  }

}

// const random = new RandomMatrixCreator();
// const generator = random.generator(3);

export default RandomMatrixCreator;