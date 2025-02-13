import { useEffect, useRef, useState } from "react";

export const useIntersectionObserver = (options?: IntersectionObserverInit) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  // 'isIntersecting' is assig

  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 'observer' is assigned a va
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    if (targetRef.current) {
      observer.observe(targetRef.current);
    }
    // }, 1); // This line seems commented out and out of place
    // React Hook useEffect has a missing dependency: 'options'. Either include it or

    return () => observer.disconnect();
  }, [options]); // Added 'options' as dependency as suggested by the linting message

  return { isIntersecting, targetRef };
};
