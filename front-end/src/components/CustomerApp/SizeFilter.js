import React, {Component} from 'react'
import './SizeFilter.css'
import './SizeFilterLargeScreens.css'

class SizeFilter extends Component {
  state = {

  }

  render() {
    const {sizes} = this.props
    const toggleSize = this.props.toggleSize
    return (
      <div className="list-items-size-filter-container">
        <p> sizes </p>
        <div className="list-items-size-filter-grid">
          {sizes.map((size) => (
            <div id={size}
                 className="list-items-size-filter-cell"
                 onClick={e => (toggleSize(e.target))}
            >
              {size}
            </div>
          ))}
        </div>
      </div>

    )
  }
}

export default SizeFilter