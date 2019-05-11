class Lagrange {
    /**
     * 
     * @param {Matrix} coefficients 
     */
    constructor(coefficients) {
        this.value = coefficients.transposed;
    }

    getValue(iteration, vector) {
        return this.value.getLine(iteration).reduce((result, element, index) => {
            return result += vector.length - 1 >= index ? element * vector[index] : element;
        }, 0);
    }
}

module.exports = Lagrange;