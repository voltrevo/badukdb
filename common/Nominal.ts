type Nominal<Type extends string, Value> = {
  type: Type;
  value: Value;
};

function Nominal<Type extends string>(type: Type) {
  return function <Value>() {
    return <V extends Value>(value: V) => ({ type, value });
  };
}

export default Nominal;
