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
export default new Config({
  WEB3_PROVIDER: WEB3_PROVIDER,
  LIFTOKEN_ADDRESS: LIFTOKEN_ADDRESS,
  WT_INDEXES: WT_INDEXES,
  MAPS_API_KEY: MAPS_API_KEY,
});
