const FileSystem = require('./Utils/FileSystem');
const Simplex = require('./Math/Simplex');

function start() {
    const pathToConfig = process.argv[2];
    const config = JSON.parse(FileSystem.readFile(pathToConfig));

    const source = config.simplex.reduce((result, element, index) => {
        const line = element.replace(/[\s]*/g, '').split(',');

        result[index] = [];

        for (const value of line) {
            result[index].push(+value);
        }

        return result;
    }, {});

    const simplex = new Simplex(source);

    const trans = simplex.transposed;

    const revers = simplex.revers;

    FileSystem.writeFile(config.pathToResult, revers.toString(), {uncoding: 'unf8'});

    console.log(config.text);
}

start();

return;
