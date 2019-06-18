/**
 * Класс описывающий многочлены Лагранжа
 */
class Lagrange {

    /**
     * Конструктор класс. 
     * @param {Matrix} coefficients - коэффиценты для многочленов
     */
    constructor(coefficients) {
        this.value = coefficients.transposed;
    }

    /**
     * Возвращает значения для многочлена.
     * @param {Number} iteration - номер многочлена Лагражка.
     * @param {Array} vector - точка в которой надо вычислить значение.
     */
    getValue(iteration, vector) {
        return this.value.getLine(iteration).reduce((result, element, index) => {
            return result += vector.length - 1 >= index ? element * vector[index] : element;
        }, 0);
    }
}

module.exports = Lagrange;
