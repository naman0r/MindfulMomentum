import React from "react";

const Footer = () => {
  return (
    <>
      <footer className="bg-gray-800 text-gray-300 p-2 shadow-lg fixed bottom-0 w-full">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm">
            <span className="font-bold text-white">MindfulMomentum</span> ©{" "}
            {new Date().getFullYear()}
          </div>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Terms
            </a>
            <a
              href="https://chromewebstore.google.com/detail/mindfulmomentum/fhnmaioanoafpmkikblmoahbnlnboikk"
              target="_blank"
              className="hover:text-white transition-colors text-red-600"
            >
              Download the extension!
            </a>
            <p>PWA version</p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
