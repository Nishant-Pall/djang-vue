import auth0 from "auth0-js";
import EventEmitter from "eventemitter3";
import router from "@/router";

export default class AuthService {
	authenticated = this.isAuthenticated();
	authNotifier = new EventEmitter();

	constructor() {
		this.login = this.login.bind(this);
		this.setSession = this.setSession.bind(this);
		this.logout = this.logout.bind(this);
		this.isAuthenticated = this.isAuthenticated.bind(this);
		this.handleAuthentication = this.handleAuthentication.bind(this);
	}
	auth0 = new auth0.WebAuth({
		domain: "dev-dxce6du8dz85qmoo.us.auth0.com",
		clientID: "9RHZMYrTdoaPgl3mDYHQo7y3W4ttm5O5",
		redirectUri: "http://localhost:8080",
		audience: "http://djang-vue-auth.com",
		responseType: "token id_token",
		scope: "openid profile",
	});

	login() {
		this.auth0.authorize();
	}

	// this method calls the parseHash() method of Auth0
	// to get authentication information from the callback URL
	handleAuthentication() {
		this.auth0.parseHash((err, authResult) => {
			if (authResult && authResult.accessToken && authResult.idToken) {
				this.setSession(authResult);
			} else if (err) {
				console.log(err);
				alert(`Error: ${err.error}. Check the console for further details.`);
			} else {
				this.silentAuth()
					.then(() => {
						console.log("user logged in through silent auth");
					})
					.catch((err) => {
						console.log(err);
					});
			}
			router.replace("/");
		});
	}

	silentAuth() {
		return new Promise((resolve, reject) => {
			this.auth0.checkSession({}, (err, authResult) => {
				if (err) return reject(err);
				this.setSession(authResult);
				resolve();
			});
		});
	}

	// stores the user's access_token, id_token, and a time at
	// which the access_token will expire in the local storage
	setSession(authResult) {
		let expiresAt = JSON.stringify(authResult.expiresIn * 1000 + new Date().getTime());
		localStorage.setItem("access_token", authResult.accessToken);
		localStorage.setItem("id_token", authResult.idToken);
		localStorage.setItem("expires_at", expiresAt);
		this.authNotifier.emit("authChange", { authenticated: true });
	}

	// remove the access and ID tokens from the
	// local storage and emits the authChange event
	logout() {
		localStorage.removeItem("access_token");
		localStorage.removeItem("id_token");
		localStorage.removeItem("expires_at");
		this.authNotifier.emit("authChange", false);
		// navigate to the home route
		router.replace("/");
	}

	// checks if the user is authenticated
	isAuthenticated() {
		// Check whether the current time is past the
		// access token's expiry time
		let expiresAt = JSON.parse(localStorage.getItem("expires_at"));
		return new Date().getTime() < expiresAt;
	}

	// a static method to get the access token
	getAuthToken() {
		return localStorage.getItem("access_token");
	}

	// a method to get the User profile
	getUserProfile(cb) {
		const accessToken = localStorage.getItem("access_token");
		if (accessToken) return this.auth0.client.userInfo(accessToken, cb);
		else return null;
	}
}
