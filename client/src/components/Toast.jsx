export default function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className={`toast${toast.show ? " show" : ""}`} role="status">
      <span>{toast.message}</span>
      <button
        type="button"
        onClick={() => {
          toast.action?.fn();
          toast.hide();
        }}
      >
        {toast.action ? toast.action.label : ""}
      </button>
    </div>
  );
}
