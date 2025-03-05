import React from "react";
import Footer from "../components/Footer";
import TopNav from "../components/TopNav";

const HabitView = ({ habit }) => {
  return (
    <>
      <TopNav />
      <div className="">
        <h1>{}</h1>
      </div>
      <Footer />
    </>
  );
};

export default HabitView;
