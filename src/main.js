const FileSystem = require('./Utils/FileSystem');
const Simplex = require('./Math/Simplex');
const GradientMethod = require('./OptimizationMethods/GradientMethod');
const Operation = require('./Math/Operation');

async function start() {
    const pathToConfig = process.argv[2];
    const config = JSON.parse(FileSystem.readFile(pathToConfig));

    //Ищем симплекс который даёт наименьшую норму.
    if (config.findSimplex) {
        const simplex = new Simplex(config.findSimplex.simplex, true);
        const minSimplex = await GradientMethod.minization(simplex, 0.001);

        FileSystem.writeFile(
            config.findSimplex.pathToResult,
            `Norma: ${minSimplex.norm}\n\nSimplex:\n${minSimplex.simplex.toString()}`
        );
    }

    //Строим правильный симплекс вписанный в единичный шар и стичаем норму для него.
    if (config.findNormaForCorrectSimplex) {
        const correctSimplex = Simplex.getCorrectSimplex(config.findNormaForCorrectSimplex.dimension);
        const centerSimplex = Operation.shiftPointsToCenter(correctSimplex);
        const normalizePoints = Operation.normalizePoints(centerSimplex);
        const superSimplex = new Simplex(normalizePoints);
    
        const norm = await superSimplex.normProjectora();
    
        FileSystem.writeFile(
            config.findNormaForCorrectSimplex.pathToResult,
            `Norma: ${norm}\n\nSimplex:\n${superSimplex.toString()}`
        );
    }
}

start().then(function() {
    console.log('Задача выполнена.')
});
