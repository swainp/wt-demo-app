const CONFIG = require('../../config.json');

class Config {
  constructor (context) {
    this.context = context;
  }
  set (key, value) {
    this.context[key] = value;
  }

  get (key) {
    return this.context[key];
  }
}
export default new Config(CONFIG);
