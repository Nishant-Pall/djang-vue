<template>
	<div id="app">
		<button class="btn btn-primary" v-if="!authenticated" @click="login()">Log In</button>
		<button class="btn btn-primary" v-if="authenticated" @click="privateMessage()">Call Private</button>
		<button class="btn btn-primary" v-if="authenticated" @click="logout()">Log Out</button>
		{{ message }}
		<br />
	</div>
</template>

<script>
import AuthService from "./auth/AuthService";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000/";
const auth = new AuthService();
export default {
	name: "App",
	data() {
		this.handleAuthentication();
		this.authenticated = false;

		auth.authNotifier.on("authChange", (authState) => {
			this.authenticated = authState.authenticated;
		});

		return {
			authenticated: false,
			message: "",
		};
	},
	methods: {
		login() {
			auth.login();
		},
		handleAuthentication() {
			auth.handleAuthentication();
		},
		logout() {
			auth.logout();
		},
		async privateMessage() {
			const url = `${API_URL}/api/private`;
			console.log(auth.getAuthToken());
			const config = {
				headers: {
					Authorization: `Bearer ${auth.getAuthToken()}`,
				},
			};
			return await axios
				.get(url, config)
				.then((response) => {
					console.log(response.data);
					this.message = response.data || "";
				})
				.catch((err) => console.log(err));
		},
	},
};
</script>

<style>
#app {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #2c3e50;
	margin-top: 60px;
}
</style>
