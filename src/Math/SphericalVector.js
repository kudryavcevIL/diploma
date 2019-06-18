const Operation = require('./Operation');

const derivativeAccuracy = 0.001;
const firstRange = [0, Operation.round(2 * Math.PI)];
const otherRange = [-Operation.round(Math.PI/2), Operation.round(Math.PI/2)];
const lengthFirstRange = Operation.round(2 * Math.PI);
const lengthOtherRanges = Operation.round(Math.PI);
const breakRangeHistory = {};
 
/**
 * Класс описывает точку с сферической системе координат. 
 */
class SphericalVector {

    /**
     * Конструктор класса.
     * @param {Array} value - значения углов.
     */
    constructor(value) {
        this.radians = [];

        for (let i = value.length - 1; i > -1; i--) {
            if (i === 0) {
                this.radians[i] = SphericalVector.noramalizeRadian(value[i], firstRange);
                continue;
            }

            this.radians[i] = SphericalVector.noramalizeRadian(value[i], otherRange);
        }
    }

    /**
     * Возврашает координаты точки в декартовой системе.
     */
    get coordinates() {
        if (!this.coordinatesValue) {
            this.coordinatesValue = this._calculateСoordinates();
        }

        return this.coordinatesValue;
    }

    /**
     * Нормирует значение углов.
     * @param {Number} value - значение угла.
     * @param {Array} range - разршонный диапозон.
     */
    static noramalizeRadian(value, range) {
        if (value < range[0]) {
            return range[0];
        }

        if (value > range[1]) {
            return range[1];
        }

        return value;
    }

    /**
     * Считает градиент.
     * @param {Function} func - функция дял который считаем градиент.
     */
    gradient(func) {
        const result = [];
        const original = this.radians;

        for (let i = original.length - 1; i > -1; i--) {
            const leftVector = new SphericalVector(original);
            const rightVector = new SphericalVector(original);

            leftVector.radians[i] = leftVector.radians[i] + derivativeAccuracy;
            rightVector.radians[i] = rightVector.radians[i] - derivativeAccuracy;

            result[i] = Operation.derivative(func(leftVector.coordinates), func(rightVector.coordinates), derivativeAccuracy);
        }

        return result;
    }

    /**
     * Переводит в декартову систему координат.
     */
    _calculateСoordinates() {
        const result = [];

        for (let i = this.radians.length - 1; i > -1; i--) {

            result[i + 1] = Operation.multiply(result[i + 1] !== undefined ? result[i + 1] : 1, Math.sin(this.radians[i]));

            for (let j = i; j > -1; j--) {
                result[j] = Operation.multiply(result[j] !== undefined ? result[j] : 1, Math.cos(this.radians[i]));
            }
        }

        return result;
    }

    /**
     * Делит шар на сектора.
     * @param {Number} numberSigments - количество секторов.
     * @param {Number} numberRadians - количество радиан.
     */
    static getVectorByRadians(numberSigments, numberRadians) {
        if (breakRangeHistory[numberSigments] && breakRangeHistory[numberSigments][numberRadians]) {
            return  breakRangeHistory[numberSigments][numberRadians];
        }

        const result = new Set();

        const stepsForFirstRange = Operation.round(lengthFirstRange / numberSigments);
        const stepsForOtherRanges = Operation.round(lengthOtherRanges / numberSigments);

        const pointsFirstRange = SphericalVector.breakRange(stepsForFirstRange, firstRange, numberSigments);
        const pointsOtherRange = SphericalVector.breakRange(stepsForOtherRanges, otherRange, numberSigments);

        for (let i = pointsFirstRange.length - 1; i > -1; i--) {
            if (numberRadians === 1) {
                result.add(new SphericalVector([pointsFirstRange[i]]));
            } else {
                SphericalVector.levelDown(numberRadians - 2, [pointsFirstRange[i]], pointsOtherRange, result);
            }
        }

        breakRangeHistory[numberSigments] = breakRangeHistory[numberSigments] || {};
        breakRangeHistory[numberSigments][numberRadians] = result;

        return result;
    }

    /**
     * 
     * @param {Number} level
     * @param {Array} root
     * @param {Array} nodes
     * @param {Array} result
     */
    static levelDown(level, root, nodes, result) {
        for (let i = nodes.length - 1; i > -1; i--) {
            if (level === 0) {
                result.add(new SphericalVector([...root, nodes[i]]));
            } else {
                SphericalVector.levelDown(level - 1, [...root, nodes[i]], nodes, result);
            }
        }
    }

    /**
     * Разбивает диапозон на отрезки.
     * @param {Number} step - длина отрезка
     * @param {Array} range - диапозон
     */
    static breakRange(step, range, numberStep) {
        const result = [range[0]];
        let currentValue = range[0];

        for (let i = numberStep; i > 0; i--) {
            currentValue = currentValue + step;
            result.push(Operation.round(currentValue));
        }

        return result;
    }
}

module.exports = SphericalVector;