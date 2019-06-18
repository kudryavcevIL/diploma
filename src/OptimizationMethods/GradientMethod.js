const pMap = require('p-map');
const SphericalVector = require('./../Math/SphericalVector');
const Operation = require('./../Math/Operation');

/**
 * Класс градиентных методов оптимизации.
 */
class GradientMethod {

    /**
     * Функции минимизации. Находит глобальный минимум. 
     * @param {Function} func - минимизируемая функциия
     * @param {Number} epcelent - точноть приближения.
     * @param {Number} numberSegment - количество сегментом, в которых надо найти локальный минимум.
     * @param {Number} sizeVector - размер вектора
     */
    static async maximization(func, epcelent, numberSegment, sizeVector) {
        const vectorsPoints = SphericalVector.getVectorByRadians(numberSegment, sizeVector);

        const result = await pMap(vectorsPoints, async (vectorsPoints) => {
            try {
                return await GradientMethod.findLocalMax(func, vectorsPoints, epcelent);
            } catch(error) {
                throw new Error(error);
            }
        }, {concurrency: 100})


        const max = {
            value: 0
        };

        for (let i = result.length - 1; i > -1; i--) {
            if (result[i].value > max.value) {
                max.value = result[i].value;
                max.vector = result[i].vector;
            }
        }

        return max;
    }

    /**
     * Находит ближайший локальный минимум функции.
     * @param {Function} func - минимизируемая функциия
     * @param {SphericalVector} startPoint - стартовый вектор.
     * @param {Number} epcelent - точноть приближения.
     */
    static async findLocalMax(func, startPoint, epcelent) {
        let point = startPoint;
        let previousGradient;
        let previousValueFunc;
        let currentGradient;
        let nextPoint;
        let nextValueFunc;
        let currentValueFunc;
        let delta;

        while(true) {
            previousValueFunc = currentValueFunc;
            currentValueFunc = func(point.coordinates);
            previousGradient = currentGradient || 0;
            currentGradient = point.gradient(func);
            delta = 0.1;

            if (GradientMethod.stopIterations(previousGradient, currentGradient, previousValueFunc, currentValueFunc)) {
                return {
                    vector: point,
                    value: currentValueFunc
                };
            }

            while(true) {
                nextPoint = GradientMethod.nextVector(point, currentGradient, delta);
                nextValueFunc = func(nextPoint.coordinates);

                if (currentValueFunc < nextValueFunc) {
                    currentValueFunc = nextValueFunc;
                    point = nextPoint;
                    delta = delta - epcelent;
                } else {
                    break;
                }
            }
        }
    }

    /**
     * Строить вектор для следуюшего шага.
     * @param {Object} point - вектор предыдушего шага.
     * @param {Object} gradients - градиент минимизируемой функции.
     * @param {Number} delta - длина шага по вектору направления.
     */
    static nextVector(point, gradients, delta) {
        const result = [];

        for (let i = point.radians.length - 1; i > -1; i--) {
            result[i] = GradientMethod.nextPointForMaximization(point[i], gradients[i], delta);
        }

        return new SphericalVector(result);
    }

    /**
     * Считате значение для следующего шага максимизации.
     * @param {Number} value - значение предыдущего шага.
     * @param {Number} gradient - градиент минимизируемой функции.
     * @param {Number} delta - длина шага по вектору направления.
     */
    static nextPointForMaximization(value, gradient, delta) {
        return value + Operation.multiply(delta, gradient);
    }

    /**
     * Считате значение для следующего шага минимизации.
     * @param {Number} value - значение предыдущего шага.
     * @param {Number} gradient - градиент минимизируемой функции.
     * @param {Number} delta - длина шага по вектору направления.
     */
    static nextPointForMinization(value, gradient, delta) {
        return value - Operation.multiply(delta, gradient);
    }

    /**
     * Строить симплкс для следуюшего шага.
     * @param {Object} simplex - симплекс предыдушего шага.
     * @param {Object} gradients - градиент минимизируемой функции.
     * @param {Number} delta - длина шага по вектору направления.
     */
    static nextSimplex(simplex, gradients, delta) {
        const result = {};

        for (const line in gradients) {
            result[line] = [];

            for (let i = gradients[line].length - 1; i > -1; i--) {
                result[line][i] = GradientMethod.nextPointForMinization(
                    simplex.radians[line].radians[i],
                    gradients[line][i],
                    delta
                );
            }
        }

        return new simplex.__proto__.constructor(result, true);
    }

    /**
     * Метод минимизации.
     * @param {Object} startSimplex - стартовый симплекс.
     * @param {Number} epcelent - точность приближения.
     */
    static async minization(startSimplex, epcelent) {
        let simplex = startSimplex;
        let previousGradient;
        let previousValueFunc;
        let currentGradient;
        let nextSimplex;
        let nextValueFunc;
        let currentValueFunc;
        let delta;

        while(true) {
            previousValueFunc = currentValueFunc;
            currentValueFunc =  await simplex.normProjectora();
            previousGradient = currentGradient || 0;
            currentGradient = await simplex.gradientByNorm();
            delta = 0.1;

            if (GradientMethod.stopIterations(previousGradient, currentGradient, previousValueFunc, currentValueFunc)) {
                return {
                    simplex: simplex,
                    norm: currentValueFunc
                };
            }

            while(true) {
                nextSimplex = GradientMethod.nextSimplex(simplex, currentGradient, delta);
                nextValueFunc = await nextSimplex.normProjectora();

                if (currentValueFunc > nextValueFunc) {
                    currentValueFunc = nextValueFunc;
                    simplex = nextSimplex;
                    delta = delta - epcelent;
                } else {
                    break;
                }
            }
        }
    }

    /**
     * Определяет надо ли отсановить алгоритм. 
     * @param {Array || Object} previousGradient - предыдуший градиент.
     * @param {Array || Object} currentGradient - актуальный градиент.
     * @param {Number} previousValueFunc - предыдущие значение функции.
     * @param {Number} currentValueFunc - актуальное значение функции.
     */
    static stopIterations(previousGradient, currentGradient, previousValueFunc, currentValueFunc) {
        const lengthCurrentGradient = Operation.absVector(currentGradient);
        const lengthPreviousGradient = Operation.absVector(previousGradient);

        //Если граидент равен 0 или если после шага входные данные не изменились.
        return lengthCurrentGradient === 0 || 
        (lengthPreviousGradient === lengthCurrentGradient && previousValueFunc === currentValueFunc);
    }
}

module.exports = GradientMethod;
