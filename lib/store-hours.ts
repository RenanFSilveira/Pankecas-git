export function getStoreStatus() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const hour = now.getHours();
  const minutes = now.getMinutes();

  const isOpen =
    dayOfWeek !== 1 &&
    (
      (hour > 17 && hour < 22) ||
      (hour === 17 && minutes >= 30)
    );

  let nextOpenTime: Date | null = null;

  if (!isOpen) {
    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(now);
      checkDate.setDate(now.getDate() + i);
      const checkDay = checkDate.getDay();

      if (checkDay !== 1) {
        if (i === 0) {
          if (hour < 17 || (hour === 17 && minutes < 30)) {
            checkDate.setHours(17, 30, 0, 0);
            nextOpenTime = checkDate;
            break;
          } else if (hour >= 22) {
            continue;
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
