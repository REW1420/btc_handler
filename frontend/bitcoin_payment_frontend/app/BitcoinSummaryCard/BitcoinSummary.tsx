export default function BitcoinSummary() {
  return (
    <div className="bg-gray-100">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-xl font-semibold">
              Bitcoin <span className=" text-sm">(BTC)</span>
            </h2>
            <p className="text-3xl font-bold">
              $109,444.42{" "}
              <span className="text-green-400 text-lg ml-2">+2.04%</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
