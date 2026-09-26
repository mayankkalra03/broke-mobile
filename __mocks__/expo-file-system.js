class MockFile {
  constructor(dir, name) {
    this.uri = `file:///mock/${name}`;
  }
  async write(content) {
    return Promise.resolve();
  }
}

module.exports = {
  Paths: {
    cache: '/mock/cache',
    document: '/mock/document',
  },
  File: MockFile,
};
