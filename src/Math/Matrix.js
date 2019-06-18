class Matrix {
    constructor(cfg) {
        this.value = cfg || {};
    }

    /**
     * Преобразует матрицу в строку.
     */
    toString() {
        let result = '';

        for (const line in this.value) {
            result += this.getLine(line).join(',  ') + '\n';
        }

        return result;
    }

    /**
     * Возвращает обратную матрицу
     */
    get revers() {
        if (!this.rev) {
            this.rev = Matrix.getRevers(this);
        }

        return this.rev; 
    }

    /**
     * Возвращает определитель матрицы
     */
    get determinant() {
        if (!this.det) {
            this.det = Matrix.getDeterminant(this);
        }

        return this.det;
    }

    /**
     * Возврашает транспонированную матрицу
     */
    get transposed() {
        if (!this.trans) {
            this.trans = Matrix.getTransposed(this);
        }

        return this.trans; 
    }

    /**
     * Возврашает размер матрицы
     */
    get size() {
        return this.getLine(0).length || 0;
    }

    /**
     * Считатет минор матрицы
     * @param {Number} numberLine - номер строки
     * @param {Number} numberColumn - номер столбца
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
     * Устанавливает значение елемента матрицы
     * @param {Number} numberLine - номер строки
     * @param {Number} numberColumn - номер столбца
     * @param {Number} element - елемент
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
     * Возврашет все элементы.
     */
    getAllElements() {
        return this.value;    
    }

    /**
     * Вовращает элемент.
     * @param {Number} numberLine - номер строки
     * @param {Number} numberColumn - номер столбца
     */
    getElement(numberLine, numberColumn) {
        return this.hasElement(numberLine, numberColumn) ? this.value[numberLine][numberColumn] : undefined;
    }

    /**
     * Вовращает строку.
     * @param {Number} numberLine - номер строки
     */
    getLine(numberLine) {
        return this.value[numberLine]|| [];
    }

    /**
     * Вовращает столбец.
     * @param {Number} numberColumn - номер столбца
     */
    getColumn(numberColumn) {
        const column = [];

        for (const numberLine in this.value) {
            column.push(this.getElement(numberLine, numberColumn));
        }

        return column;
    }

    /**
     * Проверяет есть ли элемент
     * @param {Number} numberLine - номер строки
     * @param {Number} numberColumn - номер столбца
     */
    hasElement(numberLine, numberColumn) {
        return !!(this.value[numberLine] && this.value[numberLine][numberColumn] !== undefined);
    }

    /**
     * Перебирает все элементы вызывая для каждого функцию обработчик
     * @param {Function} callback - обработчик
     */
    forEach(callback) {
        for (const numberLine in this.value) {
            this.getLine(numberLine).forEach((element, numberColumn, line) => {
                callback(element, +numberLine, numberColumn, line, this.getColumn(numberColumn));
            });
        }
    }

    /**
     * Умножает строку на число.
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
     * Складывает сроки
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
     * Считает миноры мантрицы
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
     * Считает определитель мантрицы
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

                
                const normMatrix = matrix;// new Matrix(Matrix.normalizeMatrix(matrix.value));
                const firstColumn = normMatrix.getColumn(0);
                const firstLine = normMatrix.getLine(0);
                const firstElement = normMatrix.getElement(0, 0);
        
                firstColumn.forEach((element, index) => {
                    if (index !== 0) {
                        const divider = firstElement === 0 ? 0 : element / firstElement * -1;
                        const mainLine = Matrix.multiplyLine(divider, firstLine);
                        const [ , ...newLine] = Matrix.addLines(mainLine, normMatrix.getLine(index));
        
                        nextMatrix[index - 1] = newLine;
                    }
                });
        
                return firstElement * new Matrix(nextMatrix).determinant;
            }
        }
    }

    /**
     * Транспонирует матрицу
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
     * Считатет обратную матрицу
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
     * Проверяет, что это матрица.
     * @param {*} matrix 
     */
    static isMatrix(matrix) {
        return matrix instanceof Matrix;
    }

    /**
     * Нормирует матрицу, чтобы по главной диагонали не было нулей.
     * @param {Object} matrix 
     */
    static normalizeMatrix(matrix) {
        const result = {...{}, ...matrix};
        let needProcess = true;

        while(needProcess) {
            needProcess = false;

            processLine: for (const line in result) {
                if (result[line][line] === 0) {
                    for (let i = result[line].length - 1; i > -1; i--) {
                        if (result[i][line] !== 0 && result[line][i] !== 0) {
                            const findedLine = [...[], ...result[i]];

                            result[i] = [...[], ...result[line]];
                            result[line] = findedLine;
                            needProcess = true;

                            break processLine;
                        }
                    }
                }
            }
        }

        return result;
    }
}

module.exports = Matrix;
