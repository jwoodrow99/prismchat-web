// import { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom'; // Routes, Route, useNavigate, Link

// import styles from './App.module.css';

import HomePage from './Pages/HomePage';
import LoginPage from './Pages/AboutPage';

function App() {
	return (
		<div className="App">
			<h1>Prism Chat Web</h1>

			<nav>
				<ul>
					<li>
						<Link to={'/'}>Home</Link>
					</li>
					<li>
						<Link to={'/about'}>About</Link>
					</li>
				</ul>
			</nav>

			<Routes>
				<Route path="/" element={<HomePage />} />
				<Route path="/about" element={<LoginPage />} />
			</Routes>
		</div>
	);
}

export default App;
