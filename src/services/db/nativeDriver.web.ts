// Web platform driver: returns null so database.ts uses AsyncStorage for web
export async function getNativeSqlite() {
  return null;
}
