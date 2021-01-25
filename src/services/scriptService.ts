class ScriptService {
  private readonly scriptList: string[] = [];

  public init(): void {
    const scripts = process.env.APP_SCRIPTS;

    if (scripts) {
      scripts.split(',').forEach(script => this.scriptList.push(script));
    }
  }

  public list(): string[] {
    return this.scriptList;
  }

  public isValid(script: string): boolean {
    return this.scriptList.some(x => x === script);
  }
}

export default new ScriptService();
