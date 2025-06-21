export function getStoreStatus() {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
  const hour = now.getHours();
  const minutes = now.getMinutes();

  // Aberto se for de terça (2) a domingo (0) e entre 17:30 e 22:00
  const isOpen =
    dayOfWeek !== 1 && // Não é segunda
    (
      (hour > 17 && hour < 22) || // Entre 18:00 e 21:59
      (hour === 17 && minutes >= 30) // 17:30 ou mais
    );

  let nextOpenTime: Date | null = null;

  if (!isOpen) {
    // Comece procurando hoje mesmo
    nextOpenTime = new Date(now);

    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(now);
      checkDate.setDate(now.getDate() + i);
      const checkDay = checkDate.getDay();

      if (checkDay !== 1) { // Não é segunda
        // Se é hoje, precisa ser depois do horário atual
        if (i === 0) {
          if (hour < 17 || (hour === 17 && minutes < 30)) {
            checkDate.setHours(17, 30, 0, 0);
            nextOpenTime = checkDate;
            break;
          } else if (hour >= 22) {
            continue; // Hoje já passou do horário, tenta próximo dia
          }
        } else {
          checkDate.setHours(17, 30, 0, 0);
          nextOpenTime = checkDate;
          break;
        }
      }
    }
  }

  return { isOpen, nextOpenTime };
}
