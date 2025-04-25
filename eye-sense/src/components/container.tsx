import React from "react";

const Container = ({ children }: { children: React.ReactNode }) => {
  return <div className="max-w-2xl ml-auto mr-auto p-5">{children}</div>;
};

export default Container;
