import React, { useEffect, useState } from "react";
import { useBlurCount, useDecrementBlurCount } from "~/stores/useGeneral";

const BlurCountdown = () => {
  //   const [countdown, setCountdown] = useState(90);
  const blurCount = useBlurCount();
  const decrementBlurCount = useDecrementBlurCount();

  const [countdown2, setCountdown2] = useState(8);

  //CountDown
  useEffect(() => {
    // if (!remoteStream?.getTracks()[0]) return;
    const timer = setInterval(() => {
      if (blurCount > 1) {
        decrementBlurCount();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [blurCount, decrementBlurCount]);

  //CountDown2
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown2((prev) => {
        if (prev > 0) {
          // Your countdown logic
          return prev - 1;
        } else {
          clearInterval(timer);
          return 0;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return <div>{blurCount}</div>;
};

export default BlurCountdown;
