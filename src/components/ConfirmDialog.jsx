import { NEUTRAL } from "../constants";
import { glassStyle } from "../utils/colors";

const OVERLAY_GLASS = glassStyle(0.3);
const DIALOG_GLASS = glassStyle(0.92);

export default function ConfirmDialog({ title, message, onConfirm, onCancel, confirmLabel = "Yes, delete", cancelLabel = "Cancel", danger = true }) {
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center">
      <div className="absolute inset-0" style={OVERLAY_GLASS} onClick={onCancel} />
      <div className="relative z-[1] border border-neutral-border rounded-xl py-5 px-6 max-w-[380px] w-[90%]"
        style={DIALOG_GLASS}>
        {title && <div className="text-[15px] font-medium text-neutral-text mb-2">{title}</div>}
        <div className="text-[13px] text-neutral-muted leading-relaxed mb-5">{message}</div>
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel}
            className="py-[7px] px-4 text-xs cursor-pointer bg-transparent text-neutral-muted border border-neutral-border rounded-md">
            {cancelLabel}
          </button>
          <button onClick={onConfirm}
            className="py-[7px] px-4 text-xs cursor-pointer text-white border-none rounded-md"
            style={{ background: danger ? NEUTRAL.danger : NEUTRAL.text }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
