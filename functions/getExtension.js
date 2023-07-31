function getExtension(file) {
    return file.split('.').pop();
}

module.exports = getExtension;