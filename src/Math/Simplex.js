const Matrix = require('./Matrix');
const Lagrange = require('./Lagrange');
const Operation = require('./Operation');
const GradientMethod = require('./../OptimizationMethods/GradientMethod');

class Simplex extends Matrix {

  /**
   * 
   * @param {*} cfg 
   */
    constructor(cfg) {
        super(cfg);
        
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

        const norm = await maxMethod.maximization(this.projector.bind(this), 0.01, 30, this.size - 2);

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
}

module.exports = Simplex;
