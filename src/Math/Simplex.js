const Matrix = require('./Matrix');
const Lagrange = require('./Lagrange');
const Operation = require('./Operation');
const GradientMethod = require('./../OptimizationMethods/GradientMethod');
const SphericalVector = require('./SphericalVector');

const derivativeAccuracy = 0.001;

/**
 * Класс описывающий симплекс
 */
class Simplex extends Matrix {

  /**
   * Конструктор класса 
   * @param {Object} points - набор вершин образующих симплекс
   * @param {Boolean} spherical - точки придествлены в сферической координатах.
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
     * Считает норму проектора симплекса.
     */
    async normProjectora() {
        const norm = await GradientMethod.maximization(this.projector.bind(this), 0.01, 40, this.size - 2);

        return norm.value;
    }

    /**
     * Считате норму для одного узла интреполяции.
     * @param {Array} point - узел интреполяции
     */
    projector(point) {
        let result = 0;

        for (let iteration = 0; iteration < this.size; iteration++) {
            result += Operation.round(Math.abs(this.cofLagrange.getValue(iteration, point))); 
        }

        return result;
    }

    /**
     * Составляет градиент по функции normProjectora
     */
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

    /**
     * Строит правильный симплекс
     * @param {Number} dimension - размерность пространства.
     */
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

    /**
     * Определяет необходимый коэффициент сдвига для нулевой вершины, чтобы получить правильный симплекс. 
     * @param {Number} dimension - размерность пространства.
     */
    static getShiftToCorrectSimplex(dimension) {
        return Operation.round((1 - Math.sqrt(dimension + 1))/dimension);
    }

}

module.exports = Simplex;
