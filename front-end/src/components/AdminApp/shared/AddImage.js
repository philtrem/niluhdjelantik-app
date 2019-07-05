import React, {Component} from 'react'
import './AddImage.css'
import Slim from './Slim/slim.react'


class AddImage extends Component {
  // called when slim has initialized
  slimInit(data, slim) {
    // slim instance reference
    // console.log(slim._options);

    // current slim data object and slim reference
    // console.log(data);
  }
  // called when upload button is pressed or automatically if push is enabled
  slimService(formdata, progress, success, failure, slim) {
    const {setFormValue} = this.props
    setFormValue("image", formdata[0])
  }
  slimDidConfirm() {

  }
  render() {
    return (
      <div className="add-image-slim-wrapper">
        <div className="add-image-title-bar">
          <p className="add-image-title"> Select image </p>
        </div>
        <div className="add-image-slim-container">
          <Slim ratio="1:1"
                minSize="150, 150"
                size="150, 150"
                forceSize="150, 150"
                forceType="jpg"
                instantEdit="true"
                push="true"
                label="Click to add, or drop image here"
                serviceFormat="file"
                service={ this.slimService.bind(this) }
                didInit={ this.slimInit.bind(this) }
                didConfirm={ this.slimDidConfirm.bind(this) }>
          </Slim>
        </div>
        <div className="add-image-button-container">
          <button className="add-image-done"
                  onClick={e => {this.props.toggleImageDialog(e)}}
          > Done </button>
        </div>
      </div>
    );
  }
}

export default AddImage
