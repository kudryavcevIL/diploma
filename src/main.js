const FileSystem = require('./Utils/FileSystem');
const Simplex = require('./Math/Simplex');
const GradientMethod = require('./OptimizationMethods/GradientMethod');
const Operation = require('./Math/Operation');

async function start() {
    const pathToConfig = process.argv[2];
    const config = JSON.parse(FileSystem.readFile(pathToConfig));

    const correctSimplex = Simplex.getCorrectSimplex(2);
    const centerSimplex = Operation.shiftPointsToCenter(correctSimplex);
    const normalizePoints = Operation.normalizePoints(centerSimplex);
    const superSimplex = new Simplex(normalizePoints);

    const norm = await superSimplex.normProjectora();


    /*
    const simplex = new Simplex(config.simplex, true);
    const gradMethod = new GradientMethod({});

    const minSimplex = await gradMethod.minization(simplex, 0.001);

    FileSystem.writeFile(config.pathToResult, {
        norm: minSimplex.norm,
        simplex: minSimplex.simplex.toString()
    });
    */

   FileSystem.writeFile(config.pathToResult, `Norma: ${norm}\n\nSimplex:\n${superSimplex.toString()}`);
}

start().then(function() {
    console.log('Я всё!!!')
});
