const ModernLoader = ({
  size = "medium",
  type = "spinner",
  text = "",
  color = "orange",
  className = "",
}) => {
  // Size configurations
  const sizeConfig = {
    small: {
      spinner: "w-4 h-4 border-2",
      dots: "w-2 h-2",
      pulse: "w-6 h-6",
      text: "text-xs",
    },
    medium: {
      spinner: "w-6 h-6 border-2",
      dots: "w-3 h-3",
      pulse: "w-8 h-8",
      text: "text-sm",
    },
    large: {
      spinner: "w-8 h-8 border-3",
      dots: "w-4 h-4",
      pulse: "w-12 h-12",
      text: "text-base",
    },
    xlarge: {
      spinner: "w-12 h-12 border-4",
      dots: "w-5 h-5",
      pulse: "w-16 h-16",
      text: "text-lg",
    },
  };

  // Color configurations
  const colorConfig = {
    orange: {
      primary: "border-orange-500",
      secondary: "border-orange-200",
      dot: "bg-orange-500",
      pulse: "bg-orange-500",
      text: "text-orange-600",
    },
    amber: {
      primary: "border-amber-500",
      secondary: "border-amber-200",
      dot: "bg-amber-500",
      pulse: "bg-amber-500",
      text: "text-amber-600",
    },
    gray: {
      primary: "border-gray-500",
      secondary: "border-gray-200",
      dot: "bg-gray-500",
      pulse: "bg-gray-500",
      text: "text-gray-600",
    },
    white: {
      primary: "border-white",
      secondary: "border-white/30",
      dot: "bg-white",
      pulse: "bg-white",
      text: "text-white",
    },
  };

  const config = sizeConfig[size];
  const colors = colorConfig[color];

  // Spinner Loader
  const SpinnerLoader = () => (
    <div
      className={`${config.spinner} ${colors.primary} ${colors.secondary} border-t-transparent rounded-full animate-spin`}
    ></div>
  );

  // Dots Loader
  const DotsLoader = () => (
    <div className="flex gap-1">
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={`${config.dots} ${colors.dot} rounded-full animate-bounce`}
          style={{
            animationDelay: `${index * 0.15}s`,
            animationDuration: "1s",
          }}
        ></div>
      ))}
    </div>
  );

  // Pulse Loader
  const PulseLoader = () => (
    <div
      className={`${config.pulse} ${colors.pulse} rounded-full animate-pulse opacity-60`}
    ></div>
  );

  // Ripple Loader
  const RippleLoader = () => (
    <div className="relative inline-flex">
      <div
        className={`${config.pulse} ${colors.pulse} rounded-full opacity-75 animate-ping`}
      ></div>
      <div
        className={`${config.pulse} ${colors.pulse} rounded-full opacity-25 animate-ping absolute inset-0`}
        style={{ animationDelay: "0.5s" }}
      ></div>
    </div>
  );

  // Bars Loader
  const BarsLoader = () => (
    <div className="flex gap-1 items-end">
      {[0, 1, 2, 3].map((index) => (
        <div
          key={index}
          className={`w-1 ${colors.dot} rounded-full animate-pulse`}
          style={{
            height: `${8 + (index % 2) * 4}px`,
            animationDelay: `${index * 0.1}s`,
            animationDuration: "1.2s",
          }}
        ></div>
      ))}
    </div>
  );

  // Gradient Spinner
  const GradientSpinner = () => (
    <div className={`${config.spinner} rounded-full animate-spin`}>
      <div className="w-full h-full rounded-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-300 opacity-20"></div>
      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-orange-500 animate-spin"></div>
    </div>
  );

  const loaderTypes = {
    spinner: <SpinnerLoader />,
    dots: <DotsLoader />,
    pulse: <PulseLoader />,
    ripple: <RippleLoader />,
    bars: <BarsLoader />,
    gradient: <GradientSpinner />,
  };

  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      {loaderTypes[type]}
      {text && (
        <span
          className={`${config.text} ${colors.text} font-medium animate-pulse`}
        >
          {text}
        </span>
      )}
    </div>
  );
};

export default ModernLoader;
