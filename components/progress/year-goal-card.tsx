"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { updateYearGoal } from "@/app/(app)/progress/_actions";
import { MBCard } from "@/components/mb/card";

interface YearGoalCardProps {
  yearGoal: number;
}

/** YearGoalCard — inline year-goal editor with optimistic UI and revert-on-error. Client component. */
export function YearGoalCard({ yearGoal: initialYearGoal }: YearGoalCardProps) {
  const [displayedGoal, setDisplayedGoal] = useState(initialYearGoal);
  const [inputValue, setInputValue] = useState(String(initialYearGoal));
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    const parsed = Number(inputValue);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 999) {
      toast.error("La meta debe estar entre 1 y 999");
      setInputValue(String(displayedGoal));
      return;
    }

    const previous = displayedGoal;
    setDisplayedGoal(parsed); // optimistic

    startTransition(async () => {
      const result = await updateYearGoal({ yearGoal: parsed });
      if (!result.ok) {
        setDisplayedGoal(previous);
        setInputValue(String(previous));
        toast.error("No se pudo guardar la meta. Inténtalo de nuevo.");
      } else {
        toast.success("Meta actualizada ✦");
      }
    });
  }

  const parsedInput = Number(inputValue);
  const isInputValid = Number.isInteger(parsedInput) && parsedInput >= 1 && parsedInput <= 999;
  const isUnchanged = isInputValid && parsedInput === displayedGoal;
  const isSaveDisabled = isPending || isUnchanged || !isInputValid;

  return (
    <MBCard color="#FFD0E7" radius={22} className="p-5 lg:p-6">
      <div className="flex flex-col gap-4">
        {/* Eyebrow */}
        <p
          style={{
            fontFamily: "var(--font-sticker)",
            fontSize: 12,
            color: "#3B1F47",
            letterSpacing: "2px",
            margin: 0,
            textTransform: "uppercase",
          }}
        >
          META ANUAL
        </p>

        {/* Displayed goal counter */}
        <div
          aria-live="polite"
          style={{ display: "flex", alignItems: "baseline", gap: 6 }}
        >
          <span
            style={{
              fontFamily: "var(--font-curly)",
              fontSize: "clamp(48px, 8vw, 64px)",
              color: "#FF3D9A",
              lineHeight: 1,
              WebkitTextStroke: "2px #3B1F47",
              paintOrder: "stroke fill",
              filter: "drop-shadow(2px 3px 0 #3B1F47)",
            }}
          >
            {displayedGoal}
          </span>
          <span
            style={{
              fontFamily: "var(--font-sticker)",
              fontSize: 14,
              color: "#3B1F47",
            }}
          >
            libros
          </span>
        </div>

        {/* Input + save */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="year-goal-input"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 13,
              color: "#3B1F47",
            }}
          >
            Meta de libros este año
          </label>
          <div className="flex gap-2">
            <input
              id="year-goal-input"
              type="number"
              inputMode="numeric"
              min={1}
              max={999}
              step={1}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isPending}
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 15,
                color: "#3B1F47",
                border: "2px solid #3B1F47",
                borderRadius: 8,
                padding: "8px 12px",
                width: 100,
                boxShadow: "2px 2px 0 #3B1F47",
                outline: "none",
                background: "#FFFCFE",
              }}
            />
            <button
              type="button"
              aria-label="Guardar meta anual"
              onClick={handleSave}
              disabled={isSaveDisabled}
              style={{
                fontFamily: "var(--font-sticker)",
                fontSize: 13,
                color: isSaveDisabled ? "#9E7AA8" : "#FFFCFE",
                background: isSaveDisabled ? "#F0C8E0" : "#FF3D9A",
                border: "2px solid #3B1F47",
                borderRadius: 10,
                boxShadow: isSaveDisabled ? "none" : "3px 4px 0 #3B1F47",
                padding: "8px 14px",
                cursor: isSaveDisabled ? "not-allowed" : "pointer",
                transition: "all 0.1s",
              }}
            >
              {isPending ? "Guardando…" : "Guardar meta"}
            </button>
          </div>
        </div>
      </div>
    </MBCard>
  );
}
