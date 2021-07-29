export default function mapValues<K extends string, V, MV>(
  record: Record<K, V>,
  map: (value: V) => MV,
): Record<K, MV> {
  const newRecord = {} as Record<K, MV>;

  for (const key of Object.keys(record) as K[]) {
    newRecord[key] = map(record[key]);
  }

  return newRecord;
}
