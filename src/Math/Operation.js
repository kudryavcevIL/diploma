const precision = 10000;

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

        for (let i = vector.length - 1; i > -1; i--) {
            result = result + Math.pow(vector[i], 2);
        }

        return Operation.round(Math.sqrt(result));
    }
}

module.exports = Operation;