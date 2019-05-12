const Matrix = require('./Matrix');
const Lagrange = require('./Lagrange');

class Simplex extends Matrix {

    normProjectora(points) {
        if (!this.normProj) {
            this.cofLagrange = new Lagrange(this.revers);
            this.normProj = this.getNormProjectora(points);
        }

        return this.normProj;
    }

    getNormProjectora(points) {
        const norms = [];

        for (const point in points) {
            let result = 0;

            for (let iteration = 0; iteration < this.size; iteration++) {
                result += Math.abs(this.cofLagrange.getValue(iteration, points[point])); 
            }

            norms.push(result);
        }

        return norms.reduce((result, norm) => {
            return norm > result ? norm : result;
        }, 0);
    }
}

module.exports = Simplex;
