import { LuSparkles, LuX } from "react-icons/lu";

const Drawer = ({ isOpen, onClose, title, children }) => {
  return (
    <>
      {/* Backdrop - only show on mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed top-[60px] sm:top-[70px] right-0 z-40 h-[calc(100dvh-60px)] sm:h-[calc(100dvh-70px)] p-3 sm:p-4 overflow-y-auto transition-transform bg-white w-full sm:w-[90vw] md:w-[40vw] lg:w-[35vw] xl:w-[30vw] shadow-2xl shadow-cyan-800/10 border-l border-gray-200 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        tabIndex="-1"
        aria-labelledby="drawer-right-label"
      >
        <div className="flex items-start justify-between mb-4 sm:mb-6">
          <div className="flex flex-col items-start gap-2 sm:gap-3 flex-1 pr-2">
            <span className="flex items-center gap-2 bg-orange-100/60 text-xs font-medium text-orange-500 px-2.5 sm:px-3 py-0.5 rounded-full text-nowrap">
              <LuSparkles className="w-3 h-3" />
              Summarize this post
            </span>
            <h5
              id="drawer-right-label"
              className="flex items-center text-sm sm:text-base font-semibold text-black leading-tight"
            >
              {title}
            </h5>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 flex items-center justify-center flex-shrink-0 transition-colors"
            aria-label="Close drawer"
          >
            <LuX className="text-lg" />
          </button>
        </div>

        <div className="text-sm leading-relaxed px-1 sm:px-3 mb-6">
          {children}
        </div>
      </div>
    </>
  );
};

export default Drawer;
