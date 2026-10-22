"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, CheckCircle2 } from "lucide-react";

export interface CustomSelectOption {
  value: string;
  label: string;
  sublabel?: string;
  badge?: string;
  badgeColor?: string;
  icon?: ReactNode;
  colorDot?: string;
  disabled?: boolean;
}

export interface CustomSelectGroup {
  label: string;
  options: CustomSelectOption[];
}

export interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options?: CustomSelectOption[];
  groups?: CustomSelectGroup[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  popoverClassName?: string;
  size?: "sm" | "md";
  renderTriggerContent?: (selectedOption?: CustomSelectOption) => ReactNode;
  renderOptionContent?: (option: CustomSelectOption, isSelected: boolean) => ReactNode;
}

export function CustomSelect({
  value,
  onChange,
  options,
  groups,
  placeholder = "Pilih...",
  disabled = false,
  className = "",
  triggerClassName = "",
  popoverClassName = "",
  size = "md",
  renderTriggerContent,
  renderOptionContent,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Flatten all options to easily find selected option
  const allOptions: CustomSelectOption[] = options || (groups ? groups.flatMap((g) => g.options) : []);
  const selectedOption = allOptions.find((opt) => opt.value === value);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleSelect = (val: string, isDisabled?: boolean) => {
    if (isDisabled) return;
    onChange(val);
    setIsOpen(false);
  };

  const isSmall = size === "sm";

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full text-left font-bold transition-all border border-border bg-bg-alt/70 hover:bg-bg-alt hover:border-accent/50 text-ink flex items-center justify-between shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
          isSmall
            ? "px-3 py-1.5 text-xs rounded-xl"
            : "px-3.5 py-2.5 text-xs sm:text-sm rounded-2xl"
        } ${triggerClassName}`}
      >
        {renderTriggerContent ? (
          renderTriggerContent(selectedOption)
        ) : (
          <div className="flex items-center gap-2.5 truncate flex-1 min-w-0 pr-2">
            {selectedOption?.colorDot && (
              <span
                className="w-3.5 h-3.5 rounded-full border border-black/15 shrink-0 shadow-2xs"
                style={{ backgroundColor: selectedOption.colorDot }}
              />
            )}
            {selectedOption?.icon && (
              <span className="shrink-0 text-muted flex items-center">
                {selectedOption.icon}
              </span>
            )}
            <span className="truncate text-ink font-medium">
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            {selectedOption?.badge && (
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                  selectedOption.badgeColor ||
                  "bg-accent/10 text-accent border border-accent/20"
                }`}
              >
                {selectedOption.badge}
              </span>
            )}
          </div>
        )}

        <ChevronDown
          className={`w-4 h-4 text-muted shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Popover Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Click outside backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className={`absolute left-0 right-0 top-full mt-1.5 z-50 bg-surface rounded-2xl border border-border shadow-dropdown p-1.5 max-h-[280px] overflow-y-auto space-y-1 ${popoverClassName}`}
            >
              {groups ? (
                // Grouped options
                groups.map((group, groupIdx) => (
                  <div key={group.label || groupIdx} className="space-y-1">
                    {group.label && (
                      <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted bg-bg-alt/60 rounded-lg">
                        {group.label}
                      </div>
                    )}
                    {group.options.map((option) => renderOptionItem(option))}
                  </div>
                ))
              ) : (
                // Flat options
                options?.map((option) => renderOptionItem(option))
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );

  function renderOptionItem(option: CustomSelectOption) {
    const isSelected = option.value === value;
    const isDisabled = option.disabled;

    if (renderOptionContent) {
      return (
        <div
          key={option.value}
          onClick={() => handleSelect(option.value, isDisabled)}
        >
          {renderOptionContent(option, isSelected)}
        </div>
      );
    }

    return (
      <button
        key={option.value}
        type="button"
        disabled={isDisabled}
        onClick={() => handleSelect(option.value, isDisabled)}
        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
          isDisabled
            ? "opacity-40 cursor-not-allowed"
            : isSelected
            ? "bg-accent/10 text-accent font-bold"
            : "hover:bg-bg-alt text-ink"
        }`}
      >
        <div className="flex items-center gap-2.5 truncate min-w-0 pr-2">
          {option.colorDot && (
            <span
              className="w-3.5 h-3.5 rounded-full border border-black/15 shrink-0"
              style={{ backgroundColor: option.colorDot }}
            />
          )}
          {option.icon && (
            <span className="shrink-0 text-muted flex items-center">
              {option.icon}
            </span>
          )}
          <div className="truncate">
            <span className="truncate block">{option.label}</span>
            {option.sublabel && (
              <span className="text-[10px] text-muted block truncate font-normal">
                {option.sublabel}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {option.badge && (
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                option.badgeColor ||
                "bg-purple-500/15 text-purple-700 dark:text-purple-300"
              }`}
            >
              {option.badge}
            </span>
          )}
          {isSelected && (
            <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
          )}
        </div>
      </button>
    );
  }
}
