const path = require('path');

module.exports = {
    entry: './src/js/index.js',
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'public', 'js')
    },
    devtool: 'cheap-module-eval-source-map'
};