import React, {Component} from 'react'
import './Dropdown.css'

class Dropdown extends Component {
  render() {
    const {field, selected, values, setFormValue} = this.props
    return (
      <select className="dropdown"
              defaultValue={selected || null}
              onInput={e => (setFormValue(field, e.target.value))}
      >
        {values.map((val) => (
          <option key={val} value={val}> {
            val.length > 0 &&
            val[0].toUpperCase() + val.substring(1)
          } </option>
        ))}
      </select>
    )
  }
}

export default Dropdown