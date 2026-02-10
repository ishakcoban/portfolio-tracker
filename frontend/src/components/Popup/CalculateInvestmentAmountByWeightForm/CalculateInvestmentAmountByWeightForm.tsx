import { useEffect, useState } from "react";
import { useStore } from "../../../store";
import httpService from "../../../services/httpService";

export default function CalculateInvestmentAmountByWeightForm() {
  const [text, setText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [statusCode, setStatusCode] = useState<number>(0);
  const [assets, setAssets] = useState([]);
  const { pID } = useStore();
  const inputHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setText(event.target.value.trimStart());
  };

  useEffect(() => {
    // This runs when component mounts (page loads/reloads)
    const fetchAssets = async () => {
      try {
        const response = await httpService.get(`/portfolios/${pID}`);
        if (response.status === 200) {
         
          setAssets(response.data.assets);
        }
      } catch (err) {
        //setError(err instanceof Error ? err.message : 'Failed to fetch assets');
      } finally {
      }
    };

    fetchAssets();
  }, []);
  return (
    <>
      <div className="d-flex flex-column justify-content-center align-items-center">
        <div className="w-25 text-light mb-5">
          <input
            style={{ fontSize: "1.7rem", fontWeight: "bold" }}
            type="number"
            placeholder="Invested Amount"
            className="input-style border-bottom text-center pb-2"
            value={text}
            name="portfolio"
            onChange={inputHandler}
          ></input>
          <span style={{ fontSize: "1.7rem", fontWeight: "bold" }}>$</span>
        </div>
        <div className="d-flex justify-content-evenly gap-5 my-5">
        {assets.map(
          (asset: { id: number; symbol: string; initialWeight: number }) => (
            <div className="text-center text-light" key={asset.id}>
              <div style={{fontSize:"1.4rem"}} className="fw-bold">{asset.symbol}({asset.initialWeight}%)</div>
              <div className="sdad">{asset.initialWeight * Number(text) / 100}$</div>
            </div>
          ),
        )}
        </div>
      </div>
    </>
  );
}
