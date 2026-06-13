export function isRestaurantOpen(): boolean {
  const now = new Date();
  const day = now.getDay();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const totalMinutes = hours * 60 + minutes;

  const isEarlyMorning = hours < 4;

  if (isEarlyMorning) {
    const prevDay = day === 0 ? 6 : day - 1;
    if (prevDay === 1 || prevDay === 2) {
      return totalMinutes < 3 * 60;
    } else {
      return totalMinutes < 3 * 60 + 45;
    }
  }

  if (day === 1 || day === 2) {
    return totalMinutes >= 15 * 60;
  } else {
    return totalMinutes >= 11 * 60;
  }
}

export function isLunchHours(): boolean {
  const now = new Date();
  const day = now.getDay();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const totalMinutes = hours * 60 + minutes;

  // Lunch Mon-Fri 10:30-14:30
  if (day >= 1 && day <= 5) {
    return totalMinutes >= 10 * 60 + 30 && totalMinutes < 14 * 60 + 30;
  }
  return false;
}

export function getOpeningHoursText(language: 'fi' | 'en'): string {
  if (language === 'fi') {
    return 'Ma-Ti 15:00-03:00 | Ke-Su 11:00-03:45';
  }
  return 'Mon-Tue 15:00-03:00 | Wed-Sun 11:00-03:45';
}
