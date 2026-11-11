import './PropTable.css';

const PropTable = ({ data }) => (
  <div className="prop-table-section">
    <div className="prop-table-frame">
      <div className="prop-table-heading">
        <h2>Props</h2>
        <span>
          {data.length} {data.length === 1 ? 'property' : 'properties'}
        </span>
      </div>

      <div className="prop-table-wrap">
        <div className="prop-table-surface">
          <table className="prop-table">
            <caption>Component properties</caption>
            <colgroup>
              <col className="prop-column-name" />
              <col className="prop-column-type" />
              <col className="prop-column-default" />
              <col className="prop-column-description" />
            </colgroup>
            <thead>
              <tr>
                <th scope="col">Property</th>
                <th scope="col">Type</th>
                <th scope="col">Default</th>
                <th scope="col">Description</th>
              </tr>
            </thead>
            <tbody>
              {data.map((prop, index) => (
                <tr key={index}>
                  <td>
                    <code className="prop-name">{prop.name}</code>
                  </td>
                  <td className="prop-type">{prop.type}</td>
                  <td>
                    <code className="prop-default">{prop.default?.length ? prop.default : '—'}</code>
                  </td>
                  <td className="prop-desc">{prop.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="prop-cards">
        <div className="prop-cards-surface">
          {data.map((prop, index) => (
            <div className="prop-card" key={index}>
              <div className="prop-card-header">
                <code className="prop-name">{prop.name}</code>
                <span className="prop-card-type">{prop.type}</span>
              </div>
              <p className="prop-card-desc">{prop.description}</p>
              <div className="prop-card-default">
                <span className="prop-card-label">Default</span>
                <code className="prop-default">{prop.default?.length ? prop.default : '—'}</code>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default PropTable;
