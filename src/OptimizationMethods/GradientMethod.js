const Matrix = require('./../Math/Matrix');
const SphericalVector = require('./../Math/SphericalVector');
const Operation = require('./../Math/Operation');

class GradientMethod {
    constructor(cfg) {
        this.direction = cfg.direction || '-';
        this.derivativeAccuracy = cfg.derivativeAccuracy || 0.001;
    }

    async maximization(func, epcelent, numberSegment, sizeVector) {
        const vectorsPoints = SphericalVector.getVectorByRadians(numberSegment, sizeVector);
        const arrayPromises = []

        const vect = new SphericalVector([0]);


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

    stopIterations(previousGradient, currentGradient, previousValueFunc, currentValueFunc) {
        const lengthCurrentGradient = Operation.absVector(currentGradient);
        const lengthPreviousGradient = Operation.absVector(previousGradient);

        return lengthCurrentGradient === 0 || 
        (lengthPreviousGradient === lengthCurrentGradient && previousValueFunc === currentValueFunc);
    }

    nextVector(point, gradients, delta) {
        const result = new SphericalVector([]);

        for (let i = point.radians.length - 1; i > -1; i--) {
            result.radians[i] = this.nextPointForMaximization(point.radians[i], gradients[i], delta) ;
        }

        return result;
    }

    nextPointForMaximization(value, gradient, delta) {
        return value + Operation.multiply(delta, gradient);
    }
}

module.exports = GradientMethod;
