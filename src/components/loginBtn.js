import React from "react";
import { Row, Col } from "react-flex-proto";
import { GoogleLogin } from 'react-google-login';

import eventBus from "src/lib/event-bus";
import styles from './loginBtn.scss';

export class LoginBtn extends React.Component {

	constructor(props) {
		super();

		this.state = {
			initialized: false
		}

		this.componentDidMount = this.componentDidMount.bind(this);
		this.onSignIn = this.onSignIn.bind(this);
		this.onError = this.onError.bind(this);
	}

  onSignIn(googleUser) {
      console.log("user signed in");
      console.log(JSON.stringify(googleUser));
      eventBus.userInit(googleUser);
  }

	onError(err) {
		console.log(err)
	}

  componentDidMount() {
    window.addEventListener('google-loaded', () => {
    	this.setState({
    		initialized: true
    	})
    });
  }

  render() {
		const success = this.onSignIn;
		const error = this.onError;

  	if (this.state.initialized) {
      return (
      	<Row>
      		<Col padding={5} align="right" grow={true}>
			 			<GoogleLogin theme="dark" style={{ background: 'black' }}
			 				onSuccess={success}
			 				onFailure={error}
			 				clientId={`905191758617-g2a12go7e1ss4ug8upp4qgqqpb1906q9.apps.googleusercontent.com`}
			 				render={renderProps => (
				 				<button type="button" className={styles.googleBtn}
				 					onClick={renderProps.onClick} disabled={renderProps.disabled}>
									Sign in with Google
								</button>
							)}
			 			/>
		 			</Col>
   			</Row>
      );
  	} else {
  		return null;
  	}
  }
}
