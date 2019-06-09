const FileSystem = require('./Utils/FileSystem');
const Simplex = require('./Math/Simplex');
const GradientMethod = require('./OptimizationMethods/GradientMethod');

async function start() {
    const pathToConfig = process.argv[2];
    const config = JSON.parse(FileSystem.readFile(pathToConfig));

    const simplex = new Simplex(config.simplex);
    const gradMethod = new GradientMethod({});

    const minSimplex = await gradMethod.minization(simplex, 0.001);

    FileSystem.writeFile(config.pathToResult, {
        norm: minSimplex.norm,
        simplex: minSimplex.simplex.toString()
    });
}

start().then(function() {
    console.log('Я всё!!!')
});
