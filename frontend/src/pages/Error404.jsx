import React from "react";
import TopNav from "../components/TopNav";
import Footer from "../components/Footer";

const Error404 = () => {
  return (
    <div>
      <TopNav />
      <div>You fucked up. No such route</div>
      <Footer />
    </div>
  );
};

export default Error404;
