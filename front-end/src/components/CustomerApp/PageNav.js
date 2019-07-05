import React, {Component} from 'react'
import './PageNav.css'

class PageNav extends Component {
  state = {
    currentPage: 1,
  }
  render() {
    const {currentPage, lastPage, updatePageNumber} = this.props
    const prev = "<"
    const next = ">"
    const isFirstPage = currentPage === 1
    const isLastPage = currentPage === lastPage
    return (
      <div className="customer-app-page-nav-container">
        <button type="button"
                onClick={() => (updatePageNumber(currentPage - 1))}
                disabled={isFirstPage}
        > {prev} </button>
        <p> Page {currentPage} </p>
        <button type="button"
                onClick={() => (updatePageNumber(currentPage + 1))}
                disabled={isLastPage}
        > {next} </button>

      </div>
    )
  }
}

export default PageNav