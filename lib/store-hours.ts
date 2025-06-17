// Utilitários para verificação de horário de funcionamento
export function getStoreStatus() {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
  const currentHour = now.getHours();

  // Horário de funcionamento: Terça a Sexta, das 18h às 22h
  // Segunda-feira fechado
  const isOpen = (
    (dayOfWeek >= 2 && dayOfWeek <= 5) && // Terça a Sexta
    (currentHour >= 17 && now.getMinutes() >= 30 && currentHour < 22)
  );

  let nextOpenTime = null;
  if (!isOpen) {
    nextOpenTime = new Date(now);
    
    if (dayOfWeek === 1) { // Segunda-feira
      // Abre terça às 18h
      nextOpenTime.setHours(17, 30, 0, 0);
    } else if (dayOfWeek === 0) { // Domingo
      // Abre terça às 18h
      nextOpenTime.setDate(now.getDate() + 2);
      nextOpenTime.setHours(17, 30, 0, 0);
    } else if (dayOfWeek === 6) { // Sábado
      // Abre terça às 18h
      nextOpenTime.setDate(now.getDate() + 3);
      nextOpenTime.setHours(17, 30, 0, 0);
    } else if (dayOfWeek >= 2 && dayOfWeek <= 5) { // Terça a Sexta
      if (currentHour < 18) {
        // Abre hoje às 17:30
        nextOpenTime.setHours(17, 30, 0, 0);
      } else if (currentHour >= 22) {
        // Abre amanhã às 18h (se for terça a quinta) ou na próxima terça (se for sexta)
        if (dayOfWeek === 5) { // Sexta
          nextOpenTime.setDate(now.getDate() + 4); // Próxima terça
        } else {
          nextOpenTime.setDate(now.getDate() + 1); // Amanhã
        }
        nextOpenTime.setHours(17, 30, 0, 0);
      }
    }
  }

  return { isOpen, nextOpenTime };
}

export function formatNextOpenTime(nextOpenTime: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  
  return nextOpenTime.toLocaleDateString('pt-BR', options);
}

