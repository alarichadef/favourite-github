import React from 'react';
import * as blockstack from 'blockstack';
const BlockstackContext = React.createContext({
	session: null
});
export function Blockstack({ children }) {
	const [ session, setSession ] = React.useState();
	return (
		<BlockstackContext.Provider value={{
			session,
			setSession
		}}>
			{children}
		</BlockstackContext.Provider>
	);
}
export function useBlockstack({ origin=window.location.origin, onSignInError=()=>{} }={}) {
	const user_session_ref = React.useRef(new blockstack.UserSession());
	const user_session = user_session_ref.current;
	// Set as state to force refreshes
	const { session, setSession } = React.useContext(BlockstackContext);
	const login = React.useCallback(() => {
		return user_session.redirectToSignIn(origin);
	}, [user_session, origin]);
	const logout = React.useCallback(() => {
		return user_session.signUserOut();
	}, [user_session]);
	const putFile = React.useCallback((name, data) => {
		if(!user_session.isUserSignedIn()) {
			return Promise.reject(new Error('Blockstack user not signed in'));
		}
		return user_session.putFile(name, data);
	}, [user_session]);
	const getFile = React.useCallback((name) => {
		if(!user_session.isUserSignedIn()) {
			return Promise.reject(new Error('Blockstack user not signed in'));
		}
		return user_session.getFile(name);
	}, [user_session]);
	if(!user_session.isUserSignedIn() && user_session.isSignInPending()) {
		user_session.handlePendingSignIn().then(() => {
			if (window.history && window.location.search) {
				window.history.replaceState(
					{},
					document.title,
					window.location.pathname
				);
			}
			let user_data = user_session.loadUserData();
			setSession(user_data);
		}).catch(e => {
			console.error(e);
			onSignInError(e);
		});
	}
	if(!session && user_session.isUserSignedIn()) {
		let user_data = user_session.loadUserData();
		setSession(user_data);
	}
	return [ session, { putFile, getFile, login, logout } ];
};
export default BlockstackContext;