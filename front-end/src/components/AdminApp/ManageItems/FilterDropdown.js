import React, {Component} from 'react'
import './FilterDropdown.css'

class FilterDropdown extends Component {
  render() {
    const {name, values, setFilterValue} = this.props
    return (
      <select className="dropdown filter-dropdown"
              onChange={e => (setFilterValue(name, e.target.value))}
      >
        {values.map((val) => (
          <option key={val} value={val}
          > {
            val[0].toUpperCase() + val.substring(1)
          } </option>
        ))}
      </select>
    )
  }
}

export default FilterDropdown