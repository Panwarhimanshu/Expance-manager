import Sheet from "./Sheet.jsx";

export default function EditModal({ title, fields, values, onChange, onCancel, onSave }) {
  return (
    <Sheet title={title} onClose={onCancel}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave();
        }}
      >
        {fields.map((f) => (
          <div className="field" key={f.name}>
            <label htmlFor={`edit-${f.name}`}>{f.label}</label>
            <input
              id={`edit-${f.name}`}
              type={f.type || "text"}
              min={f.min}
              step={f.step}
              required={f.required !== false}
              value={values[f.name] ?? ""}
              onChange={(e) => onChange(f.name, e.target.value)}
            />
          </div>
        ))}
        <div className="acts">
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="save">
            Save
          </button>
        </div>
      </form>
    </Sheet>
  );
}
