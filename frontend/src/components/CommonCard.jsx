import "./CommonCard.css";

function CommonCard({ title, children }) {
  return (
    <div className="common-card">
      <div className="common-card-header">
        <h2>{title}</h2>
      </div>

      <div className="common-card-body">{children}</div>
    </div>
  );
}

export default CommonCard;
