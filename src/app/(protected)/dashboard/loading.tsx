import React from "react";
import FadeLoader from "react-spinners/FadeLoader";

const LoadingPage = () => {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <FadeLoader className="h-15 w-15" color="#a5a7a9" />
    </div>
  );
};

export default LoadingPage;
