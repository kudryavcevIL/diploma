const precision = 1000;

class Operation {

    /**
     * Округляет значение.
     * @param {Number} number 
     */
    static round(number) {
        return Math.round(number * precision) / precision;
    }

    /**
     * Умножение чисел
     * @param {Number} multiplicand 
     * @param {Number} multiplier 
     */
    static multiply(multiplicand, multiplier) {
        return Operation.round(Operation.round(multiplicand) * Operation.round(multiplier));
    }

    /**
     * Частная производная
     * @param {Number} left 
     * @param {Number} right 
     * @param {Number} derivativeAccuracy 
     */
    static derivative(left, right, derivativeAccuracy) {
        return Operation.round((left - right)/(2 * derivativeAccuracy));
    }

    /**
     * Считает длину вектора.
     * @param {Array || Object} vector 
     */
    static absVector(vector) {
        let result = 0;

        if (vector instanceof Array) {
            for (let i = vector.length - 1; i > -1; i--) {
                result = result + Math.pow(vector[i], 2);
            }
        } else if (vector instanceof Object) {
            for (const line in vector) {
                for (let i = vector[line].length - 1; i > -1; i--) {
                    result = result + Math.pow(vector[line][i], 2);
                }
            }
        }

        return Operation.round(Math.sqrt(result));
    }

    /**
     * Считает расстояние между точками.
     * @param {Array} firstPoint 
     * @param {Array} secondPoint 
     */
    static getDistanceBetweenPoints(firstPoint, secondPoint) {
        let result = 0;

        for (let i = firstPoint.length - 1; i > -1; i--) {
            result += Math.pow(firstPoint[i] - secondPoint[i], 2);
        }

        return Operation.round(Math.sqrt(result));
    }

    /**
     * Находит центр масс.
     * @param {Object} points 
     */
    static getCenterOfMass(points) {
        const result = [];
        const dimension = points['0'].length
        
        for (let i = dimension - 1; i > -1; i--) {
            let sumCoordinates = 0;

            for (const point in points) {
                sumCoordinates += points[point][i];
            }

            result[i] = Operation.round(sumCoordinates / (dimension + 1));
        }

        return result;
    }

    /**
     * Производит сдвиг точек, чтобы центр тяжести оказался в начале координат.
     * @param {Object} points 
     */
    static shiftPointsToCenter(points) {
        const centerMass = Operation.getCenterOfMass(points);
        const dimension = points['0'].length;
        const result = {};

        for (const point in points) {
            result[point] = [];

            for (let i = dimension - 1; i > -1; i--) {
                result[point][i] = Operation.round(points[point][i] - centerMass[i]);
            }
        }

        return result;
    }

    /**
     * Нормирует расстояние точек, чтобы расстоние до начало координат было равно единице.
     * @param {Object} points 
     */
    static normalizePoints(points) {
        const dimension = points['0'].length;
        const result = {};
        const nullPoint = []

        for (let i = dimension - 1; i > -1; i--) {
            nullPoint.push(0);
        }

        for (const point in points) {
            result[point] = [];
            const distanceBetweenPoints = Operation.getDistanceBetweenPoints(nullPoint, points[point]);
            
            for (let i = dimension - 1; i > -1; i--) {
                result[point][i] = Operation.round(points[point][i] / distanceBetweenPoints);
            }
        }

        return result;
    }
}

module.exports = Operation;