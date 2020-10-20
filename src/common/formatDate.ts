export function dateFormatter(date: Date): string {
  return new Date(date).toLocaleDateString('pt-br')
}
