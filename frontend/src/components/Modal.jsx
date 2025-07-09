const Modal = ({ children, isOpen, onClose, title, hideHeader }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center w-full h-full bg-black/50 p-2 sm:p-4">
      <div
        className={`relative flex flex-col bg-white shadow-2xl rounded-lg sm:rounded-2xl overflow-hidden w-full h-full sm:h-auto max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl sm:max-h-[95vh] sm:mx-4`}
      >
        {!hideHeader && (
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
              {title}
            </h3>
          </div>
        )}

        <button
          type="button"
          className="text-gray-400 bg-transparent hover:bg-orange-100 hover:text-orange-900 rounded-lg text-sm w-8 h-8 flex justify-center items-center absolute top-3 sm:top-4 right-3 sm:right-4 cursor-pointer z-10 transition-colors"
          onClick={onClose}
          aria-label="Close modal"
        >
          <svg
            className="w-3 h-3"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 14 14"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M1 1l6 6m0 0l6 6M7 7l6-6M7 7l-6 6"
            />
          </svg>
        </button>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
