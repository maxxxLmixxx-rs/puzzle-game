type XY = [number, number];
type PuzzleNode = {
  u: PuzzleNode | null,
  d: PuzzleNode | null, 
  l: PuzzleNode | null,
  r: PuzzleNode | null,
  H: number,
  G: number,
  S: number,
  x: number,
  y: number,
  m: string,
  prev: PuzzleNode | null
}

type Logger = {
  add: (m: string) => void,
  get: () => void,
  clear: () => void,
}

interface PuzzleSolver {
  solve(matrix: number[][]): void;
  isSolvable(matrix: number[][]): boolean;
}

class GemGame implements PuzzleSolver {
  private _sourceMX: number[][];
  private currentMX: number[][];

  private errors(errorNumber?: number): never {
    switch (errorNumber) {
      case 1: throw new Error('Wrong puzzle format...');
      case 2: throw new Error('No solvable matrix');
      case 3: throw new Error('No available moves');
      case 4: throw new Error('Swap should be only one move');
      case 5: throw new Error('Wrong direction input');
      default: throw new Error();
    }
  }

  constructor(mx = null) {
    this.matrix = mx;
  }

  get matrix() { return this.copy(this._sourceMX) }
  set matrix(mx: number[][]) {
    if (!this.isAppropriate(mx)) this.errors(1);
    this._sourceMX = mx;
    this.logger.clear();
    this.currentMX = this.copy(mx);
  }

  private copy(mx: number[][]) {
    return mx.map(o => o.slice());
  }

  /* ** LOGGER MODULE */

  private logger = this.createLogger();
  private createLogger(): Logger {
    let __output = '';
    return ({
      add: (m: string) => {
        __output += m.toUpperCase();
      },clear: () => {
        __output = '';
      },get: () => {
        return __output;
      }
    })
  }

  /* ** SOLVE MODULE */

  private completed: XY[] = [];

  solve(mx?: number[][]) {
    if (!this.isSolvable(mx)) return null;
    if (!mx && !this.matrix) this.errors(2);
    if (mx) this.matrix = mx;
/*! DELETE ================================*/console.dir(this.currentMX);
    this.pseudoRecursiveSolve();
    return this.logger.get();
  }

  private pseudoRecursiveSolve() {
    const length = this.currentMX.length;
    const getXLine = (y: number) => this.currentMX[y].map((_, ix) => (ix + 1) + y * length),
          getYLine = (x: number) => this.currentMX.map((_, ix) => (x + 1) + length * ix);
 
    for (let i = 0; i < length - 2; i++) {
      let xLine = getXLine(i);
      let yLine = getYLine(i);

      this.solveTilesLine(xLine, xLine.slice(-2));
      if (i < length - 3) 
      this.solveTilesLine(yLine, yLine.slice(-2));
    }

    let [t1, t2, t3, t4, t5] = [
      length**2 - length - 2,
      length**2 - length - 1,
      length**2 - length,
      length**2 - 2,
      length**2 - 1,
    ]; this.solve3x2([t1, t2, t3, t4, t5]);
  }

  private getXY(num: number) {
    const rem = num % this.currentMX.length;
    const toX = rem === 0 ? this.currentMX.length : rem;
    const toY = Math.ceil(num / this.currentMX.length);
    return ([
      this.find2D(this.currentMX, el => el === num),
      [toX - 1, toY - 1]
    ]);
  }

  private solve3x2([t1, t2, t3, t4, t5]: number[]) {
    let x, y, x1, y1;
    [t1, t2, t3, t4, t5].sort((a, b) => a - b);
    
    [ [x, y], [x1, y1] ] = this.getXY(t1);
    this.moveTile([x, y], [x1, y1 + 1]);
    this.completed.push([x1, y1 + 1]);
    
    [ [x, y], [x1, y1] ] = this.getXY(t4);
    this.moveTile([x, y], [x1 + 1, y1]);
    this.completed.pop();
    this.completed.push([x1 + 1, y1]);
    
    this.moveBlank([x1, y1]);
    this.completed.pop();
    this.moveBlank([x1 + 1, y1]);
    this.completed.push([x1, y1]);

    [ [x, y], [x1, y1] ] = this.getXY(t2);
    this.moveTile([x, y], [x1, y1]);
    this.completed.push([x1, y1]);

    this.moveBlank([
      this.currentMX.length - 1,
      this.currentMX.length - 1
    ]);
  }

  private solveTilesLine(tiles: number[], lastTwo: number[]): void {
    const isCompleted = (t: number): boolean => {
      let [ [x, y] ] = this.getXY(t);
      return this.completed.some(([_x, _y]) => _x === x && _y === y);
    };
    tiles.forEach(t => {
      if (lastTwo.includes(t) || isCompleted(t)
      ) return null;
      let [ [x, y], [x1, y1] ] = this.getXY(t);
      this.moveTile([x, y], [x1, y1]);
      this.completed.push([x1, y1]);
    }); this.handleLastTiles(lastTwo);
  }

  private handleLastTiles([t1, t2]: number[]): void {
    [t1, t2] = [t1, t2].sort((a, b) => a - b);

    let [ ,[_desX, _desY] ] = this.getXY(t2);

    const M = { COL: 'col', ROW: 'row' };
    let line = Math.abs(t1 - t2) > 1 ? M.COL : M.ROW;

    const mv = moveOut.call(this, line);
    if (line === M.ROW) handleROW.call(this);
    if (line === M.COL) handleCOL.call(this);
    return null;

    /* function declaration */

    function moveOut(line: string): void {
      let [ [ x,  y] ] = this.getXY(t1);
      let [ [_x, _y] ] = this.getXY(t2);
      switch (line) {
        case M.ROW: 
          if ( y - _desY < 2) this.moveTile([x, y], [x, y + 1]);
          if (_y - _desY < 2) this.moveTile([_x, _y], [_x, _y + 1]);
          if (_y - _desY >= 2 && y - _desY >= 2) return null;
        break;
        case M.COL: 
          if ( x - _desX < 2) this.moveTile([x, y], [x + 1, y]);
          if (_x - _desX < 2) this.moveTile([_x, _y], [_x + 1, _y]);
          if (_x - _desX >= 2 && x - _desX >= 2) return null;
        } return moveOut.call(this, line);
    }
    
   /** PICTURER 1
     *  x x x    x x 2    x x 2    
     *  2 x x -> x x x -> x x 3 -> 
     *  0 3 x    0 3 x    0 x x    
     * 
     *     x 0 2    x 2 0    x 2 3
     *  -> x x 3 -> x x 3 -> x x 0
     *     x x x    x x x    x x x
     */ /** */

    function handleROW() {
      let [xL, yL] = [this.currentMX.length - 1, _desY];

      let [ [x, y] ] = this.getXY(t1);
        this.moveTile([x, y], [xL, yL]);
      this.completed.push([xL, yL]);

      let [ [x1, y1] ] = this.getXY(t2);
        this.moveTile([x1, y1], [xL, yL + 1]);
      this.completed.pop();
      this.completed.push([xL, yL + 1]);

      this.moveBlank([xL - 1, yL]);
      this.completed.pop();

      this.moveBlank([xL, yL]);
      this.moveBlank([xL, yL + 1]);
      
      this.completed.push([xL - 1, yL]);
      this.completed.push([xL, yL]);
    }

    function handleCOL() {
      let [xL, yL] = [_desX, this.currentMX.length - 1];

      let [ [x, y] ] = this.getXY(t1);
        this.moveTile([x, y], [xL, yL]);
      this.completed.push([xL, yL]);

      let [ [x1, y1] ] = this.getXY(t2);
        this.moveTile([x1, y1], [xL + 1, yL]);
      this.completed.pop();
      this.completed.push([xL + 1, yL]);

      this.moveBlank([xL, yL - 1]);
      this.completed.pop();

      this.moveBlank([xL, yL]);
      this.moveBlank([xL + 1, yL]);
      
      this.completed.push([xL, yL - 1]);
      this.completed.push([xL, yL]);
    }
  }

  /**
   * @description move tile
   * @param1 move element at [x, y] ...
   * @param2 ... to [x1, y1]
  */

  private moveTile([x, y]: XY, [x1, y1]: XY) {
    const move = {
      u: () => { this.moveBlank([x, y - 1], [ [x, y] ]); this.moveBlank([x, y]); y--; },
      d: () => { this.moveBlank([x, y + 1], [ [x, y] ]); this.moveBlank([x, y]); y++; },
      l: () => { this.moveBlank([x - 1, y], [ [x, y] ]); this.moveBlank([x, y]); x--; },
      r: () => { this.moveBlank([x + 1, y], [ [x, y] ]); this.moveBlank([x, y]); x++; },
    };

    const isXCompleted = this.completed.some(([x, y]) => x === x1);
    const isYCompleted = this.completed.some(([x, y]) => y === y1);

    const moveBX = () => {
      while (x !== x1) {
        if (x1 - x < 0) move.l();
        if (x1 - x > 0) move.r();
      }
    }, moveBY = () => {
      while (y !== y1) {
        if (y1 - y < 0) move.u();
        if (y1 - y > 0) move.d();
      }
    }

    switch (true) {
      case isXCompleted: moveBY(); moveBX(); break;
      case isYCompleted: moveBX(); moveBY(); break; 
      default: 
      if (Math.abs(y1 - y) > Math.abs(x1 - x)) 
      { moveBX(); moveBY(); 
      } else { 
        moveBY(); moveBX(); 
      }
    }
  }

  /**
   * @description move blank space exclude this.completed[]/param2
   * @param1 move to [x1, y1] ...
   * @param2 ... do not include XY[] coordinates
  */

  private moveBlank([x1, y1]: XY, exclude: XY[] = []) {
    
    const createNode = ({ x = null, y = null, prev = null, m = 'root' }) => {
      if (m === 'u' && prev && prev.m === 'd') return null;
      if (m === 'd' && prev && prev.m === 'u') return null;
      if (m === 'l' && prev && prev.m === 'r') return null;
      if (m === 'r' && prev && prev.m === 'l') return null;
      if (x < 0 || x > this.currentMX.length - 1) return null;
      if (y < 0 || y > this.currentMX.length - 1) return null;
      if (exclude.some(([_x, _y]) => x === _x && y === _y)) return null;
      if (this.completed.some(([_x, _y]) => x === _x && y === _y)) return null;

      let G = x == null || y == null ? null : this.manhattanDistance([x, y], [x1, y1]);
      let H = prev ? prev.H + 1 : 0;
      return ({
        x, y,
        u: null, d: null,
        l: null, r: null,
        G, H, S: G + H,
        prev, m,
      });
    };

    /** @return PuzzleNode[UP, DOWN, LEFT, RIGHT] */
    const getMovesArray = (node: PuzzleNode): PuzzleNode[] => {
      if (!node) return [ null, null, null, null ];
      return [
        createNode({x: node.x, y: node.y - 1, prev: node, m: 'u'}),
        createNode({x: node.x, y: node.y + 1, prev: node, m: 'd'}),
        createNode({x: node.x - 1, y: node.y, prev: node, m: 'l'}),
        createNode({x: node.x + 1, y: node.y, prev: node, m: 'r'}),
      ]; 
    }

    const setChildDirection = (
      node: PuzzleNode,
      direction: PuzzleNode,
      [u, d, l, r]: PuzzleNode[]
    ): void => {
      switch (direction) {
        case u: node.u = u; break;
        case d: node.d = d; break;
        case l: node.l = l; break;
        case r: node.r = r; break;
      }
    }

    const findLowest = (nodes: PuzzleNode[]): PuzzleNode[] => {
      const min = Math.min(
        ...nodes.filter(o => !!o && o.S !== null).map(o => o.S)
      ); return nodes.filter(o => !!o && o.S === min);
    };

    const findRoot = (
      node: PuzzleNode, roots: PuzzleNode[]
    ): PuzzleNode => {
      const ix = roots.indexOf(node);
      if (ix !== -1) {
        return roots[ix];
      } else return findRoot(node.prev, roots);
    };

    const cleanNodeDirections = (node: PuzzleNode) => {
      node.u = null; node.d = null;
      node.l = null; node.r = null;
      return node;
    }

    const resolveConflict = (
      nodes: PuzzleNode[], roots: PuzzleNode[] = nodes
    ): PuzzleNode => {
      let nodesLine = [], exit = (node: PuzzleNode) => {
        let root = findRoot(node, roots);
        roots.forEach(root => cleanNodeDirections(root));
        return root };
      nodes.forEach(node => {
        const [u, d, l, r] = getMovesArray(node);
        nodesLine.push(...findLowest([u, d, l, r]));
        [u, d, l, r].forEach(dir => setChildDirection(node, dir, [u, d, l, r]));
      }); const nodeLineLowest = findLowest(nodesLine);

      const isSameRoot = nodeLineLowest.every(({ prev }) =>
          prev === nodeLineLowest[0].prev);
      const isSameXY = nodeLineLowest.every(({ x, y }) =>
          x === nodeLineLowest[0].x && y === nodeLineLowest[0].y);

      if (isSameRoot || isSameXY) return exit(nodeLineLowest.pop());
      if (nodeLineLowest.length === 1) return exit(nodeLineLowest.pop());

      return resolveConflict(nodeLineLowest, roots);
    }

    const recursiveSolve = (node: PuzzleNode) => {
      if (node && node.G === 0) return root;
      const [u, d, l, r] = getMovesArray(node);
      if (!u && !d && !l && !r) {
        exclude.pop(); 
        exclude.push([node.x, node.y]);
        cleanNodeDirections(node.prev);
        return recursiveSolve(node.prev);
      } else exclude.push([node.x, node.y]);
      let minis = findLowest([u, d, l, r]),
          min = minis.length > 1 ?
          resolveConflict(minis) : minis[0];
      setChildDirection(node, min, [u, d, l, r]);
      return recursiveSolve(min);
    };

    const recursiveOutput = (node: PuzzleNode) => {
      let [x, y] = [node.x, node.y];
      /*LOG*/ this.logger.add(node.m !== 'root' ? node.m : '');
      switch (true) {
        case !!node.u: this.swap([x, y], [x, y - 1]); recursiveOutput(node.u); break;
        case !!node.d: this.swap([x, y], [x, y + 1]); recursiveOutput(node.d); break;
        case !!node.l: this.swap([x, y], [x - 1, y]); recursiveOutput(node.l); break;
        case !!node.r: this.swap([x, y], [x + 1, y]); recursiveOutput(node.r); break;
        default: return null;
      }}; 

    let [x, y] = this.find2D(this.currentMX, el => !el);
    const root = createNode({x, y});
    recursiveOutput(recursiveSolve(root));
  }

  private manhattanDistance([x1, y1]: XY, [x2, y2]: XY) {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
  }

  /* *** SWAP */

  private swap([x1, y1]: XY, [x2, y2]: XY) {
    if (Math.abs(x1 - x2) > 1 || Math.abs(y1 - y2) > 1) this.errors(4);
    const swapped = this.__swappedMx([x1, y1], [x2, y2]);
    if (swapped) { this.currentMX = swapped;
    return true  } else return null;
  }

  private __swappedMx([x1, y1]: XY, [x2, y2]: XY,
  mx: number[][] = this.currentMX) {
    if (x1 < 0 || x1 > mx.length - 1) return null;
    if (y1 < 0 || y1 > mx.length - 1) return null;
    if (x2 < 0 || x2 > mx.length - 1) return null;
    if (y2 < 0 || y2 > mx.length - 1) return null;
    const matrix = this.copy(mx);
      const bufferXY = matrix[y1][x1];
      matrix[y1][x1] = matrix[y2][x2];
      matrix[y2][x2] = bufferXY;
    return matrix;
  }

  /* ** CHECK MODULE */

  isSolvable(mx: number[][] = this.matrix) {
    if (!this.isAppropriate(mx)) return false;
    const inversionCount = this.countInversions(mx);
    if (mx.length % 2 !== 0) return inversionCount % 2 == 0;
    if (mx.length % 2 === 0) {
      const [x, y] = this.find2D(mx, el => !el);
      if ((mx.length - y) % 2 !== 0 && inversionCount % 2 === 0) return true;
      if ((mx.length - y) % 2 === 0 && inversionCount % 2 !== 0) return true;
    } return false;
  }

  private find2D(mx: number[][], callback: (el) => boolean) {
    return mx.reduce((acc, row, rowIx) => {
      const ix = row.findIndex(callback);
      if (ix !== -1) return [ix, rowIx];
      else return acc;
    }, []);
  }

  private countInversions(mx: number[][] = this.matrix) {
    const flatted = mx.flat();
    return flatted.reduce((acc, anchor, ix) => {
      return acc + flatted.slice(ix + 1).reduce((acc, next) => {
        if (anchor && next && anchor > next) return acc + 1;
        else return acc;
      }, 0);
    }, 0);
  }

  private isAppropriate(mx: number[][] = this.matrix) {
    if (this.__isSquare(mx)) {
      return mx.flat().every(el =>
        Number.isInteger(el) && el <= mx.length ** 2 && el > -1
      ); } return false;
  }

  private __isSquare(mx: number[][] = this.matrix) {
    if (mx.length < 2) return false;
    return mx.reduce((acc, el) => {
      return acc && !!el.length && mx.length === el.length;
    }, true);
  }
}

const gemGame = new GemGame(
  [
    [ 1,  2, 13, 3],
    [ 5,  9, 10, 4],
    [12,  0,  8, 6],
    [15, 14, 11, 7],
  ]
);

console.log(gemGame.solve());