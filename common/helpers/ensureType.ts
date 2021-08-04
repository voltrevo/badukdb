export default function ensureType<T>() {
  return function <V extends T>(value: V) {
    return value;
  };
}
