import classNames from 'classnames';
import React from 'react';

import { localize } from '../Localization/Localize';
import connectToWebChat from '../connectToWebChat';
import ErrorNotificationIcon from '../Attachment/Assets/ErrorNotificationIcon';
import SpinnerAnimation from '../Attachment/Assets/SpinnerAnimation';
import WarningNotificationIcon from '../Attachment/Assets/WarningNotificationIcon';

class DebouncedConnectivityStatus extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      children: props.children,
      since: Date.now()
    };
  }

  componentWillReceiveProps(nextProps) {
    const { children, interval } = nextProps;

    if (
      children !== this.props.children
      || interval !== this.props.interval
    ) {
      clearTimeout(this.timeout);

      this.timeout = setTimeout(() => {
        this.setState(() => ({
          children,
          since: Date.now()
        }));
      }, Math.max(0, interval - Date.now() + this.state.since));
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timeout);
  }

  render() {
    return typeof this.state.children === 'function' ? this.state.children() : false;
  }
}

const connectConnectivityStatus = (...selectors) => connectToWebChat(
  ({ connectivityStatus, language }) => ({ connectivityStatus, language }),
  ...selectors
)

export default connectConnectivityStatus(
  ({ styleSet }) => ({ styleSet })
)(
  ({ connectivityStatus, language, styleSet }) =>
    <div
      aria-live="polite"
      className={
        classNames({
          [styleSet.errorNotification]:
            connectivityStatus === 'error'
            || connectivityStatus === 'notconnected',
          [styleSet.warningNotification]:
            connectivityStatus === 'connectingslow',
          [styleSet.connectivityNotification]:
            connectivityStatus === 'uninitialized'
            || connectivityStatus === 'connected'
            || connectivityStatus === 'reconnected'
            || connectivityStatus === 'reconnecting'
        })
      }
      role="status"
    >
      <DebouncedConnectivityStatus
        interval={ (connectivityStatus === 'uninitialized' || connectivityStatus === 'error') ? 0 : 400 }>
        { () =>
          connectivityStatus === 'connectingslow' ?
            <React.Fragment>
              <WarningNotificationIcon />
              { localize('SLOW_CONNECTION_NOTIFICATION', language) }
            </React.Fragment>
          : (connectivityStatus === 'error' || connectivityStatus === 'notconnected') ?
            <React.Fragment>
              <ErrorNotificationIcon />
              { localize('FAILED_CONNECTION_NOTIFICATION', language) }
            </React.Fragment>
          : connectivityStatus === 'uninitialized' ?
            <React.Fragment>
              <SpinnerAnimation />
              { localize('INITIAL_CONNECTION_NOTIFICATION', language) }
            </React.Fragment>
          : connectivityStatus === 'reconnecting' &&
            <React.Fragment>
              <SpinnerAnimation />
              { localize('INTERRUPTED_CONNECTION_NOTIFICATION', language) }
            </React.Fragment>
        }
      </DebouncedConnectivityStatus>
    </div>
  )
