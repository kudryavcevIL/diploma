const Matrix = require('./Matrix');
const Lagrange = require('./Lagrange');
const Operation = require('./Operation');
const GradientMethod = require('./../OptimizationMethods/GradientMethod');
const SphericalVector = require('./SphericalVector');

const derivativeAccuracy = 0.001;

class Simplex extends Matrix {

  /**
   * 
   * @param {*} points 
   */
    constructor(points, spherical) {
        const matrix = {};
        const radians = {};

        for (const line in points) {
            if (spherical) {
                radians[line] = points[line] instanceof SphericalVector ? points[line] : new SphericalVector(points[line]);
                matrix[line] = [...[], ...radians[line].coordinates];
            } else {
                matrix[line] = [...[], ...points[line]];
            }

            matrix[line].push(1);
        }

        super(matrix);

        this.radians = radians;
        this.cofLagrange = new Lagrange(this.revers);
    }

    /**
     * 
     * 
     */
    async normProjectora() {
        const maxMethod = new GradientMethod({
            direction: '+',
            derivativeAccuracy: 0.001
        });

        const norm = await maxMethod.maximization(this.projector.bind(this), 0.01, 35, this.size - 2);

        return norm.value;
    }

    /**
     * 
     * @param {Array} point 
     */
    projector(point) {
        let result = 0;

        for (let iteration = 0; iteration < this.size; iteration++) {
            result += Operation.round(Math.abs(this.cofLagrange.getValue(iteration, point))); 
        }

        return result;
    }

    async gradientByNorm() {
        const result = {};

        for (const line in this.radians) {
            result[line] = [];
            const originalLine = this.radians[line];

            for (let i = originalLine.radians.length - 1; i > -1; i--) {
                const leftVector = [...[], ...originalLine.radians];
                const rightVector = [...[], ...originalLine.radians];

                leftVector[i] = +leftVector[i] + derivativeAccuracy;
                rightVector[i] = rightVector[i] - derivativeAccuracy;

                const leftPoints = {...{}, ...this.radians};
                const rightPoints = {...{}, ...this.radians};

                leftPoints[line] = leftVector;
                rightPoints[line] = rightVector;

                const leftSimplex = new Simplex(leftPoints, true);
                const rightSimplex = new Simplex(rightPoints, true);

                result[line][i] = Operation.derivative(await leftSimplex.normProjectora(), await rightSimplex.normProjectora(), derivativeAccuracy);
            }
        }

        return result;  
    }

    static getCorrectSimplex(dimension) {
        const result = {};
        result[dimension] = [];
        const shiftCorrect = Simplex.getShiftToCorrectSimplex(dimension);

        for (let i = dimension - 1; i > -1; i--) {
            result[dimension].push(shiftCorrect);
        }

        for (let i = dimension - 1; i > -1; i--) {
            result[i] = [];

            for (let j = dimension - 1; j > -1; j--) {
                result[i][j] = j === i ? 1 : 0;
            }
        }

        return result;
    }

    static getShiftToCorrectSimplex(dimension) {
        return Operation.round((1 - Math.sqrt(dimension + 1))/dimension);
    }

}

module.exports = Simplex;
