import React, { useEffect, useRef } from 'react';
import Typed from 'typed.js';

const TypedLineTry = () => {
  const el = useRef<HTMLElement | null>(null);
  const typed = useRef<Typed | null>(null);

  useEffect(() => {
    const options = {
      stringsElement: '#biosar',
      typeSpeed: 20,
      backSpeed: 10,
      loop: false,
      backDelay: 1000,
    };
    typed.current = new Typed(el.current!, options);
    return () => {
      if (typed.current) typed.current.destroy();
    };
  });

  return (
    <div className="text-7xl">
      <ul id="biosar" className="hidden">
        <li className="text-7xl">Enough talking, let&apos;s get typing</li>
        <li className="text-7xl">Click here to get started.</li>
      </ul>
      <span
        ref={el}
        className="bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent"
      />
    </div>
  );
};

export default TypedLineTry;
