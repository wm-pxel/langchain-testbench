import React from 'react';

export function setTimedMessage(
    setFunction: React.Dispatch<React.SetStateAction<string | null>>,
    message: string,
  ): void {
    setFunction(message);
  
    setTimeout(() => {
      setFunction(null);
    }, 5000);
  }