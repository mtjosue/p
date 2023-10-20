import React from "react";

// type Props = {};

const WaitingPage = () =>
  // props: Props
  {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="text-white">
          <h2>Waiting for Users to Connect With...</h2>
        </div>
      </main>
    );
  };

export default WaitingPage;
