const SphericalVector = require('./../Math/SphericalVector');
const Operation = require('./../Math/Operation');

class GradientMethod {
    constructor(cfg) {
        this.direction = cfg.direction || '-';
        this.derivativeAccuracy = cfg.derivativeAccuracy || 0.001;
    }

    async maximization(func, epcelent, numberSegment, sizeVector) {
        const vectorsPoints = SphericalVector.getVectorByRadians(numberSegment, sizeVector);
        const arrayPromises = [];

        for (let i = vectorsPoints.length - 1; i > -1; i--) {
            arrayPromises.push(this.findLocalMax(func, vectorsPoints[i], epcelent));
        }

        return Promise.all(arrayPromises).then((result) => {
            const max = {
                value: 0
            };

            for (let i = result.length - 1; i > -1; i--) {
                if (result[i].value > max.value) {
                    max.value = result[i].value;
                    max.point = result[i].point;
                }
            }

            return max;
        });
    }

    async findLocalMax(func, startPoint, epcelent) {
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

            if (this.stopIterations(previousGradient, currentGradient, previousValueFunc, currentValueFunc)) {
                return {
                    vector: point,
                    value: currentValueFunc
                };
            }

            while(true) {
                nextPoint = this.nextVector(point, currentGradient, delta);
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

    nextVector(point, gradients, delta) {
        const result = [];

        for (let i = point.radians.length - 1; i > -1; i--) {
            result[i] = this.nextPointForMaximization(point[i], gradients[i], delta) ;
        }

        return new SphericalVector(result);
    }

    nextPointForMaximization(value, gradient, delta) {
        return value + Operation.multiply(delta, gradient);
    }

    
    nextPointForMinization(value, gradient, delta) {
        return value - Operation.multiply(delta, gradient);
    }

    nextSimplex(simplex, gradients, delta) {
        const result = {};

        for (const line in gradients) {
            result[line] = [];

            for (let i = gradients[line].length - 1; i > -1; i--) {
                result[line][i] = this.nextPointForMinization(simplex.radians[line].radians[i], gradients[line][i], delta);
            }
        }

        return new simplex.__proto__.constructor(result);
    }

    async minization(startSimplex, epcelent) {
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

            if (this.stopIterations(previousGradient, currentGradient, previousValueFunc, currentValueFunc)) {
                return {
                    simplex: simplex,
                    norm: currentValueFunc
                };
            }

            while(true) {
                nextSimplex = this.nextSimplex(simplex, currentGradient, delta);
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


    stopIterations(previousGradient, currentGradient, previousValueFunc, currentValueFunc) {
        const lengthCurrentGradient = Operation.absVector(currentGradient);
        const lengthPreviousGradient = Operation.absVector(previousGradient);

        return lengthCurrentGradient === 0 || 
        (lengthPreviousGradient === lengthCurrentGradient && previousValueFunc === currentValueFunc);
    }
}

module.exports = GradientMethod;
