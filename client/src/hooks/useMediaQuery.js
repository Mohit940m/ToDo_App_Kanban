// client/src/hooks/useMediaQuery.js
import { useState, useEffect } from 'react';

const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(window.matchMedia(query).matches);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    const listener = (event) => setMatches(event.matches);

    mediaQueryList.addEventListener('change', listener);

    // Cleanup listener on component unmount
    return () => mediaQueryList.removeEventListener('change', listener);
  }, [query]);

  return matches;
};

export default useMediaQuery;