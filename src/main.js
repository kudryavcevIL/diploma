const FileSystem = require('./Utils/FileSystem');
const Simplex = require('./Math/Simplex');

async function start() {
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
    const norm = await simplex.normProjectora();

    FileSystem.writeFile(config.pathToResult, `Норма: ${norm};\n\nСимплекс:\n${simplex.toString()}`, {uncoding: 'unf8'});
}

start().then(function() {
    console.log('Я всё!!!')
});
