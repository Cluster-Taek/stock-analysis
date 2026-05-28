import { useEffect, useState } from 'react';

const useLocalStorage = <T>(key: string, initialValue: T) => {
  // 초기 렌더링 시에는 항상 initialValue 사용
  const [state, setState] = useState<T>(initialValue);

  // 클라이언트에서만 localStorage 값 로드
  useEffect(() => {
    try {
      const value = window.localStorage.getItem(key);
      if (value !== null) {
        setState(JSON.parse(value));
      }
    } catch (error) {
      console.log(error);
    }
  }, [key]);

  const setValue = (value: T) => {
    try {
      if (typeof window === 'undefined') {
        return;
      }
      window.localStorage.setItem(key, JSON.stringify(value));
      setState(value);
    } catch (error) {
      console.log(error);
    }
  };

  return {
    value: state,
    setValue,
  };
};

export default useLocalStorage;
