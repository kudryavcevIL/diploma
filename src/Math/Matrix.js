class Matrix {
    constructor(cfg) {
        this.value = cfg || {};
    }

    /**
     * 
     */
    toString() {
        let result = '';

        for (const line in this.value) {
            result += this.getLine(line).join(',  ') + '\n';
        }

        return result;
    }

    get gradient() {
        if (!this.grad) {
            this.grad = Matrix.getRevers(this);
        }

        return this.grad;
    }

    get revers() {
        if (!this.rev) {
            this.rev = Matrix.getRevers(this);
        }

        return this.rev; 
    }

    /**
     * 
     */
    get determinant() {
        if (!this.det) {
            this.det = Matrix.getDeterminant(this);
        }

        return this.det;
    }

    /**
     * 
     */
    get transposed() {
        if (!this.trans) {
            this.trans = Matrix.getTransposed(this);
        }

        return this.trans; 
    }

    /**
     * 
     */
    get size() {
        return this.getLine(0).length || 0;
    }

    /**
     * 
     * @param {Number} numberLine 
     * @param {Number} numberColumn 
     */
    minor(numberLine, numberColumn) {
        if (!this.minorMatrix) {
            this.minorMatrix = new Matrix();
        }

        if (!this.minorMatrix.hasElement(numberLine, numberColumn)) {
            this.minorMatrix.set(numberLine, numberColumn, Matrix.getMinor(numberLine, numberColumn, this));
        }

        return this.minorMatrix.getElement(numberLine, numberColumn);
    }

    /**
     * 
     * @param {Number} numberLine 
     * @param {Number} numberColumn 
     * @param {Number} element 
     */
    set(numberLine, numberColumn, element) {
        if (!this.value[numberLine]) {
            this.value[numberLine] = [];
        }

        if (this.value[numberLine][numberColumn] === undefined) {
            this.value[numberLine][numberColumn] = element;
        }
    }

    /**
     * 
     */
    getAllElements() {
        return this.value;    
    }

    /**
     * 
     * @param {Number} numberLine 
     * @param {Number} numberColumn 
     */
    getElement(numberLine, numberColumn) {
        return this.hasElement(numberLine, numberColumn) ? this.value[numberLine][numberColumn] : undefined;
    }

    /**
     * 
     * @param {Number} numberLine 
     */
    getLine(numberLine) {
        return this.value[numberLine]|| [];
    }

    /**
     * 
     * @param {Number} numberColumn 
     */
    getColumn(numberColumn) {
        const column = [];

        for (const numberLine in this.value) {
            column.push(this.getElement(numberLine, numberColumn));
        }

        return column;
    }

    /**
     * 
     * @param {Number} numberLine 
     * @param {Number} numberColumn 
     */
    hasElement(numberLine, numberColumn) {
        return !!(this.value[numberLine] && this.value[numberLine][numberColumn] !== undefined);
    }

    /**
     * 
     * @param {Function} callback 
     */
    forEach(callback) {
        for (const numberLine in this.value) {
            this.getLine(numberLine).forEach((element, numberColumn, line) => {
                callback(element, +numberLine, numberColumn, line, this.getColumn(numberColumn));
            });
        }
    }


    static getGradient(matrix) {
        const result = point instanceof Matrix ? new Matrix : [];

        point.forEach((value) => {
            
        });
    }

    /**
     * 
     * @param {Number} number 
     * @param {Arrary} line
     */
    static multiplyLine(number, line) {
        const result = [];

        for (const element of line) {
            result.push(element * number);
        }

        return result;
    }

    /**
     * 
     * @param {Array} firstLine 
     * @param {Array} secondLine 
     */
    static addLines(firstLine, secondLine) {
        return firstLine.reduce((result, element, index) => {
            result.push(element + secondLine[index]);

            return result;
        }, []);
    }

    /**
     * 
     * @param {Number} numberLine 
     * @param {Number} numberColumn 
     * @param {Matrix} matrix 
     */
    static getMinor(numberLine, numberColumn, matrix) {
        const croppedMatrix = new Matrix();

        matrix.forEach((element, line, column) => {
            if (line !== numberLine && column !== numberColumn) {
                croppedMatrix.set(
                    line < numberLine ? line : line - 1,
                    column < numberColumn ? column : column - 1,
                    element
                );
            }
        });
    
        return croppedMatrix.determinant;
    }

    /**
     * 
     * @param {Matrix} matrix 
     */
    static getDeterminant(matrix) {
        if (!Matrix.isMatrix(matrix)) {
            throw Error('Variable not is class Matrix');
        }

        switch(matrix.size) {
            case 0: {
                return 0;
            }
            case 1: {
                return matrix.getElement(0, 0);
            }
            case 2: {
                return (matrix.getElement(0, 0) * matrix.getElement(1, 1)) - (matrix.getElement(1, 0) * matrix.getElement(0, 1));
            }
            default: {
                const nextMatrix = {};

                const firstColumn = matrix.getColumn(0);
                const firstLine = matrix.getLine(0);
                const firstElement = matrix.getElement(0, 0);
        
                firstColumn.forEach((element, index) => {
                    if (index !== 0) {
                        const divider = firstElement === 0 ? 0 : element / firstElement * -1;
                        const mainLine = Matrix.multiplyLine(divider, firstLine);
                        const [ , ...newLine] = Matrix.addLines(mainLine, matrix.getLine(index));
        
                        nextMatrix[index - 1] = newLine;
                    }
                });
        
                return firstElement * new Matrix(nextMatrix).determinant;
            }
        }
    }

    /**
     * 
     * @param {Matrix} matrix 
     */
    static getTransposed(matrix) {
        if (!Matrix.isMatrix(matrix)) {
            throw Error('Variable not is class Matrix');
        }

        const result = {};

        matrix.forEach((element, numberLine, numberColumn) => {
            if (!result.hasOwnProperty(numberColumn)) {
                result[numberColumn] = [];
            }

            result[numberColumn][numberLine] = element;
        });

        return new Matrix(result);
    }

    /**
     * 
     * @param {Matrix} matrix 
     */
    static getRevers(matrix) {
        if (matrix.determinant !== 0) {
            const result = new Matrix;
            
            matrix.transposed.forEach((element, numberLine, numberColumn) => {
                const algebraicCoefficient = Math.pow(-1, numberLine + numberColumn);
                const algebraicAddition = (algebraicCoefficient * matrix.transposed.minor(numberLine, numberColumn));
                result.set(numberLine, numberColumn, (1 / matrix.determinant) * algebraicAddition);
            });

            return result;
        } else {
            return -1;
        }
    }

    /**
     * 
     * @param {*} matrix 
     */
    static isMatrix(matrix) {
        return matrix instanceof Matrix;
    }
}

module.exports = Matrix;
