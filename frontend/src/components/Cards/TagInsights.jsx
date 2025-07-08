import CustomPieChart from "../Charts/CustomPieChart";

const COLORS = [
  "#f97316", // orange-500
  "#fb923c", // orange-400
  "#fdba74", // orange-300
  "#fed7aa", // orange-200
  "#f59e0b", // amber-500
  "#fbbf24", // amber-400
  "#fcd34d", // amber-300
];

const TagCould = ({ tags }) => {
  const maxCount = Math.max(...tags.map((tag) => tag.count), 1);
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => {
        const fontSize = 12 + (tag.count / maxCount) * 5;
        return (
          <span
            key={tag.name}
            className="font-medium text-orange-900/80 bg-orange-100 px-3 py-0.5 rounded-lg"
            style={{ fontSize: `${fontSize}px` }}
          >
            #{tag.name}
          </span>
        );
      })}
    </div>
  );
};

const TagInsights = ({ tagUsage }) => {
  const processedData = (() => {
    if (!tagUsage) return [];

    const sorted = [...tagUsage].sort((a, b) => b.count - a.count);
    const topFour = sorted.slice(0, 4);
    const others = sorted.slice(4);

    const othersCount = others.reduce((sum, item) => sum + item.count, 0);

    const finalData = topFour.map((item) => ({
      ...item,
      name: item.tag || "",
    }));

    if (othersCount > 0) {
      finalData.push({
        name: "Others",
        count: othersCount,
      });
    }
    return finalData;
  })();
  return (
    <div className="grid grid-cols-12 mt-4">
      <div className="col-span-12 md:col-span-7">
        <CustomPieChart data={processedData} colors={COLORS} />
      </div>
      <div className="col-span-12 md:col-span-5 mt-5 md:mt-0">
        <TagCould
          tags={
            tagUsage.slice(0, 15).map((item) => ({
              ...item,
              name: item.tag || "",
            })) || []
          }
        />
      </div>
    </div>
  );
};

export default TagInsights;
