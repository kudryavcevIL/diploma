const FileSystem = require('./Utils/FileSystem');

function start() {
    const pathToConfig = process.argv[2];
    const config = JSON.parse(FileSystem.readFile(pathToConfig));

    const result = {
        Name: 'Ilya',
        comment: 'I am good student'
    };

    FileSystem.writeFile(config.pathToResult, result, {uncoding: 'unf8'});

    console.log(config.text);
}

start();

return;