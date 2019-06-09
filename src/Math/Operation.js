const precision = 1000;

class Operation {
    static round(number) {
        return Math.round(number * precision) / precision;
    }

    static multiply(multiplicand, multiplier) {
        return Operation.round(Operation.round(multiplicand) * Operation.round(multiplier));
    }

    static derivative(left, right, derivativeAccuracy) {
        return Operation.round((left - right)/(2 * derivativeAccuracy));
    }

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
}

module.exports = Operation;