import { useMemo, useState } from "react";
import { monthlySavings, paycheque, simulate } from "../lib/money.js";
import { focusIndex } from "../lib/rewards.js";
import { Header } from "./ui.jsx";
import StreakWidget from "./StreakWidget.jsx";
import JobCard from "./JobCard.jsx";
import SpendingCard from "./SpendingCard.jsx";
import GoalsCard from "./GoalsCard.jsx";
import ResultsCard from "./ResultsCard.jsx";
import ChartCard from "./ChartCard.jsx";
import TipsCard from "./TipsCard.jsx";
import { BadgesCard, LogCard } from "./HistoryCards.jsx";
import { DepositModal, GoalModal } from "./Modals.jsx";

export default function Planner({ username, plan: S, update, onLogout, toast }) {
  const [modal, setModal] = useState(null); // { type: 'goal'|'deposit', goal?, preset? }
  const p = paycheque(S);
  const save = monthlySavings(S);
  const sim = useMemo(() => simulate(S), [S]);
  const fi = focusIndex(S, sim);

  return (
    <div className="page">
      <div className="col">
        <Header>
          <div className="headbar">
            <span>Hi, <strong style={{ color: "var(--text)" }}>{username}</strong></span>
            <span className="sync"><i></i><span>Saved on this device</span></span>
            <button className="linkbtn" type="button" onClick={onLogout}>log out</button>
          </div>
        </Header>

        <StreakWidget S={S} />
        <JobCard S={S} p={p} update={update} toast={toast} />
        <SpendingCard S={S} p={p} update={update} />
        <GoalsCard S={S} sim={sim} fi={fi} update={update} setModal={setModal} />
        <ResultsCard S={S} p={p} save={save} sim={sim} fi={fi} />
        <ChartCard S={S} sim={sim} />
        <TipsCard S={S} p={p} save={save} sim={sim} fi={fi} />
        <BadgesCard S={S} />
        <LogCard S={S} />

        <div className="footer">
          <span>Made by Teens, for Teens</span>
          <span>Pay estimates use Ontario's 2026 minimum wage ($17.95, or $16.90 for students under 18), EI at 1.63%, CPP at 5.95% from age 18, and basic income tax.</span>
        </div>
      </div>
      {modal?.type === "goal" && <GoalModal goal={modal.goal} preset={modal.preset} update={update} toast={toast} onClose={() => setModal(null)} />}
      {modal?.type === "deposit" && <DepositModal goal={modal.goal} update={update} onClose={() => setModal(null)} />}
    </div>
  );
}
