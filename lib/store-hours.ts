// Utilitários para verificação de horário de funcionamento
export function getStoreStatus() {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();

  // Horário de funcionamento: Terça a Domingo, das 17:30 às 22:00
  const isOpen =
    dayOfWeek !== 1 && // Não é segunda-feira
    (
      (currentHour > 17 && currentHour < 22) || // Entre 18:00 e 21:59
      (currentHour === 17 && currentMinutes >= 30) // Exatamente às 17:30 ou depois
    );

  let nextOpenTime = null;
  if (!isOpen) {
    nextOpenTime = new Date(now);

    // Encontrar o próximo dia em que estará aberto
    let daysToAdd = 1;
    while (true) {
      const nextDay = (now.getDay() + daysToAdd) % 7;
      if (nextDay !== 1) break; // Achou o próximo dia em que abre (não segunda)
      daysToAdd++;
    }

    nextOpenTime.setDate(now.getDate() + daysToAdd);
    nextOpenTime.setHours(17, 30, 0, 0);
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
