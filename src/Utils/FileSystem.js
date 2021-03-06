const fs = require('fs-extra');

/**
 * Класс для работы с файловой системой.
 */
class FileSystem {

    /**
     * Читает файл.
     * @param {String} path - путь до файла
     */
    static readFile(path) {
        try {
            return fs.readFileSync(path, {encoding: 'utf8'})
        } catch(err) {
            throw Error(`Not could read file: ${path}\n Error: ${err}`);
        }
    }

    /**
     * Записывает файл
     * @param {Sting} path - путь до файла
     * @param {String | Object} content - контент
     */
    static writeFile(path, content) {
        let text = content;

        if (typeof text === 'object') {
            text = JSON.stringify(text, null, 4);
        } else if (typeof text !== 'string') {
            throw Error(`The contents not is type String`);
        }

        try {
            fs.outputFileSync(path, text, {encoding: 'utf8'});
        } catch(err) {
            throw Error(`Not could write file: ${path}\n Error: ${err}`);
        }
    }

}

module.exports = FileSystem;