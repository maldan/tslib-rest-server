export default class StringHelper {
  static camelToKebab(s: string): string {
    if (!s) {
      return s;
    }
    const x = s.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
    if (x[0] === '-') {
      return x.slice(1);
    }
    return x;
  }
}
