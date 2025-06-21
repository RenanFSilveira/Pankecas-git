// Utilitários para verificação de horário de funcionamento

export function getStoreStatus() {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();

  // Horário de funcionamento: Terça a Domingo, das 17:30 às 22h
  // Segunda-feira fechado
  const isOpen = (
    (dayOfWeek >= 2 || dayOfWeek === 0 || dayOfWeek === 6) && // Terça a Domingo
    ((currentHour === 17 && currentMinutes >= 30) || (currentHour > 17 && currentHour < 22))
  );

  let nextOpenTime = null;

  if (!isOpen) {
    nextOpenTime = new Date(now);
    
    if (dayOfWeek === 1) { // Segunda-feira
      // Abre terça às 17:30
      nextOpenTime.setDate(now.getDate() + 1);
      nextOpenTime.setHours(17, 30, 0, 0);
    } else if (dayOfWeek === 0 || dayOfWeek === 6 || (dayOfWeek >= 2 && dayOfWeek <= 5)) { // Domingo, Sábado ou Terça a Sexta
      if (currentHour < 17 || (currentHour === 17 && currentMinutes < 30)) {
        // Abre hoje às 17:30
        nextOpenTime.setHours(17, 30, 0, 0);
      } else if (currentHour >= 22) {
        // Abre amanhã às 17:30 (se não for segunda)
        nextOpenTime.setDate(now.getDate() + 1);
        
        // Se amanhã for segunda, pula para terça
        if ((dayOfWeek === 0 || dayOfWeek === 6 || (dayOfWeek >= 2 && dayOfWeek <= 5)) && (dayOfWeek + 1) % 7 === 1) {
          nextOpenTime.setDate(now.getDate() + 2);
        }
        
        nextOpenTime.setHours(17, 30, 0, 0);
      }
    }
  }

  return { isOpen, nextOpenTime };
}

export function formatNextOpenTime(nextOpenTime: Date): string {
  const now = new Date();
  const isToday = nextOpenTime.getDate() === now.getDate() && 
                  nextOpenTime.getMonth() === now.getMonth() && 
                  nextOpenTime.getFullYear() === now.getFullYear();
  
  if (isToday) {
    // Se for hoje, mostra apenas o horário
    return `hoje às ${nextOpenTime.getHours()}:${nextOpenTime.getMinutes().toString().padStart(2, '0')}`;
  } else {
    // Se for outro dia, mostra a data completa
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit',
    };
    
    return nextOpenTime.toLocaleDateString('pt-BR', options);
  }
}
