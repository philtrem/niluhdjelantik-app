import React, {Component} from 'react'
import './MessageBox.css'

const MessageBox = props => {
  const message = props.options.message
  const messageType = props.options.messageType
  const className = "messages " + messageType
  return (
    <div className={className}> {message} </div>
  )
}

export default MessageBox