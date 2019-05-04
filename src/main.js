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

    let sumElement = 0;

    simplex.each(element => {
        sumElement += element;
    });

    const elements = [];

    simplex.each((element, numberLine, numberColumn, line, column) => {
        elements.push({
            value: element,
            numberLine: numberLine,
            numberColumn: numberColumn,
            line: line,
            column: column
        })
    });

    const trans = simplex.transposed;

    result = {
        matrix: simplex.getAllElements(),
        size: simplex.size,
        determinant: simplex.determinant,
        elements: elements,
        sumElement: sumElement
    }

    FileSystem.writeFile(config.pathToResult, result, {uncoding: 'unf8'});

    console.log(config.text);
}

start();

return;
