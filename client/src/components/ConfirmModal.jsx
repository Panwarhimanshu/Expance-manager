export default function ConfirmModal({ confirm }) {
  if (!confirm) return null;
  const { title, body, yesLabel, onYes, onNo } = confirm;
  return (
    <div className="modal" onClick={(e) => e.target === e.currentTarget && onNo()}>
      <div className="box" role="alertdialog" aria-modal="true" aria-labelledby="cfH">
        <h2 id="cfH">{title}</h2>
        <p>{body}</p>
        <div className="acts">
          <button type="button" onClick={onNo} autoFocus>
            Cancel
          </button>
          <button type="button" className="go" onClick={onYes}>
            {yesLabel || "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
