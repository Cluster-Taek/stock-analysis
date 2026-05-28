export const getHypenNumber = (number: string) => {
  return number.replace(/[^0-9]/g, '').replace(/(\d{3})(\d{3,4})(\d{4})/, '$1-$2-$3');
};

export const getOnlyNumber = (number: string) => {
  return number.replace(/[^0-9]/g, '');
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getClearObject = (target: any) => {
  const filteredObject = Object.keys(target).reduce((acc, key) => {
    if (target[key] !== undefined && target[key] !== null && target[key] !== '') {
      acc[key] = target[key];
    }
    return acc;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }, {} as any);
  return filteredObject;
};

export const isEmpty = (value: unknown) => {
  if (value === undefined || value === null) {
    return true;
  }
  if (typeof value === 'string' && value.trim() === '') {
    return true;
  }
  if (Array.isArray(value) && value.length === 0) {
    return true;
  }
  if (typeof value === 'object' && Object.keys(value).length === 0) {
    return true;
  }
  return false;
};

export const parseValidDate = (dateInput: string | number | undefined, fallback: string): string => {
  if (!dateInput) return fallback;
  
  try {
    let dateStr = dateInput.toString();
    
    // MM/DD/YYYY 형식을 YYYY-MM-DD로 변환
    if (typeof dateInput === 'string' && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateInput)) {
      const [month, day, year] = dateInput.split('/');
      dateStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return fallback;
    return date.toISOString().split('T')[0];
  } catch {
    return fallback;
  }
};

export const toDateString = (timestamp: number | string | Date): string => {
  return new Date(timestamp).toISOString().split('T')[0];
};
