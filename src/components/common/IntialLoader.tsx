"use client";

import Lottie from "lottie-react";
import loaderAnimation from "@/assets/Loading confirm.json"; // Path to your JSON

export const EnterpriseLottieLoader = () => {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-white">
      <div className="w-20 h-20"> {/* Control size via a wrapper */}
        <Lottie 
          animationData={loaderAnimation} 
          loop={true}
          autoplay={true}
        />
      </div>
      
     
    </div>
  );
};