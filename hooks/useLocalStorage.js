
    import React, { useState, useEffect, useCallback } from 'react';

    // Custom Hook for managing state in localStorage
    export function useLocalStorage(key, initialValue) {
      // Function to get the initial value from localStorage or use the provided initialValue
      const readValue = useCallback(() => {
        // Prevent build error "window is undefined" during server-side rendering
        if (typeof window === 'undefined') {
          return initialValue;
        }

        try {
          const item = window.localStorage.getItem(key);
          // Parse stored json or if none return initialValue
          return item ? JSON.parse(item) : initialValue;
        } catch (error) {
          console.warn(`Error reading localStorage key “${key}”:`, error);
          return initialValue;
        }
      }, [initialValue, key]);

      // State to store our value
      // Pass initial state function to useState so logic is only executed once
      const [storedValue, setStoredValue] = useState(readValue);

      // Return a wrapped version of useState's setter function that ...
      // ... persists the new value to localStorage.
      const setValue = useCallback(
        (value) => {
          // Prevent build error "window is undefined" during server-side rendering
          if (typeof window === 'undefined') {
            console.warn(
              `Tried setting localStorage key “${key}” even though environment is not a client`
            );
          }

          try {
            // Allow value to be a function so we have same API as useState
            const valueToStore =
              value instanceof Function ? value(storedValue) : value;
            // Save state
            setStoredValue(valueToStore);
            // Save to local storage
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
          } catch (error) {
            console.warn(`Error setting localStorage key “${key}”:`, error);
          }
        },
        [key, storedValue] // Include storedValue in the dependency array
      );

       // Read localStorage again if key changes
       useEffect(() => {
        setStoredValue(readValue());
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [key]);


      // Listen to storage events to sync changes across tabs
      useEffect(() => {
        const handleStorageChange = (event) => {
          if (event.key === key && event.storageArea === window.localStorage) {
             try {
                setStoredValue(event.newValue ? JSON.parse(event.newValue) : initialValue);
             } catch (error) {
                console.warn(`Error parsing storage change for key “${key}”:`, error);
                setStoredValue(initialValue);
             }
          }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => {
          window.removeEventListener('storage', handleStorageChange);
        };
      }, [key, initialValue]);


      return [storedValue, setValue];
    }
  